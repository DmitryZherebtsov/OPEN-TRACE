1# OPEN TRACE — Radar Innowacji (HackNation 2026) — 4-Part Build Prompts

> **How to use in Cursor:**
>
> 1. Place `RadarInnowacji_HackNation2026.pdf`, `OPEN_TRACE_Podkarpacki_Impuls.pptx`, and `Oceny.pdf` in the `docs/` folder of your workspace.
>
> 2. Open Cursor in **Agent** mode and run **Part 1 → Part 2 → Part 3 → Part 4** sequentially.
>
> 3. Every prompt is written in English for maximum LLM reasoning precision while strictly enforcing **Polish** for all application UI text, database records, error messages, LLM debate outputs, and project documentation.

## PART 1 OF 4: Architecture Rules, Next.js Setup, PostgreSQL & Complete Prisma Schema (OSINT + Multi-Agent Oceny)

```
You are a Principal Full-Stack Architect and Senior TypeScript Engineer. Execute **Part 1 of 4** to build the foundation of **OPEN TRACE — Radar Innowacji** (HackNation 2026 challenge by Podkarpackie Centrum Innowacji / PCI, Team: Podkarpacki Impuls, Stolik 5B), combining both the **Hybrid OSINT Engine** (`docs/RadarInnowacji_HackNation2026.pdf`) and the **Multi-Agent Project Evaluation System ("Oceny")** (`docs/Oceny.pdf`).

CRITICAL LANGUAGE RULE: All instructions here are in English, but **100% of the generated application UI, user-facing labels, validation messages, README, and domain content MUST be in natural, professional Polish**.

### 1. Create Cursor Architecture Rules (`.cursor/rules/architecture.mdc`)
Create `.cursor/rules/architecture.mdc` with `alwaysApply: true` enforcing these mandatory constraints across all subsequent steps:
- **Tech Stack:** Next.js (App Router), TypeScript (strict mode), Tailwind CSS, PostgreSQL, Prisma ORM, `cheerio`, `pdf-parse`, `lucide-react`, `zod`.
- **EUPL-1.2 License Compliance:** The repository will be published by the Polish Ministry of Digital Affairs under `EUPL-1.2`. Never install AGPL or restrictive commercial packages. Never install vendor-locked LLM SDKs — use standard server-side HTTPS REST `fetch` against an OpenAI-compatible endpoint configured via `.env`.
- **Oslo Manual 2018 Domains & Anti-Scope:**
  - Three equal domains: `TECHNOLOGICZNY` (evaluated on TRL 1–9), `EDUKACYJNY` (TRL strictly `null`, rendered as `TRL: N/D`), and `ADMINISTRACYJNY` (TRL strictly `null`, rendered as `TRL: N/D`).
  - Anti-Scope: Never build public idea submission forms, social networks, crowdfunding, or investment brokerage payment flows.
- **Protocol „Fakty vs AI”:** Strictly separate source-verified facts (`verifiedFacts`) from AI analytical estimates (`aiEstimates`) and deterministic code calculations. Missing data must be stored as `null` and rendered in Polish as `"Brak danych w źródle"`.
- **Multi-Agent Evaluation System ("Oceny"):**
  - Every project evaluation orchestrates a 4-agent debate: **AI 1 (Adwokat)** + **AI 2 (Sceptyk)** -> **AI 4 (Weryfikator Źródeł / Fast-Check)** (validating real HTTP content of every cited URL to eliminate hallucinations until $\ge 5$ verified links are collected) -> **AI 3 (Arbiter)**.
  - All final math ($C_i$, $S_{total}$, $S_{avg}$, $S_{\%}$, PERT costs $K_{MVP\_ost}$, $K_{PILOT\_ost}$, $K_{calk}$, critical risk $R_{kryt}$, and budget table routing against $1.20 \times B_{max}$) MUST be calculated deterministically in TypeScript code, never by an LLM.
- **Security & RODO:** Enforce SSRF protection on all URL fetchers (including AI 4 link verification), keep `LLM_API_KEY` strictly server-side, and collect zero personal data (PII) or IP addresses.

### 2. Initialize Project, Docker & Licensing
1. Initialize a Next.js App Router project (`src/` directory, TypeScript, Tailwind CSS, ESLint) if not already initialized.
2. Install dependencies:
   - Production: `@prisma/client`, `cheerio`, `pdf-parse`, `lucide-react`, `zod`
   - Dev: `prisma`, `@types/pdf-parse`, `tsx`
3. Create a root `LICENSE` file containing the official `EUPL-1.2` license text and set `"license": "EUPL-1.2"` in `package.json`.
4. Create `docker-compose.yml` providing a ready-to-run `postgres:16-alpine` service (`open_trace` database) so PostgreSQL can be started locally with one command.
5. Create `.env.example` and `.env` with:
   - `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/open_trace?schema=public"`
   - `LLM_API_URL="https://api.openai.com/v1/chat/completions"`
   - `LLM_API_KEY="sk-your-server-side-api-key"`
   - `LLM_MODEL="gpt-4o-mini"`
   - `LLM_FAST_MODEL="gpt-4o-mini"`
