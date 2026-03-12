# DCC SaaS — Architecture & Implementation Blueprint
> **Version 1.0 · Février 2026 · INTERNAL — ENGINEERING USE ONLY**  
> Audience: Engineers · Product · CRO · CTO

---

## Table des matières

1. [Vue d'ensemble du système](#1-vue-densemble-du-système)
2. [Provider Layer](#2-provider-layer)
3. [Yield Board System (Scoring Engine)](#3-yield-board-system-scoring-engine)
4. [AI Agent — Provider Discovery](#4-ai-agent--provider-discovery)
5. [Provider Comparison Engine](#5-provider-comparison-engine)
6. [Income Planner System](#6-income-planner-system)
7. [Connexion Yield Boards → Income Planners](#7-connexion-yield-boards--income-planners)
8. [Connexion Income Planners → Suitability Report](#8-connexion-income-planners--suitability-report)
9. [Suitability Report (Alephya & Orion Compatible)](#9-suitability-report-alephya--orion-compatible)
10. [Flowchart complet du système](#10-flowchart-complet-du-système)
11. [Structure de fichiers & code de référence](#11-structure-de-fichiers--code-de-référence)
12. [Roadmap d'implémentation](#12-roadmap-dimplémentation)

---

## 1. Vue d'ensemble du système

### 1.1 Objectif de la plateforme

Digital Credit Compass (DCC) est une plateforme SaaS de yield intelligence de niveau institutionnel dans le marché du digital lending (+400 Md$).

**Mission :** Permettre aux utilisateurs d'identifier des providers de revenus, évaluer le risque vs. yield, construire des portfolios de revenus conformes, et générer de la documentation de suitability — depuis un unique scoring engine déterministe.

> **Principe architectural :** Le scoring engine est le composant le plus critique du système. Il est déterministe, sans IA à la couche de calcul, et ses poids sont immuables sans sign-off CRO. Toutes les autres couches sont consommatrices de son output.

### 1.2 Couches système

| Layer | Nom | Responsabilité | Owner |
|-------|-----|----------------|-------|
| L1 | Provider Layer | Ingestion des données brutes des providers, attachement d'evidence, champs vérifiés par admin | Admin + AI Agent |
| L2 | Yield Board Layer | Calcul déterministe du scoring, risk banding, snapshots de scores versionnés | Scoring Engine (Backend) |
| L3 | Planner Layer | Modélisation de scénarios utilisateur, calculs LTV/income, construction d'allocation (3 planners) | Product + Backend |
| L4 | Portfolio Layer | Sélection de providers, pondération d'allocation, calcul APY blendé | User + Guided Logic |
| L5 | Suitability Layer | Sérialisation de snapshot, génération PDF, stockage de rapport, génération de notes de risque | Backend Service |
| L6 | Integration Layer | Push API Alephya/Orion, sync plateforme advisor, dispatch webhook | API Gateway |

### 1.3 Flux système end-to-end

```
[PROVIDER DISCOVERY]     [SCORING ENGINE]      [YIELD BOARDS]
AI Agent crawls      →   Admin review +     →  3 Yield Boards
official sources         deterministic          (1A / 1B / 1C)
Evidence pack JSON       compute                Sorted by DCC Score ↓
→ Admin queue            Score snapshots
                         (append-only, immutable)
                              ↓
[PLANNER SELECTION]      [SCENARIO MODELLING]   [PROVIDER ALLOCATION]
User selects 1A/1B/1C →  Inputs: capital,   →  User selects providers
based on asset type       duration, APR, LTV    Allocation weights (sum=100%)
(BTC/Fiat/Stablecoin)    Outputs: income,       Blended APY computed
                          risk bands, SRI
                              ↓
[SUITABILITY SNAPSHOT]   [PDF GENERATION]      [PLATFORM INTEGRATION]
Session UUID created  →  Server-side render →  POST to Alephya / Orion
All inputs + scores       Fixed template F.1    suitabilitySnapshot JSON
serialized to JSON        Never re-computed     Advisor reviews & annotates
Single source of truth    Download link issued
```

### 1.4 Carte des dépendances

| Composant | Dépend de | Consommé par |
|-----------|-----------|--------------|
| AI Agent Evidence Pack | Provider official domains (whitelist) | Admin Review Queue |
| Admin Review Queue | AI Agent Output JSON | Scoring Engine |
| Scoring Engine | Admin-approved inputs + WEIGHTS constants | Yield Board Score Snapshots |
| Score Snapshot (immutable) | Scoring Engine output | Yield Boards, Suitability Reports |
| Yield Board (1A/1B/1C) | Score Snapshots + Market API data | Planner UI, Provider Comparison Engine |
| Income Planner (1A/1B/1C) | Yield Boards + User Inputs | Suitability Snapshot |
| Suitability Snapshot | Planner outputs + locked scores | PDF Engine, Advisor Integration API |
| PDF Engine | suitabilitySnapshot JSON only | User download, Advisor platforms |
| Advisor Integration API | suitabilitySnapshot JSON + credentials | Alephya, Orion platforms |

---

## 2. Provider Layer

### 2.1 Modèle objet Provider

Chaque provider est représenté par un objet structuré avec 3 zones :
- **Identity fields** : maintenus par admin
- **Scoring input fields** : extraits par AI, approuvés par admin
- **Computed output fields** : générés par l'engine, immuables après publication

### 2.2 Schéma de base de données (PostgreSQL)

```sql
-- ============================================================
-- DCC Provider Layer: Core Tables
-- ============================================================

CREATE TABLE providers (
  provider_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name               VARCHAR(200) NOT NULL,
  ticker             VARCHAR(20),
  planner_type       VARCHAR(20) NOT NULL CHECK (planner_type IN ('btc','stablecoin','fiat')),
  domicile           VARCHAR(100),
  jurisdiction_tier  SMALLINT CHECK (jurisdiction_tier BETWEEN 1 AND 4),
  logo_url           VARCHAR(500),
  official_domain    VARCHAR(300) NOT NULL,
  product_type       VARCHAR(100),
  is_active          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE scoring_inputs (
  input_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id        UUID NOT NULL REFERENCES providers(provider_id),
  evidence_pack_ref  UUID,
  duration_months    SMALLINT NOT NULL,
  criteria           JSONB NOT NULL, -- { "transparency": 80, "collateralControl": 72, ... }
  admin_approved_by  VARCHAR(100),
  approved_at        TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE score_snapshots (
  snapshot_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id        UUID NOT NULL REFERENCES providers(provider_id),
  input_id           UUID NOT NULL REFERENCES scoring_inputs(input_id),
  planner_type       VARCHAR(20) NOT NULL,
  raw_score          NUMERIC(5,2) NOT NULL,
  duration_mult      NUMERIC(4,3) NOT NULL,
  final_score        SMALLINT NOT NULL,
  risk_band          VARCHAR(20) NOT NULL,
  score_version      VARCHAR(20) NOT NULL DEFAULT '1.0',
  score_verified_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_current         BOOLEAN NOT NULL DEFAULT TRUE,
  -- Append-only: no UPDATE or DELETE on this table
  CONSTRAINT no_future_snapshots CHECK (score_verified_at <= NOW())
);

CREATE TABLE evidence_packs (
  pack_id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id        UUID NOT NULL REFERENCES providers(provider_id),
  agent_run_ts       TIMESTAMPTZ NOT NULL,
  classifications    JSONB NOT NULL,
  market_data        JSONB,
  confidence_matrix  JSONB NOT NULL,
  publish_blocked    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE market_data_cache (
  cache_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id        UUID NOT NULL REFERENCES providers(provider_id),
  data_type          VARCHAR(50) NOT NULL, -- hv30, peg_deviation, tvl, drawdown
  value              NUMERIC(12,6),
  source             VARCHAR(300),
  fetched_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_stale           BOOLEAN GENERATED ALWAYS AS (NOW() - fetched_at > INTERVAL '7 days') STORED
);
```

### 2.3 Structure JSON Provider

```json
{
  "providerId": "uuid-v4",
  "name": "AMINA Bank (formerly SEBA)",
  "plannerType": "btc",
  "ticker": null,
  "domicile": "Switzerland",
  "jurisdictionTier": 1,
  "officialDomain": "aminagroup.com",
  "productType": "BTC-backed credit facility",
  "isActive": true,
  "currentScore": {
    "snapshotId": "uuid-v4",
    "rawScore": 87.4,
    "durationMultiplier": 0.93,
    "finalScore": 81,
    "riskBand": "LOW",
    "scoreVersion": "1.0",
    "scoreVerifiedAt": "2026-02-01"
  },
  "yieldBoard": {
    "apyMin": 0.06,
    "apyMax": 0.08,
    "maxLtv": 0.50,
    "liquidationLtv": 0.85,
    "rehypothecationPermitted": false
  }
}
```

### 2.4 API Provider

```
GET  /api/v1/providers?plannerType=btc&minScore=60&sort=score_desc
GET  /api/v1/providers/:providerId
POST /api/v1/providers          (admin only)
PUT  /api/v1/providers/:providerId  (admin only)

Response envelope:
{
  "data": [ ProviderObject ],
  "meta": { "total": 9, "staleWarning": false, "asOf": "2026-02-25" }
}
```

### 2.5 Liste des providers enregistrés — BTC Income Planner (1A)

| Provider | Tier | Juridiction | Type de produit | Max LTV | Rehyp? |
|----------|------|-------------|-----------------|---------|--------|
| AMINA Bank (SEBA) | 1 — Licensed Bank | Switzerland (FINMA) | BTC-backed credit facility | 50% | Non |
| Sygnum Bank | 1 — Licensed Bank | Switzerland + Singapore (FINMA/MAS) | BTC-backed credit line | 50% | Non |
| Xapo Bank | 1 — Licensed Bank | Gibraltar (GFSC) | BTC-backed loan | 40% | Non |
| Unchained | 1 — Regulated | USA (NYDFS) | BTC-backed loan (multisig) | 40–50% | Non |
| Matrixport | 1 — Regulated | Singapore (MAS) | BTC-backed loan + structured | 50–65% | Disclosed |
| Ledn | 2 — Established Offshore | Cayman Islands | BTC-backed loan | 50% | Disclosed |
| Nexo | 2 — Established Offshore | Bulgaria / EU (MiCA) | BTC-backed loan + yield | 50% | Disclosed |
| Salt Lending | 2 — US State Licensed | USA (state-licensed) | BTC-backed loan | 50–70% | Disclosed |
| Hodl Hodl (P2P Lend) | Non-custodial / DeFi | Non-custodial/décentralisé | P2P BTC multisig collateral | Peer-set | Non (smart contract) |

---

## 3. Yield Board System (Scoring Engine)

### 3.1 Architecture de scoring — 4 couches immuables

Le scoring engine DCC est **déterministe** : des inputs identiques produisent toujours des outputs identiques.

| Layer | Nom | Ce qu'il fait | Owner |
|-------|-----|---------------|-------|
| 1 | AI Agent | Crawle les sources officielles. Extrait les valeurs candidates. Attache les URLs d'evidence et snippets (≤25 mots). Output JSON. **Ne score jamais.** | Pipeline automatisé |
| 2 | Admin Review | Revue des valeurs proposées et de l'evidence. Approuve, édite ou rejette par champ. Impossible de publier sans sign-off 100% des champs. | Admin humain (CRO ou délégué) |
| 3 | Scoring Engine | Reçoit les inputs approuvés. Applique les poids spécifiques au planner de façon déterministe. Applique le multiplicateur de durée. Output score 0–100. | Backend service — aucune IA à cette couche |
| 4 | Snapshot Lock | À la publication : tous les inputs, evidence, score et timestamp sont lockés de façon immuable. Versionnés (v1.0, v1.1...). Aucune édition rétroactive. | Database — log append-only |

### 3.2 Bandes de score universelles — Tous les planners

| Score | Bande | Badge | Comportement planner |
|-------|-------|-------|----------------------|
| 80–100 | LOW RISK | 🟢 Vert — Strong | Éligible recommandation complète |
| 60–79 | MEDIUM RISK | 🟡 Jaune — Moderate | Éligible avec note de risque affichée |
| 40–59 | ELEVATED RISK | 🟠 Orange — Caution | Cap max 30% allocation en mode Guided |
| 0–39 | HIGH RISK | 🔴 Rouge — Avoid | Exclu du mode Guided. Mode Custom uniquement avec avertissement plein écran obligatoire |

### 3.3 Multiplicateur de durée — Universel

| Durée | Multiplicateur | Rationale |
|-------|---------------|-----------|
| < 3 mois | × 1.00 | Faits observables actuels dominent |
| 3–6 mois | × 0.97 | Une phase de cycle de marché |
| 6–12 mois | × 0.93 | Exposition cycle complet |
| 1–2 ans | × 0.87 | Cycles multiples ; risque réglementaire et émetteur se cumule |
| > 2 ans | × 0.80 | Risque de durée maximum |

> **NOTE :** Le multiplicateur ne peut que réduire le score, jamais l'augmenter. Floor = 0. Appliqué APRÈS le calcul du raw score.

### 3.4 Formule de scoring — Définition mathématique

```
Raw Score  = Σ (criterion_score_i × weight_i) pour i dans planner_criteria

Final Score = clamp( round( Raw Score × DurationMultiplier ), 0, 100 )

Où :
  criterion_score_i ∈ [0, 100]
  Σ weight_i = 1.00 (les poids somment à 100% par planner)
  DurationMultiplier ∈ { 1.00, 0.97, 0.93, 0.87, 0.80 }
  clamp(x, 0, 100) = max(0, min(100, x))
```

### 3.5 Planner 1A — BTC Income Planner : Critères & Poids

| # | Clé | Critère | Poids | Mode de défaillance ciblé |
|---|-----|---------|-------|--------------------------|
| 1 | transparency | Transparency & Disclosure | 30% | Rehypothécation cachée / règles LTV non divulguées (Celsius, BlockFi) |
| 2 | collateralControl | Collateral Control & Liquidation Mechanics | 25% | Liquidation forcée à LTV défavorable — perte principale du holder BTC |
| 3 | jurisdiction | Jurisdiction & Legal Enforceability | 20% | Droits de récupération déterminés par juridiction, pas réputation |
| 4 | structuralRisk | Structural & Custody Risk | 15% | Le commingling a détruit Celsius et Voyager |
| 5 | trackRecord | Track Record & Operational Resilience | 10% | Intentionnellement faible — historique nécessaire mais insuffisant |

### 3.6 Planner 1C — Stablecoin Income Planner : Critères & Poids

| # | Clé | Critère | Poids | Mode de défaillance |
|---|-----|---------|-------|---------------------|
| 1 | reserveQuality | Reserve Quality & Peg Stability | 28% | Effondrement TerraUST ; fraude de réserve ; perte de peg |
| 2 | yieldTransparency | Yield Source Transparency | 22% | Protocole Anchor — yield opaque non durable |
| 3 | counterpartyRisk | Counterparty & Protocol Risk | 20% | Insolvabilité CeFi ; exploit smart contract DeFi |
| 4 | liquidity | Liquidity & Redemption Architecture | 15% | Capital bloqué en période de stress marché |
| 5 | jurisdiction | Jurisdiction & Regulatory Clarity | 10% | Droits de récupération ; ambiguïté d'application |
| 6 | trackRecord | Operational Track Record | 5% | Ancienneté de la plateforme ; historique d'incidents |

> **RÈGLE STRICTE :** Stablecoins algorithmiques : HARD CAP à score maximum de 20 quelle que soit la valeur des autres critères. Tout produit avec une déviation de peg 90 jours > 1.5% : AUTO-FLAG HIGH RISK quel que soit le score total.

### 3.7 Planner 1B — Fiat Income Planner (BTC Treasury Preferred Shares) : Critères & Poids

**Périmètre :** STRC, STRK, STRF, STRD, SATA, STRE — BTC treasury preferred shares UNIQUEMENT. Ce sont des actions préférentielles perpétuelles equity-adjacent. La méthodologie de crédit TradFi standard ne s'applique pas.

| # | Clé | Critère | Poids | Automation |
|---|-----|---------|-------|------------|
| 1 | marketVolatility | Market Price Volatility (HV30 + Max Drawdown) | 30% | 100% automatisé — API marché quotidienne |
| 2 | incomeMechanism | Income Mechanism Reliability | 25% | Extraction AI + approbation admin |
| 3 | seniority | Capital Stack Seniority | 15% | Extraction AI + approbation admin |
| 4 | complexity | Structural Complexity | 15% | Extraction AI + approbation admin |
| 5 | providerQuality | Provider Quality Score | 15% | Feed engine DCC master — automatique |

> **RÈGLE STRICTE :** HV30 > 35% HARD CAP : l'instrument reçoit une contribution C1 maximum de 5/30, plafonnant le score total atteignable à environ 58 (bande ELEVATED). HV30 est TOUJOURS dans la ligne primaire du Yield Board — Champ 4 — jamais caché dans la vue développée.

### 3.8 Scoring Engine — Implémentation TypeScript de référence

```typescript
// DCC Scoring Engine v1.0 — NE PAS MODIFIER LES POIDS SANS APPROBATION CRO

type PlannerType = "btc" | "stablecoin" | "fiat";

const WEIGHTS: Record<PlannerType, Record<string, number>> = {
  btc: {
    transparency: 0.30,
    collateralControl: 0.25,
    jurisdiction: 0.20,
    structuralRisk: 0.15,
    trackRecord: 0.10,
  },
  stablecoin: {
    reserveQuality: 0.28,
    yieldTransparency: 0.22,
    counterpartyRisk: 0.20,
    liquidity: 0.15,
    jurisdiction: 0.10,
    trackRecord: 0.05,
  },
  fiat: {
    marketVolatility: 0.30,
    incomeMechanism: 0.25,
    seniority: 0.15,
    complexity: 0.15,
    providerQuality: 0.15,
  },
};

function getDurationMultiplier(months: number): number {
  if (months < 3)  return 1.00;
  if (months < 6)  return 0.97;
  if (months < 12) return 0.93;
  if (months < 24) return 0.87;
  return 0.80;
}

export function computeScore(inputs: ScoringInputs) {
  const weights = WEIGHTS[inputs.plannerType];
  let rawScore = 0;
  for (const [key, weight] of Object.entries(weights)) {
    rawScore += (inputs.criteria[key] ?? 0) * weight;
  }
  const mult = getDurationMultiplier(inputs.durationMonths);
  const finalScore = Math.round(Math.max(0, Math.min(100, rawScore * mult)));
  const band = finalScore >= 80 ? "LOW" : finalScore >= 60 ? "MEDIUM"
    : finalScore >= 40 ? "ELEVATED" : "HIGH";
  return { rawScore, finalScore, band, durationMultiplier: mult };
}
```

### 3.9 Schémas de champs Yield Board — Les trois planners

#### Yield Board 1A — BTC Collateralised Lending

| # | Nom du champ | Format | Source de données | Toujours visible ? |
|---|-------------|--------|-------------------|--------------------|
| 1 | Provider | Nom + logo | Admin-maintenu | Oui |
| 2 | DCC Score | Badge 0–100 avec bande couleur | Scoring engine (déterministe) | Oui |
| 3 | APY Range | % range (ex. 6%–8%) | Admin / evidence-reviewed | Oui |
| 4 | Max LTV | % (ex. 70%) | Evidence-fetched depuis termes du prêt | Oui |
| 5 | Liquidation LTV | % color-coded rouge | Evidence-fetched depuis termes du prêt | Oui |
| 6 | Rehypothecation | Badge Oui / Non | Evidence-fetched depuis TOS | Oui |
| 7 | Score Verified | Date (YYYY-MM-DD) | Timestamp système (auto) | Oui |

#### Yield Board 1B — Fiat BTC Treasury Preferred Shares

| # | Nom du champ | Format | Règle critique |
|---|-------------|--------|----------------|
| 1 | Instrument | Ticker + nom complet | Ancre d'identité |
| 2 | Stability Score | Badge 0–100 avec bande couleur | Signal de décision primaire |
| 3 | Yield Range | % range ou "Fixed" | Admin-approuvé depuis prospectus |
| 4 | **HV30** | % à 1dp — 🟢 <10% \| 🟡 10–25% \| 🔴 >25% | **DOIT être dans la ligne primaire — Champ 4. JAMAIS caché.** |
| 5 | Dividend Type | Badge Fixed / Variable / Discretionary | Signal critique de fiabilité de revenu |
| 6 | Max Drawdown 90d | % color-coded | API marché — automatisé |
| 7 | Score Verified | Date (YYYY-MM-DD) | Timestamp système (auto) |

> **NON-NÉGOCIABLE :** Tri par défaut sur TOUS les Yield Boards : DCC Score décroissant. L'APY n'est JAMAIS le tri par défaut. Règle plateforme non-négociable.

### 3.10 Exemple Yield Board — Planner 1A (BTC)

| Provider | DCC Score | APY Range | Max LTV | Liquidation LTV | Rehyp? | Score Verified |
|----------|-----------|-----------|---------|-----------------|--------|----------------|
| AMINA Bank | 81 🟢 | 6%–8% | 50% | 85% | 🔴 Non | 2026-02-01 |
| Sygnum Bank | 79 🟡 | 5.5%–7.5% | 50% | 80% | 🔴 Non | 2026-02-01 |
| Unchained | 77 🟡 | 7%–9% | 40–50% | 85% | 🔴 Non | 2026-02-01 |
| Xapo Bank | 75 🟡 | 6%–8% | 40% | 80% | 🔴 Non | 2026-02-01 |
| Ledn | 72 🟡 | 7.5%–9% | 50% | 85% | ⚠️ Disclosed | 2026-02-01 |
| Nexo | 68 🟡 | 6%–10% | 50% | 83% | ⚠️ Disclosed | 2026-02-01 |
| Salt Lending | 62 🟡 | 8%–12% | 50–70% | 85% | ⚠️ Disclosed | 2026-02-01 |
| Hodl Hodl P2P | 58 🟠 | Peer-set | Peer-set | Peer-set | 🔴 Non | 2026-02-01 |

---

## 4. AI Agent — Provider Discovery

### 4.1 Pipeline Agent — 6 étapes

| Étape | Nom | Ce qu'il fait | Output |
|-------|-----|---------------|--------|
| 1 | Source Discovery | Construit la whitelist des URLs officielles des providers. Rejette forums, agrégateurs, Wikipedia. | Liste d'URLs vérifiées |
| 2 | Document Fetch | Récupère : TOS, FAQ, termes de prêt, prospectus, rapports d'audit, pages PoR, pages de pricing. | Corpus de documents bruts |
| 3 | Field Extraction | LLM extrait les valeurs candidates par champ de scoring. Mappe vers des buckets enum définis. Stocke URL + snippet (≤25 mots). | Valeurs de champs proposées + evidence |
| 4 | Conflict Detection | Si deux sources officielles sont en conflit sur le même champ → champ défini à "CONFLICT" → score worst-case → flag admin obligatoire. | Flags de conflit |
| 5 | Confidence Scoring | Chaque champ scoré 0.0–1.0. En dessous du seuil → worst-case assigné + review admin flaggée. | Matrice de confiance |
| 6 | Evidence Pack | Regroupe les valeurs proposées, confiance, URLs sources, snippets, timestamps en contrat JSON. | Evidence pack JSON → file d'attente admin |

### 4.2 Seuils de confiance par type de champ

| Catégorie de champ | Confiance min | Sources requises | En cas d'échec |
|---------------------|---------------|------------------|----------------|
| Safety-critical (LTV, rehypothecation, peg data, seniority) | ≥ 0.85 | 2 indépendantes | Score worst-case + blocage admin OBLIGATOIRE |
| High-importance (custody model, dividend type pour STRK/STRD) | ≥ 0.80 | 2 préférées, 1 minimum | Flag pour review ; tentative worst-case |
| Standard fields (fee schedule, termes, structure) | ≥ 0.70 | 1 suffisante | Inclure avec indicateur de confiance |
| Market data (HV30, drawdown, peg deviation, TVL) | API-verified | N/A — automatisé | Freeze du score sur échec API + bannière de staleness |

### 4.3 Prompt AI Agent Master — BTC Provider Discovery

```markdown
# DCC AGENT: BTC INCOME PLANNER — PROVIDER EVIDENCE EXTRACTION
# Version: 1.0 | Applies to: Planner 1A (BTC-Collateralised Lending)

You are the DCC evidence extraction agent. You NEVER score providers.
You ONLY extract evidence and propose classification values.

## TARGET PROVIDER: {provider_name}
## OFFICIAL DOMAIN: {official_domain}

## RETRIEVAL INSTRUCTIONS
Fetch ONLY from the following approved source types on the official domain:
- /terms-of-service or /legal
- /loan-terms or /borrow
- /faq
- /custody or /security
- /proof-of-reserves
- /pricing or /fees
- Official audit report URLs (from audit firm website)

REJECT: Reddit, Twitter/X, forums, aggregators, Wikipedia, CoinGecko editorial.

## EXTRACTION TARGETS — BTC PLANNER
For each field below, extract the value, classify into the defined bucket,
attach the source URL and a snippet of <= 25 words:

1. liquidation_ltv: Exact LTV at which collateral is liquidated?
   Bucket: exact_percent | range | absent | CONFLICT

2. margin_call_ltv: Margin call trigger LTV?
   Bucket: exact_percent | range | absent | CONFLICT

3. rehypothecation: Does the platform rehypothecate BTC collateral?
   Bucket: no | yes_disclosed | yes_undisclosed | unknown

4. collateral_top_up: Allowed speed for collateral top-up?
   Bucket: instant | same_day | delayed | not_allowed

5. custody_model: How is BTC collateral held?
   Bucket: segregated_disclosed | pooled_disclosed | commingled | unknown

6. jurisdiction_tier: Primary regulatory jurisdiction?
   Bucket: tier1 (NYDFS/FCA/MAS/FINMA/MiCA) | tier2 (CIMA/BMA/BVI)
         | tier3 (Seychelles/Marshall Islands) | tier4 (anonymous/sanctioned)

7. proof_of_reserves: Does the platform publish proof of reserves?
   Bucket: monthly | quarterly | annual | none

## OUTPUT FORMAT — JSON ONLY
{
  "providerId": "...",
  "plannerType": "btc",
  "agentRunTimestamp": "ISO-8601",
  "proposedClassifications": {
    "liquidation_ltv": {
      "proposedValue": "85%",
      "confidence": 0.95,
      "sources": [{ "url": "...", "snippet": "...", "lastChecked": "..." }],
      "conflictDetected": false,
      "adminStatus": "pending"
    },
    ... // all fields
  },
  "fieldsRequiringReview": [],
  "criticalFieldsBelowThreshold": [],
  "overallAgentConfidence": 0.91,
  "publishBlocked": true
}
```

### 4.4 Interface TypeScript du contrat JSON Agent

```typescript
interface AgentOutput {
  providerId: string;
  plannerType: "btc" | "stablecoin" | "fiat";
  agentRunTimestamp: string; // ISO-8601

  // Market data — bypasse l'approbation admin, direct vers l'engine
  marketData?: {
    hv30: number;              // ex. 0.072 = 7.2%
    maxDrawdown90d: number;    // ex. -0.041 = -4.1%
    pegDeviation90d?: number;  // stablecoin uniquement
    tvl?: number;              // DeFi uniquement, USD
    source: string;
    lastFetched: string;
    requiresAdminReview: false;
  };

  // Classification fields — requièrent approbation admin
  proposedClassifications: Record<string, {
    proposedValue: string;    // valeur bucket enum
    confidence: number;       // 0.0–1.0
    sources: Array<{
      url: string;
      snippet: string;        // <= 25 mots
      lastChecked: string;
    }>;
    conflictDetected: boolean;
    adminStatus: "pending" | "approved" | "edited" | "rejected";
  }>;

  fieldsRequiringReview: string[];
  criticalFieldsBelowThreshold: string[];
  overallAgentConfidence: number;
  publishBlocked: true; // TOUJOURS true jusqu'à approbation admin de tout
}
```

### 4.5 Cadence de re-vérification

| Type de données | Fréquence | En cas d'échec |
|-----------------|-----------|----------------|
| Market data (HV30, peg, TVL) | Quotidien | Freeze du score ; afficher bannière "Data Under Review" immédiatement |
| Safety-critical fields (LTV, rehypothecation, peg) | Hebdomadaire | Déclencher review admin ; afficher badge de staleness |
| Standard fields (fee schedule, terms) | Mensuel | Flag comme "pending re-check" ; score reste valide jusqu'à l'échec du re-check |

---

## 5. Provider Comparison Engine

### 5.1 Logique de comparaison

Permet aux utilisateurs de sélectionner 2–4 providers depuis un Yield Board et afficher une comparaison côte à côte structurée de tous les critères scorés, ranges de yield et indicateurs de risque. Opère sur les **snapshots de scores lockés courants** — aucune re-computation en temps réel.

### 5.2 Requête SQL de comparaison

```sql
SELECT
  p.provider_id,
  p.name,
  p.planner_type,
  p.jurisdiction_tier,
  ss.final_score,
  ss.risk_band,
  ss.score_verified_at,
  si.criteria,
  si.duration_months,
  mdc_hv.value AS hv30,
  mdc_liq.value AS max_drawdown_90d
FROM providers p
JOIN score_snapshots ss ON ss.provider_id = p.provider_id AND ss.is_current = TRUE
JOIN scoring_inputs si ON si.input_id = ss.input_id
LEFT JOIN market_data_cache mdc_hv ON mdc_hv.provider_id = p.provider_id
  AND mdc_hv.data_type = 'hv30'
LEFT JOIN market_data_cache mdc_liq ON mdc_liq.provider_id = p.provider_id
  AND mdc_liq.data_type = 'max_drawdown_90d'
WHERE p.provider_id = ANY(:provider_ids::uuid[])
  AND p.is_active = TRUE
ORDER BY ss.final_score DESC;
```

### 5.3 API Comparison

```
POST /api/v1/providers/compare

Request body:
{
  "plannerType": "btc",
  "providerIds": ["uuid1", "uuid2", "uuid3"]  // 2–4 IDs
}

Erreurs :
  400 — moins de 2 ou plus de 4 provider IDs
  400 — providers de plannerType mixtes dans une même comparaison
  404 — provider ID inconnu
```

---

## 6. Income Planner System

### 6.1 Vue d'ensemble des trois planners

| Module | Nom | Utilisateur principal | Asset core | Calcul clé |
|--------|-----|----------------------|------------|------------|
| 1A | BTC Income Planner | Holders BTC cherchant yield sans vendre | Bitcoin (BTC) | LTV sizing, prix margin call/liquidation, SRI |
| 1B | Fiat Income Planner | Allocateurs fiat cherchant yield BTC-linked | Capital fiat USD/EUR | Payout attendu depuis BTC Treasury preferred shares |
| 1C | Stablecoin Income Planner | Holders de stablecoins cherchant yield (CeFi/DeFi) | USDC, USDT, DAI, PYUSD | APY blendé, portfolio risk score, income range |

### 6.2 Module 1A — BTC Income Planner

#### Objectif
Aide les utilisateurs à dimensionner le collatéral Bitcoin pour un prêt sur période définie et visualiser le risque quand le levier (LTV) change. Éducatif et non-custodial. N'exécute pas de transactions. Ne fournit pas de conseil d'investissement.

#### Inputs

| Input | Variable | Source | Notes |
|-------|----------|--------|-------|
| Total loan need sur 12 mois | TotalNeed12m | User input | Principal + Total Interest sur 12 mois |
| Annual interest rate | APR | User input | Annual % |
| BTC spot price | BTC_price | Price feed API + override manuel optionnel | USD par BTC |

#### Formules

```typescript
// MODULE 1A: BTC INCOME PLANNER — RÉFÉRENCE DES FORMULES

TotalNeed12m = Principal + TotalInterest12m
MonthlyTarget = TotalNeed12m / 12
MonthlyInterest = Principal × APR / 12
BTC_required (at LTV) = TotalNeed12m / (BTC_price × LTV)

// Prix seuil (margin/liquidation)
Price_threshold = TotalNeed12m / (BTC_required × ThresholdLTV)
MarginCallPrice = TotalNeed12m / (BTC_required × 0.75)
LiquidationPrice = TotalNeed12m / (BTC_required × 0.85)
CollateralRatio = 1 / LTV

// Scenario Risk Index (SRI) — 0 à 100
SRI = clamp( 100 × (LTV / liquidationLTV)², 0, 100 )

// Bandes de risque :
// Vert  : LTV ≤ 50%
// Amber : 50% < LTV ≤ 75%
// Rouge : LTV > 75%

// Interprétation SRI :
// 0–40  : Sensibilité faible
// 41–70 : Sensibilité modérée
// 71–100: Sensibilité élevée
```

#### Exemple step-by-step

| Étape | Calcul | Résultat |
|-------|--------|----------|
| Inputs | BTC = $40,000 \| APR = 9% \| TotalNeed12m = $13,080 | — |
| Monthly Target | $13,080 / 12 | $1,090/mois |
| Monthly Interest (info) | $12,000 × 0.09 / 12 | $90/mois |
| BTC Required at 50% LTV | $13,080 / ($40,000 × 0.50) | 0.6540 BTC |
| Margin Call Price (75%) | $13,080 / (0.6540 × 0.75) | ≈ $26,670 |
| Liquidation Price (85%) | $13,080 / (0.6540 × 0.85) | ≈ $23,540 |
| SRI at 50% LTV | 100 × (0.50 / 0.85)² = clamp(34.6) | 35 — Sensibilité faible |

#### User Flow — Module 1A

1. User entre TotalNeed12m, APR, BTC_price
2. Système affiche monthly target + décomposition des intérêts
3. Slider LTV interactif (0–100%) → BTC_required se met à jour en temps réel
4. Tableau de comparaison : LTV = 10% | 25% | 50% | 75% | 85%
5. Indicateur de risque (Vert/Amber/Rouge) + valeur SRI affichée
6. User sauvegarde le scénario
7. Système charge Yield Board 1A (trié par DCC Score ↓)
8. User alloue % entre providers (somme doit = 100%)
9. Système calcule APY blendé + valeurs finales du scénario
10. Paramètres populés dans les sections du Suitability Report

### 6.3 Module 1B — Fiat Income Planner

#### Objectif
Permettre aux utilisateurs de gagner des yields Bitcoin-linked sans détenir, gérer ou pledger directement du BTC. Focalisé sur les produits de revenu dénominés en fiat (BTC treasury preferred shares) dont les retours sont indirectement liés aux écosystèmes Bitcoin.

#### Inputs

| # | Input | Default | Notes |
|---|-------|---------|-------|
| 1 | Capital à investir (USD) | Aucun | $25,000 / $100,000 / $500,000 typiques |
| 2 | Duration (mois) | 12 mois | Horizon de planification. Pas un sélecteur de lockup. |
| 3 | Allocation mode | Modelled | Modelled (généré par DCC) ou User-defined |

#### Logique d'allocation

| Mode | Logique | Contrôle utilisateur |
|------|---------|----------------------|
| Modelled Allocation (DCC-generated) | 70% → instrument top DCC Score, 15% → 2ème, 15% → 3ème | Aucun — DCC propose basé sur les scores |
| User-Defined Allocation | User sélectionne instruments et définit les poids manuellement | Complet — les poids doivent sommer à 100% |

#### Outputs clés
- Estimation mensuelle de payout attendu
- Estimation annuelle de payout attendu
- Range de payout si les taux varient (snapshot-based et timestampé)
- Paramètres sauvegardés populés dans le Suitability Report

### 6.4 Module 1C — Stablecoin Income Planner

#### Inputs

| Input | Options |
|-------|---------|
| Base Stablecoin | USDC, USDT |
| Target Income Mode | Monthly / Quarterly / Annual |
| Scenario Type | Modelled / User Defined |

#### Logique d'allocation — Scénario Modelled

| Catégorie | Poids | Structure |
|-----------|-------|-----------|
| Stablecoin savings products (CeFi) — on-demand | 70% | Providers CeFi éligibles supportant le stablecoin sélectionné |
| On-chain overcollateralized lending protocols (DeFi) | 30% | Protocoles DeFi surcollateralisés uniquement — aucun stablecoin algorithmique |

#### Outputs clés
- Revenu attendu aligné sur le mode sélectionné (mensuel/trimestriel/annuel)
- APY de portfolio blendé
- Portfolio Risk Score (0–100, post-duration adjustment)
- Risk Band (Low / Medium / Elevated)

#### Exemple — Scénario Guided

| Input/Output | Valeur |
|-------------|--------|
| Capital | $100,000 |
| Base Stablecoin | USDC |
| Duration | 30 jours |
| Allocation | 70% CeFi savings (~4.5%) + 30% DeFi overcollateralized (~5.2%) |
| Blended APY | ~4.8% |
| Expected Annual Income | ~$4,800 |
| Expected Monthly Income | ~$400 |
| Portfolio Risk Score | 83 / 100 — LOW RISK (🟢) |

---

## 7. Connexion Yield Boards → Income Planners

### 7.1 Modes de sélection — Guided vs. Custom

| Mode | Logique de filtre | Seuil de score | Cap d'allocation |
|------|-------------------|----------------|------------------|
| Guided Mode | Affiche uniquement les providers avec DCC Score ≥ 60. Tri DCC Score ↓. Highlight top 3. | ≥ 60 (MEDIUM ou mieux) | Max 30% par provider avec score 40–59 ; aucun cap pour 60+ |
| Custom Mode | Affiche tous les providers y compris HIGH RISK (0–39). Tri DCC Score ↓ par défaut. | Aucun minimum — mais avertissement plein écran pour ≤ 39 | Aucun — user contrôle l'allocation librement |

### 7.2 API Yield Board → Sélection Planner

```
GET /api/v1/yield-board/:plannerType
  ?mode=guided        // ou custom
  &minScore=60        // auto-appliqué en guided
  &sort=score_desc    // TOUJOURS par défaut
  &stablecoin=USDC    // 1C uniquement

Response:
{
  "plannerType": "btc",
  "mode": "guided",
  "providers": [ ProviderWithScore[] ],
  "guidedAllocation": {        // mode guided uniquement
    "top1": { "providerId": "...", "recommendedWeight": 70 },
    "top2": { "providerId": "...", "recommendedWeight": 15 },
    "top3": { "providerId": "...", "recommendedWeight": 15 }
  },
  "staleWarning": false,
  "asOf": "2026-02-25T00:00:00Z"
}
```

---

## 8. Connexion Income Planners → Suitability Report

### 8.1 Vue d'ensemble du Suitability Engine

Transforme une session planner complète en un objet JSON `suitabilitySnapshot` immuable, qui est la **source unique de vérité** pour tous les outputs downstream : rapport PDF, intégration plateforme advisor, et piste d'audit de provenance de données.

> **RÈGLE D'IMPLÉMENTATION CRITIQUE :** Ne JAMAIS re-calculer les scores au moment de la génération PDF. Utiliser le snapshot locké. Les scores du snapshot sont gelés en fin de session. C'est le bug d'implémentation le plus courant — ne pas y tomber.

### 8.2 Workflow de génération — 6 étapes

| Étape | Action | Règle critique |
|-------|--------|----------------|
| 1 | User complète la session planner — tous les inputs requis entrés, allocation sélectionnée ou guidée | Les poids d'allocation doivent sommer à 100% |
| 2 | Backend calcule le score de portfolio final en utilisant les snapshots de scores approuvés. Score locké dans le suitability snapshot — ne peut plus changer. | Utiliser les snapshots de scores lockés — ne JAMAIS re-calculer depuis les inputs bruts à ce stade |
| 3 | User clique "Generate Report". UUID de session créé. Inputs, allocation, scores et notes de risque sérialisés en objet JSON suitabilitySnapshot. | UUID généré une fois — immuable |
| 4 | Service de génération PDF (server-side, pas client-side) reçoit le snapshot JSON et rend le rapport avec le template fixé. | Server-side uniquement. Aucune génération PDF côté client. |
| 5 | PDF stocké côté serveur lié à l'UUID de session. User reçoit un lien de téléchargement. Jamais auto-envoyé par email sans action explicite de l'utilisateur. | Consentement explicite de l'utilisateur requis avant toute distribution |
| 6 | Si intégration Alephya ou Orion activée : suitabilitySnapshot JSON POSTé à l'endpoint API d'intégration. | L'intégration est toujours opt-in par utilisateur — jamais automatique |

### 8.3 Logique de génération automatique des notes de risque

| Condition | Note de risque générée |
|-----------|----------------------|
| Poids d'un seul provider > 60% | "High concentration: over 60% allocated to a single provider. Consider diversifying across 2–3 providers." |
| Tout provider dans le portfolio avec riskBand = ELEVATED | "One or more providers in this portfolio carry an ELEVATED risk rating. Review individual provider risk notes." |
| Fiat planner : tout instrument HV30 > 25% | "High volatility detected: one or more instruments have 30-day historical volatility exceeding 25%. Income distribution is not guaranteed." |
| Duration > 12 mois | "Extended duration: scores are adjusted downward for durations beyond 12 months to reflect compounding structural risk." |
| Stablecoin : toute déviation de peg flaggée | "Stablecoin peg risk: one or more instruments have triggered a peg deviation alert in the past 90 days." |

### 8.4 Structure des sections du rapport

| § | Section | Contenu |
|---|---------|---------|
| 1 | Header | DCC logo \| Titre du rapport \| UUID de référence \| Date de génération \| Module planner (1A/1B/1C) |
| 2 | User Inputs Summary | Montant capital \| Duration \| Préférence de risque \| Type d'asset \| Mode d'allocation \| Date de session |
| 3 | Recommended Allocation | Table : Provider/Instrument \| Allocation % \| DCC Score \| Yield Range \| Risk Band \| Key Risk Note |
| 4 | Portfolio Score | Score combiné \| Score band \| Score duration-adjusted \| Décomposition du score par critère |
| 5 | Expected Income Range | Annual income min–max \| Monthly income min–max \| Base de formule divulguée |
| 6 | Risk Notes | 3–5 notes de risque auto-générées (logique section 8.3) |
| 7 | Disclaimers | Boilerplate légal fixé (Section F.4 du CRO Memo) — verbatim, aucune édition sans revue légale |
| 8 | Data Provenance | Version du score \| Date as-of \| URL page méthodologie \| Référence snapshot evidence agent |
| 9 | Signature Block | Nom utilisateur (optionnel) \| Nom advisor (optionnel) \| Report UUID \| Version DCC \| Numéros de page |

---

## 9. Suitability Report (Alephya & Orion Compatible)

### 9.1 Schéma JSON suitabilitySnapshot — Définition complète

```typescript
// suitabilitySnapshot — schéma canonique pour PDF + intégration advisor
// Stocker en DB comme source unique de vérité. Ne jamais re-calculer depuis cet objet.

interface SuitabilitySnapshot {
  // ── Identity
  reportId: string;                          // UUID v4 — généré une fois en fin de session
  dccVersion: string;                        // ex. "1.0.3"
  plannerModule: "1A" | "1B" | "1C";
  generatedAt: string;                       // ISO-8601
  dataAsOf: string;                          // Date ISO du snapshot de score le plus récent utilisé

  // ── User Inputs
  inputs: {
    capitalUSD: number;
    durationMonths: number;
    riskPreference: "low" | "medium" | "high";
    allocationMode: "guided" | "custom";
    assetType: "btc" | "stablecoin" | "fiat";
  };

  // ── Allocation
  allocation: Array<{
    providerId: string;
    providerName: string;
    ticker?: string;           // fiat preferred shares uniquement
    weightPct: number;         // 0–100 ; tous les items doivent sommer à 100
    apyMin: number;            // 0.06 = 6%
    apyMax: number;
    dccScore: number;          // 0–100, duration-adjusted
    riskBand: "LOW" | "MEDIUM" | "ELEVATED" | "HIGH";
    keyRiskNote: string;       // résumé 1 phrase en langage simple
  }>;

  // ── Portfolio Outputs
  outputs: {
    portfolioScore: number;             // moyenne pondérée DCC score
    portfolioBand: string;
    durationMultiplier: number;
    annualIncomeMin: number;            // USD
    annualIncomeMax: number;
    monthlyIncomeMin: number;
    monthlyIncomeMax: number;
    scoreBreakdown: Record<string, number>; // critère → score
  };

  // ── Risk Notes (auto-générées — 3–5 max)
  riskNotes: string[];

  // ── Disclaimers (fixés — ne pas autoriser l'édition utilisateur)
  disclaimers: string[];

  // ── Data Provenance
  provenance: {
    scoringMethodologyVersion: string;  // ex. "1.0"
    methodologyUrl: string;
    agentSnapshotRef?: string;          // UUID evidence pack
  };
}
```

### 9.2 Intégration plateforme Advisor — Alephya & Orion

```typescript
async function pushToAdvisorPlatform(
  platform: "alephya" | "orion" | "custom",
  snapshot: SuitabilitySnapshot,
  advisorCredentials: { apiKey: string; clientId: string }
): Promise<{ success: boolean; platformRef: string }> {
  const endpoints: Record<string, string> = {
    alephya: "https://api.alephya.com/v1/dcc/suitability",
    orion:   "https://api.orionadvisor.com/v1/external/dcc",
    custom:  process.env.CUSTOM_ADVISOR_ENDPOINT ?? "",
  };

  const payload = {
    source: "dcc",
    sourceVersion: snapshot.dccVersion,
    reportId: snapshot.reportId,
    clientId: advisorCredentials.clientId,
    generatedAt: snapshot.generatedAt,
    data: snapshot,          // snapshot complet — la plateforme parse ce dont elle a besoin
    format: "dcc_v1",        // versionné pour l'évolution du schéma
  };

  const res = await fetch(endpoints[platform], {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${advisorCredentials.apiKey}`,
      "X-DCC-Version": snapshot.dccVersion,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(`Integration failed: ${res.status}`);
  const result = await res.json();
  return { success: true, platformRef: result.referenceId };
}
```

### 9.3 Exemple de Suitability Report — Planner 1A (BTC)

| Champ | Valeur |
|-------|--------|
| Report ID | a4f2b8c1-3d9e-4b72-8f1a-7c6d2e9f0b3a |
| DCC Version | 1.0.0 |
| Planner Module | 1A — BTC Income Planner |
| Generated At | 2026-02-25T14:30:00Z |
| Data As Of | 2026-02-01 |
| Capital (USD) | $200,000 |
| Duration (mois) | 6 |
| Duration Multiplier | × 0.97 |
| Risk Preference | Medium |
| Allocation Mode | Guided |
| Allocation | 70% AMINA Bank (score 81) + 15% Sygnum Bank (score 77) + 15% Unchained (score 75) |
| Portfolio Score | 79 — MEDIUM RISK (🟡) |
| Blended APY | 6.0% – 8.0% |
| Expected Annual Income | $12,000 – $16,000 |
| Expected Monthly Income | $1,000 – $1,333 |

### 9.4 Disclaimers obligatoires — À inclure verbatim dans chaque rapport

> Ces 7 disclaimers doivent apparaître verbatim dans chaque PDF généré. Ne pas éditer sans revue légale.

1. This report is generated by Digital Credit Compass (DCC) for informational purposes only.
2. It does not constitute investment advice, financial advice, or a recommendation to buy, sell, or hold any financial instrument.
3. DCC scores reflect publicly available information as of the date shown. They are not predictions of future performance.
4. Yields and distributions shown are estimates based on provider-published data. Actual income may differ materially.
5. DCC is not a registered investment adviser, broker-dealer, or financial institution in any jurisdiction.
6. Past provider performance, scoring history, or DCC methodology versions do not guarantee future results.
7. The user accepts full responsibility for any investment decision made using this report.

---

## 10. Flowchart complet du système

```
LAYER 1: PROVIDER DISCOVERY
├── AI Agent
│   ├── Source Discovery: build official domain whitelist
│   ├── Document Fetch: TOS, loan terms, FAQ, audit reports
│   ├── Field Extraction: LTV, rehypothecation, custody, jurisdiction
│   ├── Conflict Detection: mark CONFLICT if sources disagree
│   ├── Confidence Scoring: 0.0–1.0 per field
│   └── Evidence Pack JSON → Admin Queue (publishBlocked = TRUE)
│
│   [Human Admin Review]
↓
LAYER 2: SCORING ENGINE
├── Admin approves/edits/rejects each field
│   └── 100% field sign-off required before publish
├── Scoring Engine receives approved inputs
│   ├── Applies planner-specific weights (BTC/Stablecoin/Fiat)
│   ├── Applies duration multiplier
│   └── Outputs Raw Score → Final Score → Risk Band
└── Score Snapshot: immutable, versioned, append-only DB
│
│   [Locked score snapshots]
↓
LAYER 3: YIELD BOARDS (3 Parallel Boards)
├── Yield Board 1A (BTC Lending)       Sort: DCC Score ↓
├── Yield Board 1B (Fiat/BTC Prefs)    Sort: DCC Score ↓ | HV30 in Field 4
└── Yield Board 1C (Stablecoin)        Sort: DCC Score ↓ | Peg stability visible
│
│   [User selects planner]
↓
LAYER 4: INCOME PLANNER
├── Module 1A: Enter TotalNeed12m + APR + BTC_price → LTV slider → SRI
├── Module 1B: Enter capital + duration + mode
└── Module 1C: Choose stablecoin + mode + capital
│
│   [Scenario saved → load providers]
↓
LAYER 5: PORTFOLIO CONSTRUCTION
├── Yield Board loads filtered providers (Guided: score ≥ 60)
├── User allocates weights (must sum to 100%)
│   ├── Guided: 70/15/15 default across top 3
│   └── Custom: user controls fully
└── System computes blended APY + portfolio score
│
│   [Allocation finalized]
↓
LAYER 6: SUITABILITY GENERATION
├── User clicks "Generate Report"
├── Session UUID created
├── Inputs + scores + allocation → suitabilitySnapshot JSON
├── Risk notes auto-generated (3–5 max)
├── PDF generated server-side from snapshot
├── PDF stored linked to UUID
└── Download link issued to user
│
│   [User opts in to advisor share]
↓
LAYER 7: PLATFORM INTEGRATION
├── POST suitabilitySnapshot JSON
│   ├── Alephya: https://api.alephya.com/v1/dcc/suitability
│   ├── Orion:   https://api.orionadvisor.com/v1/external/dcc
│   └── Custom:  env.CUSTOM_ADVISOR_ENDPOINT
└── Advisor receives full snapshot → reviews, annotates, acts
```

---

## 11. Structure de fichiers & code de référence

### 11.1 Structure de fichiers

```
dcc-saas/
├── /providers
│   ├── provider.model.ts          # Provider TypeScript interfaces
│   ├── provider.repository.ts     # DB queries (select, insert, update)
│   └── provider.routes.ts         # REST API routes
├── /yield_engine
│   ├── scoring.engine.ts          # Core deterministic scoring
│   ├── score.snapshot.ts          # Snapshot lock + versioning
│   └── yield.board.ts             # Yield board query + filter logic
├── /planner_engine
│   ├── planner.btc.ts             # Module 1A BTC formulas
│   ├── planner.fiat.ts            # Module 1B Fiat preferred shares
│   ├── planner.stablecoin.ts      # Module 1C Stablecoin
│   └── portfolio.allocator.ts     # Shared allocation + blended APY
├── /suitability_engine
│   ├── snapshot.builder.ts        # suitabilitySnapshot serializer
│   ├── risk.notes.generator.ts    # Auto risk note logic
│   └── pdf.generator.ts           # Server-side PDF renderer
├── /ai_agents
│   ├── agent.btc.prompt.md        # Master prompt — BTC planner
│   ├── agent.stablecoin.prompt.md # Master prompt — Stablecoin
│   ├── agent.fiat.prompt.md       # Master prompt — Fiat
│   ├── agent.runner.ts            # Pipeline orchestrator
│   └── evidence.validator.ts      # Confidence + conflict checks
└── /api
    ├── routes.providers.ts        # GET/POST provider endpoints
    ├── routes.yield-board.ts      # GET yield board endpoints
    ├── routes.planner.ts          # POST planner compute endpoints
    ├── routes.suitability.ts      # POST generate report endpoints
    └── routes.integration.ts      # POST advisor platform push
```

### 11.2 `/yield_engine/scoring.engine.ts`

```typescript
// /yield_engine/scoring.engine.ts
// DCC Scoring Engine v1.0 — CRO-approved weights. DO NOT MODIFY.

export type PlannerType = "btc" | "stablecoin" | "fiat";

export interface ScoringInputs {
  plannerType: PlannerType;
  durationMonths: number;
  criteria: Record<string, number>; // criterion key → raw score 0–100
}

export interface ScoringResult {
  rawScore: number;
  finalScore: number;
  band: "LOW" | "MEDIUM" | "ELEVATED" | "HIGH";
  durationMultiplier: number;
}

const WEIGHTS: Record<PlannerType, Record<string, number>> = {
  btc: {
    transparency: 0.30,
    collateralControl: 0.25,
    jurisdiction: 0.20,
    structuralRisk: 0.15,
    trackRecord: 0.10,
  },
  stablecoin: {
    reserveQuality: 0.28,
    yieldTransparency: 0.22,
    counterpartyRisk: 0.20,
    liquidity: 0.15,
    jurisdiction: 0.10,
    trackRecord: 0.05,
  },
  fiat: {
    marketVolatility: 0.30,
    incomeMechanism: 0.25,
    seniority: 0.15,
    complexity: 0.15,
    providerQuality: 0.15,
  },
};

function getDurationMultiplier(months: number): number {
  if (months < 3)  return 1.00;
  if (months < 6)  return 0.97;
  if (months < 12) return 0.93;
  if (months < 24) return 0.87;
  return 0.80;
}

export function computeScore(inputs: ScoringInputs): ScoringResult {
  const weights = WEIGHTS[inputs.plannerType];
  if (!weights) throw new Error(`Unknown plannerType: ${inputs.plannerType}`);

  let rawScore = 0;
  for (const [key, weight] of Object.entries(weights)) {
    rawScore += (inputs.criteria[key] ?? 0) * weight;
  }

  const mult = getDurationMultiplier(inputs.durationMonths);
  const finalScore = Math.round(Math.max(0, Math.min(100, rawScore * mult)));
  const band = finalScore >= 80 ? "LOW"
    : finalScore >= 60 ? "MEDIUM"
    : finalScore >= 40 ? "ELEVATED" : "HIGH";

  return { rawScore, finalScore, band, durationMultiplier: mult };
}
```

### 11.3 `/planner_engine/planner.btc.ts`

```typescript
// /planner_engine/planner.btc.ts — Module 1A: BTC Income Planner

export interface BtcPlannerInputs {
  totalNeed12m: number;        // Principal + total interest over 12 months
  apr: number;                 // Annual %, e.g. 0.09 = 9%
  btcPrice: number;            // USD per BTC
  ltv: number;                 // 0.0–1.0
  liquidationLtv?: number;     // default 0.85
  marginCallLtv?: number;      // default 0.75
}

export interface BtcPlannerResult {
  monthlyTarget: number;
  btcRequired: number;
  marginCallPrice: number;
  liquidationPrice: number;
  scenarioRiskIndex: number;
  riskBand: "GREEN" | "AMBER" | "RED";
  collateralRatio: number;
}

export function computeBtcPlanner(i: BtcPlannerInputs): BtcPlannerResult {
  const liqLtv = i.liquidationLtv ?? 0.85;
  const mcLtv  = i.marginCallLtv ?? 0.75;

  if (i.ltv <= 0 || i.ltv > 1.0) throw new Error("LTV must be > 0 and <= 1.0");
  if (i.btcPrice <= 0)            throw new Error("BTC price must be > 0");

  const monthlyTarget   = i.totalNeed12m / 12;
  const btcRequired     = i.totalNeed12m / (i.btcPrice * i.ltv);
  const marginCallPrice = i.totalNeed12m / (btcRequired * mcLtv);
  const liquidationPrice= i.totalNeed12m / (btcRequired * liqLtv);
  const sriRaw          = 100 * Math.pow(i.ltv / liqLtv, 2);
  const scenarioRiskIndex = Math.min(Math.max(sriRaw, 0), 100);
  const riskBand        = i.ltv <= 0.50 ? "GREEN" : i.ltv <= 0.75 ? "AMBER" : "RED";
  const collateralRatio = 1 / i.ltv;

  return {
    monthlyTarget:    Math.round(monthlyTarget * 100) / 100,
    btcRequired:      Math.round(btcRequired * 10000) / 10000,
    marginCallPrice:  Math.round(marginCallPrice),
    liquidationPrice: Math.round(liquidationPrice),
    scenarioRiskIndex:Math.round(scenarioRiskIndex * 10) / 10,
    riskBand,
    collateralRatio:  Math.round(collateralRatio * 100) / 100,
  };
}
```

### 11.4 `/suitability_engine/snapshot.builder.ts`

```typescript
// /suitability_engine/snapshot.builder.ts
import { v4 as uuidv4 } from "uuid";
import { generateRiskNotes } from "./risk.notes.generator";
import { DISCLAIMERS } from "./disclaimers.const";

export function buildSuitabilitySnapshot(
  session: PlannerSession,
  allocation: AllocationItem[],
  lockedScores: Map<string, ScoringResult>
): SuitabilitySnapshot {
  // Validate allocation sums to 100%
  const totalWeight = allocation.reduce((s, a) => s + a.weightPct, 0);
  if (Math.abs(totalWeight - 100) > 0.01)
    throw new Error(`Allocation weights sum to ${totalWeight}%, must be 100%`);

  // Compute portfolio-level metrics from LOCKED scores — never re-compute
  const portfolioScore = allocation.reduce(
    (sum, a) => sum + (lockedScores.get(a.providerId)?.finalScore ?? 0) * (a.weightPct / 100),
    0
  );
  const blendedApyMin = allocation.reduce((sum, a) => sum + a.apyMin * (a.weightPct / 100), 0);
  const blendedApyMax = allocation.reduce((sum, a) => sum + a.apyMax * (a.weightPct / 100), 0);
  const annualIncomeMin = session.capitalUSD * blendedApyMin;
  const annualIncomeMax = session.capitalUSD * blendedApyMax;
  const riskBand = portfolioScore >= 80 ? "LOW" : portfolioScore >= 60 ? "MEDIUM"
    : portfolioScore >= 40 ? "ELEVATED" : "HIGH";

  return {
    reportId:      uuidv4(),
    dccVersion:    process.env.DCC_VERSION ?? "1.0.0",
    plannerModule: session.plannerModule,
    generatedAt:   new Date().toISOString(),
    dataAsOf:      session.dataAsOf,
    inputs: {
      capitalUSD:     session.capitalUSD,
      durationMonths: session.durationMonths,
      riskPreference: session.riskPreference,
      allocationMode: session.allocationMode,
      assetType:      session.assetType,
    },
    allocation: allocation.map(a => ({
      ...a,
      dccScore:  lockedScores.get(a.providerId)?.finalScore ?? 0,
      riskBand:  lockedScores.get(a.providerId)?.band ?? "HIGH",
    })),
    outputs: {
      portfolioScore:    Math.round(portfolioScore * 10) / 10,
      portfolioBand:     riskBand,
      durationMultiplier: allocation[0]
        ? (lockedScores.get(allocation[0].providerId)?.durationMultiplier ?? 1.0) : 1.0,
      annualIncomeMin:   Math.round(annualIncomeMin),
      annualIncomeMax:   Math.round(annualIncomeMax),
      monthlyIncomeMin:  Math.round(annualIncomeMin / 12),
      monthlyIncomeMax:  Math.round(annualIncomeMax / 12),
      scoreBreakdown:    {}, // populated from scoring_inputs criteria
    },
    riskNotes:   generateRiskNotes(allocation, session),
    disclaimers: DISCLAIMERS,
    provenance: {
      scoringMethodologyVersion: "1.0",
      methodologyUrl:    "https://digitalcreditcompass.com/methodology",
      agentSnapshotRef:  session.agentSnapshotRef,
    },
  };
}
```

---

## 12. Roadmap d'implémentation

### 12.1 Séquence d'exécution en 6 phases

| Phase | Nom | Livrables | Critère de sortie |
|-------|-----|-----------|-------------------|
| 1 | Provider System | DB schema (5 tables), Provider CRUD API, Admin UI stub | Les 9 providers BTC ingérés. L'API retourne la liste filtrée. |
| 2 | Yield Board System | Scoring engine (TypeScript), Snapshot system (append-only), Yield Board 1A API, Admin review queue UI, Intégration API market data | Test de déterminisme passe 100/100 runs. Les 5 critères BTC calculent correctement. Tri = DCC Score ↓. |
| 3 | Planner System | Module 1A (BTC) compute engine + UI, Module 1B (Fiat) + UI, Module 1C (Stablecoin) + UI, Portfolio allocator, Session save/restore | Tous les tests de formule planner passent (T2). LTV=0 retourne une erreur de validation. SRI calcule non-linéairement. |
| 4 | Suitability System | suitabilitySnapshot builder, Risk notes auto-generator, PDF generator server-side, Report storage (UUID-linked), Download endpoint | Test de correspondance PDF (T5) : chaque champ numérique dans le PDF correspond exactement au JSON snapshot. Disclaimers présents verbatim. |
| 5 | AI Agent Automation | Agent pipeline (6 stages), Evidence pack JSON contract, Intégration admin review queue, Seuils de confiance appliqués, Scheduler re-check (daily/weekly/monthly) | publishBlocked = true sur tout output agent (T7). La bannière de données périmées se déclenche en un cycle de rendu (T8). |
| 6 | Platform Integration | Intégration POST Alephya, Intégration POST Orion, Custom webhook endpoint, UI toggle opt-in utilisateur, Gestion des credentials d'intégration (env vars uniquement) | Test de round-trip réussi vers les deux endpoints sandbox Alephya et Orion. Snapshot JSON accepté et référencé par la plateforme. |

### 12.2 Checklist de sign-off pre-développement

| # | Item | Owner | Statut |
|---|------|-------|--------|
| 1 | Scoring engine TypeScript (Section 3.8) revu et approuvé par CRO | CRO | ☐ |
| 2 | Poids des critères des trois planners confirmés contre le CRO memo | Lead Developer + CRO | ☐ |
| 3 | DB schema inclut les 5 tables (providers, scoring_inputs, score_snapshots, evidence_packs, market_data_cache) | Lead Developer | ☐ |
| 4 | Schéma JSON suitabilitySnapshot validé contre les champs du template PDF | Product + Developer | ☐ |
| 5 | Bloc de disclaimers légaux (7 items) revu par le conseil légal | Legal | ☐ |
| 6 | Endpoints d'intégration advisor (Alephya, Orion) confirmés avec chaque plateforme | CRO + Developer | ☐ |

### 12.3 Règles non-négociables — Immuables sans sign-off CRO

| # | Règle | Conséquence de violation |
|---|-------|--------------------------|
| 1 | Les poids de scoring (Section 3.8) sont fixés. Ne pas ajuster. | Intégrité du score détruite ; tous les scores publiés deviennent invalides |
| 2 | Tri par défaut Yield Board : DCC Score décroissant. Jamais APY. | Modèle de confiance core violé ; DCC devient un site de comparaison APY |
| 3 | HV30 doit être dans la ligne primaire du Yield Board Fiat — Champ 4. | Signal de risque clé caché ; l'utilisateur ne peut pas prendre de décision éclairée |
| 4 | publishBlocked = true jusqu'à ce que tous les champs agent aient le statut admin. | Données AI non-approuvées entrent dans le scoring engine |
| 5 | suitabilitySnapshot est la source unique de vérité pour le PDF. | Les champs PDF peuvent diverger des scores réels — risque de conformité |
| 6 | Les disclaimers légaux (F.4) inclus verbatim dans chaque PDF. | Exposition légale — éditer uniquement après revue légale |
| 7 | Les snapshots de scores sont immuables. Aucune édition rétroactive. | L'historique des scores perd son intégrité ; les utilisateurs ne peuvent pas faire confiance aux scores publiés |
| 8 | La bannière de données périmées s'affiche si les market data ont > 7 jours. | Les utilisateurs peuvent prendre des décisions sur des données de volatilité ou de peg obsolètes |

### 12.4 Tests QA — Obligatoires avant toute release publique

| Test ID | Description | Critère de succès |
|---------|-------------|-------------------|
| T1 | Déterminisme du scoring engine | Mêmes inputs × 100 runs → output identique à chaque fois |
| T2 | BTC planner : validation LTV = 0 | Doit retourner une erreur de validation, pas un crash ou division par zéro |
| T3 | Fiat planner : hard cap HV30 > 35% | STRK HV30 ~32% → score ≤ 40 sur C1 |
| T4 | Stablecoin : cap stablecoin algorithmique | Score total doit être capé à 20 quels que soient les autres critères |
| T5 | Précision des champs PDF | Chaque champ numérique dans le PDF correspond exactement au JSON suitabilitySnapshot — zéro divergence |
| T6 | Tri par défaut Yield Board | DCC Score ↓ au chargement de la page et après tout changement de filtre — toujours |
| T7 | Blocage de publication agent | publishBlocked = true sur tout output agent avant approbation admin. Tentative de bypass → système rejette. |
| T8 | Bannière de données périmées | Échec API mocké → champ HV30 affiche "Data Under Review" en un cycle de rendu |

---

*DCC SaaS Architecture Consolidation & Implementation Blueprint · Version 1.0 · Février 2026 · **INTERNAL — ENGINEERING USE ONLY***