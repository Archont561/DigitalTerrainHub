import uuid
from unittest.mock import patch

from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth import get_user_model

from pyodm import exceptions

from PyODM.models import NodeODMTask, Workspace


class TaskViewTests(TestCase):

    def setUp(self):
        self.client = Client()
        User = get_user_model()
        self.user = User.objects.create_user(username="testuser", password="testpass")
        self.other_user = User.objects.create_user(username="otheruser", password="otherpass")
        self.workspace = Workspace.objects.create(user=self.user)
        self.task = NodeODMTask.objects.create(uuid=uuid.uuid4(), workspace=self.workspace)
        self.task_url_kwargs = {"uuid": self.task.uuid}

    def login(self):
        self.client.login(username="testuser", password="testpass")

    def test_task_detail_view_requires_login(self):
        url = reverse("task:detail", kwargs=self.task_url_kwargs)
        response = self.client.get(url)
        self.assertEqual(response.status_code, 302)

    def test_task_detail_view_returns_403_for_wrong_user(self):
        self.client.login(username="otheruser", password="otherpass")
        url = reverse("task:detail", kwargs=self.task_url_kwargs)
        response = self.client.get(url)
        self.assertEqual(response.status_code, 403)

    def test_task_detail_view_success(self):
        self.login()
        url = reverse("task:detail", kwargs=self.task_url_kwargs)
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "task")  # Template should contain 'task' context

    def test_task_cancel_success(self):
        self.login()
        url = reverse("task:cancel", kwargs=self.task_url_kwargs)
        with patch.object(NodeODMTask, "cancel", return_value=None):
            response = self.client.post(url)
        self.assertEqual(response.status_code, 200)

    def test_task_cancel_error(self):
        self.login()
        url = reverse("task:cancel", kwargs=self.task_url_kwargs)
        with patch.object(NodeODMTask, "cancel", side_effect=exceptions.OdmError("Failed")):
            response = self.client.post(url)
        self.assertEqual(response.status_code, 500)

    def test_task_restart_success(self):
        self.login()
        url = reverse("task:restart", kwargs=self.task_url_kwargs)
        with patch.object(NodeODMTask, "restart", return_value=None):
            response = self.client.post(url)
        self.assertEqual(response.status_code, 200)

    def test_task_restart_error(self):
        self.login()
        url = reverse("task:restart", kwargs=self.task_url_kwargs)
        with patch.object(NodeODMTask, "restart", side_effect=exceptions.OdmError("Restart failed")):
            response = self.client.post(url)
        self.assertEqual(response.status_code, 500)

    def test_task_output_success(self):
        self.login()
        url = reverse("task:output", kwargs=self.task_url_kwargs)
        with patch.object(NodeODMTask, "output", return_value={"result": "ok"}):
            response = self.client.post(url)
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(response.content, {"result": "ok"})

    def test_task_output_error(self):
        self.login()
        url = reverse("task:output", kwargs=self.task_url_kwargs)
        with patch.object(NodeODMTask, "output", side_effect=exceptions.OdmError("Output failed")):
            response = self.client.post(url)
        self.assertEqual(response.status_code, 500)

    def test_task_delete_view(self):
        self.login()
        url = reverse("task:delete", kwargs=self.task_url_kwargs)
        with patch.object(NodeODMTask, "delete", return_value=None):
            response = self.client.post(url)
        self.assertEqual(response.status_code, 200)