6. Create a clean Polish `README.md` describing **OPEN TRACE — Radar Innowacji**, Tor A + Tor B hybrid OSINT architecture, the 4-Agent AI Evaluation Debate ("Oceny"), EUPL-1.2 compliance, and setup commands.

### 3. Implement Complete `prisma/schema.prisma` & Domain Types (`src/types/innovation.ts`, `src/types/evaluation.ts`)
1. Write `prisma/schema.prisma` with all OSINT core entities PLUS the Multi-Agent Evaluation ("Oceny") and Admin Budget entities:
   - Enums:
     - `Domain` (`TECHNOLOGICZNY`, `EDUKACYJNY`, `ADMINISTRACYJNY`)
     - `Pathway` (`REPLIKACJA`, `TRANSFER_TECHNOLOGII`, `BADANIA_ROZWOJ`, `KOMERCJALIZACJA`)
     - `SimilarityStatus` (`UNIKALNE`, `POKREWNE`, `POTENCJALNY_DUPLIKAT`)
     - `SourceType` (`UCZELNIA`, `SZKOLA`, `JST`, `REJESTR_PATENTOWY`, `BAZA_GRANTOWA`, `INKUBATOR_CTT`, `INNE`)
     - `SourceAvailability` (`DOSTEPNE`, `OGRANICZONE`, `BLAD_POBIERANIA`)
     - `EvaluationTable` (`TABELA_GLOWNA`, `TABELA_DRUGORZEDNA`, `ARCHIWUM_ODRZUCONE`)
   - OSINT Models:
     - `DataSource`: `id`, `url` (`@unique`), `registryName`, `institutionType` (`SourceType`), `lastScannedAt`, `availability`, timestamps, `innovations`.
     - `Innovation`: `id`, `title`, `summary`, `problem`, `solution`, `domain` (`Domain`), `creator`, `institution`, `isPreIndexed` (`Boolean @default(false)`), `verifiedFacts` (`Json`), `sourceId`, `scoring`, `similarities`, `pathways`, `evaluations`, timestamps, plus indexes on `domain`, `isPreIndexed`, `institution`, `title`.
     - `ScoringBreakdown`: `id`, `innovationId` (`@unique`), `implementationLevel` (`Int` 1–5), `trl` (`Int?` 1–9 or `null`), `innovativeness` (`Int` 1–5), `transferPotential` (`Int` 1–5), `credibilityIndex` (`Int` 1–5), `credibilityDetails` (`Json`), `aiEstimates` (`Json`), timestamps.
     - `SimilarityMatch`: `id`, `innovationId`, `registry`, `matchedTitle`, `matchedReferenceId`, `matchPercent` (`Float`), `status` (`SimilarityStatus`), `functionalDifferences`, `createdAt`.
     - `TransferPathway`: `id`, `innovationId`, `pathway` (`Pathway`), `rationale`, `targetGroups` (`String[]`), `kpis` (`Json`), `createdAt`.
     - `ScanJob`: `id`, `kind`, `target`, `status`, `startedAt`, `durationMs` (`Int`), `recordsFound` (`Int`), `innovationId` (`String?`), `errors` (`Json?`).
   - Multi-Agent Evaluation ("Oceny") & Admin Models:
     - `AdminSettings`: `id` (`String @id @default("default")`), `maxBudgetPln` (`Float @default(250000)`), `toleranceMultiplier` (`Float @default(1.20)`), `updatedAt` (`DateTime @updatedAt`).
     - `ProjectEvaluation`: `id`, `innovationId` (`String?` optional relation to `Innovation`), `projectTitle` (`String`), `projectDescription` (`String`), `advocateReport` (`Json`), `skepticReport` (`Json`), `verifierLogs` (`Json`), `arbiterReport` (`Json`), `c1ChallengeFit` (`Float`), `c2Originality` (`Float`), `c3UsabilityUx` (`Float`), `c4Completeness` (`Float`), `c5Scalability` (`Float`), `totalScore` (`Float`), `avgScore` (`Float`), `percentScore` (`Float`), `pertMvpCostPln` (`Float`), `pertPilotCostPln` (`Float`), `totalPertCostPln` (`Float`), `criticalRiskPercent` (`Float`), `budgetLimitSnapshotPln` (`Float`), `targetTable` (`EvaluationTable`), `durationMs` (`Int`), `createdAt` (`DateTime @default(now())`), `updatedAt` (`DateTime @updatedAt`).
