import shutil, magic
from django.db.models.signals import post_save, post_delete, post_migrate
from django.conf import settings
from django.dispatch import receiver
from django_tus.signals import tus_upload_finished_signal
from .models import Workspace, OptionsPreset, NodeODMTask
from PyODM.views.workspaces import WorkspaceUploadImagesView
from pathlib import Path
from PIL import Image


@receiver(post_save, sender=Workspace)
def create_workspace_folder(sender, instance, created, **kwargs):
    if created:
        thumbnails_dir = instance.get_dir() / settings.THUMBNAIL_DIR_NAME
        images_dir = instance.get_dir() / settings.IMAGES_DIR_NAME
        thumbnails_dir.mkdir(parents=True, exist_ok=True)
        images_dir.mkdir(parents=True, exist_ok=True)


@receiver(post_delete, sender=Workspace)
def delete_workspace_folder(sender, instance, **kwargs):
    workspace_path = instance.get_dir()
    if workspace_path.exists() and workspace_path.is_dir():
        shutil.rmtree(workspace_path)


@receiver(tus_upload_finished_signal, sender=WorkspaceUploadImagesView)
def handle_tus_upload_finished(sender, upload_file_path: Path, workspace: Workspace, **kwargs):
    if not upload_file_path.exists(): return
    mime = magic.Magic(mime=True)
    file_mime_type = mime.from_file(str(upload_file_path))
    filename = upload_file_path.name
    workspace_dir = workspace.get_dir()

    if file_mime_type not in settings.WORKSPACE_ALLOWED_FILE_MIME_TYPES:
        upload_file_path.unlink()
        return
    else:
        final_path = workspace_dir / settings.IMAGES_DIR_NAME / filename
        upload_file_path.rename(final_path)

    if file_mime_type.startswith("image"):
        thumbnails_dir = workspace_dir / settings.THUMBNAIL_DIR_NAME
        with Image.open(final_path) as img:
            img.thumbnail((256, 256))
            img.save(thumbnails_dir / filename)


@receiver(post_migrate)
def create_global_presets(sender, **kwargs):    
    for name, options in settings.GLOBAL_OPTION_PRESETS.items():
        OptionsPreset.objects.get_or_create(user=None, name=name, defaults={"options": options})


@receiver(post_save, sender=NodeODMTask)
def start_monitoring_task_status(sender, instance, created, **kwargs):
    if created:
        from .sse import PyODMChannelManager
        PyODMChannelManager.start_monitoring_task_status(
            channel="pyodm",
            uuid=instance.uuid,
        )

