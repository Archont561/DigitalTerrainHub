from django.contrib import admin
from .models import Workspace, OptionsPreset, NodeODMTask

for model in [
    Workspace,
    OptionsPreset,
    NodeODMTask,
]: admin.site.register(model)
