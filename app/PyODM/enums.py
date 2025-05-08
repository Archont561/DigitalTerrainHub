from django.conf import settings
from pyodm import Node, exceptions
from enum import Enum
from re import sub
from typing import defaultdict

class DatasetStageOptions(Enum):
    BG_REMOVAL = "bg-removal"
    CAMERA_LENS = "camera-lens"
    CAMERAS = "cameras"
    GCP = "gcp"
    GEO = "geo"
    GPS_ACCURACY = "gps-accuracy"
    PRIMARY_BAND = "primary-band"
    SKY_REMOVAL = "sky-removal"
    USE_EXIF = "use-exif"
    VIDEO_LIMIT = "video-limit"
    VIDEO_RESOLUTION = "video-resolution"

class SplitOptions(Enum):
    SM_CLUSTER = "sm-cluster"
    SM_NO_ALIGN = "sm-no-align"
    SPLIT = "split"
    SPLIT_IMAGE_GROUPS = "split-image-groups"
    SPLIT_OVERLAP = "split-overlap"

class OpenSFMOptions(Enum):
    FEATURE_QUALITY = "feature-quality"
    FEATURE_TYPE = "feature-type"
    FORCE_GPS = "force-gps"
    IGNORE_GSD = "ignore-gsd"
    MATCHER_NEIGHBORS = "matcher-neighbors"
    MATCHER_ORDER = "matcher-order"
    MATCHER_TYPE = "matcher-type"
    MIN_NUM_FEATURES = "min-num-features"
    PC_QUALITY = "pc-quality"
    RADIOMETRIC_CALIBRATION = "radiometric-calibration"
    ROLLING_SHUTTER = "rolling-shutter"
    ROLLING_SHUTTER_READOUT = "rolling-shutter-readout"
    SFM_ALGORITHM = "sfm-algorithm"
    SFM_NO_PARTIAL = "sfm-no-partial"
    SKIP_BAND_ALIGNMENT = "skip-band-alignment"
    USE_FIXED_CAMERA_PARAMS = "use-fixed-camera-params"
    USE_HYBRID_BUNDLE_ADJUSTMENT = "use-hybrid-bundle-adjustment"

class OpenMVSOptions(Enum):
    PC_FILTER = "pc-filter"
    PC_SKIP_GEOMETRIC = "pc-skip-geometric"

class FilterPointsOptions(Enum):
    AUTO_BOUNDARY = "auto-boundary"
    AUTO_BOUNDARY_DISTANCE = "auto-boundary-distance"
    BOUNDARY = "boundary"
    FAST_ORTHOPHOTO = "fast-orthophoto"
    PC_SAMPLE = "pc-sample"

class MeshingOptions(Enum):
    MESH_OCTREE_DEPTH = "mesh-octree-depth"
    MESH_SIZE = "mesh-size"
    SKIP_3DMODEL = "skip-3dmodel"

class MVSTexturingOptions(Enum):
    GLTF = "gltf"
    TEXTURING_KEEP_UNSEEN_FACES = "texturing-keep-unseen-faces"
    TEXTURING_SINGLE_MATERIAL = "texturing-single-material"
    TEXTURING_SKIP_GLOBAL_SEAM_LEVELING = "texturing-skip-global-seam-leveling"
    USE_3DMESH = "use-3dmesh"

class GeoreferencingOptions(Enum):
    ALIGN = "align"
    CROP = "crop"
    PC_CLASSIFY = "pc-classify"
    PC_COPC = "pc-copc"
    PC_CSV = "pc-csv"
    PC_EPT = "pc-ept"
    PC_LAS = "pc-las"
    PC_RECTIFY = "pc-rectify"

class DEMOptions(Enum):
    COG = "cog"
    DEM_DECIMATION = "dem-decimation"
    DEM_EUCLIDEAN_MAP = "dem-euclidean-map"
    DEM_GAPFILL_STEPS = "dem-gapfill-steps"
    DEM_RESOLUTION = "dem-resolution"
    DSM = "dsm"
    DTM = "dtm"
    SMRF_SCALAR = "smrf-scalar"
    SMRF_SLOPE = "smrf-slope"
    SMRF_THRESHOLD = "smrf-threshold"
    SMRF_WINDOW = "smrf-window"
    TILES = "tiles"

class OrthophotoOptions(Enum):
    BUILD_OVERVIEWS = "build-overviews"
    ORTHOPHOTO_COMPRESSION = "orthophoto-compression"
    ORTHOPHOTO_CUTLINE = "orthophoto-cutline"
    ORTHOPHOTO_KMZ = "orthophoto-kmz"
    ORTHOPHOTO_NO_TILED = "orthophoto-no-tiled"
    ORTHOPHOTO_PNG = "orthophoto-png"
    ORTHOPHOTO_RESOLUTION = "orthophoto-resolution"
    SKIP_ORTHOPHOTO = "skip-orthophoto"

class ReportOptions(Enum):
    SKIP_REPORT = "skip-report"

class PostprocessOptions(Enum):
    THREE_D_TILES = "3d-tiles"
    COPY_TO = "copy-to"

class NodeODMOptions:
    DATASET_STAGE = DatasetStageOptions
    SPLIT = SplitOptions
    OPEN_SFM = OpenSFMOptions
    OPEN_MVS = OpenMVSOptions
    FILTERPOINTS = FilterPointsOptions
    MESHING = MeshingOptions
    MVS_TEXTURING = MVSTexturingOptions
    GEOREFERENCING = GeoreferencingOptions
    DEM = DEMOptions
    ORTHOPHOTO = OrthophotoOptions
    REPORT = ReportOptions
    POSTPROCESS = PostprocessOptions

    @classmethod
    def find_group_by_option(cls, option_name: str):
        class_vars = {key: value for key, value in vars(NodeODMOptions).items() if not key.startswith('__') and callable(value)}
        for group, enum in class_vars.items():
            for const in enum:
                if const.value == option_name:
                    return group
        return None

    @classmethod
    def to_dict(cls, group=False):
        try:
            node = Node.from_url(settings.NODEODM_URL)
            node_options = node.options()
        except (exceptions.NodeConnectionError, exceptions.NodeResponseError):
            return {}
        else:
            if group:
                grouped_options = defaultdict(list)
                for option in node_options:
                    group = NodeODMOptions.find_group_by_option(option.name)
                    grouped_options[group].append({
                        "name": option.name,
                        "value": option.value,
                        "type": option.type,
                        "domain": "non-negative" if option.type in ["float", "int"] else option.domain,
                        "help": sub(r'[^.]*%\([^)]+\)s[^.]*\.?', '', option.help),
                    })
                return dict(grouped_options)
            else:
                return [{
                    "name": option.name,
                    "value": option.value,
                    "type": option.type,
                    "group": NodeODMOptions.find_group_by_option(option.name),
                    "domain": "non-negative" if option.type in ["float", "int"] else option.domain,
                    "help": sub(r'[^.]*%\([^)]+\)s[^.]*\.?', '', option.help),
                } for option in node_options]