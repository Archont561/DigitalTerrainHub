FROM python:3.11-alpine

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

COPY . /app

WORKDIR /app

RUN ["python", "-m", "venv", "/py", "&&", \
    "/py/bin/pip", "install", "--upgrade", "pip", "&&", \
    "/py/bin/pip", "install", "-r", "/requirements.txt"]
RUN ["adduser", "--disabled-password", "--no-create-home", "app"]
RUN ["chown", "-R", "app:app", "/app"]

ENV PATH="/py/bin:$PATH"

USER app

EXPOSE ${PORT}

CMD ["python", "manage.py", "runserver"]