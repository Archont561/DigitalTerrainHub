# === Builder Stage ===
FROM python:3.11-slim AS builder

# Install curl, bash, file, ca-certificates for uv setup
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl bash file ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Install uv (Python version and dependency manager)
RUN curl -Ls https://astral.sh/uv/install.sh | bash

ENV PATH="/root/.local/bin:${PATH}" \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY pyproject.toml uv.lock ./

# Install Python 3.11 with uv and set up venv
RUN uv python install 3.11 && \
    uv venv && \
    # Replace python-magic-bin with python-magic if necessary
    if grep -q "python-magic-bin" pyproject.toml; then \
      uv remove python-magic-bin && \
      uv add python-magic && \
      uv lock --check && \
      echo "Replaced python-magic-bin with python-magic"; \
    else \
      echo "No python-magic-bin found, skipping replacement"; \
    fi && \
    uv sync --frozen --no-install-project --no-dev

# Patch deprecated argument in django_tus signals
RUN echo "import django.dispatch\n\ntus_upload_finished_signal = django.dispatch.Signal()" \
    > .venv/lib/python3.11/site-packages/django_tus/signals.py

COPY . .

# === Production Stage ===
FROM ghcr.io/osgeo/gdal:ubuntu-small-3.11.0 AS runtime

WORKDIR /app

COPY --from=builder /app /app

ENV PATH="/app/.venv/bin:${PATH}" \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

EXPOSE 8000

CMD ["sh", "-c", "${DOCKER_CMD:-python -m daphne -b 0.0.0.0 -p 8000 Config.asgi:application}"]
