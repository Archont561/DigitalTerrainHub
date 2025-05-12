import os, shutil
from dotenv import load_dotenv
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"

load_dotenv(dotenv_path=BASE_DIR / ".env")

APP_NAME = "Digital Terrain Hub"
DEBUG = bool(os.environ.get("DEBUG", False))
SECRET_KEY = os.environ.get("SECRET_KEY", "DEV_SECRET_KEY")
ALLOWED_HOSTS = [] + list(filter(None, os.environ.get("ALLOWED_HOSTS", "*").split(",")))
NODEODM_URL = os.environ.get("NODEODM_URL", "http://localhost:3000")

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
    'widget_tweaks',
    'tailwind',
    'django_browser_reload',
    'heroicons',
    'django_tus',
    # created apps,
    "Core",
    "Users",
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
]

ROOT_URLCONF = 'DTH.urls'

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
            "loaders": [(
                "django.template.loaders.cached.Loader",
                [
                    "django_cotton.cotton_loader.Loader",
                    "django.template.loaders.filesystem.Loader",
                    "django.template.loaders.app_directories.Loader",
                ],
            )],
            "builtins": [
                "django_cotton.templatetags.cotton"
            ],
        },
    },
]

WSGI_APPLICATION = 'DTH.wsgi.application'

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


LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True

LOGIN_URL = "/users/login/"
LOGIN_REDIRECT_URL = "/users/profile/"

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

TAILWIND_APP_NAME = 'Frontend'
TAILWIND_CSS_PATH = 'dist/styles.css'
NPM_BIN_PATH = shutil.which("npm")

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
DATA_UPLOAD_MAX_MEMORY_SIZE = 50 * 1024**2
TUS_MAX_FILE_SIZE = DATA_UPLOAD_MAX_MEMORY_SIZE