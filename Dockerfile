FROM ghcr.io/astral-sh/uv:python3.11-alpine

WORKDIR /app

RUN ["apk", "add", "--no-cache", "nodejs", "npm"]

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy

RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv sync --frozen --no-install-project --no-dev

ADD . /app
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev

ENV PATH="/app/.venv/bin:$PATH"

RUN ["adduser", "--disabled-password", "--no-create-home", "app"]
RUN ["chown", "-R", "app:app", "/app"]

USER app

ENTRYPOINT []

CMD ["start.sh"]