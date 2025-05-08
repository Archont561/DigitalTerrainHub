#!/bin/bash

set -e
MANAGE_PY="./app/manage.py"

# Main command handler
case "$1" in
  dev)
    uv run $MANAGE_PY tailwind start & uv run $MANAGE_PY runserver
    ;;
  build)
    uv run $MANAGE_PY tailwind install --no-package-lock
    uv run $MANAGE_PY tailwind build
    ;;
  start)
    uv run $MANAGE_PY runserver
    ;;
  manage)
    shift
    uv run $MANAGE_PY "$@"
    ;;
  *)
    echo "❌ Unknown command: $1"
    exit 1
    ;;
esac
