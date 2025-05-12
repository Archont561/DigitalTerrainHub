import shutil
from django.db.models.signals import post_save, post_delete
from django.conf import settings
from django.dispatch import receiver
from django_tus.signals import tus_upload_finished_signal
from .models import Workspace
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
        upload_file_path.rename(destination_folder / upload_file_path.name)

