# savings-wishlist
wishlist tracker with a twist, inspired by "girl math" in pop culture; tracking how much you save

## Run locally

Start PostgreSQL from the repo root with `docker compose up -d db`. Create
`backend/.env` with the database URL for the local Compose service.

```dotenv
DATABASE_URL=postgresql://myapp:1234@127.0.0.1:5432/myapp
```

From `backend`, install dependencies, create the auth tables, and start Express.

```sh
npm install
npm run db:init:auth
npm start
```

In another terminal, run the frontend from `frontend`.

```sh
npm install
npm run dev
```

Open the Vite URL to sign up or sign in. Vite proxies `/api` to port 3000 by
default. If you set a different backend port, set `BACKEND_URL` when starting Vite.
