import shutil
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Workspace
from pathlib import Path

WORKSPACES_DIR = Path(__file__).resolve().parent / "workspaces"

@receiver(post_save, sender=Workspace)
def create_workspace_folder(sender, instance, created, **kwargs):
    if created:
        workspace_path = WORKSPACES_DIR / str(instance.uuid)
        workspace_path.mkdir(parents=True, exist_ok=True)


@receiver(post_delete, sender=Workspace)
def delete_workspace_folder(sender, instance, **kwargs):
    workspace_path = WORKSPACES_DIR / str(instance.uuid)
    if workspace_path.exists() and workspace_path.is_dir():
        shutil.rmtree(workspace_path)

