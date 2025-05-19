import uuid, calendar
from django.db import models
from django.contrib.auth.models import User
from pyodm.types import TaskStatus
from django.conf import settings
from pathlib import Path
from Core.helpers.generators import generate_docker_container_style_name


class Workspace(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="workspaces")
    name = models.CharField(max_length=100, default=generate_docker_container_style_name)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    def get_dir(self) -> Path:
        return settings.WORKSPACES_DIR / str(self.uuid) 
    
    def get_images_paths(self, thumbnails=False) -> list[Path]:
        base_dir = self.get_dir()
        images_dir = base_dir / settings.THUMBNAIL_DIR_NAME if thumbnails else base_dir
        return [file for file in images_dir.iterdir() if file.is_file()]
    
    @property
    def created_at_epoch(self):
        return calendar.timegm(self.created_at.utctimetuple())

    @property
    def image_count(self):
        return len(self.get_images_paths())


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

class OptionsPreset(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="presets", null=True)
    name = models.CharField(max_length=100, default=generate_docker_container_style_name)
    options = models.JSONField()

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'name'], name='unique_user_preset_name')
        ]