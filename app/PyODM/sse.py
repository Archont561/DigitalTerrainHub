import threading
import logging
from django_eventstream import send_event
from django.conf import settings
from pyodm import Node, exceptions
from pyodm.types import TaskStatus
from PyODM.models import NodeODMTask

logger = logging.getLogger(__name__)


class PyODMChannelManager:
    connections = {}
    lock = threading.Lock()
    
    def can_read_channel(self, uuid, channel):
        return uuid.is_authenticated

    @classmethod
    def start_monitoring_task_status(cls, uuid, channel):
        logger.info(f"Start monitoring of status of task {uuid}")

        with cls.lock:
            if uuid in cls.connections.keys():
                logger.info(f"Polling thread already exists for task uuid {uuid}")
                return cls
        
        shutdown_event = threading.Event()

        thread = threading.Thread(
            target=cls._start_polling,
            args=(uuid, shutdown_event, channel),
            daemon=True
        )
        thread.start()

        with cls.lock:
            cls.connections[uuid] = (thread, shutdown_event)

        logger.info(f"Started polling thread for task uuid {uuid}")
        return cls


    @classmethod
    def _start_polling(cls, uuid, shutdown_event, channel):
        try:
            node = Node.from_url(settings.NODEODM_URL)
        except exceptions.NodeConnectionError as e:
            logger.error(f"Failed to create Node for task uuid {uuid}: {e}", exc_info=True)
            return

        while not shutdown_event.is_set():
            shutdown_event.wait(timeout=5)
            cls._poll_once(node, uuid, shutdown_event, channel)

    @classmethod
    def _poll_once(cls, node, uuid, shutdown_event, channel):
        task_queryset = NodeODMTask.objects.filter(
            uuid=uuid, 
            status__in=[
                TaskStatus.QUEUED.value,
                TaskStatus.RUNNING.value,
        ])

        if not task_queryset.exists():
            with cls.lock:
                shutdown_event.set()
                cls.connections.pop(uuid, (None, None))

            logger.info(f"Stopped polling thread for task uuid {uuid}")
            return

        task = task_queryset.first()

        try:
            odm_task = node.get_task(task.uuid)
            task_info = odm_task.info()
        except exceptions.OdmError as e:
            logger.warning(f"Failed to get task info for task {task.uuid}: {e}")
            return

        new_status = task_info.status.value
        if task.status == new_status:
            return

        task.status = new_status
        task.save()

        send_event(
            channel=channel,
            event_type=f"task-{uuid}-status",
            data="",
        )

        logger.debug(f"Sent status update for task {uuid}")
