import json, re
from itertools import chain
from django.conf import settings
from pyodm import Node, exceptions

with open("./odm_options_grouping.json") as opts_grouping_file, \
    open("./odm_outputs.json") as outputs_file, \
    open("./odm_options_presets.json") as presets_file:
    ODMTaskOutputs = json.load(outputs_file)
    ODMOptionsPresets = json.load(presets_filr)
    odm_opts_grouping = json.load(opts_grouping_file)

option_to_group = {opt: group for group, opts in odm_opts_grouping.items() for opt in opts}

ODMTaskOptions = []
try:
    node = Node.from_url(settings.NODEODM_URL)
    node_options = node.options()
except (exceptions.NodeConnectionError, exceptions.NodeResponseError):
    ...
else:
    for option in node_options:
        option_group = option_to_group.get(option.name, None)
        if option_group:
            ODMTaskOptions.append({
                "name": option.name,
                "value": option.value,
                "type": option.domain if option.domain == "json" else option.type,
                "domain": "bool" if option.domain == "" else option.domain,
                "help": re.sub(r'[^.]*%\([^)]+\)s[^.]*\.?', '', option.help),
                "group": option_group
            })

__all__ = [
    ODMTaskOptions,
    ODMTaskOutputs,
    ODMOptionsPresets,
]