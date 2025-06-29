from Config.django.base import MEDIA_ROOT

WORKSPACES_DIR = MEDIA_ROOT / "workspaces"
THUMBNAIL_DIR_NAME = "thumbnail"
IMAGES_DIR_NAME = "images"
OUTPUT_DIR_NAME = "outputs"
WORKSPACE_ALLOWED_FILE_MIME_TYPES = [
    "image/jpeg", "image/png", "image/bmp", 
    "image/webp", "image/tiff", "image/heif",
    "image/heic",
]