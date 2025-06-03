import threading
import logging
from django_eventstream.channelmanager import DefaultChannelManager
from django_eventstream import send_event
from django.conf import settings
from django.contrib.auth import get_user_model
from pyodm import Node, exceptions
from pyodm.types import TaskStatus
from PyODM.models import NodeODMTask

User = get_user_model()
logger = logging.getLogger(__name__)


class PyODMChannelManager(DefaultChannelManager):
    def __init__(self):
        super().__init__()
        self.connections = {}
        self.lock = threading.Lock()

    def can_subscribe(self, request, channel):
        return request.user.is_authenticated

    def on_subscribe(self, request, channel):
        logger.info(request)
        user_id = request.user.id

        with self.lock:
            if user_id in self.connections.keys():
                logger.info(f"Polling thread already exists for user {user_id}")
                return True
        
        shutdown_event = threading.Event()

        thread = threading.Thread(
            target=self._start_polling,
            args=(user_id, shutdown_event),
            daemon=True
        )
        thread.start()

        with self.lock:
            self.connections[user_id] = (thread, shutdown_event)

        logger.info(f"Started polling thread for user {user_id}")
        return True

    def on_unsubscribe(self, request, channel):
        user_id = request.user.id

        with self.lock:
            thread, shutdown_event = self.connections.pop(user_id, (None, None))

        if shutdown_event:
            shutdown_event.set()

        if thread:
            thread.join(timeout=5)

        logger.info(f"Stopped polling thread for user {user_id}")

    def _start_polling(self, user_id, shutdown_event):
        try:
            node = Node.from_url(settings.NODEODM_URL)
        except exceptions.NodeConnectionError as e:
            logger.error(f"Failed to create Node for user {user_id}: {e}", exc_info=True)
            return

        while not shutdown_event.is_set():
            self._poll_once(node, user_id, shutdown_event)
            shutdown_event.wait(timeout=5)

    def _poll_once(self, node, user_id, shutdown_event):
        # Exit early if user no longer exists
        if not User.objects.filter(id=user_id).exists():
            shutdown_event.set()
            return

        tasks = NodeODMTask.objects.filter(
            workspace__user_id=user_id,
            status__in=[
                TaskStatus.QUEUED.value,
                TaskStatus.RUNNING.value,
            ]
        )

        for task in tasks:
            try:
                odm_task = node.get_task(task.uuid)
                task_info = odm_task.info()
            except exceptions.OdmError as e:
                logger.warning(f"Failed to get task info for {task.uuid}: {e}")
                continue

            new_status = task_info.status.value
            if task.status == new_status:
                continue

            task.status = new_status
            task.save()

            send_event(
                channel="pyodm",
                event_type=f"task-{task.uuid}-status",
                data=task.get_status_display()
            )

            logger.debug(f"Sent status update for task {task.uuid} to user {user_id}")
