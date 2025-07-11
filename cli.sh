#!/bin/bash

set -e


load_env() {
  local env_file=${1:-.env}
  if [[ -f "$env_file" ]]; then
    echo "Loading environment variables from $env_file"
    set -a
    source "$env_file"
    set +a
  else
    echo "Warning: Env file '$env_file' not found, skipping."
  fi
}

MANAGE_PY="./backend/manage.py"
NPM_DIR="./frontend"
NGROK="./test/ngrok.exe"
NGROK_URL="sensible-firstly-labrador.ngrok-free.app"
PORT="8000"
ENV_FILE="./backend/.env"
STRIPE="./test/stripe.exe"

# Main command handler
case "$1" in
  dev)
    load_env $ENV_FILE
    uv run $MANAGE_PY runserver
    ;;
  manage)
    shift
    uv run $MANAGE_PY "$@"
    ;;
  npm)
    shift
    cwd=$(pwd)
    cd $NPM_DIR
    npm "$@"
    cd "$cwd"
    ;;
  ngrok)
    $NGROK http --url=sensible-firstly-labrador.ngrok-free.app $PORT
    ;;
  stripe)
    shift
    $STRIPE "$@"
    ;;
  *)
    echo "❌ Unknown command: $1"
    exit 1
    ;;
esac
