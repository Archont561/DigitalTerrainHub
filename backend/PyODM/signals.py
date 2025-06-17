import shutil, magic
from django.db.models.signals import post_save, post_delete, post_migrate, Signal
from django.conf import settings
from django.dispatch import receiver
from django_tus.signals import tus_upload_finished_signal
from .models import Workspace, OptionsPreset, NodeODMTask, GCPPoint
from pathlib import Path
from PIL import Image


@receiver(post_save, sender=Workspace)
def create_workspace_folder(sender, instance, created, **kwargs):
    if created:
        thumbnails_dir = instance.get_dir() / settings.THUMBNAIL_DIR_NAME
        images_dir = instance.get_dir() / settings.IMAGES_DIR_NAME
        outputs_dir = instance.get_dir() / settings.OUTPUT_DIR_NAME
        thumbnails_dir.mkdir(parents=True, exist_ok=True)
        images_dir.mkdir(parents=True, exist_ok=True)
        outputs_dir.mkdir(parents=True, exist_ok=True)


@receiver(post_delete, sender=Workspace)
def delete_workspace_folder(sender, instance, **kwargs):
    workspace_path = instance.get_dir()
    if workspace_path.exists() and workspace_path.is_dir():
        shutil.rmtree(workspace_path)


@receiver(tus_upload_finished_signal, sender=Workspace)
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


@receiver(post_save, sender=NodeODMTask)
def start_monitoring_task_status(sender, instance, created, **kwargs):
    if created:
        from .sse import PyODMChannelManager
        PyODMChannelManager.start_monitoring_task_status(
            channel="pyodm",
            uuid=instance.uuid,
        )

odm_task_download = Signal()

@receiver(odm_task_download, sender=NodeODMTask)
def download_task_on_complete(sender, task, **kwargs):
    task_output_dir = task.get_task_output_dir()
    task.download_on_complete(destination=task_output_dir)


@receiver(post_migrate)
def populate_database(sender, **kwargs):
    from PyODM.assets import ODMOptionsPresets

    for name, options in ODMOptionsPresets.items():
        OptionsPreset.objects.get_or_create(user=None, name=name, defaults={"options": options})

    if not settings.DEBUG: return

    import uuid, random
    from datetime import datetime
    from pyodm.types import TaskStatus
    from django.core.exceptions import ValidationError
    from django.contrib.auth import get_user_model
    from django.contrib.gis.geos import Point

    User = get_user_model()

    if not User.objects.exists():
        user = User.objects.create_user(
            username='testuser', 
            email='testuser@example.com', 
            password='password123'
        )
    else:
        user = User.objects.first()


    for _ in range(5):
        workspace = Workspace.objects.get_or_create(
            user=user,
        )

        # Step 4: Create NodeODM Tasks for each workspace
        task = NodeODMTask.objects.get_or_create(
            workspace=workspace,
            status=random.choice([
                TaskStatus.QUEUED, 
                TaskStatus.RUNNING, 
                TaskStatus.COMPLETED, 
                TaskStatus.CANCELED, 
                TaskStatus.FAILED,
            ]).value,
            uuid=uuid.uuid4(),
        )

        # Step 5: Create GCPPoints
        for i in range(5):
            gcp_point = GCPPoint.objects.get_or_create(
                workspace=workspace,
                label=f"GCP_Point_{i}",
                location=Point(
                    random.uniform(-180, 180),
                    random.uniform(-90, 90),
                    srid=4326
                ),
                altitude=random.uniform(0, 5000),
                image_name=f"image_{random.randint(1, 10)}.jpg",
                image_coords=Point(
                    random.uniform(0, 1000),
                    random.uniform(0, 1000),
                    srid=0
                ),
            )

            # Validate and save the GCPPoint
            try:
                gcp_point.clean()
            except ValidationError as e:
                print(f"Validation error while saving GCPPoint for workspace {workspace.name}: {e}")
            else:
                gcp_point.save()
                print(f"Created GCPPoint for workspace {workspace.name}")


        # Step 6: Add some more dummy tasks or other data as needed
        print(f"Created workspace '{workspace.name}' with tasks and GCP points.")
