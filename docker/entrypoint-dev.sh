#!/bin/sh
set -e

bun install
rm -rf .next
bun run db:migrate
exec bun run dev:docker