2. Create `src/lib/prisma.ts` (singleton PrismaClient), `src/types/innovation.ts`, and `src/types/evaluation.ts` with strict TypeScript interfaces matching the exact Polish JSON schema from `docs/Oceny.pdf` (`rola`, `oceny_podkategorii`, `koszty_pln`, `podobne_problemy`, `podsumowanie_decyzji`, `VerifierResult`).
3. Run `npx prisma generate` (and if PostgreSQL is accessible, `npx prisma db push`) and verify zero TypeScript errors.

```

## PART 2 OF 4: Tor A Pre-Indexed Knowledge Base & Seeded Multi-Agent Evaluations

```
Execute **Part 2 of 4** for **OPEN TRACE — Radar Innowacji**: build the comprehensive `prisma/seed.ts` script populating:
1. Default `AdminSettings` (`maxBudgetPln: 250000`, `toleranceMultiplier: 1.20`, meaning `B_limit = 300 000 PLN`).
2. The **Tor A Pre-Indexed Knowledge Base** (15 realistic Polish innovations across all 3 Oslo Manual 2018 domains and Polish/EU registries so local search executes in `< 200 ms`).
3. Pre-populated **Multi-Agent Debate Evaluations (`ProjectEvaluation`)** demonstrating all 3 routing tables (`TABELA_GLOWNA`, `TABELA_DRUGORZEDNA`, `ARCHIWUM_ODRZUCONE`).

All data in `prisma/seed.ts` MUST be in **Polish**. Configure `"prisma": { "seed": "tsx prisma/seed.ts" }` in `package.json` and make `prisma/seed.ts` idempotent.

### 1. Seed the Two Mandatory Reference Validation Cases (in Polish)
1. **Przypadek 1 — Technologiczny:**
   - **Title:** `"Autonomiczna diagnostyka infrastruktury energetycznej"`
   - **Creator & Institution:** `"Zespół Badawczy Systemów Bezzałogowych i Termowizji"` / `"Politechnika Rzeszowska im. Ignacego Łukasiewicza"`
   - **DataSource:** `url: "https://bip.prz.edu.pl/raporty-br/autonomiczna-diagnostyka-sieci-2025"`, `registryName: "NCBR / Repozytorium Uczelni"`, `institutionType: "UCZELNIA"`
   - **Domain:** `TECHNOLOGICZNY`, `isPreIndexed: true`
   - **verifiedFacts:** `institution: "Politechnika Rzeszowska im. Ignacego Łukasiewicza"`, `publicationDate: "2025-11-14"`, `sourceUrl: "https://bip.prz.edu.pl/raporty-br/autonomiczna-diagnostyka-sieci-2025"`, `formalIdentifier: "NCBR/LIDER/14/0082/2024"`, `verbatimQuotes` (40 km grid test, 12 public buildings, 94.2% detection efficacy, -65% inspection time), `authorMetrics`, `budgetOrCost: null` (to demonstrate `"Brak danych w źródle"`), `hasSupplementaryDocs: true`.
   - **ScoringBreakdown:** `implementationLevel: 4`, `trl: 6`, `innovativeness: 4`, `transferPotential: 5`, `credibilityIndex: 5`, plus Polish rationales in `aiEstimates`.
   - **SimilarityMatch (2 records):** 2 `UPRP` records (`P.441902` at `58.0%`, `P.438115` at `56.5%`, status `POKREWNE`) highlighting the unique failure prediction module.
   - **TransferPathway:** `TRANSFER_TECHNOLOGII` & `KOMERCJALIZACJA` (`-65% czasu inspekcji`, `TRL 8 w 12 mies.`).

