# VayuSetu - AI-Powered Civic Air Quality Briefing Studio

Backend + GenAI + RAG for the *Civic Air Quality Briefing Studio* challenge.
Rule: **code cleans and calculates, Gemini interprets and writes, RAG keeps Gemini grounded.**

## Deployment on Vercel
VayuSetu is pre-configured for seamless 1-click deployment on **Vercel** with fullstack routing (React frontend + Express Serverless API functions):
1. Push your repository to GitHub / GitLab.
2. In the [Vercel Dashboard](https://vercel.com/new), import your repository.
3. In **Settings -> Environment Variables**, add:
   - `GROQ_API_KEY`: your Groq API key (`gsk_...`)
   - `GROQ_MODEL`: `openai/gpt-oss-120b`
   - `MONGODB_URI`: your MongoDB Atlas connection string (e.g. `mongodb+srv://...`)
4. Click **Deploy**. Vercel will automatically build the React client and route all `/api/*` endpoints to the serverless handler!

Alternatively, deploy using the Vercel CLI:
```bash
npx vercel
# Follow prompts, set Environment Variables in Vercel dashboard, then deploy to production:
npx vercel --prod
```

## Setup (Local)
```bash
npm install               # install backend dependencies
npm run build             # build the React + Vite frontend
npm start                 # starts the full app on http://localhost:5000
```
For active frontend development:
```bash
npm start                 # runs backend on http://localhost:5000
npm run client            # in another terminal: runs Vite dev server on http://localhost:3000 (proxies /api)
```
Node 18+. Without `MONGO_URI`, reports are stored in `data/reports.json`.

## Pipeline
```
upload / paste -> parser.js -> normalizer.js (columns, dates, units, flags, row ids)
  -> store (MongoDB / JSON) -> RAG index (readings + knowledge)
  -> Gemini: analysis -> role recommendations -> comparison -> briefing + advisory
  -> citation verifier -> printable HTML (Save as PDF)
```

## Folder map
| Path | Purpose |
|---|---|
| `server/services/parser.js` | CSV / XLSX / pasted text -> raw table (PDF returns a clear "not supported yet") |
| `server/services/normalizer.js` | Header aliasing, date parsing, unit conversion (mg/m3 -> ug/m3), missing/invalid/suspicious flags, location alias merge, hotspot + data-quality math |
| `server/services/compare.js` | Previous vs latest: % change, new/resolved hotspots, gaps resolved/new (all in code) |
| `server/services/rag/` | `embeddings.js` (Gemini or local fallback), `retriever.js` (vector search), `indexer.js` (builds corpora) |
| `server/knowledge/*.md` | RAG knowledge base: AQI bands, health guidance, role playbooks, cause attribution, language/reading levels |
| `server/prompts/*.js` | All Gemini prompts (see below) |
| `server/services/generate.js` | retrieve -> prompt -> Gemini -> verify |
| `server/services/verify.js` | Drops invalid citations, flags unverified items |
| `server/services/render.js` | Printable briefing/advisory HTML with evidence index |
| `server/routes/api.js` | REST API |
| `server/sample-data/` | Two deliberately messy Bhopal CSVs (12 and 13 Nov) |
| `server/scripts/` | Execution scripts & evaluators demo (`demo.js`) |
| `server/data/` | Local JSON report store (`reports.json`) |
| `client/` | React 18 + Vite frontend |

## RAG design
Two corpora, one vector index each:
1. **Data corpus** - one chunk per reading row (`[R4] New Market | 2026-11-13 | PM2.5=190 ... source file row 4`) plus one chunk per location summary. Flagged rows and hotspots are *always* included so data-quality claims are never missed.
2. **Knowledge corpus** - markdown files split by `##` headings. Role playbook chunks carry `<!-- role: ... -->` tags so each role gets its own playbook deterministically.

Embeddings use `gemini-embedding-001` (768 dims). If no key or the call fails, a local hashed bag-of-words embedder is used so retrieval still works.

## Prompts (server/prompts)
- `common.js` - **system prompt with the grounding contract** (no invented values, cite row ids, observed vs possible cause, suspicious readings are unreliable, no trend from one report) + language/level/role definitions + shared document schema
- `analysis.prompt.js` - findings, data gaps, possible causes (with how-to-verify), area comparison, unusual readings
- `recommendations.prompt.js` - role-specific prioritised actions (owner, timeframe, citations, playbook refs, "hold until verified")
- `comparison.prompt.js` - explains the precomputed diff (improved, worsened, new hotspots, gaps resolved)
- `briefing.prompt.js` - internal briefing, 9 fixed sections
- `advisory.prompt.js` - citizen advisory with separate children / older adults / sensitive-people sections
- `qa.prompt.js` - grounded question answering ("answerable: false" when data is missing)

## Guardrails
- Missing values stay `null`; Gemini never sees a "filled" value.
- PM2.5 > PM10, negative, extreme values are flagged and excluded from hotspots and comparisons.
- Reliability level (Good / Limited / Poor) is computed by code and overrides whatever Gemini says.
- Every citation is checked against real row ids; unknown ids are removed and the item is marked `unverified`.
- If Gemini fails, analysis falls back to rule-based findings (`generatedBy: "rules"`).

## API
| Method | Route | Body |
|---|---|---|
| GET | `/api/health` | - (lists roles, languages, levels) |
| POST | `/api/reports` | multipart `file` **or** JSON `{text, name}`; optional `city`, `reportDate` |
| GET | `/api/reports`, `/api/reports/:id` | |
| GET | `/api/reports/:id/readings/:rid` | traceability: the exact source row |
| POST | `/api/reports/:id/readings` | `{ids:["R3","R7"]}` batch lookup |
| POST | `/api/reports/:id/analyze` | |
| POST | `/api/reports/:id/recommendations` | `{role: ward_officer \| housing_society \| school}` |
| PATCH | `/api/reports/:id/actions/:role/:actionId` | `{status, assignee}` action tracker |
| POST | `/api/reports/:id/compare` | `{previousId?}` (auto-picks the latest earlier report) |
| POST | `/api/reports/:id/briefing` | `{language, level, role}` |
| POST | `/api/reports/:id/advisory` | `{language, level}` |
| GET | `/api/reports/:id/documents/:docId/print` | printable HTML -> browser Print -> Save as PDF |
| POST | `/api/reports/:id/ask` | `{question, role?}` RAG Q&A |

Languages: `en hi mr bn ta te gu kn pa ur`. Levels: `simple standard detailed`.

## Demo script for evaluators
1. Upload `report_2026-11-12.csv`, then `report_2026-11-13.csv` (city Bhopal).
2. Show flags: `N/A`, `-`, `-12`, `Missing`, `0.09 mg/m3`, PM2.5 900 > PM10 300, five date formats, a title line above the header.
3. Analyze -> click a finding -> `/readings/:rid` shows the source row.
4. Recommendations for each role -> compare actions.
5. Compare -> MP Nagar PM2.5 145 -> 165 (+13.8%), Bairagarh new hotspot, Arera PM10 gap resolved, Kolar PM2.5 new gap.
6. Briefing (English, detailed) and Advisory (Hindi, simple) -> print URL -> Save as PDF.

## Status
Tested offline: parsing, cleaning, comparison, local-embedding RAG, API routes, error handling.
**Not tested here:** live Gemini calls (no API key in the build environment). Model names are in `.env` - change them if your key uses different ones. Verify AQI breakpoints in `aqi.js` against the current CPCB notification.

## Frontend
Complete React 18 + Vite frontend built in `./client`:
- **Studio Overview**: Interactive Leaflet monitoring map with AQI color pins, data quality audit metrics, and priority hotspot badges.
- **Traceability & Evidence Drawer**: Clickable citation chips (e.g. `[R4]`, `[R2]`) slide open the exact source row, file name, row number, raw text, and audit flags.
- **Temporal Comparison**: Precomputed code deltas (improved, worsened, stable), new/resolved hotspots, and resolved/new data gaps.
- **Action Tracker Board**: Role playbooks for Ward Officer, Housing Society (RWA), and Schools with interactive status progression (`todo` ➔ `in_progress` ➔ `done`) and assignee tracking.
- **Civic Document Studio**: Multilingual briefing & advisory generator across 10 Indian languages and 3 reading levels with direct Print-to-PDF export.
- **Grounded Q&A Assistant**: Strict RAG assistant answering citizen & official queries with verifiable citations.
- **Readings Ledger**: Searchable, filterable table of all audited measurements.
- **1-Click Demo Loader**: Instant buttons to test with the messy Bhopal evaluation datasets.