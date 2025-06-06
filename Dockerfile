# Base image: Python + uv + Debian for easier GDAL install
FROM python:3.11-slim

# Set workdir
WORKDIR /app

# Install system dependencies for GDAL, GEOS, etc.
RUN apt-get update && apt-get install -y \
    gdal-bin \
    libgdal-dev \
    libgeos-dev \
    python3-dev \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install uv
RUN curl -Ls https://astral.sh/uv/install.sh | bash && \
    echo "uv installed in /root/.local/bin" && \
    ls -l /root/.local/bin

ENV PATH="/root/.local/bin:/root/.cargo/bin:$PATH" \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

COPY pyproject.toml uv.lock ./

RUN if grep -q "python-magic-bin" pyproject.toml; then \
        uv remove python-magic-bin && \
        uv add python-magic && \
        apt-get update && apt-get install -y libmagic1 libmagic-dev; \
    fi

# Sync dependencies using uv
RUN uv sync --frozen --no-install-project --no-dev

# Copy backend project
COPY /backend /app/backend


RUN cat <<EOF > /app/.venv/lib/python3.11/site-packages/django_tus/signals.py
import django.dispatch

# Patched to remove deprecated providing_args argument
tus_upload_finished_signal = django.dispatch.Signal()
EOF

# Ensure GDAL bindings know where the lib is
ENV CPLUS_INCLUDE_PATH=/usr/include/gdal \
    C_INCLUDE_PATH=/usr/include/gdal \
    GDAL_VERSION=3.5.3 \
    GDAL_LIBRARY_PATH=/usr/lib/libgdal.so

EXPOSE 8000

CMD ["uv", "run", "python", "./backend/manage.py", "runserver", "0.0.0.0:8000"]
