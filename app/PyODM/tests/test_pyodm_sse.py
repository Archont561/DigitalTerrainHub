import threading
import uuid
import time
from unittest.mock import patch, MagicMock

from django.test import TransactionTestCase, RequestFactory, override_settings
from django.urls import reverse
from django.contrib.auth import get_user_model

from PyODM.sse import PyODMChannelManager
from PyODM.models import Workspace, NodeODMTask
from pyodm.types import TaskStatus


@override_settings(NODEODM_URL="http://dummy-nodeodm")
class PyODMChannelManagerTests(TransactionTestCase):
    def setUp(self):
        self.manager = PyODMChannelManager()
        self.factory = RequestFactory()

        credentials = dict(username='testuser', password='testpass')
        self.user = get_user_model().objects.create_user(**credentials)
        self.client.login(**credentials)

        self.workspace = Workspace.objects.create(user=self.user, name="Test Workspace")

        self.task_uuid = uuid.uuid4()
        self.task = NodeODMTask.objects.create(
            uuid=self.task_uuid,
            workspace=self.workspace,
            name="Test Task",
            status=TaskStatus.QUEUED.value
        )

        self.channel = "pyodm"
        self.event_url = reverse("events", kwargs={"channel": self.channel})

    def test_start_monitoring_creates_thread(self):
        self.manager.start_monitoring_task_status(uuid=self.task_uuid, channel=self.channel)

        thread_info = self.manager.connections.get(self.task_uuid)
        self.assertIsNotNone(thread_info)
        thread, shutdown_event = thread_info
        self.assertIsInstance(thread, threading.Thread)
        self.assertTrue(thread.is_alive())

    def test_duplicate_monitoring_does_not_start_new_thread(self):
        self.manager.start_monitoring_task_status(uuid=self.task_uuid, channel=self.channel)
        first_thread = self.manager.connections[self.task_uuid][0]

        self.manager.start_monitoring_task_status(uuid=self.task_uuid, channel=self.channel)
        second_thread = self.manager.connections[self.task_uuid][0]

        self.assertEqual(first_thread, second_thread)

    @patch("PyODM.sse.send_event")
    @patch("pyodm.Node.from_url")
    def test_status_change_triggers_send_event(self, mock_node_from_url, mock_send_event):
        mock_node = MagicMock()
        mock_odm_task = MagicMock()

        # Simulate change from QUEUED -> COMPLETED
        info_mock = MagicMock()
        info_mock.status.value = TaskStatus.COMPLETED.value
        mock_odm_task.info.return_value = info_mock
        mock_node.get_task.return_value = mock_odm_task
        mock_node_from_url.return_value = mock_node

        # Set task as QUEUED in DB
        self.task.status = TaskStatus.QUEUED.value
        self.task.save()

        shutdown_event = threading.Event()
        self.manager._poll_once(mock_node, self.task_uuid, shutdown_event, self.channel)

        self.task.refresh_from_db()
        self.assertEqual(self.task.status, TaskStatus.COMPLETED.value)

        mock_send_event.assert_called_once()
        args, kwargs = mock_send_event.call_args
        self.assertEqual(kwargs["channel"], self.channel)
        self.assertEqual(kwargs["event_type"], f"task-{self.task.uuid}-status")

