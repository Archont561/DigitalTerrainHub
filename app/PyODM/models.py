import uuid
from django.db import models
from django.contrib.auth.models import User
from pyodm.types import TaskStatus
from pathlib import Path

WORKSPACES_DIR = Path(__file__).resolve().parent / "workspaces"
IMAGES_DIR_NAME = "images"

class Workspace(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="workspaces")
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    def get_dir(self) -> Path:
        return WORKSPACES_DIR / str(self.uuid) 
    
    def get_images_paths(self) -> list[str]:
        images_dir = self.get_dir() / IMAGES_DIR_NAME
        if not images_dir.exists(): return []
        return [str(file) for file in images_dir.iterdir() if file.is_file()]

    def save_images(self, file):
        images_dir = self.get_dir() / IMAGES_DIR_NAME
        file_path = images_dir / file.name
        with open(file_path, 'wb+') as f:
            for chunk in file.chunks():
                f.write(chunk)


class NodeODMTask(models.Model):
    uuid = models.UUIDField(editable=True, unique=True, primary_key=True)
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name="tasks")
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.SmallIntegerField(
        choices=[(status.value, status.name) for status in TaskStatus],
        default=TaskStatus.RUNNING.value,
    )
    name = models.CharField(max_length=100)

    def get_status(self) -> TaskStatus:
            return TaskStatus(self.status)
