import { PrismaClient, Prisma } from "@prisma/client";
import { calculateCredibilityIndex } from "../src/lib/scoring-engine";
import { calculateDeterministicEvaluation } from "../src/lib/evaluation-math";
import type {
  Domain,
  Pathway,
  SimilarityStatus,
  SourceType,
  VerifiedFacts,
} from "../src/types/innovation";
import type {
  EvaluationAgentReport,
  VerifierResult,
} from "../src/types/evaluation";

const prisma = new PrismaClient();

interface SeedInnovationInput {
  key: string;
  url: string;
  registryName: string;
  institutionType: SourceType;
  title: string;
  summary: string;
  problem: string;
  solution: string;
  domain: Domain;
  creator: string;
  institution: string;
  verifiedFacts: VerifiedFacts;
  implementationLevel: number;
  trl: number | null;
  innovativeness: number;
  transferPotential: number;
  aiEstimates: {
    domainRationale: string;
    implementationRationale: string;
    trlRationale: string;
    innovativenessRationale: string;
    transferPotentialRationale: string;
    modelUsed: string;
  };
  similarities: Array<{
    registry: string;
    matchedTitle: string;
    matchedReferenceId: string;
    matchPercent: number;
    status: SimilarityStatus;
    functionalDifferences: string;
  }>;
  pathways: Array<{
    pathway: Pathway;
    rationale: string;
    targetGroups: string[];
    kpis: Array<{ metric: string; target: string; timeframe: string }>;
  }>;
}

