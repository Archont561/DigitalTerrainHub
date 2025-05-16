from Config.env import env

NODEODM_URL = env("NODEODM_URL", default="http://localhost:3000")

GLOBAL_OPTION_PRESETS = {
    "dummy": {
        "option_dummy_1": "dummy_1"
    } 
}