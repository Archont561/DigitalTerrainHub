import uuid, calendar
from pathlib import Path

from django.db import models
from django.conf import settings
from django.contrib.auth import get_user_model

from pyodm import Node, exceptions
from pyodm.types import TaskStatus

from Core.utils.generators import generate_docker_container_style_name

User = get_user_model()


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
        if thumbnails: target_dir = base_dir / settings.THUMBNAIL_DIR_NAME
        else: target_dir = base_dir / settings.IMAGES_DIR_NAME
        return [file for file in target_dir.iterdir() if file.is_file()]
    
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
        default=TaskStatus.QUEUED.value,
    )
    name = models.CharField(max_length=100)

    def get_odm_task(self):
        node = Node.from_url(settings.NODEODM_URL)
        return node.get_task(self.uuid) 

    def cancel(self):
        return self.get_odm_task().cancel()

    def restart(self, options: dict):
        return self.get_odm_task().restart(options)

    def output(self, line: int):
        return self.get_odm_task().output(line)

    def delete(self, *args, **kwargs):
        self.get_odm_task().delete()
        return super().delete(*args, **kwargs)


class OptionsPreset(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="presets", null=True)
    name = models.CharField(max_length=100, default=generate_docker_container_style_name)
    options = models.JSONField()

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'name'], name='unique_user_preset_name')
        ]