2. **Przypadek 2 — Administracyjny / Edukacyjny:**
   - **Title:** `"Predykcja posiłków i redukcja marnowania żywności w szkołach"`
   - **Creator & Institution:** `"Wydział Edukacji i Cyfryzacji"` / `"Urząd Gminy Boguchwała"`
   - **DataSource:** `url: "https://bip.boguchwala.pl/biuletyn-samorzadowy/2025-10-predykcja-posilkow-szkolnych"`, `registryName: "Biuletyn Samorządowy JST"`, `institutionType: "JST"`
   - **Domain:** `ADMINISTRACYJNY`, `isPreIndexed: true`
   - **verifiedFacts:** `institution: "Gmina Boguchwała (6 szkół podstawowych)"`, `publicationDate: "2025-10-22"`, `formalIdentifier: null`, `verbatimQuotes` (6 primary schools, 28% waste drop in 1 semester), `authorMetrics` (`-28% odpadów`, `40–50 tys. zł/rok na placówkę`), `budgetOrCost: null`, `hasSupplementaryDocs: true`.
   - **ScoringBreakdown:** `implementationLevel: 5`, `trl: null` (`N/D`), `innovativeness: 4`, `transferPotential: 5`, `credibilityIndex: 4` (4 of 5 deterministic attributes), plus Polish rationales in `aiEstimates`.
   - **SimilarityMatch:** `Interreg Europe` (`IE-PGI05821` at `64.0%`, `POKREWNE`; no patent matches `< 55%`).
   - **TransferPathway:** `REPLIKACJA` (`40–50 tys. zł/rok na placówkę`, `adaptacja < 3 tygodni bez nakładów na IT`).

### 2. Add 13 Additional Pre-Indexed Polish Innovations (Total = 15 Innovations)
Create 13 more realistic Polish innovations across `UPRP`, `EPO`, `PBN`, `PPM`, `PAN`, `BazTol`, `Google Scholar`, `NCBR`, `PARP`, `NCN`, `CORDIS`, `Interreg Europe` (4 `TECHNOLOGICZNY` with TRL 1–9, 4 `EDUKACYJNY` with `trl: null`, 5 `ADMINISTRACYJNY` with `trl: null`).

### 3. Seed 3 Full Multi-Agent Evaluations (`ProjectEvaluation`) Covering All 3 Tables
Create 3 complete, realistic `ProjectEvaluation` records with full 15-subcategory `advocateReport`, `skepticReport`, `verifierLogs` (5 verified links), and `arbiterReport` JSONs, plus exact mathematically consistent scores and PERT costs:
1. **Evaluation 1 (Linked to Przypadek 2 — School Food Prediction):**
   - `totalScore: 43.33` ($S_{avg} = 8.67$, $S_{\%} = 86.7\%$), `pertMvpCostPln: 28000`, `pertPilotCostPln: 42000`, `totalPertCostPln: 70000` ($\le 300\,000$ PLN limit), `criticalRiskPercent: 20.0` (1 unaddressed out of 5 critical problems) -> `targetTable: "TABELA_GLOWNA"`.
2. **Evaluation 2 (Linked to Przypadek 1 — Autonomous Drone Grid Diagnostics):**
   - `totalScore: 41.67` ($S_{avg} = 8.33$, $S_{\%} = 83.3\%$), `pertMvpCostPln: 145000`, `pertPilotCostPln: 215000`, `totalPertCostPln: 360000` ($> 300\,000$ PLN limit, substantively great but exceeds $1.20 \times B_{max}$), `criticalRiskPercent: 40.0` -> `targetTable: "TABELA_DRUGORZEDNA"`.
3. **Evaluation 3 (Low-scoring unvalidated concept — e.g., `"Ogólnopolski portal społecznościowy dla wynalazców bez weryfikacji źródeł"`):**
   - `totalScore: 19.50` ($S_{avg} = 3.90$, $S_{\%} = 39.0\% < 25$ pkt), `totalPertCostPln: 180000`, `criticalRiskPercent: 80.0` -> `targetTable: "ARCHIWUM_ODRZUCONE"`.

