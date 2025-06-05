from django.apps import AppConfig
from Core.utils.generators import generate_templates_namespaces
from pathlib import Path

templates_dir = Path(__file__).parent / "templates"
templates_dir.mkdir(exist_ok=True)

class MapViewerConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'MapViewer'
    templates = generate_templates_namespaces(templates_dir)
