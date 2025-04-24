import os
from dotenv import load_dotenv
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR.parent / "frontend"

load_dotenv(dotenv_path=BASE_DIR / ".env")

DEBUG = bool(int(os.environ.get("DEBUG", 0)))
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
    'django_vite',
    ######,
    "Users",
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
]

ROOT_URLCONF = 'DTH.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            FRONTEND_DIR / "templates"
        ],
        'APP_DIRS': False,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
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
LOGIN_REDIRECT_URL = "/"

STATIC_URL = str(FRONTEND_DIR / 'static') + "/"
STATICFILES_DIRS = [
    FRONTEND_DIR / "dist"
]
STATIC_ROOT = str(FRONTEND_DIR / "staticfiles") + "/"

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

DJANGO_VITE = {
    "default": {
        "dev_mode": DEBUG
    }
}