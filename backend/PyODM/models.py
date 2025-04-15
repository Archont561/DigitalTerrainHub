from django.db import models
from pyodm.types import TaskStatus

class Task(models.Model):
    status = models.PositiveSmallIntegerField(
        choices=[(status.name, status.value) for status in TaskStatus],
        default=TaskStatus.QUEUED.value
    )

    def __str__(self):
        return f"Task {self.id} - {self.status}"