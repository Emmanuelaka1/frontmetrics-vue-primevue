# FrontMetrics — Vue 3 + Vite + PrimeVue 4

Projet de base prêt à l'emploi pour afficher des métriques depuis un service REST.

## Démarrage

```bash
npm i
cp .env.example .env   # édite VITE_METRICS_URL si besoin
npm run dev
```

## Tech

- Vue 3 + TypeScript (Vite)
- PrimeVue 4 + thème Aura
- PrimeIcons + PrimeFlex

## API

Par défaut, l'URL est `VITE_METRICS_URL` (voir `.env`). L'API peut renvoyer:

```json
{
  "typeCarte": "INSERT",
  "metrics": [
    { "name": "CPU", "value": 62, "type": "percent" },
    { "name": "Req/min", "value": 1240, "type": "number" },
    { "name": "Status", "value": "OK", "type": "text" }
  ]
}
```

ou directement un **tableau** de métriques. Le code normalise automatiquement.
