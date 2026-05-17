#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ -z "${MONGO_URI:-}" ]]; then
  echo "Set MONGO_URI to your MongoDB Atlas connection string before running this script." >&2
  exit 1
fi

mongosh "$MONGO_URI" --file "$SCRIPT_DIR/init-mongo.js"