Start PostgreSQL via `docker compose up -d` if needed, run `npx prisma db push` and `npx prisma db seed`, and verify all records exist in the database.

```

## PART 3 OF 4: Tor B OSINT Scraper, Multi-Agent Debate Engine ("Oceny") & REST API

```
Execute **Part 3 of 4** for **OPEN TRACE — Radar Innowacji**: implement the complete server-side OSINT pipeline (Tor B), hybrid OSINT scoring engine ("Fakty vs AI"), the **4-Agent Debate Evaluation Engine ("Oceny")** from `docs/Oceny.pdf`, and all REST API routes. All error messages, LLM system prompts, and outputs must be in **Polish**.

### 1. SSRF-Safe OSINT Scraper & Parser (`src/lib/scraper.ts`)
Implement `src/lib/scraper.ts`:
- **`validateSafeUrl(rawUrl: string)`**: Allow ONLY `http:` and `https:`; block `localhost`, `*.local`, `*.internal`; resolve DNS (`dns.lookup({ all: true })`) and block ALL loopback, private, link-local, and reserved IPv4/IPv6 ranges (`127.0.0.0/8`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `169.254.0.0/16`, `0.0.0.0/8`, `::1`, `fc00::/7`, `fe80::/10`). Throw Polish error: `"Zablokowano próbę dostępu do sieci wewnętrznej lub niedozwolonego adresu (ochrona SSRF)."`
- **`fetchAndParseUrl(url: string)`**: `AbortSignal.timeout(15000)`, max `10 MB` download limit, parse PDFs via `pdf-parse` and HTML via `cheerio` (strip scripts/styles/nav/footer, extract clean text up to 25,000 chars). Also export `parsePdfBuffer` and `normalizeRawText`.

### 2. OSINT Protocol „Fakty vs AI” Extractor & Deterministic Scoring (`src/lib/llm-extractor.ts`, `src/lib/scoring-engine.ts`)
- **`src/lib/llm-extractor.ts`**: Call server-side HTTPS REST endpoint (`LLM_API_URL`, `LLM_API_KEY`, `LLM_MODEL`), validate with `zod`, separate `verifiedFacts` (exact quotes, institution, date, URL, `formalIdentifier`, `authorMetrics`, `budgetOrCost` — strictly `null` if absent) from `aiEstimates` (`domain`, `implementationLevel`, `trl`, `innovativeness`, `transferPotential` + Polish rationales). Hard guardrail: force `trl = null` whenever `domain !== "TECHNOLOGICZNY"`. Include a clean Polish deterministic heuristic fallback if `LLM_API_KEY` is missing or unreachable.
- **`src/lib/scoring-engine.ts`**:
  - Deterministic `calculateCredibilityIndex` (`1..5`) from the 5 verifiable attributes (`.gov.pl`/`.edu.pl`/official registry domain, identified creator/institution, formal patent/grant ID, measurable numeric results, supplementary docs).
  - Fast `< 200 ms` `computeSimilarityMatches` classifying `< 55%` (`UNIKALNE`), `55–79%` (`POKREWNE`), and `>= 80%` (`POTENCJALNY_DUPLIKAT`) with Polish `functionalDifferences`.
  - Deterministic `generateTransferPathways` assigning pathway, target groups, and Polish KPIs.

