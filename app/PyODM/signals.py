import shutil, magic
from django.db.models.signals import post_save, post_delete, post_migrate
from django.conf import settings
from django.dispatch import receiver
from django_tus.signals import tus_upload_finished_signal
from .models import Workspace, OptionsPreset
from .views import WorkspaceUploadImagesView
from pathlib import Path


@receiver(post_save, sender=Workspace)
def create_workspace_folder(sender, instance, created, **kwargs):
    if created:
        instance.get_dir().mkdir(parents=True, exist_ok=True)


@receiver(post_delete, sender=Workspace)
def delete_workspace_folder(sender, instance, **kwargs):
    workspace_path = instance.get_dir()
    if workspace_path.exists() and workspace_path.is_dir():
        shutil.rmtree(workspace_path)


@receiver(tus_upload_finished_signal, sender=WorkspaceUploadImagesView)
def handle_tus_upload_finished(sender, upload_file_path: Path, destination_folder: Path, **kwargs):
    if upload_file_path.exists() and destination_folder.exists():
        mime = magic.Magic(mime=True)
        file_mime_type = mime.from_file(str(upload_file_path))
        
        if file_mime_type not in settings.WORKSPACE_ALLOWED_FILE_MIME_TYPES:
            upload_file_path.unlink()
        else:
            upload_file_path.rename(destination_folder / upload_file_path.name)


@receiver(post_migrate)
def create_global_presets(sender, **kwargs):    
    for name, options in settings.GLOBAL_OPTION_PRESETS.items():
        OptionsPreset.objects.get_or_create( user=None, name=name, defaults={"options": options})

