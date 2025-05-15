import shutil, sys
from Config.env import BASE_DIR, env

sys.path.append(BASE_DIR / "Core")
from Core.helpers.generators import generate_templates_namespaces

env.read_env(BASE_DIR / ".env")

DATA_DIR = BASE_DIR / "data"
APP_NAME = "Digital Terrain Hub"
DEBUG = env.bool("DJANGO_DEBUG", default=True)
SECRET_KEY = env("DJANGO_SECRET_KEY", default="DUMMY_SECRET_KEY")

EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
EMAIL_USE_TLS = env.bool("EMAIL_USE_TLS", default=True)
EMAIL_USE_SSL = env.bool("EMAIL_USE_SSL", default=False)
EMAIL_PORT = env.int("EMAIL_PORT", default=587)
DEFAULT_FROM_EMAIL = env("DJANGO_APP_EMAIL", 
    default=f'{"".join([chunk.lower() for chunk in APP_NAME.split(" ")])}@localhost')

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.humanize',
    # django extensions
    'django_vite',    
    'django_htmx',
    'django_cotton.apps.SimpleAppConfig',
    "template_partials.apps.SimpleAppConfig",
    'widget_tweaks',
    'tailwind',
    'django_browser_reload',
    'heroicons',
    'django_tus',
    # created apps,
    "Core",
    "User",
    "Frontend",
    "Payment",
    "PyODM",
    "MapViewer",
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    ####
    'django_htmx.middleware.HtmxMiddleware',
    'django_browser_reload.middleware.BrowserReloadMiddleware',
    ####
    "Core.middleware.SpacelessMiddleware",
]

ROOT_URLCONF = 'Config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            BASE_DIR / "Frontend" / "templates"
        ],
        'APP_DIRS': False,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
            "loaders": [
                (
                    "template_partials.loader.Loader",
                    [
                        (
                            "django.template.loaders.cached.Loader",
                            [
                                "django_cotton.cotton_loader.Loader",
                                "django.template.loaders.filesystem.Loader",
                                "django.template.loaders.app_directories.Loader",
                            ],
                        )
                    ],
                )
            ],
            "builtins": [
                "django_cotton.templatetags.cotton",
                "template_partials.templatetags.partials",
            ],
        },
    },
]

WSGI_APPLICATION = 'Config.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


LANGUAGE_CODE = 'pl'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True

LOGIN_URL = "/user/credentials/login/"
LOGIN_REDIRECT_URL = "/user/profile/"

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

TAILWIND_APP_NAME = 'Frontend'
TAILWIND_CSS_PATH = 'dist/styles.css'
NPM_BIN_PATH = shutil.which("npm")
TEMPLATES_NAMESPACES = generate_templates_namespaces(BASE_DIR / "Frontend" / "templates")

DJANGO_VITE = {
    "default": {
        "dev_mode": DEBUG,
    }
}

TUS_UPLOAD_DIR = DATA_DIR / 'uploads'
TUS_DESTINATION_DIR  = TUS_UPLOAD_DIR
TUS_FILE_NAME_FORMAT = 'random-suffix'
TUS_EXISTING_FILE = 'overwrite'
WORKSPACES_DIR = DATA_DIR / "workspaces"
WORKSPACE_ALLOWED_FILE_MIME_TYPES = [
    "image/jpeg", "image/png", "image/bmp", 
    "image/webp", "image/tiff", "image/heif",
    "image/heic",
]
DATA_UPLOAD_MAX_MEMORY_SIZE = 50 * 1024**2
TUS_MAX_FILE_SIZE = DATA_UPLOAD_MAX_MEMORY_SIZE


from Config.settings.NodeODM import *