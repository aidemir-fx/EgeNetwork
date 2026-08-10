# EGE Network

## Production deployment

1. Copy `.env.example` to `.env` on the server and fill in production values. Never commit `.env`.
2. Create the persistent database directory: `mkdir -p data`.
3. Build and start the service: `docker compose up -d --build`.
4. Check the service: `docker compose ps` and `curl http://127.0.0.1:3000/health`.

SQLite is stored in `./data/auth.sqlite` and is mounted into the container at `/app/data`.
The production image builds dependencies inside Node 22 Alpine, so host `node_modules` are not reused.