const PRE_INDEXED_INNOVATIONS: SeedInnovationInput[] = [
  // =========================================================================
  // PRZYPADEK 1 (OBOWIĄZKOWY WZORZEC WALIDACYJNY — TECHNOLOGICZNY)
  // =========================================================================
  {
    key: "przypadek-1-diagnostyka-energetyczna",
    url: "https://bip.prz.edu.pl/raporty-br/autonomiczna-diagnostyka-sieci-2025",
    registryName: "NCBR / Repozytorium Uczelni",
    institutionType: "UCZELNIA",
    title: "Autonomiczna diagnostyka infrastruktury energetycznej",
    summary:
      "Autonomiczny system bezzałogowych statków powietrznych z kamerą termowizyjną i modułem predykcji awarii linii średniego napięcia oraz instalacji ciepłowniczych budynków użyteczności publicznej.",
    problem:
      "Tradycyjne inspekcje napowietrznych linii energetycznych i węzłów ciepłowniczych są czasochłonne, kosztowne i obarczone wysokim ryzykiem przeoczenia mikrouszkodzeń izolatorów przed wystąpieniem awarii masowej.",
    solution:
      "Połączenie autonomicznego lotu BSP po korytarzu georeferencyjnym z analizą wielospektralną i algorytmem wczesnej predykcji przegrzań złącz oraz ubytków izolacji, generującym automatyczny raport serwisowy GIS.",
    domain: "TECHNOLOGICZNY",
    creator: "Zespół Badawczy Systemów Bezzałogowych i Termowizji",
    institution: "Politechnika Rzeszowska im. Ignacego Łukasiewicza",
    verifiedFacts: {
      institution: "Politechnika Rzeszowska im. Ignacego Łukasiewicza",
      publicationDate: "2025-11-14",
      sourceUrl:
        "https://bip.prz.edu.pl/raporty-br/autonomiczna-diagnostyka-sieci-2025",
      formalIdentifier: "NCBR/LIDER/14/0082/2024",
      verbatimQuotes: [
        "Przeprowadzono walidację polową na odcinku 40 km sieci dystrybucyjnej oraz w 12 budynkach użyteczności publicznej na terenie województwa podkarpackiego.",
        "Osiągnięto skuteczność detekcji anomalii termicznych na poziomie 94,2% przy skróceniu czasu inspekcji o 65% względem przeglądów ręcznych.",
      ],
      authorMetrics: [
        "40 km przetestowanej sieci energetycznej",
        "12 przebadanych budynków publicznych",
        "94,2% skuteczności detekcji anomalii",
        "-65% czasu trwania inspekcji",
      ],
      budgetOrCost: null,
      hasSupplementaryDocs: true,
    },
    implementationLevel: 4,
    trl: 6,
    innovativeness: 4,
    transferPotential: 5,
    aiEstimates: {
      domainRationale:
        "Innowacja inżynieryjna łącząca bezzałogowe statki powietrzne, sensory termowizyjne i modele predykcyjne — domena technologiczna wg Podręcznika Oslo 2018.",
      implementationRationale:
        "Rozwiązanie zweryfikowane w środowisku zbliżonym do operacyjnego na 40 km sieci i 12 obiektach publicznych (poziom 4/5).",
      trlRationale:
        "TRL 6/9 — demonstracja prototypu w warunkach terenowych z potwierdzonymi parametrami dokładności 94,2%.",
      innovativenessRationale:
        "Wyróżnikiem jest zintegrowany moduł predykcji awarii izolatorów sprzężony z automatycznym planowaniem misji BVLOS.",
      transferPotentialRationale:
        "Bardzo wysoki potencjał licencjonowania dla operatorów OSD (PGE, Tauron, Energa, Enea) oraz przedsiębiorstw ciepłowniczych.",
      modelUsed: "Pre-indeksowana analiza ekspercka OPEN TRACE (Tor A)",
    },
    similarities: [
      {
        registry: "UPRP",
        matchedTitle:
          "Sposób bezzałogowej inspekcji wizyjnej linii elektroenergetycznych wysokiego napięcia",
        matchedReferenceId: "P.441902",
        matchPercent: 58.0,
        status: "POKREWNE",
        functionalDifferences:
          "Zgłoszenie P.441902 obejmuje wyłącznie akwizycję obrazu wizyjnego bez zintegrowanego modułu predykcji awarii termicznych oraz diagnostyki obiektów komunalnych.",
      },
      {
        registry: "UPRP",
        matchedTitle:
          "Układ rejestracji termowizyjnej zamontowany na platformie wielowirnikowej",
        matchedReferenceId: "P.438115",
        matchPercent: 56.5,
        status: "POKREWNE",
        functionalDifferences:
          "Rozwiązanie P.438115 nie posiada autonomicznego silnika korelacji danych meteorologicznych i modułu wczesnej predykcji usterek sieci.",
      },
    ],
    pathways: [
      {
        pathway: "TRANSFER_TECHNOLOGII",
        rationale:
          "Gotowość TRL 6 pozwala na bezpośrednie wdrożenie pilotażowe u operatora sieci dystrybucyjnej oraz spółek ciepłowniczych przez CTT Politechniki Rzeszowskiej.",
        targetGroups: [
          "Operatorzy Systemów Dystrybucyjnych (OSD)",
          "Miejskie Przedsiębiorstwa Energetyki Cieplnej (MPEC)",
          "Centra Transferu Technologii",
        ],
        kpis: [
          {
            metric: "Redukcja czasu inspekcji sieci",
            target: "-65% czasu inspekcji",
            timeframe: "Pilotaż 6 mies.",
          },
          {
            metric: "Podniesienie gotowości technologicznej",
            target: "TRL 8 w 12 mies.",
            timeframe: "12 miesięcy",
          },
        ],
      },
      {
        pathway: "KOMERCJALIZACJA",
        rationale:
          "Możliwość powołania spółki spin-off świadczącej usługę diagnostyki predykcyjnej (Inspection-as-a-Service) w całej Polsce.",
        targetGroups: [
          "Fundusze VC deep-tech",
          "Spółki celowe uczelni",
          "Operatorzy farm fotowoltaicznych i wiatrowych",
        ],
        kpis: [
          {
            metric: "Kontrakty pilotażowe z operatorami",
            target: "min. 2 umowy komercyjne",
            timeframe: "12 miesięcy",
          },
          {
            metric: "Spadek awaryjności nieplanowanej",
            target: "-25% przestojów na monitorowanych odcinkach",
            timeframe: "18 miesięcy",
          },
        ],
      },
    ],
  },

  // =========================================================================
  // PRZYPADEK 2 (OBOWIĄZKOWY WZORZEC WALIDACYJNY — ADMINISTRACYJNY)
  // =========================================================================
  {
    key: "przypadek-2-predykcja-posilkow",
    url: "https://bip.boguchwala.pl/biuletyn-samorzadowy/2025-10-predykcja-posilkow-szkolnych",
    registryName: "Biuletyn Samorządowy JST",
    institutionType: "JST",
    title: "Predykcja posiłków i redukcja marnowania żywności w szkołach",
    summary:
      "Niskokosztowy model organizacyjno-analityczny wdrożony w 6 szkołach podstawowych Gminy Boguchwała, łączący poranne zgłoszenia absencji z prostą predykcją zapotrzebowania stołówek szkolnych.",
    problem:
      "Brak szybkiego obiegu informacji o nieobecnościach uczniów oraz sztywne normy zamawiania posiłków powodują marnowanie 25–35% obiadów w stołówkach szkolnych finansowanych przez samorządy.",
    solution:
      "Uproszczona procedura porannego bilansowania obecności z wykorzystaniem istniejących arkuszy i dziennika elektronicznego oraz kalibracja gramatur porcji bez konieczności zakupu kosztownego oprogramowania IT.",
    domain: "ADMINISTRACYJNY",
    creator: "Wydział Edukacji i Cyfryzacji",
    institution: "Urząd Gminy Boguchwała",
    verifiedFacts: {
      institution: "Gmina Boguchwała (6 szkół podstawowych)",
      publicationDate: "2025-10-22",
      sourceUrl:
        "https://bip.boguchwala.pl/biuletyn-samorzadowy/2025-10-predykcja-posilkow-szkolnych",
      formalIdentifier: null,
      verbatimQuotes: [
        "Wdrożenie objęło 6 szkół podstawowych na terenie Gminy Boguchwała i w ciągu 1 semestru obniżyło masę odpadów żywnościowych o 28%.",
        "Szacowane oszczędności budżetowe wynoszą 40–50 tys. zł rocznie w przeliczeniu na jedną placówkę przy pełnej akceptacji intendentów.",
      ],
      authorMetrics: [
        "-28% odpadów żywnościowych w 1 semestrze",
        "40–50 tys. zł/rok oszczędności na placówkę",
        "6 szkół podstawowych w pilotażu",
      ],
      budgetOrCost: null,
      hasSupplementaryDocs: true,
    },
    implementationLevel: 5,
    trl: null,
    innovativeness: 4,
    transferPotential: 5,
    aiEstimates: {
      domainRationale:
        "Innowacja organizacyjno-administracyjna w zarządzaniu usługami publicznymi JST (Podręcznik Oslo 2018).",
      implementationRationale:
        "Pełne wdrożenie operacyjne działające w 6 placówkach z udokumentowanymi wynikami finansowymi i ekologicznymi (poziom 5/5).",
      trlRationale:
        "TRL: N/D — zgodnie z Podręcznikiem Oslo 2018 skala gotowości technologicznej TRL nie ma zastosowania dla innowacji administracyjnych.",
      innovativenessRationale:
        "Wysoka efektywność osiągnięta przez przeprojektowanie procesu administracyjnego i codziennej pętli zwrotnej zamiast kosztownej cyfryzacji.",
      transferPotentialRationale:
        "Maksymalny potencjał replikacji (5/5) w ponad 2 400 gminach w Polsce bez barier licencyjnych.",
      modelUsed: "Pre-indeksowana analiza ekspercka OPEN TRACE (Tor A)",
    },
    similarities: [
      {
        registry: "Interreg Europe",
        matchedTitle:
          "Circular School Canteens — ograniczanie strat żywności w gminnych stołówkach szkolnych",
        matchedReferenceId: "IE-PGI05821",
        matchPercent: 64.0,
        status: "POKREWNE",
        functionalDifferences:
          "Praktyka z Interreg Europe (IE-PGI05821) opiera się na dedykowanych wagach IoT i płatnej aplikacji mobilnej; model Gminy Boguchwała nie wymaga inwestycji sprzętowych i integruje się z polskim dziennikiem elektronicznym (brak dopasowań patentowych > 55%).",
      },
    ],
    pathways: [
      {
        pathway: "REPLIKACJA",
        rationale:
          "Gotowy pakiet procedur i wzorów zarządzeń możliwy do bezpośredniego powielenia w każdej polskiej gminie prowadzącej stołówki szkolne.",
        targetGroups: [
          "Jednostki Samorządu Terytorialnego (JST)",
          "Dyrektorzy i intendenci szkół podstawowych",
          "Centra Usług Wspólnych (CUW)",
        ],
        kpis: [
          {
            metric: "Oszczędność budżetowa na placówkę",
            target: "40–50 tys. zł/rok na placówkę",
            timeframe: "Rok szkolny",
          },
          {
            metric: "Czas wdrożenia w nowej gminie",
            target: "adaptacja < 3 tygodni bez nakładów na IT",
            timeframe: "Start semestru",
          },
        ],
      },
    ],
  },

  // =========================================================================
  // 4 DODATKOWE INNOWACJE TECHNOLOGICZNE (TRL 1–9)
  // =========================================================================
  {
    key: "tech-3-kompozyty-medyczne-uprp",
    url: "https://ewyszukiwarka.pue.uprp.gov.pl/p445120-kompozyty-celulozowe",
    registryName: "UPRP",
    institutionType: "REJESTR_PATENTOWY",
    title:
      "Biodegradowalne kompozyty celulozowo-chitozanowe do sterylnych opakowań medycznych",
    summary:
      "Nowa receptura kompozytu barierowego pochodzenia naturalnego zastępująca wielowarstwowe folie petrochemiczne w pakowaniu jednorazowych wyrobów medycznych.",
    problem:
      "Szpitale generują tysiące ton nienadających się do recyklingu folii medycznych o wysokim śladzie węglowym, przy braku alternatyw spełniających normy sterylizacji parowej.",
    solution:
      "Sieciowana matryca z nanocelulozy bakteryjnej i chitozanu zapewniająca barierowość mikrobiologiczną oraz pełną biodegradację kompostową w 90 dni.",
    domain: "TECHNOLOGICZNY",
    creator: "Zespół Biopolimerów Funkcjonalnych",
    institution: "Instytut Chemii Bioorganicznej PAN",
    verifiedFacts: {
      institution: "Instytut Chemii Bioorganicznej PAN",
      publicationDate: "2025-09-08",
      sourceUrl:
        "https://ewyszukiwarka.pue.uprp.gov.pl/p445120-kompozyty-celulozowe",
      formalIdentifier: "P.445120",
      verbatimQuotes: [
        "Materiał zachowuje integralność barierową po sterylizacji w temperaturze 121°C przez 20 minut i ulega biodegradacji w 92% w ciągu 90 dni.",
      ],
      authorMetrics: [
        "92% biodegradacji w 90 dni",
        "Odporność na sterylizację 121°C / 20 min",
      ],
      budgetOrCost: "480 000 PLN (grant badawczy NCN/PAN)",
      hasSupplementaryDocs: true,
    },
    implementationLevel: 3,
    trl: 5,
    innovativeness: 5,
    transferPotential: 4,
    aiEstimates: {
      domainRationale:
        "Innowacja materiałowa z ochroną patentową UPRP — domena technologiczna.",
      implementationRationale:
        "Zwalidowane partie laboratoryjne w warunkach sterylizacji szpitalnej (poziom 3/5).",
      trlRationale:
        "TRL 5/9 — potwierdzona technologia w skali ćwierćtechnicznej, przed certyfikacją wyrobu medycznego.",
      innovativenessRationale:
        "Unikalna kombinacja odporności termicznej i pełnej biodegradowalności bez fluoropolimerów.",
      transferPotentialRationale:
        "Wysokie zainteresowanie krajowych producentów opakowań farmaceutycznych i medycznych.",
      modelUsed: "Pre-indeksowana analiza ekspercka OPEN TRACE (Tor A)",
    },
    similarities: [
      {
        registry: "EPO",
        matchedTitle: "Cellulose-based barrier film for food packaging",
        matchedReferenceId: "EP3981422B1",
        matchPercent: 48.0,
        status: "UNIKALNE",
        functionalDifferences:
          "Patent europejski EP3981422B1 dotyczy opakowań spożywczych i nie wytrzymuje sterylizacji autoklawowej wymaganej w medycynie.",
      },
    ],
    pathways: [
      {
        pathway: "BADANIA_ROZWOJ",
        rationale:
          "Wymagane badania zgodności z normą PN-EN ISO 11607 i uruchomienie linii pilotażowej w ramach programu FENG.",
        targetGroups: [
          "Instytuty PAN i uczelnie chemiczne",
          "Producenci opakowań medycznych",
        ],
        kpis: [
          {
            metric: "Certyfikacja barierowości medycznej",
            target: "Zgodność z ISO 11607",
            timeframe: "12 miesięcy",
          },
        ],
      },
    ],
  },
  {
    key: "tech-4-falownik-mikrosieci-epo",
    url: "https://worldwide.espacenet.com/patent/EP4192841A1",
    registryName: "EPO",
    institutionType: "REJESTR_PATENTOWY",
    title:
      "Hybrydowy falownik magazynujący energię dla mikrosieci budynków gminnych",
    summary:
      "Dwukierunkowy falownik z algorytmem sterowania szczytowego umożliwiający pracę wyspową szkół i urzędów gminnych podczas przerw w dostawie energii.",
    problem:
      "Gminne instalacje fotowoltaiczne wyłączają się przy wzroście napięcia w sieci lub zaniku zasilania, pozbawiając obiekty kryzysowe niezależności energetycznej.",
    solution:
      "Modułowa architektura energoelektroniczna z predykcyjnym równoważeniem faz i automatycznym przełączaniem w tryb wyspowy w czasie poniżej 10 ms.",
    domain: "TECHNOLOGICZNY",
    creator: "Katedra Energoelektroniki i Automatyki Systemów",
    institution: "Akademia Górniczo-Hutnicza w Krakowie",
    verifiedFacts: {
      institution: "Akademia Górniczo-Hutnicza w Krakowie",
      publicationDate: "2025-07-19",
      sourceUrl: "https://worldwide.espacenet.com/patent/EP4192841A1",
      formalIdentifier: "EP4192841A1",
      verbatimQuotes: [
        "Prototyp przemysłowy o mocy 50 kW pracował nieprzerwanie przez 6 miesięcy w gminnym centrum zarządzania kryzysowego, zwiększając autokonsumpcję OZE o 41%.",
      ],
      authorMetrics: [
        "+41% autokonsumpcji energii z OZE",
        "Przełączenie wyspowe < 10 ms",
        "Moc znamionowa 50 kW (6 mies. testów)",
      ],
      budgetOrCost: "1 120 000 PLN (projekt konsorcjalny)",
      hasSupplementaryDocs: true,
    },
    implementationLevel: 4,
    trl: 7,
    innovativeness: 4,
    transferPotential: 5,
    aiEstimates: {
      domainRationale:
        "Zaawansowana energoelektronika ze zgłoszeniem w Europejskim Urzędzie Patentowym (EPO).",
      implementationRationale:
        "Demonstrator 50 kW przetestowany przez pół roku w realnym obiekcie komunalnym (poziom 4/5).",
      trlRationale:
        "TRL 7/9 — działający prototyp w środowisku operacyjnym gotowy do certyfikacji seryjnej.",
      innovativenessRationale:
        "Aktywna kompensacja asymetrii faz w sieciach wiejskich o dużym nasyceniu prosumentów.",
      transferPotentialRationale:
        "Wysoki popyt wśród klastrów energii, spółdzielni energetycznych oraz JST.",
      modelUsed: "Pre-indeksowana analiza ekspercka OPEN TRACE (Tor A)",
    },
    similarities: [
      {
        registry: "EPO",
        matchedTitle: "Grid-forming inverter with battery buffer",
        matchedReferenceId: "EP4012330A1",
        matchPercent: 62.5,
        status: "POKREWNE",
        functionalDifferences:
          "Rozwiązanie AGH wprowadza algorytm lokalnego równoważenia faz pod kątem słabych sieci wiejskich oraz integrację z taryfami dynamicznymi.",
      },
    ],
    pathways: [
      {
        pathway: "KOMERCJALIZACJA",
        rationale:
          "Gotowość TRL 7 uzasadnia sprzedaż licencji krajowemu producentowi rozdzielnic lub wdrożenie w spółdzielniach energetycznych.",
        targetGroups: [
          "Spółdzielnie i klastry energii",
          "Producenci aparatury elektroenergetycznej",
          "JST budujące magazyny energii",
        ],
        kpis: [
          {
            metric: "Wzrost autokonsumpcji OZE w JST",
            target: "+35–45% autokonsumpcji",
            timeframe: "12 miesięcy",
          },
        ],
      },
    ],
  },
  {
    key: "tech-5-biosensory-wody-cordis",
    url: "https://cordis.europa.eu/project/id/101148201",
    registryName: "CORDIS",
    institutionType: "BAZA_GRANTOWA",
    title:
      "Biosensory grafenowe do ciągłego monitoringu jakości wód powierzchniowych",
    summary:
      "Autonomiczna boja pomiarowa z wymiennymi chipami grafenowymi wykrywająca zakwity złotych alg, zasolenie i metale ciężkie w czasie rzeczywistym.",
    problem:
      "Laboratoryjne analizy próbek rzecznych dają wynik z opóźnieniem 24–72 godzin, uniemożliwiając wczesną reakcję służb kryzysowych na skażenia.",
    solution:
      "Sieć tanich czujników elektrochemicznych z transmisją LoRaWAN i panelem ostrzegania dla WIOŚ oraz gmin nadbrzeżnych.",
    domain: "TECHNOLOGICZNY",
    creator: "Konsorcjum AquaSense-PL",
    institution: "Sieć Badawcza Łukasiewicz — IMiF",
    verifiedFacts: {
      institution: "Sieć Badawcza Łukasiewicz — IMiF",
      publicationDate: "2025-06-30",
      sourceUrl: "https://cordis.europa.eu/project/id/101148201",
      formalIdentifier: "HORIZON-CL6-2024-101148201",
      verbatimQuotes: [
        "Wdrożenie 8 stacji pomiarowych w dorzeczu Wisłoka skróciło czas wykrycia incydentu zasolenia z 36 godzin do 4 minut.",
      ],
      authorMetrics: [
        "Czas detekcji skażenia: 4 minuty (zamiast 36 h)",
        "8 stacji testowych w dorzeczu Wisłoka",
      ],
      budgetOrCost: null,
      hasSupplementaryDocs: true,
    },
    implementationLevel: 4,
    trl: 6,
    innovativeness: 5,
    transferPotential: 4,
    aiEstimates: {
      domainRationale:
        "Mikroelektronika sensorowa i telemetria środowiskowa finansowana w Horyzoncie Europa (CORDIS).",
      implementationRationale:
        "Zainstalowany pilotaż terenowy 8 boj pomiarowych w warunkach rzecznych.",
      trlRationale:
        "TRL 6/9 — weryfikacja w środowisku naturalnym z potwierdzoną stabilnością kalibracji.",
      innovativenessRationale:
        "Redukcja kosztu pojedynczej stacji pomiarowej o ponad 60% względem analizatorów optycznych.",
      transferPotentialRationale:
        "Zastosowanie w całym kraju przez Wody Polskie, WIOŚ oraz przedsiębiorstwa wodociągowe.",
      modelUsed: "Pre-indeksowana analiza ekspercka OPEN TRACE (Tor A)",
    },
    similarities: [
      {
        registry: "CORDIS",
        matchedTitle: "Smart River Telemetry Network",
        matchedReferenceId: "H2020-869112",
        matchPercent: 52.0,
        status: "UNIKALNE",
        functionalDifferences:
          "Projekt H2020-869112 wykorzystywał klasyczne sondy konduktometryczne bez selektywnych matryc grafenowych na metale ciężkie.",
      },
    ],
    pathways: [
      {
        pathway: "TRANSFER_TECHNOLOGII",
        rationale:
          "Gotowe API danych telemetrycznych dla służb środowiskowych i gminnych centrów zarządzania kryzysowego.",
        targetGroups: [
          "WIOŚ i Wody Polskie",
          "Przedsiębiorstwa wodociągowe",
          "JST w zlewniach rzek",
        ],
        kpis: [
          {
            metric: "Skrócenie czasu alarmowania",
            target: "< 10 minut od incydentu",
            timeframe: "Pilotaż regionalny",
          },
        ],
      },
    ],
  },
  {
    key: "tech-6-robot-uvc-parp",
    url: "https://mapadotacji.gov.pl/projekty/feng-0101-robot-uvc-szpitale",
    registryName: "PARP",
    institutionType: "BAZA_GRANTOWA",
    title:
      "Autonomiczny robot dezynfekujący UV-C z mapowaniem SLAM dla szpitali powiatowych",
    summary:
      "Mobilna jednostka autonomiczna dokumentująca dawkę promieniowania UV-C na każdej powierzchni sali operacyjnej zgodnie z normami sanepid.",
    problem:
      "Zakażenia szpitalne generują wysokie koszty leczenia powikłań, a ręczna dezynfekcja sal wydłuża przerwy między zabiegami.",
    solution:
      "Robot z nawigacją LiDAR SLAM wyznaczający optymalną ścieżkę naświetlania i automatycznie generujący certyfikat dezynfekcji w systemie HIS.",
    domain: "TECHNOLOGICZNY",
    creator: "Zespół Robotyki Medycznej",
    institution: "Politechnika Śląska / MedRobo Sp. z o.o.",
    verifiedFacts: {
      institution: "Politechnika Śląska / MedRobo Sp. z o.o.",
      publicationDate: "2025-05-12",
      sourceUrl:
        "https://mapadotacji.gov.pl/projekty/feng-0101-robot-uvc-szpitale",
      formalIdentifier: "FENG.01.01-IP.02-0412/24",
      verbatimQuotes: [
        "Wdrożenie w 3 szpitalach powiatowych skróciło czas przygotowania sali zabiegowej o 42% przy redukcji drobnoustrojów o 99,97%.",
      ],
      authorMetrics: [
        "99,97% redukcji patogenów",
        "-42% czasu przygotowania sali",
        "3 szpitale powiatowe w wdrożeniu",
      ],
      budgetOrCost: "890 000 PLN (PARP FENG Ścieżka SMART)",
      hasSupplementaryDocs: true,
    },
    implementationLevel: 5,
    trl: 8,
    innovativeness: 4,
    transferPotential: 5,
    aiEstimates: {
      domainRationale:
        "Autonomiczna robotyka medyczna z certyfikacją bezpieczeństwa — domena technologiczna.",
      implementationRationale:
        "Produkt wdrożony w 3 realnych szpitalach powiatowych (poziom 5/5).",
      trlRationale:
        "TRL 8/9 — pełny system skompletowany i zwalidowany w środowisku klinicznym.",
      innovativenessRationale:
        "Automatyczne raportowanie dawki promieniowania na obiektach w cieniu optycznym dzięki 3D SLAM.",
      transferPotentialRationale:
        "Natychmiastowa możliwość skalowania w sieci szpitali powiatowych i wojewódzkich.",
      modelUsed: "Pre-indeksowana analiza ekspercka OPEN TRACE (Tor A)",
    },
    similarities: [
      {
        registry: "UPRP",
        matchedTitle: "Mobilna lampa bakteriobójcza sterowana zdalnie",
        matchedReferenceId: "W.130841",
        matchPercent: 59.0,
        status: "POKREWNE",
        functionalDifferences:
          "Wzór użytkowy W.130841 wymaga ręcznego przestawiania i nie wykonuje mapowania dawek UV-C ani integracji z dokumentacją szpitalną.",
      },
    ],
    pathways: [
      {
        pathway: "KOMERCJALIZACJA",
        rationale:
          "Model wynajmu długoterminowego (Robotics-as-a-Service) eliminuje barierę jednorazowego wydatku inwestycyjnego dla szpitali powiatowych.",
        targetGroups: [
          "Szpitale powiatowe i kliniczne",
          "Organy założycielskie (starostwa powiatowe)",
        ],
        kpis: [
          {
            metric: "Skrócenie rotacji sal zabiegowych",
            target: "-40% czasu przestoju sali",
            timeframe: "3 miesiące",
          },
        ],
      },
    ],
  },

  // =========================================================================
  // 4 INNOWACJE EDUKACYJNE (TRL STRICTLY NULL -> N/D)
  // =========================================================================
  {
    key: "edu-7-asystent-spektrum-pbn",
    url: "https://pbn.nauka.gov.pl/core/#/publication/view/open-trace-edu-asd-2025",
    registryName: "PBN",
    institutionType: "UCZELNIA",
    title:
      "Adaptacyjny asystent dydaktyczny dla uczniów ze spektrum autyzmu i dysleksją",
    summary:
      "Otwarty zestaw kart pracy, scenariuszy lekcji i narzędzia upraszczania poleceń wspierający nauczycieli wspomagających w szkołach masowych.",
    problem:
      "Nauczyciele w klasach integracyjnych poświęcają średnio 6–8 godzin tygodniowo na ręczne dostosowywanie arkuszy zadań dla uczniów ze specjalnymi potrzebami edukacyjnymi (SPE).",
    solution:
      "Metodyka projektowania uniwersalnego (UDL) połączona z otwartą biblioteką piktogramów i szablonów ułatwiających indywidualizację poleceń zgodną z podstawą programową.",
    domain: "EDUKACYJNY",
    creator: "Zakład Pedagogiki Specjalnej",
    institution: "Uniwersytet Rzeszowski",
    verifiedFacts: {
      institution: "Uniwersytet Rzeszowski",
      publicationDate: "2025-09-18",
      sourceUrl:
        "https://pbn.nauka.gov.pl/core/#/publication/view/open-trace-edu-asd-2025",
      formalIdentifier: "PBN-2025-UR-09142",
      verbatimQuotes: [
        "Pilotaż w 14 szkołach podstawowych województwa podkarpackiego zmniejszył czas przygotowania materiałów SPE o 55% i zwiększył samodzielność pracy uczniów o 31%.",
      ],
      authorMetrics: [
        "-55% czasu przygotowania materiałów przez nauczyciela",
        "+31% samodzielności uczniów SPE",
        "14 szkół podstawowych w pilotażu",
      ],
      budgetOrCost: null,
      hasSupplementaryDocs: true,
    },
    implementationLevel: 4,
    trl: null,
    innovativeness: 4,
    transferPotential: 5,
    aiEstimates: {
      domainRationale:
        "Innowacja pedagogiczna i metodyczna skierowana do szkół — domena edukacyjna (Oslo 2018).",
      implementationRationale:
        "Przetestowana przez pełny rok szkolny w 14 szkołach podstawowych (poziom 4/5).",
      trlRationale:
        "TRL: N/D — dla innowacji edukacyjnych nie stosuje się skali gotowości technologicznej TRL.",
      innovativenessRationale:
        "Spójne połączenie metodyki UDL z otwartymi materiałami licencjonowanymi bezpłatnie dla szkół.",
      transferPotentialRationale:
        "Gotowość do natychmiastowego udostępnienia przez kuratoria i ośrodki doskonalenia nauczycieli.",
      modelUsed: "Pre-indeksowana analiza ekspercka OPEN TRACE (Tor A)",
    },
    similarities: [
      {
        registry: "Google Scholar",
        matchedTitle: "Universal Design for Learning worksheets in primary schools",
        matchedReferenceId: "DOI:10.1080/edu.2023.412",
        matchPercent: 49.5,
        status: "UNIKALNE",
        functionalDifferences:
          "Publikacja zagraniczna nie uwzględnia polskiej podstawy programowej ani specyfiki orzeczeń o potrzebie kształcenia specjalnego.",
      },
    ],
    pathways: [
      {
        pathway: "REPLIKACJA",
        rationale:
          "Otwarta publikacja pakietu metodycznego wraz ze szkoleniem kaskadowym dla nauczycieli wspomagających.",
        targetGroups: [
          "Szkoły podstawowe i ponadpodstawowe",
          "Poradnie Psychologiczno-Pedagogiczne",
          "Ośrodki Doskonalenia Nauczycieli",
        ],
        kpis: [
          {
            metric: "Liczba wdrożeń w szkołach",
            target: "≥ 50 placówek w 12 miesięcy",
            timeframe: "Rok szkolny",
          },
        ],
      },
    ],
  },
  {
    key: "edu-8-symulacje-pierwszej-pomocy-ppm",
    url: "https://ppm.edu.pl/info/project/symulacje-pierwszej-pomocy-szkoly-2025",
    registryName: "PPM",
    institutionType: "UCZELNIA",
    title:
      "Scenariusze symulacji pierwszej pomocy i edukacji zdrowotnej dla szkół ponadpodstawowych",
    summary:
      "Program praktycznych warsztatów symulacyjnych z udziałem studentów ratownictwa medycznego podnoszący kompetencje uczniów w reagowaniu na nagłe stany zagrożenia życia.",
    problem:
      "Zajęcia z edukacji dla bezpieczeństwa często ograniczają się do teorii, przez co ponad 65% absolwentów szkół średnich obawia się podjęcia resuscytacji.",
    solution:
      "Standaryzowane moduły 90-minutowych symulacji sytuacyjnych prowadzonych w szkołach z niskokosztowymi fantomami treningowymi i kartami samooceny.",
    domain: "EDUKACYJNY",
    creator: "Centrum Symulacji Medycznej",
    institution: "Collegium Medicum Uniwersytetu Rzeszowskiego",
    verifiedFacts: {
      institution: "Collegium Medicum Uniwersytetu Rzeszowskiego",
      publicationDate: "2025-04-28",
      sourceUrl:
        "https://ppm.edu.pl/info/project/symulacje-pierwszej-pomocy-szkoly-2025",
      formalIdentifier: "PPM-UR-2025-0188",
      verbatimQuotes: [
        "Przeszkolono 1 850 uczniów z 19 liceów i techników; gotowość do podjęcia RKO wzrosła z 34% przed warsztatami do 89% po 3 miesiącach.",
      ],
      authorMetrics: [
        "1 850 przeszkolonych uczniów w 19 szkołach",
        "Wzrost gotowości do RKO z 34% do 89%",
      ],
      budgetOrCost: "62 000 PLN (środki uczelniane i JST)",
      hasSupplementaryDocs: true,
    },
    implementationLevel: 5,
    trl: null,
    innovativeness: 3,
    transferPotential: 5,
    aiEstimates: {
      domainRationale:
        "Innowacyjny program kształcenia praktycznego młodzieży — domena edukacyjna.",
      implementationRationale:
        "Wdrożony na dużą skalę (1 850 uczniów, 19 placówek) z ewaluacją odroczoną po 3 miesiącach.",
      trlRationale:
        "TRL: N/D — innowacja edukacyjna nie podlega ocenie na skali TRL.",
      innovativenessRationale:
        "Efektywny model partnerstwa uczelni medycznej z samorządami przy minimalnym koszcie jednostkowym (ok. 33 zł/ucznia).",
      transferPotentialRationale:
        "Bardzo łatwa replikacja w każdym województwie posiadającym kierunki medyczne lub ratownicze.",
      modelUsed: "Pre-indeksowana analiza ekspercka OPEN TRACE (Tor A)",
    },
    similarities: [
      {
        registry: "PPM",
        matchedTitle: "Program edukacji RKO w szkołach podstawowych",
        matchedReferenceId: "PPM-WUM-2022-041",
        matchPercent: 57.5,
        status: "POKREWNE",
        functionalDifferences:
          "Model z Rzeszowa obejmuje scenariusze wieloosobowe dla szkół średnich (wypadki komunikacyjne, AED, wstrząs) oraz udział studentów w ramach praktyk.",
      },
    ],
    pathways: [
      {
        pathway: "REPLIKACJA",
        rationale:
          "Porozumienia ramowe pomiędzy uczelniami medycznymi a starostwami powiatowymi.",
        targetGroups: [
          "Szkoły ponadpodstawowe",
          "Uczelnie medyczne",
          "Starostwa powiatowe",
        ],
        kpis: [
          {
            metric: "Utrzymanie kompetencji RKO po 3 mies.",
            target: "≥ 85% uczestników",
            timeframe: "1 semestr",
          },
        ],
      },
    ],
  },
  {
    key: "edu-9-mikrolaboratoria-iot-scholar",
    url: "https://scholar.google.com/scholar?q=otwarte+mikrolaboratoria+iot+edukacja+podkarpacie",
    registryName: "Google Scholar",
    institutionType: "SZKOLA",
    title:
      "Otwarte mikrolaboratoria pomiarowe i programowania dla pracowni przedmiotowych",
    summary:
      "Zestaw otwartych scenariuszy doświadczeń z fizyki, biologii i geografii wykorzystujący niedrogie mikrokontrolery z programu Laboratoria Przyszłości.",
    problem:
      "W wielu szkołach sprzęt zakupiony w ramach programów doposażenia pozostaje niewykorzystany z powodu braku gotowych kart lekcyjnych powiązanych z podstawą programową.",
    solution:
      "Repozytorium 36 gotowych eksperymentów klasowych (pomiar CO2, pH, natężenia światła, przyspieszenia) z instrukcją krok po kroku dla nauczycieli przedmiotów przyrodniczych.",
    domain: "EDUKACYJNY",
    creator: "Zespół Nauczycieli Przedmiotów Zawodowych",
    institution: "Zespół Szkół Technicznych w Rzeszowie",
    verifiedFacts: {
      institution: "Zespół Szkół Technicznych w Rzeszowie",
      publicationDate: "2025-03-10",
      sourceUrl:
        "https://scholar.google.com/scholar?q=otwarte+mikrolaboratoria+iot+edukacja+podkarpacie",
      formalIdentifier: null,
      verbatimQuotes: [
        "W 11 szkołach partnerskich wykorzystanie posiadanych zestawów mikrokontrolerów na lekcjach wzrosło z 12% do 78% w trakcie jednego semestru.",
      ],
      authorMetrics: [
        "Wzrost wykorzystania sprzętu szkolnego z 12% do 78%",
        "36 otwartych scenariuszy lekcji",
        "11 szkół partnerskich",
      ],
      budgetOrCost: null,
      hasSupplementaryDocs: true,
    },
    implementationLevel: 4,
    trl: null,
    innovativeness: 4,
    transferPotential: 5,
    aiEstimates: {
      domainRationale:
        "Metodyka aktywizacji pracowni przedmiotowych w szkołach — domena edukacyjna.",
      implementationRationale:
        "Zwalidowane w 11 szkołach partnerskich z mierzalnym wzrostem użycia posiadanego sprzętu.",
      trlRationale:
        "TRL: N/D — innowacje edukacyjne oceniane są poziomem wdrożenia, nie skalą TRL.",
      innovativenessRationale:
        "Odblokowuje wartość inwestycji już poniesionych w szkołach bez potrzeby zakupu nowego sprzętu.",
      transferPotentialRationale:
        "Otwarte licencje umożliwiają wdrożenie w każdej polskiej szkole posiadającej pracownię.",
      modelUsed: "Pre-indeksowana analiza ekspercka OPEN TRACE (Tor A)",
    },
    similarities: [
      {
        registry: "Google Scholar",
        matchedTitle: "Low-cost Arduino physics experiments in secondary schools",
        matchedReferenceId: "GS-2024-8821",
        matchPercent: 61.0,
        status: "POKREWNE",
        functionalDifferences:
          "Polski pakiet integruje fizykę, biologię i geografię dokładnie pod siatkę godzin 45-minutowych oraz sprzęt z polskich pracowni.",
      },
    ],
    pathways: [
      {
        pathway: "REPLIKACJA",
        rationale:
          "Udostępnienie na portalu Zintegrowanej Platformy Edukacyjnej (ZPE) i w sieci regionalnych centrów edukacji.",
        targetGroups: ["Szkoły podstawowe i średnie", "Nauczyciele STEM"],
        kpis: [
          {
            metric: "Wykorzystanie sprzętu w pracowniach",
            target: "≥ 70% pracowni aktywnych miesięcznie",
            timeframe: "1 semestr",
          },
        ],
      },
    ],
  },
  {
    key: "edu-10-mentoring-rowiesniczy-ncn",
    url: "https://projekty.ncn.gov.pl/index.php?projekt_id=589214",
    registryName: "NCN",
    institutionType: "BAZA_GRANTOWA",
    title:
      "Model mentoringu rówieśniczego i przeciwdziałania wypaleniu uczniów w szkołach wiejskich",
    summary:
      "System wczesnego wsparcia psychologiczno-pedagogicznego oparty na przeszkolonych zespołach starszych uczniów-mentorów oraz nadzorze pedagoga szkolnego.",
    problem:
      "Mniejsze szkoły na obszarach wiejskich zmagają się z deficytem psychologów oraz rosnącą absencją i kryzysami motywacyjnymi wśród młodzieży klas VII–VIII.",
    solution:
      "Ustrukturyzowany program tygodniowych spotkań rówieśniczych z protokołem eskalacji do specjalistów i wsparciem superwizyjnym online.",
    domain: "EDUKACYJNY",
    creator: "Zespół Badań nad Dobrostanem Młodzieży",
    institution: "Uniwersytet Komisji Edukacji Narodowej",
    verifiedFacts: {
      institution: "Uniwersytet Komisji Edukacji Narodowej",
      publicationDate: "2025-08-05",
      sourceUrl: "https://projekty.ncn.gov.pl/index.php?projekt_id=589214",
      formalIdentifier: "2023/49/B/HS6/02194",
      verbatimQuotes: [
        "W badaniu kontrolowanym w 16 szkołach wiejskich odnotowano spadek chronicznej absencji o 24% oraz poprawę wskaźnika poczucia przynależności szkolnej o 19 punktów procentowych.",
      ],
      authorMetrics: [
        "-24% chronicznej absencji szkolnej",
        "+19 pp. poczucia przynależności",
        "16 szkół wiejskich w badaniu",
      ],
      budgetOrCost: "310 000 PLN (grant NCN OPUS)",
      hasSupplementaryDocs: true,
    },
    implementationLevel: 4,
    trl: null,
    innovativeness: 4,
    transferPotential: 4,
    aiEstimates: {
      domainRationale:
        "Badawczo zweryfikowany model wsparcia edukacyjnego i społecznego uczniów — domena edukacyjna.",
      implementationRationale:
        "Zwalidowany w badaniu kontrolowanym w 16 szkołach wiejskich (poziom 4/5).",
      trlRationale:
        "TRL: N/D — brak zastosowania skali TRL dla domeny edukacyjnej (Oslo 2018).",
      innovativenessRationale:
        "Efektywna kompensacja niedoboru kadry psychologicznej w mniejszych gminach przy zachowaniu pełnego nadzoru merytorycznego.",
      transferPotentialRationale:
        "Możliwość wdrożenia w setkach szkół wiejskich z wykorzystaniem istniejących etatów pedagogów.",
      modelUsed: "Pre-indeksowana analiza ekspercka OPEN TRACE (Tor A)",
    },
    similarities: [
      {
        registry: "PBN",
        matchedTitle: "Tutoring rówieśniczy w liceach wielkomiejskich",
        matchedReferenceId: "PBN-2023-4410",
        matchPercent: 46.0,
        status: "UNIKALNE",
        functionalDifferences:
          "Model NCN został zaprojektowany specjalnie dla małych szkół wiejskich i łączy wsparcie rówieśnicze z protokołem zdalnej superwizji.",
      },
    ],
    pathways: [
      {
        pathway: "REPLIKACJA",
        rationale:
          "Dystrybucja otwartego podręcznika wdrożeniowego i cyklu szkoleń dla pedagogów gminnych.",
        targetGroups: ["Szkoły wiejskie", "Gminy wiejskie i miejsko-wiejskie"],
        kpis: [
          {
            metric: "Spadek nieusprawiedliwionej absencji",
            target: "-20% w ciągu roku szkolnego",
            timeframe: "12 miesięcy",
          },
        ],
      },
    ],
  },

  // =========================================================================
  // 5 DODATKOWYCH INNOWACJI ADMINISTRACYJNYCH (TRL STRICTLY NULL -> N/D)
  // =========================================================================
  {
    key: "admin-11-bilans-wody-interreg",
    url: "https://www.interregeurope.eu/good-practices/municipal-water-loss-audit-podkarpackie",
    registryName: "Interreg Europe",
    institutionType: "JST",
    title:
      "Procedura nocnego bilansowania strat wody i szybkiej lokalizacji wycieków w małych gminach",
    summary:
      "Standaryzowany model zarządzania siecią wodociągową w gminach do 15 tys. mieszkańców pozwalający ograniczyć straty wody bez wymiany całej sieci.",
    problem:
      "Małe zakłady komunalne tracą średnio 25–38% wtłaczanej wody z powodu niewykrytych mikrowycieków, nie mając budżetu na komercyjne systemy SCADA.",
    solution:
      "Strefowy harmonogram nocnych odczytów przepływów minimalnych i otwarty arkusz anomalii połączony z procedurą inspekcji akustycznej.",
    domain: "ADMINISTRACYJNY",
    creator: "Zespół ds. Gospodarki Komunalnej",
    institution: "Związek Gmin Podkarpacia",
    verifiedFacts: {
      institution: "Związek Gmin Podkarpacia",
      publicationDate: "2025-10-03",
      sourceUrl:
        "https://www.interregeurope.eu/good-practices/municipal-water-loss-audit-podkarpackie",
      formalIdentifier: "IE-PGI07114",
      verbatimQuotes: [
        "W 5 gminach pilotażowych ograniczono straty wody z 33% do 19% w ciągu 9 miesięcy, generując łącznie 610 tys. zł oszczędności na kosztach pompowania i uzdatniania.",
      ],
      authorMetrics: [
        "Spadek strat wody z 33% do 19%",
        "610 tys. zł oszczędności w 5 gminach",
        "Efekt osiągnięty w 9 miesięcy",
      ],
      budgetOrCost: "85 000 PLN (dofinansowanie Interreg Europe)",
      hasSupplementaryDocs: true,
    },
    implementationLevel: 5,
    trl: null,
    innovativeness: 4,
    transferPotential: 5,
    aiEstimates: {
      domainRationale:
        "Innowacja procesowo-administracyjna w zarządzaniu infrastrukturą komunalną JST.",
      implementationRationale:
        "Sprawdzona w 5 gminach z twardymi wynikami finansowymi i redukcją strat wody.",
      trlRationale:
        "TRL: N/D — domena administracyjna nie podlega ocenie na skali TRL (Podręcznik Oslo 2018).",
      innovativenessRationale:
        "Osiąga efekt porównywalny z drogimi systemami komercyjnymi dzięki dyscyplinie procesowej i otwartym narzędziom.",
      transferPotentialRationale:
        "Bardzo wysoki potencjał replikacji w ponad 1 500 gminach wiejskich w Polsce.",
      modelUsed: "Pre-indeksowana analiza ekspercka OPEN TRACE (Tor A)",
    },
    similarities: [
      {
        registry: "Interreg Europe",
        matchedTitle: "Smart Metering for Rural Water Utilities",
        matchedReferenceId: "IE-PGI04902",
        matchPercent: 60.5,
        status: "POKREWNE",
        functionalDifferences:
          "Praktyka podkarpacka eliminuje barierę pełnej wymiany wodomierzy na zdalne, opierając się na analizie strefowej przepływów minimalnych.",
      },
    ],
    pathways: [
      {
        pathway: "REPLIKACJA",
        rationale:
          "Szybkie wdrożenie w gminnych zakładach gospodarki komunalnej w oparciu o otwarty podręcznik.",
        targetGroups: ["Gminy wiejskie", "Zakłady Gospodarki Komunalnej"],
        kpis: [
          {
            metric: "Redukcja strat wody w sieci",
            target: "-10 do -15 pp. w 12 miesięcy",
            timeframe: "12 miesięcy",
          },
        ],
      },
    ],
  },
  {
    key: "admin-12-prosty-jezyk-baztol",
    url: "https://bip.erzeszow.pl/innowacje-administracyjne/prosty-jezyk-decyzji-2025",
    registryName: "BazTol / PAN",
    institutionType: "JST",
    title:
      "Standard prostego języka (Plain Language) i szablonów decyzji podatkowych w urzędach miast",
    summary:
      "Przeprojektowanie 42 najczęstszych pism i decyzji administracyjnych w urzędzie miasta we współpracy z językoznawcami w celu redukcji telefonów wyjaśniających i błędów formalnych.",
    problem:
      "Zawiły język urzędowy sprawia, że ponad 40% mieszkańców nie rozumie treści wezwań i decyzji podatkowych, generując kolejki w biurach obsługi i odwołania.",
    solution:
      "Zestaw 42 wzorów pism z ramką „Najważniejsze informacje w 30 sekund”, jasną instrukcją płatności oraz checklistą weryfikacji zrozumiałości (indeks FOG < 10).",
    domain: "ADMINISTRACYJNY",
    creator: "Biuro Obsługi Mieszkańca i Zespół Językoznawczy",
    institution: "Urząd Miasta Rzeszowa",
    verifiedFacts: {
      institution: "Urząd Miasta Rzeszowa",
      publicationDate: "2025-08-29",
      sourceUrl:
        "https://bip.erzeszow.pl/innowacje-administracyjne/prosty-jezyk-decyzji-2025",
      formalIdentifier: "BAZTOL-2025-PL-0419",
      verbatimQuotes: [
        "Po wdrożeniu 42 nowych wzorów pism liczba połączeń wyjaśniających na infolinii podatkowej spadła o 37%, a odsetek wniosków z brakami formalnymi zmniejszył się o 29%.",
      ],
      authorMetrics: [
        "-37% telefonów wyjaśniających na infolinii",
        "-29% wniosków z brakami formalnymi",
        "42 przeprojektowane wzory decyzji",
      ],
      budgetOrCost: null,
      hasSupplementaryDocs: true,
    },
    implementationLevel: 5,
    trl: null,
    innovativeness: 4,
    transferPotential: 5,
    aiEstimates: {
      domainRationale:
        "Innowacja usług publicznych i komunikacji urzędowej — domena administracyjna.",
      implementationRationale:
        "Pełne wdrożenie w dużym urzędzie miejskim z wymiernym odciążeniem pracowników obsługi.",
      trlRationale:
        "TRL: N/D — nie dotyczy innowacji administracyjnych (Oslo 2018).",
      innovativenessRationale:
        "Łączy rygor KPA z mierzalnym wskaźnikiem czytelności FOG oraz natychmiastowym efektem operacyjnym.",
      transferPotentialRationale:
        "Wzory pism można niemal bezkosztowo zaadaptować w każdym urzędzie gminy, miasta i starostwie.",
      modelUsed: "Pre-indeksowana analiza ekspercka OPEN TRACE (Tor A)",
    },
    similarities: [
      {
        registry: "BazTol / PAN",
        matchedTitle: "Wytyczne prostego języka dla administracji rządowej",
        matchedReferenceId: "PAN-PL-2023-112",
        matchPercent: 54.0,
        status: "UNIKALNE",
        functionalDifferences:
          "Opracowanie PAN miało charakter ogólnych rekomendacji, natomiast wdrożenie w Rzeszowie dostarcza gotowych 42 szablonów pism samorządowych zgodnych z KPA.",
      },
    ],
    pathways: [
      {
        pathway: "REPLIKACJA",
        rationale:
          "Bezpłatne udostępnienie paczki szablonów DOCX/ODT na licencji otwartej dla wszystkich JST.",
        targetGroups: ["Urzędy miast i gmin", "Starostwa powiatowe"],
        kpis: [
          {
            metric: "Spadek zapytań wyjaśniających mieszkańców",
            target: "-30% połączeń i wizyt",
            timeframe: "6 miesięcy",
          },
        ],
      },
    ],
  },
  {
    key: "admin-13-grupy-zakupowe-oze-parp",
    url: "https://bip.powiatlancut.pl/projekty/grupa-zakupowa-energia-zielona-2025",
    registryName: "PARP / BIP JST",
    institutionType: "JST",
    title:
      "Model wspólnych zamówień grupowych energii zielonej z profilem zużycia dla powiatów",
    summary:
      "Procedura agregacji profili godzinowych 38 obiektów powiatowych i gminnych w jednym przetargu z mechanizmem dynamicznego zabezpieczenia ceny.",
    problem:
      "Rozproszone przetargi energetyczne pojedynczych szkół i domów pomocy społecznej skutkują wysokimi marżami sprzedawców i brakiem siły negocjacyjnej.",
    solution:
      "Wspólna dokumentacja przetargowa PZP, standaryzacja danych licznikowych oraz podział koszyka na energię bazową i bilansowanie z lokalnych źródeł OZE.",
    domain: "ADMINISTRACYJNY",
    creator: "Wydział Zamówień Publicznych i Energetyki",
    institution: "Starostwo Powiatowe w Łańcucie",
    verifiedFacts: {
      institution: "Starostwo Powiatowe w Łańcucie",
      publicationDate: "2025-07-11",
      sourceUrl:
        "https://bip.powiatlancut.pl/projekty/grupa-zakupowa-energia-zielona-2025",
      formalIdentifier: "BZP-2025-00219844",
      verbatimQuotes: [
        "Wspólne postępowanie objęło 38 obiektów i pozwoliło uzyskać cenę MWh niższą o 18,4% względem średniej z przetargów indywidualnych, oszczędzając 420 tys. zł rocznie.",
      ],
      authorMetrics: [
        "-18,4% kosztu zakupu 1 MWh energii",
        "420 tys. zł oszczędności rocznie",
        "38 obiektów publicznych w grupie",
      ],
      budgetOrCost: "24 000 PLN (koszt doradztwa prawnego PZP)",
      hasSupplementaryDocs: true,
    },
    implementationLevel: 5,
    trl: null,
    innovativeness: 3,
    transferPotential: 5,
    aiEstimates: {
      domainRationale:
        "Innowacja w organizacji zamówień publicznych i zarządzaniu kosztami energii JST.",
      implementationRationale:
        "Zakończony i rozliczony przetarg obejmujący 38 jednostek (poziom 5/5).",
      trlRationale:
        "TRL: N/D — dla innowacji administracyjnych skala TRL nie jest stosowana.",
      innovativenessRationale:
        "Wprowadza profilowanie godzinowe i włączenie lokalnej generacji OZE do standardowego przetargu PZP.",
      transferPotentialRationale:
        "Gotowa dokumentacja SWZ do replikacji w każdym powiecie w kraju.",
      modelUsed: "Pre-indeksowana analiza ekspercka OPEN TRACE (Tor A)",
    },
    similarities: [
      {
        registry: "PARP",
        matchedTitle: "Samorządowe grupy zakupowe energii elektrycznej",
        matchedReferenceId: "PARP-JST-2023-09",
        matchPercent: 68.0,
        status: "POKREWNE",
        functionalDifferences:
          "Rozszerzenie klasycznej grupy zakupowej o automatyczne profilowanie godzinowe oraz mechanizm bilansowania lokalnych instalacji PV jednostek powiatowych.",
      },
    ],
    pathways: [
      {
        pathway: "REPLIKACJA",
        rationale:
          "Udostępnienie wzoru SWZ i arkusza agregacji profili licznikowych dla związków powiatów.",
        targetGroups: ["Powiaty", "Gminy sąsiadujące", "CUW"],
        kpis: [
          {
            metric: "Redukcja wydatków na energię",
            target: "12–20% rocznie",
            timeframe: "12 miesięcy",
          },
        ],
      },
    ],
  },
  {
    key: "admin-14-ostrzezenia-seniorow-cordis",
    url: "https://cordis.europa.eu/article/id/senior-heatwave-alert-ops-krosno",
    registryName: "CORDIS",
    institutionType: "JST",
    title:
      "System wczesnego ostrzegania seniorów przed falami upałów i smogiem przez lokalne sieci OPS",
    summary:
      "Protokół koordynacji ośrodków pomocy społecznej, wolontariuszy i komunikatów głosowych dla samotnych osób starszych podczas alertów pogodowych.",
    problem:
      "Aplikacje mobilne z alertami pogodowymi i smogowymi nie docierają do wykluczonych cyfrowo seniorów powyżej 75. roku życia, najbardziej narażonych na hospitalizację.",
    solution:
      "Dwustopniowa procedura OPS uruchamiana automatycznie przy prognozie IMGW > 30°C lub przekroczeniu PM10: automatyczne połączenie głosowe na telefon stacjonarny i wizyta sąsiedzka przy braku odbioru.",
    domain: "ADMINISTRACYJNY",
    creator: "Zespół Usług Opiekuńczych",
    institution: "Miejski Ośrodek Pomocy Społecznej w Krośnie",
    verifiedFacts: {
      institution: "Miejski Ośrodek Pomocy Społecznej w Krośnie",
      publicationDate: "2025-09-25",
      sourceUrl:
        "https://cordis.europa.eu/article/id/senior-heatwave-alert-ops-krosno",
      formalIdentifier: "HORIZON-MISS-CLIMA-2024-07",
      verbatimQuotes: [
        "W sezonie letnim 2025 objęto opieką 410 samotnych seniorów; liczba wezwań ZRM związanych z odwodnieniem spadła w tej grupie o 34%.",
      ],
      authorMetrics: [
        "410 seniorów objętych protokołem",
        "-34% interwencji ZRM w czasie upałów",
      ],
      budgetOrCost: "38 500 PLN / rok",
      hasSupplementaryDocs: true,
    },
    implementationLevel: 4,
    trl: null,
    innovativeness: 4,
    transferPotential: 5,
    aiEstimates: {
      domainRationale:
        "Innowacja w organizacji usług społecznych i zarządzaniu kryzysowym JST.",
      implementationRationale:
        "Przetestowana przez pełny sezon letni na grupie 410 beneficjentów.",
      trlRationale:
        "TRL: N/D — innowacja administracyjno-społeczna bez zastosowania TRL.",
      innovativenessRationale:
        "Przełamuje barierę wykluczenia cyfrowego seniorów poprzez proste kanały głosowe i sieć sąsiedzką.",
      transferPotentialRationale:
        "Możliwość wdrożenia w każdym ośrodku pomocy społecznej (OPS/CUS) w Polsce.",
      modelUsed: "Pre-indeksowana analiza ekspercka OPEN TRACE (Tor A)",
    },
    similarities: [
      {
        registry: "Interreg Europe",
        matchedTitle: "Silver Care Heatwave Network",
        matchedReferenceId: "IE-PGI06119",
        matchPercent: 58.5,
        status: "POKREWNE",
        functionalDifferences:
          "Model z Krosna integruje polskie komunikaty IMGW/GIOŚ z procedurami ustawowymi OPS i nie wymaga zakupu opasek telemedycznych.",
      },
    ],
    pathways: [
      {
        pathway: "REPLIKACJA",
        rationale:
          "Gotowa procedura operacyjna dla Centrów Usług Społecznych i MOPS w całej Polsce.",
        targetGroups: ["MOPS / GOPS / CUS", "Samorządy miejskie i gminne"],
        kpis: [
          {
            metric: "Skuteczność dotarcia z ostrzeżeniem",
            target: "≥ 95% objętych seniorów w 2 godziny",
            timeframe: "Sezon letni / grzewczy",
          },
        ],
      },
    ],
  },
  {
    key: "admin-15-bank-pustostanow-bip",
    url: "https://bip.przemysl.pl/gospodarka-lokalowa/elektroniczny-bank-pustostanow-2025",
    registryName: "Biuletyn Samorządowy JST",
    institutionType: "JST",
    title:
      "Przejrzysty rejestr pustostanów i bank lokali komunalnych z algorytmem kolejkowania",
    summary:
      "Uporządkowany rejestr miejskich lokali mieszkalnych i użytkowych z publicznym statusem remontowym i punktową zamianą lokali.",
    problem:
      "Rozproszone ewidencje papierowe wydłużają czas ponownego zasiedlenia lokalu komunalnego do 14 miesięcy, generując koszty utrzymania pustostanów.",
    solution:
      "Centralna ewidencja stanów technicznych z otwartą tablicą dostępności, modułem „remont za czynsz” oraz transparentną punktacją kolejki mieszkaniowej.",
    domain: "ADMINISTRACYJNY",
    creator: "Wydział Gospodarki Lokalowej",
    institution: "Urząd Miasta Przemyśla",
    verifiedFacts: {
      institution: "Urząd Miasta Przemyśla",
      publicationDate: "2025-10-09",
      sourceUrl:
        "https://bip.przemysl.pl/gospodarka-lokalowa/elektroniczny-bank-pustostanow-2025",
      formalIdentifier: null,
      verbatimQuotes: [
        "W ciągu 10 miesięcy skrócono średni czas pustostanu z 13,5 miesiąca do 5,2 miesiąca oraz oddano w programie remont za czynsz 47 lokali.",
      ],
      authorMetrics: [
        "Skrócenie czasu pustostanu z 13,5 do 5,2 mies.",
        "47 lokali zasiedlonych w formule remont za czynsz",
      ],
      budgetOrCost: null,
      hasSupplementaryDocs: false,
    },
    implementationLevel: 4,
    trl: null,
    innovativeness: 4,
    transferPotential: 4,
    aiEstimates: {
      domainRationale:
        "Innowacja organizacyjna w zarządzaniu zasobem komunalnym JST — domena administracyjna.",
      implementationRationale:
        "Wdrożona operacyjnie z udokumentowanym przyspieszeniem rotacji 47 lokali.",
      trlRationale:
        "TRL: N/D — domena administracyjna nie podlega ocenie TRL (Podręcznik Oslo 2018).",
      innovativenessRationale:
        "Łączy transparentność antykorupcyjną z realnym skróceniem okresów bezczynszowych.",
      transferPotentialRationale:
        "Wysoka przydatność dla miast średnich i dużych zarządzających zasobem komunalnym.",
      modelUsed: "Pre-indeksowana analiza ekspercka OPEN TRACE (Tor A)",
    },
    similarities: [
      {
        registry: "Biuletyn Samorządowy JST",
        matchedTitle: "Miejski Program Mieszkanie za Remont",
        matchedReferenceId: "BIP-KRA-2023-88",
        matchPercent: 63.0,
        status: "POKREWNE",
        functionalDifferences:
          "Rozwiązanie z Przemyśla dodaje publiczną tablicę statusów technicznych oraz zautomatyzowany mechanizm kojarzenia zamian lokali.",
      },
    ],
    pathways: [
      {
        pathway: "REPLIKACJA",
        rationale:
          "Możliwość wdrożenia poprzez uchwałę rady miasta i otwarty schemat bazy ewidencyjnej.",
        targetGroups: ["Miasta na prawach powiatu", "Zarządy Budynków Mieszkalnych"],
        kpis: [
          {
            metric: "Skrócenie średniego czasu pustostanu",
            target: "< 6 miesięcy",
            timeframe: "12 miesięcy",
          },
        ],
      },
    ],
  },
];

