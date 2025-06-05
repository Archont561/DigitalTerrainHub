from Config.env import env

NODEODM_URL = env("NODEODM_URL", default="http://localhost:3000")

GLOBAL_OPTION_PRESETS = {
    "Multispectral": {
        "auto-boundary": True,
        "radiometric-calibration": "camera"
    },
    "Volume Analysis": {
        "auto-boundary": True,
        "dsm": True,
        "dem-resolution": "2",
        "pc-quality": "high"
    },
    "3D Model": {
        "auto-boundary": True,
        "mesh-octree-depth": "12",
        "use-3dmesh": True,
        "pc-quality": "high",
        "mesh-size": "300000"
    },
    "Buildings": {
        "auto-boundary": True,
        "mesh-size": "300000",
        "feature-quality": "high",
        "pc-quality": "high"
    },
    "Forest": {
        "auto-boundary": True,
        "min-num-features": "18000",
        "use-3dmesh": True,
        "feature-quality": "medium"
    },
    "DSM + DTM": {
        "auto-boundary": True,
        "dsm": True,
        "dtm": True
    },
    "Field": {
        "sfm-algorithm": "planar",
        "fast-orthophoto": True,
        "matcher-neighbors": 4
    },
    "Fast Orthophoto": {
        "auto-boundary": True,
        "fast-orthophoto": True
    },
    "High Resolution": {
        "auto-boundary": True,
        "dsm": True,
        "pc-quality": "high",
        "dem-resolution": "2.0",
        "orthophoto-resolution": "2.0"
    },
    'Point of Interest': {
        'mesh-size' :'300000',
        'use-3dmesh': True
    },
    "Default": {
        "auto-boundary": True,
        "dsm": True
    }
}
