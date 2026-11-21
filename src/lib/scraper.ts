import dns from "node:dns/promises";
import net from "node:net";
import * as cheerio from "cheerio";

const SSRF_ERROR_MESSAGE =
  "Zablokowano próbę dostępu do sieci wewnętrznej lub niedozwolonego adresu (ochrona SSRF).";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const FETCH_TIMEOUT_MS = 15_000;
const MAX_EXTRACTED_CHARS = 25_000;
const MAX_REDIRECTS = 5;

export interface ParsedDocumentResult {
  url: string;
  contentType: string;
  title: string | null;
  text: string;
  isPdf: boolean;
  byteLength: number;
}

function isBlockedIpv4(ip: string): boolean {
  const parts = ip.split(".").map((n) => Number(n));
  if (parts.length !== 4 || parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) {
    return true;
  }
  const [a, b, c] = parts;
  if (a === 0) return true; // 0.0.0.0/8
  if (a === 10) return true; // 10.0.0.0/8
  if (a === 100 && b >= 64 && b <= 127) return true; // 100.64.0.0/10 CGNAT
  if (a === 127) return true; // 127.0.0.0/8 loopback
  if (a === 169 && b === 254) return true; // 169.254.0.0/16 link-local & metadata
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
  if (a === 192 && b === 0 && c === 0) return true; // 192.0.0.0/24
  if (a === 192 && b === 0 && c === 2) return true; // TEST-NET-1
  if (a === 192 && b === 168) return true; // 192.168.0.0/16
  if (a === 198 && (b === 18 || b === 19)) return true; // benchmarking
  if (a >= 224) return true; // multicast & reserved
  return false;
}

function isBlockedIpv6(ip: string): boolean {
  const normalized = ip.toLowerCase().trim();
  if (normalized === "::" || normalized === "::1") return true;

  // IPv4-mapped IPv6 e.g. ::ffff:127.0.0.1 or ::ffff:7f00:1
  if (normalized.startsWith("::ffff:")) {
    const mapped = normalized.slice(7);
    if (net.isIPv4(mapped)) {
      return isBlockedIpv4(mapped);
    }
    const hexParts = mapped.split(":");
    if (hexParts.length === 2) {
      const hi = parseInt(hexParts[0], 16);
      const lo = parseInt(hexParts[1], 16);
      if (!Number.isNaN(hi) && !Number.isNaN(lo)) {
        const ipv4 = `${(hi >> 8) & 0xff}.${hi & 0xff}.${(lo >> 8) & 0xff}.${lo & 0xff}`;
        return isBlockedIpv4(ipv4);
      }
    }
    return true;
  }

  // fc00::/7 (Unique Local Address: fc.. / fd..)
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true;

  // fe80::/10 (Link-Local: fe8., fe9., fea., feb.)
  if (/^fe[89ab][0-9a-f]:/i.test(normalized) || normalized === "fe80::") {
    return true;
  }

  // ff00::/8 (Multicast)
  if (normalized.startsWith("ff")) return true;

  // Unspecified / loopback expanded form
  if (/^(0{1,4}:){7}0{0,3}[01]$/.test(normalized)) return true;

  return false;
}

function isBlockedIp(ip: string): boolean {
  const kind = net.isIP(ip);
  if (kind === 4) return isBlockedIpv4(ip);
  if (kind === 6) return isBlockedIpv6(ip);
  return true;
}

export async function validateSafeUrl(rawUrl: string): Promise<URL> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    throw new Error("Nieprawidłowy format adresu URL. Podaj pełny adres zaczynający się od https:// lub http://.");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(SSRF_ERROR_MESSAGE);
  }

  if (parsed.username || parsed.password) {
    throw new Error(SSRF_ERROR_MESSAGE);
  }

  const hostname = parsed.hostname.toLowerCase().replace(/\.$/, "");
  if (
    !hostname ||
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal") ||
    hostname === "metadata.google.internal"
  ) {
    throw new Error(SSRF_ERROR_MESSAGE);
  }

  const bareHost =
    hostname.startsWith("[") && hostname.endsWith("]")
      ? hostname.slice(1, -1)
      : hostname;

  if (net.isIP(bareHost)) {
    if (isBlockedIp(bareHost)) {
      throw new Error(SSRF_ERROR_MESSAGE);
    }
    return parsed;
  }

  let resolved: Array<{ address: string; family: number }>;
  try {
    resolved = await dns.lookup(bareHost, { all: true });
  } catch {
    throw new Error(
      `Nie udało się rozwiązać nazwy domeny „${bareHost}”. Sprawdź poprawność adresu URL lub dostępność zasobu.`
    );
  }

  if (!resolved || resolved.length === 0) {
    throw new Error(SSRF_ERROR_MESSAGE);
  }

  for (const entry of resolved) {
    if (isBlockedIp(entry.address)) {
      throw new Error(SSRF_ERROR_MESSAGE);
    }
  }

  return parsed;
}

