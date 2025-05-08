#!/bin/bash

set -e

# Main command handler
case "$1" in
  dev)
    uv run manage.py tailwind start & uv run manage.py runserver
    ;;
  build)
    uv run manage.py tailwind install --no-package-lock
    uv run manage.py tailwind build
    ;;
  start)
    uv run manage.py runserver
    ;;
  manage)
    shift
    uv run manage.py "$@"
    ;;
  *)
    echo "❌ Unknown command: $1"
    exit 1
    ;;
esac
