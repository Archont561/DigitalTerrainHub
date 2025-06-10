FROM ghcr.io/osgeo/gdal:ubuntu-small-3.11.0

# Install curl, bash, file in one step and clean up apt cache
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl bash file && \
    rm -rf /var/lib/apt/lists/*

# Install uv tool (Astral's universal version manager)
RUN curl -Ls https://astral.sh/uv/install.sh | bash

ENV PATH="/root/.local/bin:${PATH}" \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Install Python 3.11 via uv, create venv, and copy app files in one go
WORKDIR /app

COPY . /app

RUN uv python install 3.11 && \
    uv venv && \
    # Handle python-magic-bin swap if present
    if grep -q "python-magic-bin" pyproject.toml; then \
      uv remove python-magic-bin && \
      uv add python-magic && \
      uv lock --check && \
      echo "python-magic-bin replaced with python-magic"; \
    else \
      echo "python-magic-bin not found, skipping replacement"; \
    fi && \
    uv sync --frozen --no-install-project --no-dev

# Patch django_tus signals.py to remove deprecated argument
RUN cat <<EOF > .venv/lib/python3.11/site-packages/django_tus/signals.py
import django.dispatch

# Patched to remove deprecated providing_args argument
tus_upload_finished_signal = django.dispatch.Signal()
EOF

EXPOSE 8000


CMD ["sh", "-c", "${DOCKER_CMD:-uv run python -m daphne -b 0.0.0.0 -p 8000 Config.asgi:application}"]