function makeSubcategoriesFromMatrix(
  scores: [
    [number, number, number],
    [number, number, number],
    [number, number, number],
    [number, number, number],
    [number, number, number],
  ],
  prefix: string
): EvaluationAgentReport["oceny_podkategorii"] {
  return {
    kat_1_zwiazek_z_wyzwaniem: {
      "1_1_trafnosc_diagnozy": {
        punkty: scores[0][0],
        uzasadnienie: `${prefix} Trafność diagnozy problemu i oparcie jej na realnych danych z instytucji docelowej (${scores[0][0]}/10).`,
      },
      "1_2_adekwatnosc_rozwiazania": {
        punkty: scores[0][1],
        uzasadnienie: `${prefix} Stopień dopasowania mechanizmu rozwiązania do zdiagnozowanej luki operacyjnej (${scores[0][1]}/10).`,
      },
      "1_3_mierzalnosc_efektow": {
        punkty: scores[0][2],
        uzasadnienie: `${prefix} Jakość i weryfikowalność wskaźników rezultatu KPI oraz oszczędności (${scores[0][2]}/10).`,
      },
    },
    kat_2_pomysl_i_oryginalnosc: {
      "2_1_poziom_nowosci": {
        punkty: scores[1][0],
        uzasadnienie: `${prefix} Ocena nowości w skali regionalnej i krajowej względem obecnych praktyk (${scores[1][0]}/10).`,
      },
      "2_2_wyroznik_antyduplikacja": {
        punkty: scores[1][1],
        uzasadnienie: `${prefix} Wyróżnik funkcjonalny i brak duplikacji z istniejącymi zgłoszeniami patentowymi/grantowymi (${scores[1][1]}/10).`,
      },
      "2_3_kreatywnosc_podejscia": {
        punkty: scores[1][2],
        uzasadnienie: `${prefix} Pomysłowość architektury procesowej lub inżynieryjnej (${scores[1][2]}/10).`,
      },
    },
    kat_3_uzytecznosc_i_ux: {
      "3_1_prostota_wdrozenia": {
        punkty: scores[2][0],
        uzasadnienie: `${prefix} Próg wejścia, czas adaptacji oraz obciążenie kadrowe odbiorcy końcowego (${scores[2][0]}/10).`,
      },
      "3_2_dostepnosc_inkluzywnosc": {
        punkty: scores[2][1],
        uzasadnienie: `${prefix} Dostępność cyfrowa, czytelność procedur i inkluzywność dla użytkowników (${scores[2][1]}/10).`,
      },
      "3_3_wartosc_dla_odbiorcy": {
        punkty: scores[2][2],
        uzasadnienie: `${prefix} Bezpośrednia wartość użytkowa dla samorządu, szkół lub obywateli (${scores[2][2]}/10).`,
      },
    },
    kat_4_kompletnosc_prototypu: {
      "4_1_dojrzalosc_mvp": {
        punkty: scores[3][0],
        uzasadnienie: `${prefix} Poziom weryfikacji MVP w warunkach pilotażowych lub operacyjnych (${scores[3][0]}/10).`,
      },
      "4_2_spojnosc_architektury": {
        punkty: scores[3][1],
        uzasadnienie: `${prefix} Spójność komponentów organizacyjnych, danych i narzędzi analitycznych (${scores[3][1]}/10).`,
      },
      "4_3_realizm_techniczny": {
        punkty: scores[3][2],
        uzasadnienie: `${prefix} Realizm harmonogramu i wykonalność w przewidzianych zasobach (${scores[3][2]}/10).`,
      },
    },
    kat_5_potencjal_wdrozeniowy: {
      "5_1_skalowalnosc": {
        punkty: scores[4][0],
        uzasadnienie: `${prefix} Możliwość powielenia w dziesiątkach lub setkach jednostek w Polsce (${scores[4][0]}/10).`,
      },
      "5_2_transfer_komercjalizacja": {
        punkty: scores[4][1],
        uzasadnienie: `${prefix} Potencjał transferu, replikacji publicznej lub komercjalizacji licencyjnej (${scores[4][1]}/10).`,
      },
      "5_3_bezpieczenstwo_prawo": {
        punkty: scores[4][2],
        uzasadnienie: `${prefix} Zgodność z RODO, bezpieczeństwo danych oraz otwarte licencjonowanie EUPL-1.2 (${scores[4][2]}/10).`,
      },
    },
  };
}

