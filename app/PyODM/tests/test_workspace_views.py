import json, uuid, base64
from pathlib import Path
from bs4 import BeautifulSoup
from unittest.mock import patch, Mock, mock_open, MagicMock

from django.test import TestCase, Client
from django.db import IntegrityError
from django.contrib.auth.models import User
from django.http import HttpResponse, HttpResponseBadRequest, HttpResponseForbidden, HttpResponseNotFound
from django.urls import reverse
from django.apps import apps
from django.conf import settings

from pyodm import exceptions
from pyodm.types import TaskStatus

from PyODM.models import Workspace, OptionsPreset, NodeODMTask
from PyODM.views.workspaces import (
    WorkspaceCreateView,
    WorkspaceUploadImagesView,
    WorkspaceDetailView,
    WorkspaceUpdateView,
    WorkspaceDeleteView,
    WorkspaceServeImagesView,
    WorkspaceCreateTaskView,
)

app_config = apps.get_app_config("PyODM")

class WorkspaceViewsTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(username="testuser", password="testpass")
        self.client.login(username="testuser", password="testpass")
        self.workspace = Workspace.objects.create(user=self.user)
        self.workspace_uuid = str(self.workspace.uuid)

    def test_workspace_create_view(self):
        response = self.client.post(reverse("workspace:create"))  # Adjust URL name
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, app_config.templates.cotton.workspace.card)
        self.assertIn("workspace", response.context)
        self.assertEqual(Workspace.objects.filter(user=self.user).count(), 2)  # One from setUp, one created

    def test_workspace_create_view_unauthenticated(self):
        self.client.logout()
        response = self.client.post(reverse("workspace:create"))
        self.assertEqual(response.status_code, 302)  # Redirect to login

    def test_workspace_detail_view_get(self):
        response = self.client.get(reverse("workspace:detail", kwargs={"ws_uuid": self.workspace_uuid}))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, app_config.templates.cotton.workspace.card)
        self.assertEqual(response.context["workspace"], self.workspace)

    def test_workspace_detail_view_count_images(self):
        with patch.object(Workspace, "image_count", 5):
            response = self.client.get(
                reverse("workspace:detail", kwargs={"ws_uuid": self.workspace_uuid}),
                {"count": "images"}
            )
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.content.decode(), "5")

    def test_workspace_detail_view_invalid_count(self):
        response = self.client.get(
            reverse("workspace:detail", kwargs={"ws_uuid": self.workspace_uuid}),
            {"count": "invalid"}
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.content.decode(), "Wrong query!")

    def test_workspace_detail_view_thumbnails(self):
        file_names = ["thumb1.jpg", "thumb2.jpg"]
        with patch.object(Workspace, "get_images_paths", return_value=[Path(name) for name in file_names]):
            response = self.client.get(
                reverse("workspace:detail", kwargs={"ws_uuid": self.workspace_uuid}) \
                +"?thumbnails"
            )
            self.assertEqual(response.status_code, 200)
            self.assertIsNone(response.context)
            
            soup = BeautifulSoup(response.content, "html.parser")
            thumbnails = []
            for img in soup.find_all("img"):
                src = img.get("src", "")
                if "thumbnails" in src:
                    thumbnails.append(src[:-1].split("/")[-1])

            self.assertEqual(sorted(thumbnails), sorted(file_names))


    def test_workspace_detail_view_thumbnails_and_images(self):
        response = self.client.get(
            reverse("workspace:detail", kwargs={"ws_uuid": self.workspace_uuid}) +
            "?images&thumbnails"
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.content.decode(), "Please specify either 'thumbnails' or 'images', not both.")

    def test_workspace_detail_view_images_not_implemented(self):
        response = self.client.get(
            reverse("workspace:detail", kwargs={"ws_uuid": self.workspace_uuid}) + 
            "?images"
        )
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.content.decode(), "Not implemented")

    def test_workspace_detail_view_invalid_uuid(self):
        invalid_uuid = uuid.uuid4()
        response = self.client.get(reverse("workspace:detail", kwargs={"ws_uuid": invalid_uuid}))
        self.assertEqual(response.status_code, 404)

    def test_workspace_detail_view_wrong_user(self):
        other_user = User.objects.create_user(username="otheruser", password="otherpass")
        other_workspace = Workspace.objects.create(user=other_user)
        response = self.client.get(reverse("workspace:detail", kwargs={"ws_uuid": str(other_workspace.uuid)}))
        self.assertEqual(response.status_code, 403)

    def test_workspace_upload_images_view(self):
        resource_id = str(uuid.uuid4())
        file_data = b"test-content"
        file_size = len(file_data)
        encoded_filename = base64.b64encode(b"test.jpg").decode("ascii")

        # Step 1: Simulate POST request to initiate the upload
        post_headers = {
            "HTTP_X-WORKSPACE-UUID": str(self.workspace_uuid),
            "HTTP_TUS_RESUMABLE": "1.0.0",
            "HTTP_UPLOAD_LENGTH": str(file_size),
            "HTTP_UPLOAD_METADATA": f"filename {encoded_filename}",
        }

        with patch("django_tus.tusfile.TusFile.create_initial_file") as mock_create_file:
            tus_file = MagicMock()
            tus_file.resource_id = resource_id
            mock_create_file.return_value = tus_file

            post_response = self.client.post(reverse("workspace:upload"), **post_headers)
            self.assertEqual(post_response.status_code, 201)
            

    def test_workspace_upload_images_view_missing_header(self):
        response = self.client.post(reverse("workspace:upload"))
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.content.decode(), "Missing X-Workspace-UUID")

    def test_workspace_update_view_patch(self):
        data = {"name": "Updated Workspace"}
        with patch("PyODM.forms.WorkspaceForm", return_value=Mock(is_valid=lambda: True, save=lambda: None)):
            response = self.client.patch(
                reverse("workspace:update",  kwargs={"ws_uuid": self.workspace_uuid}),
                data=json.dumps(data),
                content_type="application/json",
            )
            soup = BeautifulSoup(response.content, "html.parser")
            self.assertEqual(response.status_code, 200)
            self.assertEqual(data["name"], soup.find("input").get("value"))

    def test_workspace_update_view_invalid_json(self):
        response = self.client.patch(
            reverse("workspace:update", kwargs={"ws_uuid": self.workspace_uuid}),
            data="invalid json",
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.content.decode(), "Invalid JSON.")

    def test_workspace_update_view_invalid_form(self):
        with patch("PyODM.forms.WorkspaceForm", return_value=Mock(is_valid=lambda: False)):
            response = self.client.patch(
                reverse("workspace:update", kwargs={"ws_uuid": self.workspace_uuid}),
                data=json.dumps({"name": "dummy"*21}),
                content_type="application/json"
            )
            self.assertEqual(response.status_code, 400)
            self.assertEqual(response.content.decode(), "Invalid form data.")

    def test_workspace_delete_view(self):
        response = self.client.post(reverse("workspace:delete", kwargs={"ws_uuid": self.workspace_uuid}))
        self.assertEqual(response.status_code, 200)
        self.assertFalse(Workspace.objects.filter(uuid=self.workspace_uuid).exists())

    def test_workspace_serve_images_view(self):
        file_path = Path(settings.IMAGES_DIR_NAME) / "test.jpg"
        m_open = mock_open(read_data=b"image data")
        with patch.object(Path, "exists", return_value=True), \
            patch.object(Path, "is_file", return_value=True), \
            patch("mimetypes.guess_type", return_value=("image/jpeg", None)), \
            patch.object(Path, "open", m_open):
            response = self.client.get(
                reverse("workspace:serve-image", kwargs={"ws_uuid": self.workspace_uuid, "filename": "test.jpg"})
            )
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response["Content-Type"], "image/jpeg")

    def test_workspace_serve_images_view_not_found(self):
        with patch.object(Path, "exists", return_value=False):
            response = self.client.get(
                reverse("workspace:serve-image", kwargs={"ws_uuid": self.workspace_uuid, "filename": "test.jpg"})
            )
            self.assertEqual(response.status_code, 404)

    def test_workspace_serve_images_view_thumbnail(self):
        file_path = Path(settings.THUMBNAIL_DIR_NAME) / "thumb.jpg"
        m_open = mock_open(read_data=b"image data")
        with patch.object(Path, "exists", return_value=True), \
             patch.object(Path, "is_file", return_value=True), \
             patch("mimetypes.guess_type", return_value=("image/jpeg", None)), \
             patch.object(Path, "open", m_open):
            response = self.client.get(
                reverse("workspace:serve-thumbnail", kwargs={
                    "ws_uuid": self.workspace_uuid, 
                    "filename": file_path.name
                })
            )
            
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response["Content-Type"], "image/jpeg")


class WorkspaceCreateTaskViewTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(username="testuser", password="testpass")
        self.client.login(username="testuser", password="testpass")
        self.workspace = Workspace.objects.create(user=self.user, name="Test Workspace")
        self.url = reverse("workspace:create-task", kwargs={"ws_uuid": self.workspace.uuid})
        self.preset = OptionsPreset.objects.create(name="fast", options={"resize": "true"})

    def test_create_task_with_valid_custom_options(self):
        payload = {
            "name": "Test Task",
            "options-preset": "custom",
            "options": {"resize": "true"}
        }

        mock_node = MagicMock()
        mock_task = MagicMock()
        mock_task.uuid = uuid.uuid4()
        mock_task.status.value = TaskStatus.QUEUED.value

        with patch("PyODM.views.workspaces.Node.from_url", return_value=mock_node), \
             patch.object(mock_node, "create_task", return_value=mock_task):

            response = self.client.post(
                self.url,
                data=json.dumps(payload),
                content_type="application/json"
            )

            self.assertEqual(response.status_code, 200)

    def test_create_task_with_invalid_json(self):
        response = self.client.post(self.url, data="not-a-json", content_type="application/json")
        self.assertEqual(response.status_code, 400)
        self.assertIn(b"Invalid JSON", response.content)

    def test_create_task_with_no_options(self):
        payload = {
            "name": "Task Without Options",
            "options-preset": "custom"
        }
        response = self.client.post(self.url, data=json.dumps(payload), content_type="application/json")
        self.assertEqual(response.status_code, 400)
        self.assertIn(b"No options given", response.content)

    def test_create_task_with_nonexistent_preset(self):
        payload = {
            "name": "Task With Bad Preset",
            "options-preset": "nonexistent"
        }
        response = self.client.post(self.url, data=json.dumps(payload), content_type="application/json")
        self.assertEqual(response.status_code, 400)
        self.assertIn(b"No such preset", response.content)

    def test_create_task_node_error(self):
        payload = {
            "name": "Test Task",
            "options-preset": self.preset.name
        }

        with patch("PyODM.views.workspaces.Node.from_url", side_effect=exceptions.OdmError("Node down")):
            response = self.client.post(self.url, data=json.dumps(payload), content_type="application/json")
            self.assertEqual(response.status_code, 400)

    def test_task_creation_integrity_error(self):
        payload = {
            "name": "Test Task",
            "options-preset": self.preset.name
        }
        created_task = NodeODMTask.objects.create(
            uuid=uuid.uuid4(), 
            workspace=self.workspace, 
            name=payload["name"]
        )
        mock_node = MagicMock()
        mock_task = MagicMock()
        mock_task.uuid = created_task.uuid
        mock_task.status.value = TaskStatus.QUEUED.value

        with patch("PyODM.views.workspaces.Node.from_url", return_value=mock_node), \
             patch.object(mock_node, "create_task", return_value=mock_task), \
             patch("PyODM.views.workspaces.NodeODMTask.objects.create", side_effect=IntegrityError()):

            response = self.client.post(self.url, data=json.dumps(payload), content_type="application/json")
            self.assertEqual(response.status_code, 400)