### 3. Multi-Agent Debate Engine ("Oceny") (`src/lib/multi-agent-evaluator.ts`)
Implement the exact 4-agent pipeline specified in `docs/Oceny.pdf`:
1. **Shared Zod Schema (`EvaluationAgentReportSchema`)**:
   - `rola`: `"ADWOKAT" | "SCEPTYK" | "ARBITER"`
   - `oceny_podkategorii`: all 5 categories (`kat_1_zwiazek_z_wyzwaniem`, `kat_2_pomysl_i_oryginalnosc`, `kat_3_uzytecznosc_i_ux`, `kat_4_kompletnosc_prototypu`, `kat_5_potencjal_wdrozeniowy`) and all 15 subcategories (`1_1_trafnosc_diagnozy`, `1_2_adekwatnosc_rozwiazania`, `1_3_mierzalnosc_efektow`, `2_1_poziom_nowosci`, `2_2_wyroznik_antyduplikacja`, `2_3_kreatywnosc_podejscia`, `3_1_prostota_wdrozenia`, `3_2_dostepnosc_inkluzywnosc`, `3_3_wartosc_dla_odbiorcy`, `4_1_dojrzalosc_mvp`, `4_2_spojnosc_architektury`, `4_3_realizm_techniczny`, `5_1_skalowalnosc`, `5_2_transfer_komercjalizacja`, `5_3_bezpieczenstwo_prawo`), each `{ punkty: z.number().int().min(1).max(10), uzasadnienie: z.string().min(10) }`.
   - `koszty_pln`: `{ koszt_mvp: z.number().nonnegative(), uzasadnienie_mvp: z.string(), koszt_pilotazu: z.number().nonnegative(), uzasadnienie_pilotazu: z.string() }`.
   - `podobne_problemy`: array of `{ nazwa_projektu, link_url, opis_problemu, czy_krytyczny: boolean, jak_rozwiazano, czy_zaadresowany_w_projekcie?: boolean }`.
   - `podsumowanie_decyzji`: `string`.
2. **Step A — Parallel Debate (`AI 1 Adwokat` + `AI 2 Sceptyk`)**:
   - Run **AI 1 (Adwokat)** (optimistic/minimal realistic PLN costs, $\ge 5$ solved similar cases with real URLs, defending all 15 subcategories) and **AI 2 (Sceptyk)** (pessimistic PLN costs including hidden RODO/integration/training/delay costs, $\ge 5$ critical failure/delay cases with real URLs, critiquing all 15 subcategories) in parallel using the Polish system prompts from `docs/Oceny.pdf`.
3. **Step B — Source Verification Loop (`AI 4 Weryfikator Źródeł / Fast-Check`)**:
   - Collect all URLs from `AI 1` and `AI 2`. For each URL, fetch actual page text using `fetchAndParseUrl` (with SSRF protection) and call `LLM_FAST_MODEL` as **AI 4 (Weryfikator Źródeł)** returning `{ link_url, status: "ZWERYFIKOWANY" | "CZĘŚCIOWO_ZGODNY" | "HALUCYNACJA", czy_projekt_istnieje, zgodnosc_nazwy_i_opisu_procent, krotkie_uzasadnienie }`.
   - Reject all `HALUCYNACJA` links. If fewer than 5 verified (`ZWERYFIKOWANY` or `CZĘŚCIOWO_ZGODNY`) cases remain, trigger up to 2 targeted replenishment attempts (querying the LLM for replacement real sources and verifying them via HTTP + AI 4, supplemented if needed by verified URLs from the local Tor A `DataSource` registry so every link passed to the Arbiter is 100% real and verified).
4. **Step C — Final Verdict (`AI 3 Arbiter`)**:
   - Pass original project description, `AI 1` report, `AI 2` report, and ONLY the verified reference cases from `AI 4` to **AI 3 (Arbiter)**. Enforce $\ge 5$ verified problems in `podobne_problemy` with `czy_krytyczny` and `czy_zaadresowany_w_projekcie`.
5. **Step D — Deterministic Math & Table Routing (`calculateDeterministicEvaluation`)**:
   - Using `AI 3` subcategory scores $p_{i,j}$ ($i \in 1..5, j \in 1..3$):
     - $C_i = (p_{i,1} + p_{i,2} + p_{i,3}) / 3$
     - $S_{total} = C_1 + C_2 + C_3 + C_4 + C_5$ (scale 5–50)
     - $S_{avg} = S_{total} / 5$ (scale 1–10) and $S_{\%} = (S_{total} / 50) \times 100$
   - PERT Cost Formulas:
     - $K_{MVP\_ost} = (K_{MVP\_AI1} + 4 \times K_{MVP\_AI3} + K_{MVP\_AI2}) / 6$
     - $K_{PILOT\_ost} = (K_{PILOT\_AI1} + 4 \times K_{PILOT\_AI3} + K_{PILOT\_AI2}) / 6$
     - $K_{calk} = K_{MVP\_ost} + K_{PILOT\_ost}$
   - Critical Risk Index:
     - $R_{kryt} = N_{kryt\_wszystkie} > 0 ? (N_{kryt\_niezaadresowane} / N_{kryt\_wszystkie}) \times 100 : 0$
   - Budget Routing against `AdminSettings.maxBudgetPln` ($B_{max}$) and $B_{limit} = 1.20 \times B_{max}$:
     - If $S_{total} < 25$ $\rightarrow$ `ARCHIWUM_ODRZUCONE`
     - Else if $K_{calk} \le B_{limit}$ $\rightarrow$ `TABELA_GLOWNA`
     - Else $\rightarrow$ `TABELA_DRUGORZEDNA`
   - Include a rich Polish offline heuristic fallback so live demo runs work seamlessly even without an active external API key.

