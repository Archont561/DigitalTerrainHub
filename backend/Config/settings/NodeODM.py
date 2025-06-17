from Config.env import env
from Config.django.base import WORKSPACES_DIR

NODEODM_URL = env("NODEODM_URL", default="http://localhost:3000")
NODEODM_TASKS_DIR = env.path("NODEODM_TASKS_DIR", default=WORKSPACES_DIR.parent / "tasks")