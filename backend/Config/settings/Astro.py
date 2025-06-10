from Config.env import env

ASTRO_HOST = env("ASTRO_HOST", default="host.docker.internal")
ASTRO_PORT = env.int("ASTRO_PORT", default=4321)
ASTRO_URL_BASE = env("ASTRO_URL_BASE", default="")
ASTRO_URL = f"http://{ASTRO_HOST}:{ASTRO_PORT}/{ASTRO_URL_BASE}"