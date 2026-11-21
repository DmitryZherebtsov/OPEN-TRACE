# OPEN TRACE — Radar Innowacji (HackNation 2026)

**Wyzwanie:** Podkarpackie Centrum Innowacji (PCI) — Radar Innowacji  
**Zespół:** Podkarpacki Impuls (Stolik 5B)  
**Licencja:** EUPL-1.2 (zgodność z wymogami publikacji Ministerstwa Cyfryzacji)

---

## Przegląd systemu

**OPEN TRACE — Radar Innowacji** to otwarta, instytucjonalna platforma analityczna klasy OSINT oraz wieloagentowego audytu projektów, zaprojektowana w celu błyskawicznego odkrywania, weryfikacji i oceny innowacji w trzech równorzędnych domenach **Podręcznika Oslo 2018**:

- **Technologiczna (`TECHNOLOGICZNY`)** — oceniana na skali gotowości technologicznej `TRL 1–9`.
- **Edukacyjna (`EDUKACYJNY`)** — wskaźnik `TRL` ściśle wyłączony (`null` → renderowany jako `TRL: N/D`).
- **Administracyjna (`ADMINISTRACYJNY`)** — wskaźnik `TRL` ściśle wyłączony (`null` → renderowany jako `TRL: N/D`).

### Architektura hybrydowa OSINT (Tor A + Tor B)

1. **Tor A — Pre-indeksowana Baza Wiedzy (`< 200 ms`)**  
   Lokalna baza PostgreSQL zasilona 15 realistycznymi innowacjami z polskich i europejskich rejestrów (`UPRP`, `EPO`, `PBN`, `PPM`, `PAN`, `BazTol`, `Google Scholar`, `NCBR`, `PARP`, `NCN`, `CORDIS`, `Interreg Europe`, `BIP JST`), zapewniająca natychmiastowe wyszukiwanie, filtrowanie i dopasowanie podobieństwa antyduplikacyjnego.
2. **Tor B — Skaner doraźny (URL, PDF do 10 MB, Tekst źródłowy)**  
   Chroniony przed atakami SSRF ekstraktor treści (`cheerio` + `pdf-parse`) współpracujący z **Protokołem „Fakty vs AI”** — bezwzględnie oddzielającym zweryfikowane fakty źródłowe (`verifiedFacts`, brak danych = `"Brak danych w źródle"`) od estymacji analitycznych AI (`aiEstimates`) oraz deterministycznego kodu (Indeks wiarygodności źródła `1–5`, klasyfikacja podobieństwa, ścieżki transferu i KPI).

### System Wieloagentowej Oceny Projektów („Debata 4 AI”)

Każdy projekt może zostać poddany ustrukturyzowanej, transparentnej ocenie w 4-etapowym potoku:

1. **AI 1 (Adwokat)** i **AI 2 (Sceptyk)** — równoległa analiza 15 podkategorii (5 kategorii × 20%), estymacja kosztów MVP i pilotażu w PLN (wariant optymistyczny vs pesymistyczny) oraz wskazanie co najmniej 5 podobnych przypadków referencyjnych.
2. **AI 4 (Weryfikator Źródeł / Fast-Check)** — realne pobranie treści każdego zacytowanego adresu URL (z ochroną SSRF), odrzucenie halucynacji (`HALUCYNACJA`) oraz ewentualne uzupełnienie puli do $\ge 5$ zweryfikowanych źródeł.
3. **AI 3 (Arbiter / Sędzia)** — ostateczny werdykt na podstawie debaty i wyłącznie zweryfikowanych źródeł.
4. **Deterministyczna matematyka i routing budżetowy (TypeScript):**
   - Średnie kategorii $C_i$, wynik końcowy $S_{total}$ (5–50 pkt), $S_{avg}$ (1–10) i $S_{\%}$.
   - Koszty urealnione PERT: $K_{MVP\_ost}$, $K_{PILOT\_ost}$ i $K_{calk} = K_{MVP\_ost} + K_{PILOT\_ost}$.
   - Wskaźnik Ryzyka Krytycznego $R_{kryt}$ (% niezaadresowanych problemów krytycznych).
   - Automatyczne kierowanie względem budżetu $B_{max}$ i progu tolerancji $B_{limit} = 1{,}20 \times B_{max}$ do jednej z 3 tabel: **Tabela Główna**, **Tabela Drugorzędna** lub **Archiwum / Odrzucone**.

### Bezpieczeństwo, RODO i Zgodność z EUPL-1.2

- **Brak vendor lock-in LLM:** komunikacja z modelami odbywa się wyłącznie po stronie serwera poprzez standardowy `fetch` HTTPS REST do dowolnego endpointu zgodnego z OpenAI Chat Completions API (konfigurowanego w `.env`).
- **Ochrona SSRF:** blokada protokołów innych niż `http`/`https`, nazw lokalnych (`localhost`, `*.local`, `*.internal`) oraz prywatnych i zarezerwowanych adresów IPv4/IPv6 po rozwiązaniu DNS (także w przekierowaniach).
- **RODO (Zero PII):** system nie zbiera danych osobowych ani adresów IP; przełącznik 6 perspektyw użytkownika (`JST`, `SZKOLY`, `UCZELNIE`, `INWESTORZY`, `STARTUPY`, `WYNALAZCY`) działa wyłącznie w pamięci przeglądarki (`localStorage`).
- **Anti-Scope:** brak publicznych formularzy zgłaszania pomysłów, funkcji społecznościowych, crowdfundingu i pośrednictwa płatniczego.

---

## Szybki start

### Wymagania wstępne
- Node.js 20+ oraz npm
- Docker Desktop / Docker Engine (dla lokalnej instancji PostgreSQL 16)

### 1. Instalacja zależności i konfiguracja środowiska

```bash
npm install
cp .env.example .env
```

Uzupełnij w pliku `.env` własny klucz `LLM_API_KEY` (opcjonalnie — bez aktywnego klucza system automatycznie uruchamia deterministyczny tryb analityczny offline w języku polskim).

### 2. Uruchomienie PostgreSQL, migracja schematu i zasilenie bazy (Tor A + Oceny)

```bash
docker compose up -d
npx prisma generate
npx prisma db push
npx prisma db seed
```

### 3. Uruchomienie aplikacji

```bash
npm run dev
```

Aplikacja będzie dostępna pod adresem `http://localhost:3000`:
- `/` — **Radar OSINT** (Odkrywanie Tor A + Skaner doraźny Tor B)
- `/oceny` — **Oceny Wieloagentowe (Debata 4 AI)**
- `/admin` — **Panel Administratora (Budżet $B_{max}$)**

### 4. Weryfikacja produkcyjna

```bash
npx prisma generate
npx tsc --noEmit
npm run build
```