### 4. REST API Endpoints (`src/app/api/...`)
- `GET /api/innovations` & `GET /api/innovations/[id]`
- `POST /api/scan` & `GET /api/jobs`
- `GET /api/evaluations` (filterable by `table`: `TABELA_GLOWNA`, `TABELA_DRUGORZEDNA`, `ARCHIWUM_ODRZUCONE`) & `GET /api/evaluations/[id]`
- `POST /api/evaluate`: Accepts `{ innovationId?: string, title?: string, description?: string }`, runs the full 4-agent debate pipeline, persists `ProjectEvaluation`, and returns the full evaluation result.
- `GET /api/admin/budget` & `PATCH /api/admin/budget`: Reads/updates `AdminSettings.maxBudgetPln` ($B_{max}$) and automatically re-evaluates `targetTable` for all existing `ProjectEvaluation` records whenever $B_{max}$ changes!

Run `npx tsc --noEmit` to verify zero TypeScript errors.

```

## PART 4 OF 4: Polish Frontend UI/UX, 6 Personas, Multi-Agent "Oceny" Dashboard & Final Build

```
Execute **Part 4 of 4** for **OPEN TRACE — Radar Innowacji**: build the complete **Polish-language** Next.js App Router frontend UI uniting the **OSINT Radar Discovery & Scanner**, the **6 User Personas Switcher**, and the **Multi-Agent Project Evaluation ("Oceny AI") & Admin Budget Panel**.

### 1. Visual Identity & Navigation (`src/app/layout.tsx`, `src/app/globals.css`)
- Design a modern, authoritative Polish institutional & analytical UI inspired by **OPEN TRACE — Radar Innowacji** (deep indigo/violet palette `#4C1D95` / `#6D28D9`, clean slate cards, emerald badges for verified facts/links, amber/rose indicators for risks, and subtle radar SVG geometry).
- Top navigation bar with 3 clear Polish workspace tabs:
  1. **Radar OSINT (`Odkrywanie i Skaner`)** — Tor A search + Tor B on-demand URL/PDF/text scanner.
  2. **Oceny Wieloagentowe (`Debata 4 AI`)** — 3 routing tables (`Tabela Główna`, `Tabela Drugorzędna`, `Archiwum / Odrzucone`), live debate launcher, and detailed 15-subcategory breakdown.
  3. **Panel Administratora (`Budżet B_max`)** — budget configuration ($B_{max}$ and live $120\%$ threshold $B_{limit}$) with instant re-routing of evaluated projects.
- Ensure 100% of visible UI text, tooltips, placeholders, and badges are in **Polish**.

### 2. Header & 6 User Personas Switcher (`src/components/RoleSwitcher.tsx`)
Implement **„Przełącznik perspektywy użytkownika”** across all 6 target groups (`JST`, `SZKOLY`, `UCZELNIE`, `INWESTORZY`, `STARTUPY`, `WYNALAZCY`), dynamically adjusting default filters, highlighted KPIs, and recommended pathways, stored solely in React state / `localStorage` (RODO compliant).

