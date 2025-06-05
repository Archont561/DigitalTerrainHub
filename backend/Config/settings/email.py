from Config.env import env
from Config.django.base import APP_NAME

EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
EMAIL_USE_TLS = env.bool("EMAIL_USE_TLS", default=True)
EMAIL_USE_SSL = env.bool("EMAIL_USE_SSL", default=False)
EMAIL_PORT = env.int("EMAIL_PORT", default=587)
DEFAULT_FROM_EMAIL = env("DJANGO_APP_EMAIL", 
    default=f'{"".join([chunk.lower() for chunk in APP_NAME.split(" ")])}@localhost')