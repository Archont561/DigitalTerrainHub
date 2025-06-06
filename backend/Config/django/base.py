import shutil, sys
from Config.env import BASE_DIR, env

env.read_env(BASE_DIR / ".env")

DATA_DIR = BASE_DIR / "data"
APP_NAME = "Digital Terrain Hub"
DEBUG = env.bool("DJANGO_DEBUG", default=True)
SECRET_KEY = env("DJANGO_SECRET_KEY", default="DUMMY_SECRET_KEY")

INSTALLED_APPS = [
    'daphne',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.humanize',
    'django.contrib.gis',
    # django extensions
    'django_htmx',
    'rest_framework',
    'django_eventstream',
    'heroicons',
    'django_tus',
    # created apps,
    "Core",
    "User",
    "Payment",
    "PyODM",
    "MapViewer",
]

ASGI_APPLICATION = "Config.asgi.application"

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
    ####
    "Core.middleware.SpacelessMiddleware",
]

ROOT_URLCONF = 'Core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        }
    },
]

WSGI_APPLICATION = 'Config.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'NAME': env('POSTGRES_DB'),
        'USER': env('POSTGRES_USER'),
        'PASSWORD': env('POSTGRES_PASSWORD'),
        'HOST': env('POSTGRES_HOST'),
        'PORT': env('POSTGRES_PORT'),
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

AUTH_USER_MODEL = 'User.CustomUser'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
TUS_UPLOAD_DIR = MEDIA_ROOT / 'uploads'
TUS_DESTINATION_DIR  = TUS_UPLOAD_DIR
TUS_FILE_NAME_FORMAT = 'random-suffix'
TUS_EXISTING_FILE = 'overwrite'
WORKSPACES_DIR = MEDIA_ROOT / "workspaces"
THUMBNAIL_DIR_NAME = "thumbnail"
IMAGES_DIR_NAME = "images"
OUTPUT_DIR_NAME = "outputs"
WORKSPACE_ALLOWED_FILE_MIME_TYPES = [
    "image/jpeg", "image/png", "image/bmp", 
    "image/webp", "image/tiff", "image/heif",
    "image/heic",
]
DATA_UPLOAD_MAX_MEMORY_SIZE = 50 * 1024**2
TUS_MAX_FILE_SIZE = DATA_UPLOAD_MAX_MEMORY_SIZE

EVENTSTREAM_CHANNELMANAGER_CLASS = 'Core.sse.DelegatingChannelManager'

from Config.settings.NodeODM import *
from Config.settings.Stripe import *
from Config.settings.Astro import *
from Config.settings.email import *