### 3. Radar OSINT Discovery, On-Demand Scanner & Innovation Card (`src/app/page.tsx`, `src/components/ScannerPanel.tsx`, `src/components/InnovationCard.tsx`)
- **Discovery (Tor A):** Instant search bar with `< 200 ms` latency badge, domain filter tabs (`Wszystkie`, `Technologiczna`, `Edukacyjna`, `Administracyjna`), credibility/implementation filters, and Innovation preview cards.
- **On-Demand Scanner (`Skan doraźny`):** Tabs for **Adres URL** (SSRF-protected), **Plik PDF** (up to 10 MB), and **Tekst źródłowy** (with 2 one-click Polish sample presets), plus collapsible `ScanJob` logs.
- **Innovation Card (`/innovations/[id]` & modal):**
  - Strict two-layer **„Fakty vs AI”** split: **Warstwa faktów (`verifiedFacts`)** with verbatim quotes and `"Brak danych w źródle"` for missing fields vs. **Warstwa analityczna (`aiEstimates + kod`)** with the 5-dimensional matrix (including `TRL: N/D` for non-tech domains and the 5-attribute deterministic `Indeks wiarygodności źródła`), `SimilarityMatch` bars (`<55%`, `55–79%`, `>=80%`), and `TransferPathway` KPIs.
  - Prominent CTA button: **„Uruchom Ocenę Wieloagentową (Debata 4 AI)”** triggering `POST /api/evaluate` and opening the full debate report.

### 4. Multi-Agent Evaluation ("Oceny AI") Views & Admin Budget Panel (`src/app/oceny/page.tsx`, `src/components/EvaluationDetail.tsx`, `src/app/admin/page.tsx`)
- **Evaluation Launcher & 3 Routing Tables (`/oceny`):**
  - Form to evaluate either an existing database innovation OR any pasted project concept.
  - Live 4-step debate progress indicator (`1. AI 1 Adwokat + AI 2 Sceptyk` → `2. AI 4 Weryfikator Źródeł (Fast-Check URL)` → `3. AI 3 Arbiter (Sędzia)` → `4. Wzory PERT, Ryzyko i Routing Budżetowy`).
  - Three clear tabs/tables reflecting `docs/Oceny.pdf`:
    - **Tabela Główna** ($S_{total} \ge 25\text{ pkt}$ oraz $K_{calk} \le 1{,}20 \times B_{max}$) — recommended for main budget.
    - **Tabela Drugorzędna** ($S_{total} \ge 25\text{ pkt}$ oraz $K_{calk} > 1{,}20 \times B_{max}$) — substantively strong, awaiting external grants.
    - **Archiwum / Odrzucone** ($S_{total} < 25\text{ pkt}$) — requires concept revision.
- **Detailed Multi-Agent Debate Report (`EvaluationDetail`):**
  - Executive KPI cards: **Wynik końcowy** ($S_{total}/50\text{ pkt}$, $S_{avg}/10$, $S_{\%}$), **Koszt urealniony PERT** ($K_{calk}$ vs $B_{limit}$), **Wskaźnik Ryzyka Krytycznego** ($R_{kryt}\%$), and **Tabela docelowa** badge.
  - **5 Categories (20% each) & 15 Subcategories Accordion/Table:** Displays `AI 3 Arbiter` final score (`1–10`) alongside side-by-side arguments from **AI 1 (Adwokat)**, **AI 2 (Sceptyk)**, and **AI 3 (Arbiter)** for every single one of the 15 subcategories.
  - **PERT Cost Breakdown Table:** Shows MVP and Pilot estimates from `AI 1` (optymistyczny), `AI 2` (pesymistyczny), `AI 3` (realistyczny), and the resulting PERT totals ($K_{MVP\_ost} + K_{PILOT\_ost} = K_{calk}$).
  - **Verified Similar Problems & AI 4 Fast-Check Log:** Lists the $\ge 5$ verified reference projects with clickable URLs, `AI 4` verification status badges (`ZWERYFIKOWANY` / `CZĘŚCIOWO_ZGODNY` + count of rejected `HALUCYNACJA` links), `czy_krytyczny` badge, and `czy_zaadresowany_w_projekcie` (`Tak` / `Nie — Ryzyko`).
- **Admin Budget Panel (`/admin`):**
  - Input for maximum budget per project $B_{max}$ (in PLN), live calculation of the `120%` tolerance limit ($B_{limit} = 1{,}20 \times B_{max}$), save button calling `PATCH /api/admin/budget`, and immediate feedback showing how projects moved between `Tabela Główna` and `Tabela Drugorzędna`.

### 5. Final End-to-End Verification
Run these commands in the terminal and fix every single TypeScript, ESLint, Prisma, or Next.js build issue until all succeed with zero errors:
1. `npx prisma generate`
2. `npx tsc --noEmit`
3. `npm run build`

```