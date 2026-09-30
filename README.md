# CivicCycle

Municipal waste operations client built with React, TypeScript, and Vite. The current version uses typed in-memory fixtures so the dashboard can be reviewed before the Express and MongoDB services are introduced.

## Local development

```powershell
npm install
npm run dev
```

## Client structure

- `src/components`: reusable presentation components
- `src/data`: mock repositories and replaceable fixture data
- `src/types`: shared domain contracts
- `src/App.tsx`: page composition and temporary UI state

## MERN handoff

Replace the fixture exports in `src/data/dashboard.tsx` with API client calls to an Express service. Keep the exported domain contracts in `src/types/dashboard.ts` aligned with MongoDB document DTOs; this lets components remain independent of transport and persistence details.