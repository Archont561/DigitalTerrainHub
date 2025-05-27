import threading
import uuid
from django.test import TransactionTestCase, RequestFactory
from unittest.mock import patch, MagicMock

from django.urls import reverse
from django.contrib.auth import get_user_model

from PyODM.eventstream import PyODMChannelManager
from PyODM.models import Workspace, NodeODMTask
from pyodm.types import TaskStatus

class PyODMChannelManagerTests(TransactionTestCase):
    def setUp(self):
        self.manager = PyODMChannelManager()
        self.factory = RequestFactory()

        credentials = dict(
            username='testuser', 
            password='testpass',
        )
        self.user = get_user_model().objects.create_user(**credentials)
        self.client.login(**credentials)

        # Create workspace for user
        self.workspace = Workspace.objects.create(user=self.user, name="Test Workspace")

        # Create task for workspace
        self.task = NodeODMTask.objects.create(
            uuid=uuid.uuid4(),
            workspace=self.workspace,
            name="Test Task",
        )

        self.channel = "pyodm"
        self.event_url = reverse("events", kwargs={ "channel": self.channel })

        # Create authenticated request using client session
        session = self.client.session
        session['_auth_user_id'] = self.user.pk
        session.save()
        
        self.addCleanup(self.cleanup_threads)    

    def test_on_subscribe_starts_thread_and_returns_true(self):
        request = self.factory.get(self.event_url)
        request.user = self.user

        result = self.manager.on_subscribe(request, self.channel)
        self.assertTrue(result)

        thread, shutdown_event = self.manager.connections.get(self.user.id)
        self.assertIsInstance(thread, threading.Thread)
        self.assertTrue(thread.is_alive(), "Pooling thread should start!")

    def test_on_unsubscribe_stops_thread(self):
        request = self.factory.get(self.event_url)
        request.user = self.user

        self.manager.on_subscribe(request, self.channel)
        thread, shutdown_event = self.manager.connections.get(self.user.id)

        self.assertTrue(thread.is_alive())
        self.assertFalse(shutdown_event.is_set())

        self.manager.on_unsubscribe(request, self.channel)

        self.assertNotIn(self.user.id, self.manager.connections)
        self.assertTrue(shutdown_event.is_set())

        thread.join(timeout=1)
        self.assertFalse(thread.is_alive())

    @patch('PyODM.eventstream.send_event')
    @patch('pyodm.Node')
    def test_send_event_triggered_on_status_change(self, mock_node, mock_send_event):
        request = self.factory.get(self.event_url)
        request.user = self.user

        mock_node.from_url.return_value = MagicMock()

        mock_odm_task = MagicMock()
        mock_odm_task.info.return_value.status.value = TaskStatus.COMPLETED.value
        mock_node.get_task.return_value = mock_odm_task

        shutdown_event = threading.Event()
        self.manager._poll_once(mock_node, self.user.id, shutdown_event)

        self.task.refresh_from_db()
        self.assertEqual(self.task.status, TaskStatus.COMPLETED.value)

        mock_send_event.assert_called_once()
        args, kwargs = mock_send_event.call_args
        self.assertEqual(kwargs["event_type"], f"task-{self.task.uuid}-status")
        self.assertEqual(kwargs["data"], TaskStatus.COMPLETED.name)
    
    def cleanup_threads(self):
        for _, (thread, shutdown_event) in self.manager.connections.items():
            shutdown_event.set()
            thread.join(timeout=2)
        self.manager.connections.clear()