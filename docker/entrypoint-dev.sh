#!/bin/sh
set -e

# Host bind-mounts source, but node_modules lives in a Docker volume that can
# stay stale after package.json / bun.lock changes on the host.
bun install

if [ ! -d node_modules/@auth/drizzle-adapter ] || [ ! -d node_modules/next-auth ]; then
  echo "Auth dependencies missing from node_modules volume — reinstalling..."
  rm -rf node_modules
  bun install
fi

rm -rf .next
bun run db:migrate
exec bun run dev:docker
