import threading
from django_eventstream.channelmanager import DefaultChannelManager
from django_eventstream import send_event
from django.conf import settings
from pyodm import Node, exceptions
from PyODM.models import NodeODMTask


class PyODMChannelManager(DefaultChannelManager):

    def __init__(self):
        super().__init__()
        self.threads = []

    def can_subscribe(self, request, channel):
        return request.user.is_authenticated

    def on_subscribe(self, request, channel):
        def poll_task_status():
            while True:
                node = Node.from_url(settings.NODEODM_URL)
                tasks = NodeODMTask.objects.filter(workspace__user=request.user)

                if not request.user.exists(): break

                for task in tasks:
                    try:
                        odm_task = node.get_task(task.uuid)
                        task_info = odm_task.info()
                    except exceptions.OdmError:
                        continue
                        current_status = task_info.status.name
                    
                    if task.status != current_status:
                        task.status = current_status
                        task.save()
            
            time.sleep(5)

        thread = threading.Thread(target=poll_task_status, daemon=True)
        thread.start()
        self.threads.append(thread)
        return True
    