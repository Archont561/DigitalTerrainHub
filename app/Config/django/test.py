from .base import *
from Config.env import env

ALLOWED_HOSTS = ['*']
CSRF_TRUSTED_ORIGINS = env.list("DJANGO_CSRF_TRUSTED_ORIGINS", default=[])