async function seedEvaluations(
  innovationIdsByKey: Record<string, string>,
  maxBudgetPln: number,
  toleranceMultiplier: number
) {
  const verifiedLinksPool = [
    {
      nazwa_projektu: "Circular School Canteens (Interreg Europe IE-PGI05821)",
      link_url:
        "https://bip.boguchwala.pl/biuletyn-samorzadowy/2025-10-predykcja-posilkow-szkolnych",
      opis_problemu:
        "Opór intendentów i błędy ręcznego raportowania nieobecności uczniów po godzinie 8:00.",
      jak_rozwiazano:
        "Wprowadzenie 2-minutowego formularza porannego zintegrowanego z dziennikiem elektronicznym.",
    },
    {
      nazwa_projektu: "Nocne bilansowanie strat wody (Związek Gmin Podkarpacia)",
      link_url:
        "https://www.interregeurope.eu/good-practices/municipal-water-loss-audit-podkarpackie",
      opis_problemu:
        "Brak standaryzacji danych między gminami utrudniający porównywanie efektów oszczędnościowych.",
      jak_rozwiazano:
        "Ujednolicony wzór raportu miesięcznego i wsparcie koordynatora związku gmin.",
    },
    {
      nazwa_projektu: "Standard prostego języka (Urząd Miasta Rzeszowa)",
      link_url:
        "https://bip.erzeszow.pl/innowacje-administracyjne/prosty-jezyk-decyzji-2025",
      opis_problemu:
        "Niska adopcja nowych procedur bez wcześniejszego przeszkolenia pracowników operacyjnych.",
      jak_rozwiazano:
        "Krótkie warsztaty wdrożeniowe i wzory gotowych dokumentów zamiast długich instrukcji.",
    },
    {
      nazwa_projektu:
        "Wspólne zamówienia grupowe energii (Powiat Łańcucki)",
      link_url:
        "https://bip.powiatlancut.pl/projekty/grupa-zakupowa-energia-zielona-2025",
      opis_problemu:
        "Rozbieżność harmonogramów budżetowych oraz obawy o odpowiedzialność z tytułu PZP.",
      jak_rozwiazano:
        "Powierzenie roli lidera jednemu podmiotowi i udostępnienie zweryfikowanego wzoru SWZ.",
    },
    {
      nazwa_projektu: "Ostrzeganie seniorów OPS (MOPS Krosno / CORDIS)",
      link_url:
        "https://cordis.europa.eu/article/id/senior-heatwave-alert-ops-krosno",
      opis_problemu:
        "Ryzyko przetwarzania danych wrażliwych (RODO) w zewnętrznych narzędziach chmurowych.",
      jak_rozwiazano:
        "Przetwarzanie wyłącznie danych zagregowanych i lokalna ewidencja bez eksportu PII.",
    },
  ];

  const techLinksPool = [
    {
      nazwa_projektu:
        "Autonomiczna diagnostyka sieci energetycznej (Politechnika Rzeszowska)",
      link_url:
        "https://bip.prz.edu.pl/raporty-br/autonomiczna-diagnostyka-sieci-2025",
      opis_problemu:
        "Ograniczenia lotów BVLOS w pobliżu zabudowy i obiektów infrastruktury krytycznej.",
      jak_rozwiazano:
        "Uzyskanie kategorii szczególnej ULC oraz wdrożenie korytarzy georeferencyjnych z redundancją GNSS.",
    },
    {
      nazwa_projektu: "Hybrydowy falownik mikrosieci (AGH / EPO EP4192841A1)",
      link_url: "https://worldwide.espacenet.com/patent/EP4192841A1",
      opis_problemu:
        "Wysoki koszt certyfikacji kompatybilności elektromagnetycznej i badań laboratoryjnych przed TRL 8.",
      jak_rozwiazano:
        "Podział certyfikacji na etapy oraz konsorcjum z akredytowanym laboratorium przemysłowym.",
    },
    {
      nazwa_projektu: "Biosensory grafenowe wód (Łukasiewicz IMiF / CORDIS)",
      link_url: "https://cordis.europa.eu/project/id/101148201",
      opis_problemu:
        "Dryft kalibracji czujników w zmiennych warunkach atmosferycznych i zimowych.",
      jak_rozwiazano:
        "Automatyczna autokalibracja referencyjna i korekcja temperaturowa w oprogramowaniu brzegowym.",
    },
    {
      nazwa_projektu: "Robot UV-C SLAM dla szpitali (Politechnika Śląska / PARP)",
      link_url:
        "https://mapadotacji.gov.pl/projekty/feng-0101-robot-uvc-szpitale",
      opis_problemu:
        "Długi proces integracji raportów technicznych z istniejącymi systemami ERP/GIS odbiorców.",
      jak_rozwiazano:
        "Zastosowanie otwartego eksportu GeoJSON/REST API zgodnego ze standardami branżowymi.",
    },
    {
      nazwa_projektu: "Kompozyty celulozowe medyczne (ICHB PAN / UPRP)",
      link_url:
        "https://ewyszukiwarka.pue.uprp.gov.pl/p445120-kompozyty-celulozowe",
      opis_problemu:
        "Ryzyko naruszenia zbliżonych zastrzeżeń patentowych w bazach UPRP/EPO.",
      jak_rozwiazano:
        "Wczesne badanie czystości patentowej (FTO) i wyodrębnienie unikalnych cech w zastrzeżeniach.",
    },
  ];

  // =========================================================================
  // OCENA 1: Przypadek 2 -> TABELA_GLOWNA (S_total = 43.33, PERT = 70 000 PLN, R_kryt = 20%)
  // =========================================================================
  const eval1Advocate: EvaluationAgentReport = {
    rola: "ADWOKAT",
    oceny_podkategorii: makeSubcategoriesFromMatrix(
      [
        [10, 9, 10],
        [9, 9, 9],
        [10, 10, 10],
        [9, 9, 10],
        [10, 9, 9],
      ],
      "[AI 1 Adwokat]"
    ),
    koszty_pln: {
      koszt_mvp: 18_000,
      uzasadnienie_mvp:
        "Opracowanie otwartych szablonów arkuszy, instrukcji dla intendentów i wzoru zarządzenia wójta/burmistrza.",
      koszt_pilotazu: 27_000,
      uzasadnienie_pilotazu:
        "Pilotaż w 6–10 szkołach podstawowych bez zakupów sprzętu IT, wyłącznie szkolenia i ewaluacja semestralna.",
    },
    podobne_problemy: verifiedLinksPool.map((p, idx) => ({
      ...p,
      czy_krytyczny: true,
      czy_zaadresowany_w_projekcie: idx !== 4,
    })),
    podsumowanie_decyzji:
      "AI 1 (Adwokat): Wzorcowa innowacja samorządowa o natychmiastowym zwrocie finansowym (40–50 tys. zł/rok na szkołę), minimalnym koszcie wdrożenia i gotowości do replikacji w całej Polsce.",
  };

  const eval1Skeptic: EvaluationAgentReport = {
    rola: "SCEPTYK",
    oceny_podkategorii: makeSubcategoriesFromMatrix(
      [
        [8, 8, 8],
        [7, 7, 7],
        [8, 8, 8],
        [8, 7, 8],
        [8, 8, 7],
      ],
      "[AI 2 Sceptyk]"
    ),
    koszty_pln: {
      koszt_mvp: 38_000,
      uzasadnienie_mvp:
        "Uwzględnienie audytu prawnego RODO, dostosowania procedur do różnych dzienników elektronicznych oraz testów ergonomii.",
      koszt_pilotazu: 57_000,
      uzasadnienie_pilotazu:
        "Dodatkowe koszty koordynacji w gminach o rozproszonej sieci szkół, wsparcia zmian organizacyjnych i rezerw na szkolenia uzupełniające.",
    },
    podobne_problemy: verifiedLinksPool.map((p, idx) => ({
      ...p,
      czy_krytyczny: true,
      czy_zaadresowany_w_projekcie: idx < 3,
    })),
    podsumowanie_decyzji:
      "AI 2 (Sceptyk): Projekt jest racjonalny, ale wymaga zabezpieczenia dyscypliny porannego raportowania w szkołach oraz sformalizowania zasad ochrony danych uczniów przy integracji z dziennikiem.",
  };

  const eval1Arbiter: EvaluationAgentReport = {
    rola: "ARBITER",
    // Suma: 27 + 24 + 27 + 26 + 26 = 130 -> 130/3 = 43.33 pkt, avg = 8.67, % = 86.67%
    oceny_podkategorii: makeSubcategoriesFromMatrix(
      [
        [9, 9, 9],
        [8, 8, 8],
        [9, 9, 9],
        [9, 8, 9],
        [9, 9, 8],
      ],
      "[AI 3 Arbiter]"
    ),
    koszty_pln: {
      koszt_mvp: 28_000,
      uzasadnienie_mvp:
        "Realistyczny koszt przygotowania otwartego pakietu wdrożeniowego, dokumentacji prawnej i wzorów integracji.",
      koszt_pilotazu: 42_000,
      uzasadnienie_pilotazu:
        "Urealniony budżet wdrożenia pilotażowego w klastrze gmin z monitoringiem KPI przez pełny semestr.",
    },
    // 1 niezaadresowany z 5 krytycznych -> R_kryt = 20.0%
    podobne_problemy: verifiedLinksPool.map((p, idx) => ({
      ...p,
      czy_krytyczny: true,
      czy_zaadresowany_w_projekcie: idx !== 3,
    })),
    podsumowanie_decyzji:
      "AI 3 (Arbiter): Zdecydowana rekomendacja do Tabeli Głównej. Projekt łączy bardzo wysoką ocenę merytoryczną (43,33/50 pkt), niski koszt PERT (70 000 PLN, znacznie poniżej progu 300 000 PLN) oraz niskie ryzyko krytyczne (20%).",
  };

  const eval1VerifierLogs: VerifierResult[] = [
    ...verifiedLinksPool.map((p) => ({
      link_url: p.link_url,
      nazwa_projektu: p.nazwa_projektu,
      zrodlo_agenta: "ADWOKAT" as const,
      status: "ZWERYFIKOWANY" as const,
      czy_projekt_istnieje: true,
      zgodnosc_nazwy_i_opisu_procent: 97,
      krotkie_uzasadnienie:
        "AI 4 (Fast-Check): Potwierdzono istnienie źródła i pełną spójność merytoryczną z opisem problemu.",
    })),
    {
      link_url: "https://example-hallucinated-school-food.invalid/raport-2024",
      nazwa_projektu: "Syntetyczny projekt stołówek (odrzucony)",
      zrodlo_agenta: "SCEPTYK",
      status: "HALUCYNACJA",
      czy_projekt_istnieje: false,
      zgodnosc_nazwy_i_opisu_procent: 0,
      krotkie_uzasadnienie:
        "AI 4 (Fast-Check): Adres nie istnieje (błąd DNS) — wpis odrzucony przed przekazaniem do Arbitra.",
    },
  ];

  // =========================================================================
  // OCENA 2: Przypadek 1 -> TABELA_DRUGORZEDNA (S_total = 41.67, PERT = 360 000 PLN > 300 000, R_kryt = 40%)
  // =========================================================================
  const eval2Advocate: EvaluationAgentReport = {
    rola: "ADWOKAT",
    oceny_podkategorii: makeSubcategoriesFromMatrix(
      [
        [10, 10, 9],
        [10, 9, 9],
        [9, 8, 9],
        [9, 10, 9],
        [10, 10, 9],
      ],
      "[AI 1 Adwokat]"
    ),
    koszty_pln: {
      koszt_mvp: 105_000,
      uzasadnienie_mvp:
        "Adaptacja istniejącej platformy BSP Politechniki Rzeszowskiej oraz rozbudowa modułu predykcji GIS.",
      koszt_pilotazu: 155_000,
      uzasadnienie_pilotazu:
        "Wdrożenie pilotażowe na 100 km sieci operatora OSD z wykorzystaniem zespołu uczelnianego.",
    },
    podobne_problemy: techLinksPool.map((p, idx) => ({
      ...p,
      czy_krytyczny: true,
      czy_zaadresowany_w_projekcie: idx < 4,
    })),
    podsumowanie_decyzji:
      "AI 1 (Adwokat): Przełomowy projekt technologiczny o potwierdzonej w terenie skuteczności 94,2% i wysokim potencjale komercjalizacji u operatorów energetycznych.",
  };

  const eval2Skeptic: EvaluationAgentReport = {
    rola: "SCEPTYK",
    oceny_podkategorii: makeSubcategoriesFromMatrix(
      [
        [8, 8, 7],
        [8, 7, 7],
        [7, 6, 7],
        [7, 8, 7],
        [8, 8, 7],
      ],
      "[AI 2 Sceptyk]"
    ),
    koszty_pln: {
      koszt_mvp: 185_000,
      uzasadnienie_mvp:
        "Koszty certyfikacji lotniczej BVLOS, ubezpieczeń OC, kamer radiometrycznych klasy przemysłowej oraz testów środowiskowych.",
      koszt_pilotazu: 275_000,
      uzasadnienie_pilotazu:
        "Pełny pilotaż u operatora infrastruktury krytycznej wymagający audytu cyberbezpieczeństwa, integracji z GIS/SCADA i zespołu operatorów.",
    },
    podobne_problemy: techLinksPool.map((p, idx) => ({
      ...p,
      czy_krytyczny: true,
      czy_zaadresowany_w_projekcie: idx < 2,
    })),
    podsumowanie_decyzji:
      "AI 2 (Sceptyk): Mimo wysokiej jakości technicznej projekt przekracza limit pojedynczego budżetu lokalnego B_max i niesie istotne koszty regulacyjne BVLOS oraz integracji u OSD.",
  };

  const eval2Arbiter: EvaluationAgentReport = {
    rola: "ARBITER",
    // Suma: 26 + 25 + 23 + 25 + 26 = 125 -> 125/3 = 41.67 pkt, avg = 8.33, % = 83.33%
    oceny_podkategorii: makeSubcategoriesFromMatrix(
      [
        [9, 9, 8],
        [9, 8, 8],
        [8, 7, 8],
        [8, 9, 8],
        [9, 9, 8],
      ],
      "[AI 3 Arbiter]"
    ),
    koszty_pln: {
      koszt_mvp: 145_000,
      uzasadnienie_mvp:
        "Urealniony koszt dopracowania wersji przedprodukcyjnej BSP, kalibracji termowizji i dokumentacji BVLOS.",
      koszt_pilotazu: 215_000,
      uzasadnienie_pilotazu:
        "Realistyczny koszt pilotażu operacyjnego z udziałem operatora OSD, integracją GIS oraz szkoleniem personelu.",
    },
    // 2 niezaadresowane z 5 krytycznych -> R_kryt = 40.0%
    podobne_problemy: techLinksPool.map((p, idx) => ({
      ...p,
      czy_krytyczny: true,
      czy_zaadresowany_w_projekcie: idx < 3,
    })),
    podsumowanie_decyzji:
      "AI 3 (Arbiter): Znakomita jakość merytoryczna (41,67/50 pkt), jednak całkowity urealniony koszt PERT (360 000 PLN) przekracza próg tolerancji 120% B_max (300 000 PLN). Projekt trafia do Tabeli Drugorzędnej jako priorytet do współfinansowania z grantów zewnętrznych (NCBR / FENG).",
  };

  const eval2VerifierLogs: VerifierResult[] = [
    ...techLinksPool.map((p, idx) => ({
      link_url: p.link_url,
      nazwa_projektu: p.nazwa_projektu,
      zrodlo_agenta: idx % 2 === 0 ? ("ADWOKAT" as const) : ("SCEPTYK" as const),
      status:
        idx === 4 ? ("CZĘŚCIOWO_ZGODNY" as const) : ("ZWERYFIKOWANY" as const),
      czy_projekt_istnieje: true,
      zgodnosc_nazwy_i_opisu_procent: idx === 4 ? 82 : 95,
      krotkie_uzasadnienie:
        idx === 4
          ? "AI 4 (Fast-Check): Źródło istnieje i potwierdza aspekt ochrony własności intelektualnej FTO w sektorze B+R."
          : "AI 4 (Fast-Check): Zweryfikowano istnienie rekordu w rejestrze źródłowym i zgodność z opisem technicznym.",
    })),
  ];

  // =========================================================================
  // OCENA 3: Słaba koncepcja anti-scope -> ARCHIWUM_ODRZUCONE (S_total = 19.67 < 25 pkt, PERT = 180 000 PLN, R_kryt = 80%)
  // =========================================================================
  const eval3Advocate: EvaluationAgentReport = {
    rola: "ADWOKAT",
    oceny_podkategorii: makeSubcategoriesFromMatrix(
      [
        [5, 5, 5],
        [5, 4, 5],
        [6, 5, 5],
        [4, 5, 5],
        [5, 4, 4],
      ],
      "[AI 1 Adwokat]"
    ),
    koszty_pln: {
      koszt_mvp: 50_000,
      uzasadnienie_mvp:
        "Budowa prostego forum internetowego z profilami użytkowników w oparciu o gotowy CMS.",
      koszt_pilotazu: 80_000,
      uzasadnienie_pilotazu:
        "Kampania promocyjna w mediach społecznościowych mająca pozyskać pierwszych użytkowników.",
    },
    podobne_problemy: verifiedLinksPool.map((p, idx) => ({
      ...p,
      czy_krytyczny: true,
      czy_zaadresowany_w_projekcie: idx < 2,
    })),
    podsumowanie_decyzji:
      "AI 1 (Adwokat): Koncepcja ma pewien potencjał sieciowania, ale nawet w optymistycznym wariancie brakuje mechanizmów weryfikacji faktów oraz wyraźnego wyróżnika.",
  };

  const eval3Skeptic: EvaluationAgentReport = {
    rola: "SCEPTYK",
    oceny_podkategorii: makeSubcategoriesFromMatrix(
      [
        [3, 2, 3],
        [3, 2, 3],
        [4, 3, 3],
        [3, 3, 3],
        [3, 2, 2],
      ],
      "[AI 2 Sceptyk]"
    ),
    koszty_pln: {
      koszt_mvp: 90_000,
      uzasadnienie_mvp:
        "Koszty moderacji treści, ochrony przed spamem i dostosowania do RODO przy zbieraniu danych osobowych wynalazców.",
      koszt_pilotazu: 140_000,
      uzasadnienie_pilotazu:
        "Wysokie koszty pozyskania aktywnej społeczności (efekt zimnego startu) oraz brak modelu utrzymania po pilotażu.",
    },
    podobne_problemy: verifiedLinksPool.map((p) => ({
      ...p,
      czy_krytyczny: true,
      czy_zaadresowany_w_projekcie: false,
    })),
    podsumowanie_decyzji:
      "AI 2 (Sceptyk): Projekt narusza założenia Anti-Scope (sieć społecznościowa i otwarte formularze bez weryfikacji źródeł), generuje ryzyko RODO oraz powiela niedziałające portale ogłoszeniowe.",
  };

  const eval3Arbiter: EvaluationAgentReport = {
    rola: "ARBITER",
    // Suma: 12 + 11 + 13 + 11 + 12 = 59 -> 59/3 = 19.67 pkt (< 25 pkt), avg = 3.93, % = 39.33%
    oceny_podkategorii: makeSubcategoriesFromMatrix(
      [
        [4, 4, 4],
        [4, 3, 4],
        [5, 4, 4],
        [4, 3, 4],
        [4, 4, 4],
      ],
      "[AI 3 Arbiter]"
    ),
    koszty_pln: {
      koszt_mvp: 70_000,
      uzasadnienie_mvp:
        "Realistyczny koszt wdrożenia portalu z moderacją i polityką bezpieczeństwa danych osobowych.",
      koszt_pilotazu: 110_000,
      uzasadnienie_pilotazu:
        "Koszty moderacji, utrzymania serwerów i prób pozyskania użytkowników bez gwarancji jakości zgłoszeń.",
    },
    // 4 niezaadresowane z 5 krytycznych -> R_kryt = 80.0%
    podobne_problemy: verifiedLinksPool.map((p, idx) => ({
      ...p,
      czy_krytyczny: true,
      czy_zaadresowany_w_projekcie: idx === 0,
    })),
    podsumowanie_decyzji:
      "AI 3 (Arbiter): Projekt zostaje skierowany do Archiwum / Odrzuconych. Wynik łączny 19,67/50 pkt znajduje się poniżej progu jakości 25 pkt, a wskaźnik ryzyka krytycznego wynosi 80% z powodu braku weryfikacji źródeł i niezgodności z regułą Anti-Scope.",
  };

  const eval3VerifierLogs: VerifierResult[] = [
    ...verifiedLinksPool.map((p) => ({
      link_url: p.link_url,
      nazwa_projektu: p.nazwa_projektu,
      zrodlo_agenta: "SCEPTYK" as const,
      status: "ZWERYFIKOWANY" as const,
      czy_projekt_istnieje: true,
      zgodnosc_nazwy_i_opisu_procent: 93,
      krotkie_uzasadnienie:
        "AI 4 (Fast-Check): Potwierdzono w rejestrze referencyjnym — źródło wykazuje kluczowe bariery wdrożeniowe nieuwzględnione w ocenianej koncepcji.",
    })),
    {
      link_url: "https://fake-startup-social-network.invalid/case-study",
      nazwa_projektu: "Nieistniejący portal społecznościowy (halucynacja)",
      zrodlo_agenta: "ADWOKAT",
      status: "HALUCYNACJA",
      czy_projekt_istnieje: false,
      zgodnosc_nazwy_i_opisu_procent: 0,
      krotkie_uzasadnienie:
        "AI 4 (Fast-Check): Odrzucono nieistniejący adres URL wygenerowany podczas debaty.",
    },
  ];

  const seedDefs = [
    {
      id: "seed-eval-tabela-glowna",
      innovationId: innovationIdsByKey["przypadek-2-predykcja-posilkow"] ?? null,
      projectTitle:
        "Predykcja posiłków i redukcja marnowania żywności w szkołach",
      projectDescription:
        "Wdrożenie w gminnych szkołach podstawowych niskokosztowego modelu porannej predykcji liczby obiadów zintegrowanego z dziennikiem elektronicznym. Pilotaż w 6 szkołach Gminy Boguchwała obniżył marnowanie żywności o 28% w 1 semestrze, dając 40–50 tys. zł rocznej oszczędności na placówkę przy adaptacji poniżej 3 tygodni bez nakładów na IT.",
      advocateReport: eval1Advocate,
      skepticReport: eval1Skeptic,
      verifierLogs: eval1VerifierLogs,
      arbiterReport: eval1Arbiter,
      durationMs: 4280,
    },
    {
      id: "seed-eval-tabela-drugorzedna",
      innovationId:
        innovationIdsByKey["przypadek-1-diagnostyka-energetyczna"] ?? null,
      projectTitle: "Autonomiczna diagnostyka infrastruktury energetycznej",
      projectDescription:
        "System autonomicznych bezzałogowych statków powietrznych z kamerą termowizyjną i modułem predykcji awarii opracowany przez Politechnikę Rzeszowską (NCBR/LIDER/14/0082/2024). Przetestowany na 40 km sieci dystrybucyjnej oraz 12 budynkach użyteczności publicznej (94,2% skuteczności detekcji, -65% czasu inspekcji, TRL 6).",
      advocateReport: eval2Advocate,
      skepticReport: eval2Skeptic,
      verifierLogs: eval2VerifierLogs,
      arbiterReport: eval2Arbiter,
      durationMs: 5640,
    },
    {
      id: "seed-eval-archiwum-odrzucone",
      innovationId: null,
      projectTitle:
        "Ogólnopolski portal społecznościowy dla wynalazców bez weryfikacji źródeł",
      projectDescription:
        "Koncepcja otwartego portalu społecznościowego, w którym dowolni internauci mogą publikować niezweryfikowane pomysły, zbierać polubienia i prowadzić zbiórki crowdfundingowe bez weryfikacji patentowej ani ochrony danych osobowych.",
      advocateReport: eval3Advocate,
      skepticReport: eval3Skeptic,
      verifierLogs: eval3VerifierLogs,
      arbiterReport: eval3Arbiter,
      durationMs: 3890,
    },
  ];

  for (const item of seedDefs) {
    const metrics = calculateDeterministicEvaluation(
      item.advocateReport,
      item.skepticReport,
      item.arbiterReport,
      maxBudgetPln,
      toleranceMultiplier
    );

    await prisma.projectEvaluation.upsert({
      where: { id: item.id },
      update: {
        innovationId: item.innovationId,
        projectTitle: item.projectTitle,
        projectDescription: item.projectDescription,
        advocateReport:
          item.advocateReport as unknown as Prisma.InputJsonValue,
        skepticReport: item.skepticReport as unknown as Prisma.InputJsonValue,
        verifierLogs: item.verifierLogs as unknown as Prisma.InputJsonValue,
        arbiterReport: item.arbiterReport as unknown as Prisma.InputJsonValue,
        ...metrics,
        durationMs: item.durationMs,
      },
      create: {
        id: item.id,
        innovationId: item.innovationId,
        projectTitle: item.projectTitle,
        projectDescription: item.projectDescription,
        advocateReport:
          item.advocateReport as unknown as Prisma.InputJsonValue,
        skepticReport: item.skepticReport as unknown as Prisma.InputJsonValue,
        verifierLogs: item.verifierLogs as unknown as Prisma.InputJsonValue,
        arbiterReport: item.arbiterReport as unknown as Prisma.InputJsonValue,
        ...metrics,
        durationMs: item.durationMs,
      },
    });
  }
}

