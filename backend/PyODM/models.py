import uuid, calendar
from pathlib import Path

from django.contrib.gis.db import models
from django.core.exceptions import ValidationError
from django.conf import settings
from django.contrib.auth import get_user_model

from pyodm import Node, exceptions
from pyodm.types import TaskStatus

from Core.utils.generators import generate_docker_container_style_name

User = get_user_model()


class OptionsPreset(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="presets", null=True)
    name = models.CharField(max_length=100, default=generate_docker_container_style_name)
    options = models.JSONField()

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'name'], name='unique_user_preset_name')
        ]


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


class NodeODMTaskManager(models.Manager):
    def create_task(self, workspace, name, options, webhook):
        node = Node.from_url(settings.NODEODM_URL)
        odm_task = node.create_task(
            files=[str(file_path) for file_path in workspace.get_images_paths()],
            name=name,
            options=options,
            webhook=webhook,
        )
        task_info = odm_task.info()
        return self.create(
            uuid=task_info.uuid,
            workspace=workspace,
            name=name,
            status=task_info.status
        )


class NodeODMTask(models.Model):
    uuid = models.UUIDField(editable=True, unique=True, primary_key=True)
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name="tasks")
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.SmallIntegerField(
        choices=[(status.value, status.name) for status in TaskStatus],
        default=TaskStatus.QUEUED.value,
    )
    name = models.CharField(max_length=100)

    objects = NodeODMTaskManager()

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

    def get_task_output_dir(self):
        task_output_dir = self.workspace.get_dir() / settings.OUTPUT_DIR_NAME / str(self.uuid)
        task_output_dir.mkdir(parents=True, exist_ok=True)
        return task_output_dir

    def download_on_complete(self, *args, **kwargs):
        return self.get_odm_task().download_assets(*args, **kwargs)


class GCPPointManager(models.Manager):
    def to_txt(self, filepath, queryset=None):
        if queryset is None: queryset = self.all()

        with open(filepath, 'w') as f:
            for i, point in enumerate(queryset):
                if i == 0: f.write(f"EPSG:{p.location.srid}")
                f.write(" ".join(
                    point.location.y,
                    point.location.x,
                    point.altitude,
                    int(point.image_coords.x),
                    int(point.image_coords.y),
                    point.image_name,
                    point.label if point.label else '',
                ) + "\n")


class GCPPoint(models.Model):
    workspace = models.ForeignKey(
        'Workspace', 
        on_delete=models.CASCADE, 
        related_name='gcp_points',
        help_text="Workspace to which this GCP point belongs"
    )
    label = models.CharField(max_length=100)
    location = models.PointField(geography=True, srid=4326)
    altitude = models.FloatField(help_text="Altitude in meters")
    image_name = models.CharField(max_length=255, help_text="Image file name or identifier")
    image_coords = models.PointField(srid=0, dim=2, geography=False, help_text="Image pixel coordinates (x, y) in Cartesian space")

    objects = GCPPointManager()

    def __str__(self):
        return (
            f"GCPPoint(lat={self.location.y}, lng={self.location.x}, alt={self.altitude}, "
            f"image={self.image_name}, pixel=({self.image_coords.x}, {self.image_coords.y}))"
        )

    def clean(self):
        super().clean()
        if self.workspace:
            valid_images = [p.name for p in self.workspace.get_images_paths()]
            if self.image_name not in valid_images:
                raise ValidationError({
                    'image_name': f"Image '{self.image_name}' does not exist in the workspace."
                })


class NodeODMTaskOption(models.Model):
    name = models.CharField(max_length=30, unique=True)
    opt_type = models.CharField(max_length=10)
    description = models.TextField(blank=True)
    group = models.CharField(max_length=100)
    default_value = models.CharField(max_length=10)
    domain = models.JSONField()

    def __str__(self):
        return self.name

    def is_valid_value(self, value):
        match self.domain:
            case "bool":
                return value in [True, False]
            case "integer":
                return isinstance(value, int)
            case "positive integer":
                return isinstance(value, int) and value > 0
            case "integer: 1 <= x <= 14":
                return isinstance(value, int) and 1 <= value <= 14
            case "json":
                return isinstance(value, dict) or isinstance(value, list)
            case "enum":
                return isinstance(value, list)
            case "float":
                return isinstance(value, float)
            case domain if domain in ["float > 0.0", "positive float"]:
                return isinstance(value, float) and value > 0.0
            case "string":
                return isinstance(value, str)


class NodeODMTaskOutput(models.Model):
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True, null=True)
    group = models.CharField(max_length=100, blank=True, null=True)
    path = models.CharField(max_length=255)

    def __str__(self):
        return self.name