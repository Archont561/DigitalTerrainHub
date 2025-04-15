from pathlib import Path
from pyodm import Node, exceptions
from pyodm.types import TaskInfo, TaskStatus

class PyODMHandler():

    def __init__(self, client_node: Node):
        self.client = client_node
        self.current_task = None

    def _run_task(task_options, restart = False):
        try:
            self.current_tast =(self.current_task.restart if restart else self.client.create_task)(**task_options)
            self.current_task.wait_for_completion()
        except exceptions.NodeConnectionError as e:
            print("Cannot connect: %s" % e)
        except exceptions.NodeResponseError as e:
            print("Error: %s" % e)
        except exceptions.TaskFailedError():
            print("\n".join(self.current_task.output()))

    def create_dem():
        ...
    
    def create_dsm():
        ...
    
    def create_point_cloud():
        ...

    def create_ortomosaic():
        ...