export function normalizeRawText(input: string): string {
  return input
    .replace(/\u0000/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim()
    .slice(0, MAX_EXTRACTED_CHARS);
}

export async function parsePdfBuffer(buffer: Buffer): Promise<{
  text: string;
  title: string | null;
}> {
  if (buffer.byteLength === 0) {
    throw new Error("Przesłany plik PDF jest pusty.");
  }
  if (buffer.byteLength > MAX_BYTES) {
    throw new Error("Plik PDF przekracza maksymalny dozwolony rozmiar 10 MB.");
  }

  // Import wewnętrznego modułu pdf-parse/lib/pdf-parse.js omija kod testowy z index.js pakietu pdf-parse@1.1.1
  const pdfParseModule = (await import("pdf-parse/lib/pdf-parse.js")) as {
    default?: (dataBuffer: Buffer) => Promise<{ text: string; info?: { Title?: string } }>;
  };
  const pdfParseFn =
    typeof pdfParseModule.default === "function"
      ? pdfParseModule.default
      : (pdfParseModule as unknown as (
          dataBuffer: Buffer
        ) => Promise<{ text: string; info?: { Title?: string } }>);

  const parsed = await pdfParseFn(buffer);
  const text = normalizeRawText(parsed.text || "");
  if (text.length < 20) {
    throw new Error(
      "Nie udało się wyodrębnić warstwy tekstowej z pliku PDF (dokument może być skanem graficznym bez OCR)."
    );
  }

  const rawTitle = parsed.info?.Title?.trim();
  return {
    text,
    title: rawTitle && rawTitle.length >= 4 ? rawTitle : null,
  };
}

async function readStreamWithLimit(
  response: Response,
  maxBytes: number
): Promise<Buffer> {
  const contentLengthHeader = response.headers.get("content-length");
  if (contentLengthHeader) {
    const declared = Number(contentLengthHeader);
    if (!Number.isNaN(declared) && declared > maxBytes) {
      throw new Error(
        "Rozmiar zasobu docelowego przekracza limit bezpieczeństwa 10 MB."
      );
    }
  }

  if (!response.body) {
    const ab = await response.arrayBuffer();
    if (ab.byteLength > maxBytes) {
      throw new Error(
        "Rozmiar zasobu docelowego przekracza limit bezpieczeństwa 10 MB."
      );
    }
    return Buffer.from(ab);
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        throw new Error(
          "Pobierany dokument przekroczył maksymalny dopuszczalny rozmiar 10 MB."
        );
      }
      chunks.push(value);
    }
  }

  return Buffer.concat(chunks);
}

export async function fetchAndParseUrl(
  rawUrl: string
): Promise<ParsedDocumentResult> {
  let currentUrl = await validateSafeUrl(rawUrl);
  let response: Response | null = null;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    response = await fetch(currentUrl.toString(), {
      method: "GET",
      redirect: "manual",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: {
        "User-Agent":
          "OpenTrace-RadarInnowacji/1.0 (+https://opentrace.gov.pl; EUPL-1.2 OSINT Bot)",
        Accept: "text/html,application/pdf,text/plain;q=0.9,*/*;q=0.5",
        "Accept-Language": "pl-PL,pl;q=0.9,en;q=0.6",
      },
    });

    if (
      response.status >= 300 &&
      response.status < 400 &&
      response.headers.get("location")
    ) {
      if (hop === MAX_REDIRECTS) {
        throw new Error(
          "Przekroczono maksymalną liczbę przekierowań HTTP podczas pobierania źródła."
        );
      }
      const nextRaw = new URL(
        response.headers.get("location")!,
        currentUrl
      ).toString();
      currentUrl = await validateSafeUrl(nextRaw);
      continue;
    }

    break;
  }

  if (!response) {
    throw new Error("Nie uzyskano odpowiedzi z serwera źródłowego.");
  }

  if (!response.ok) {
    throw new Error(
      `Serwer źródłowy zwrócił błąd HTTP ${response.status} dla adresu ${currentUrl.toString()}.`
    );
  }

  const contentType = (response.headers.get("content-type") || "").toLowerCase();
  const buffer = await readStreamWithLimit(response, MAX_BYTES);

  const isPdf =
    contentType.includes("application/pdf") ||
    currentUrl.pathname.toLowerCase().endsWith(".pdf") ||
    buffer.subarray(0, 5).toString("ascii") === "%PDF-";

  if (isPdf) {
    const parsedPdf = await parsePdfBuffer(buffer);
    return {
      url: currentUrl.toString(),
      contentType: "application/pdf",
      title: parsedPdf.title,
      text: parsedPdf.text,
      isPdf: true,
      byteLength: buffer.byteLength,
    };
  }

  const html = buffer.toString("utf-8");
  const $ = cheerio.load(html);

  const title =
    $("meta[property='og:title']").attr("content")?.trim() ||
    $("title").first().text().trim() ||
    $("h1").first().text().trim() ||
    null;

  $(
    "script, style, noscript, iframe, svg, canvas, nav, footer, header, aside, form, button, [role='navigation'], [aria-hidden='true']"
  ).remove();

  const mainCandidate =
    $("main, article, [role='main'], .content, #content").first().text() ||
    $("body").text();
  const cleanText = normalizeRawText(mainCandidate || $.root().text());

  if (cleanText.length < 30) {
    throw new Error(
      "Strona źródłowa nie zawiera wystarczającej ilości tekstu możliwego do analizy OSINT."
    );
  }

  return {
    url: currentUrl.toString(),
    contentType: contentType || "text/html",
    title,
    text: cleanText,
    isPdf: false,
    byteLength: buffer.byteLength,
  };
}
