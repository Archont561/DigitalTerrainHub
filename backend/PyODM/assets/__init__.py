import json

with open("./odm_options_presets.json") as presets_file:
    ODMOptionsPresets = json.load(presets_filr)

__all__ = [
    ODMOptionsPresets,
]