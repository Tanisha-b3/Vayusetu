# VayuSetu Server (Backend, RAG & LLM Engine)

Standalone backend server providing deterministic data cleaning, automated hotspot calculations, citation-grounded RAG, and Groq/Gemini LLM inference.

## Setup & Running Standalone
```bash
npm install
npm start          # API running on http://localhost:5000/api/health
npm run dev        # Watch mode
npm run demo       # Runs full pipeline test on sample datasets
```

## Structure
- `data/`: Local JSON report storage (`reports.json`)
- `sample-data/`: Evaluation test CSVs
- `scripts/`: Automated evaluator test script (`demo.js`)
- `knowledge/`: Domain knowledge markdown files & role playbooks
- `prompts/`: Grounding contract & formatting prompts
- `routes/`: Express REST API routes (`api.js`)
- `services/`: Normalizer, compare, RAG retriever/indexer, LLM client
- `config.js`: Environment configuration (Groq, MongoDB, Gemini)
- `index.js`: Express server entry & Vercel serverless export
- `store.js`: MongoDB Atlas & local JSON persistence layer
