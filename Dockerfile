FROM python:3.11-alpine

RUN ["apk", "add", "--no-cache", "bash", "nodejs", "npm"]

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=8000
ENV PATH="/py/bin:$PATH"

COPY . /app

WORKDIR /app

RUN ["python", "-m", "venv", "/py", "&&", \
    "/py/bin/pip", "install", "--upgrade", "pip", "&&", \
    "/py/bin/pip", "install", "-r", "/requirements.txt"]
RUN ["build.sh"]
RUN ["adduser", "--disabled-password", "--no-create-home", "app"]
RUN ["chown", "-R", "app:app", "/app"]

USER app

EXPOSE ${PORT}

CMD ["start.sh"]