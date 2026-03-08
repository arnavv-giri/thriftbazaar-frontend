# ThriftBazaar Frontend

React 19 + Vite 7 marketplace frontend.

## Local Development

```bash
npm install
npm run dev
```

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Spring Boot backend URL (e.g. `https://your-backend.railway.app`) |

Copy `.env.example` to `.env` and fill in the value for local dev.
Production env vars are set in Vercel dashboard — never committed to git.