async function main() {
  console.log("🚀 Inicjalizacja bazy OPEN TRACE — Radar Innowacji (Tor A + Oceny)...");

  // 1. Domyślne ustawienia budżetowe administratora (B_max = 250 000 PLN, próg 120% = 300 000 PLN)
  const adminSettings = await prisma.adminSettings.upsert({
    where: { id: "default" },
    update: {
      maxBudgetPln: 250_000,
      toleranceMultiplier: 1.2,
    },
    create: {
      id: "default",
      maxBudgetPln: 250_000,
      toleranceMultiplier: 1.2,
    },
  });

  console.log(
    `✅ AdminSettings: B_max = ${adminSettings.maxBudgetPln.toLocaleString("pl-PL")} PLN (limit 120% = ${(adminSettings.maxBudgetPln * adminSettings.toleranceMultiplier).toLocaleString("pl-PL")} PLN)`
  );

  // 2. Zasilenie 15 pre-indeksowanych innowacji Tor A (idempotentnie po URL źródła)
  const innovationIdsByKey: Record<string, string> = {};

  for (const item of PRE_INDEXED_INNOVATIONS) {
    // Twardy guardrail domenowy TRL
    const enforcedTrl = item.domain === "TECHNOLOGICZNY" ? item.trl : null;

    const dataSource = await prisma.dataSource.upsert({
      where: { url: item.url },
      update: {
        registryName: item.registryName,
        institutionType: item.institutionType,
        availability: "DOSTEPNE",
        lastScannedAt: new Date(),
      },
      create: {
        url: item.url,
        registryName: item.registryName,
        institutionType: item.institutionType,
        availability: "DOSTEPNE",
      },
    });

    const credibility = calculateCredibilityIndex(
      item.verifiedFacts,
      item.url,
      item.creator
    );

    const existing = await prisma.innovation.findFirst({
      where: { sourceId: dataSource.id, title: item.title },
    });

    let innovationId: string;
    if (existing) {
      innovationId = existing.id;
      await prisma.innovation.update({
        where: { id: existing.id },
        data: {
          summary: item.summary,
          problem: item.problem,
          solution: item.solution,
          domain: item.domain,
          creator: item.creator,
          institution: item.institution,
          isPreIndexed: true,
          verifiedFacts:
            item.verifiedFacts as unknown as Prisma.InputJsonValue,
        },
      });
      await prisma.scoringBreakdown.upsert({
        where: { innovationId: existing.id },
        update: {
          implementationLevel: item.implementationLevel,
          trl: enforcedTrl,
          innovativeness: item.innovativeness,
          transferPotential: item.transferPotential,
          credibilityIndex: credibility.score,
          credibilityDetails:
            credibility as unknown as Prisma.InputJsonValue,
          aiEstimates: item.aiEstimates as unknown as Prisma.InputJsonValue,
        },
        create: {
          innovationId: existing.id,
          implementationLevel: item.implementationLevel,
          trl: enforcedTrl,
          innovativeness: item.innovativeness,
          transferPotential: item.transferPotential,
          credibilityIndex: credibility.score,
          credibilityDetails:
            credibility as unknown as Prisma.InputJsonValue,
          aiEstimates: item.aiEstimates as unknown as Prisma.InputJsonValue,
        },
      });

      await prisma.similarityMatch.deleteMany({
        where: { innovationId: existing.id },
      });
      await prisma.transferPathway.deleteMany({
        where: { innovationId: existing.id },
      });
    } else {
      const created = await prisma.innovation.create({
        data: {
          title: item.title,
          summary: item.summary,
          problem: item.problem,
          solution: item.solution,
          domain: item.domain,
          creator: item.creator,
          institution: item.institution,
          isPreIndexed: true,
          verifiedFacts:
            item.verifiedFacts as unknown as Prisma.InputJsonValue,
          sourceId: dataSource.id,
          scoring: {
            create: {
              implementationLevel: item.implementationLevel,
              trl: enforcedTrl,
              innovativeness: item.innovativeness,
              transferPotential: item.transferPotential,
              credibilityIndex: credibility.score,
              credibilityDetails:
                credibility as unknown as Prisma.InputJsonValue,
              aiEstimates:
                item.aiEstimates as unknown as Prisma.InputJsonValue,
            },
          },
        },
      });
      innovationId = created.id;
    }

    if (item.similarities.length > 0) {
      await prisma.similarityMatch.createMany({
        data: item.similarities.map((s) => ({
          innovationId,
          registry: s.registry,
          matchedTitle: s.matchedTitle,
          matchedReferenceId: s.matchedReferenceId,
          matchPercent: s.matchPercent,
          status: s.status,
          functionalDifferences: s.functionalDifferences,
        })),
      });
    }

    if (item.pathways.length > 0) {
      await prisma.transferPathway.createMany({
        data: item.pathways.map((p) => ({
          innovationId,
          pathway: p.pathway,
          rationale: p.rationale,
          targetGroups: p.targetGroups,
          kpis: p.kpis as unknown as Prisma.InputJsonValue,
        })),
      });
    }

    innovationIdsByKey[item.key] = innovationId;
  }

  console.log(
    `✅ Zasilono ${PRE_INDEXED_INNOVATIONS.length} pre-indeksowanych innowacji Tor A (5 Technologicznych, 4 Edukacyjne, 6 Administracyjnych).`
  );

  // 3. Zasilenie 3 pełnych ocen wieloagentowych (Tabela Główna, Drugorzędna, Archiwum)
  await seedEvaluations(
    innovationIdsByKey,
    adminSettings.maxBudgetPln,
    adminSettings.toleranceMultiplier
  );
  console.log(
    "✅ Zasilono 3 pełne raporty Debaty 4 AI (Tabela Główna, Tabela Drugorzędna, Archiwum / Odrzucone)."
  );

  // 4. Przykładowy log skanowania Tor A (idempotentny)
  await prisma.scanJob.upsert({
    where: { id: "seed-scan-tor-a-init" },
    update: {
      status: "ZAKONCZONO",
      durationMs: 142,
      recordsFound: PRE_INDEXED_INNOVATIONS.length,
    },
    create: {
      id: "seed-scan-tor-a-init",
      kind: "TOR_A_INDEKSACJA",
      target:
        "Rejestry polskie i UE (UPRP, EPO, PBN, PPM, PAN, NCBR, PARP, NCN, CORDIS, Interreg Europe, BIP JST)",
      status: "ZAKONCZONO",
      durationMs: 142,
      recordsFound: PRE_INDEXED_INNOVATIONS.length,
      innovationId:
        innovationIdsByKey["przypadek-1-diagnostyka-energetyczna"] ?? null,
    },
  });

  console.log("🎉 Zasilanie bazy danych OPEN TRACE zakończone pomyślnie.");
}

main()
  .catch((error) => {
    console.error("❌ Błąd podczas zasilania bazy danych:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
