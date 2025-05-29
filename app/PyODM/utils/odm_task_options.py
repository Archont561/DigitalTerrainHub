from dataclasses import dataclass
from django.conf import settings
from pyodm import Node, exceptions
from re import sub
from typing import defaultdict

@dataclass(frozen=True)
class DatasetStageOptions:
    BG_REMOVAL: str = 'bg-removal'
    CAMERA_LENS: str = 'camera-lens'
    CAMERAS: str = 'cameras'
    GCP: str = 'gcp'
    GEO: str = 'geo'
    GPS_ACCURACY: str = 'gps-accuracy'
    PRIMARY_BAND: str = 'primary-band'
    SKY_REMOVAL: str = 'sky-removal'
    USE_EXIF: str = 'use-exif'
    VIDEO_LIMIT: str = 'video-limit'
    VIDEO_RESOLUTION: str = 'video-resolution'

@dataclass(frozen=True)
class SplitOptions:
    SM_CLUSTER: str = 'sm-cluster'
    SM_NO_ALIGN: str = 'sm-no-align'
    SPLIT: str = 'split'
    SPLIT_IMAGE_GROUPS: str = 'split-image-groups'
    SPLIT_OVERLAP: str = 'split-overlap'

@dataclass(frozen=True)
class OpenSFMOptions:
    FEATURE_QUALITY: str = 'feature-quality'
    FEATURE_TYPE: str = 'feature-type'
    FORCE_GPS: str = 'force-gps'
    IGNORE_GSD: str = 'ignore-gsd'
    MATCHER_NEIGHBORS: str = 'matcher-neighbors'
    MATCHER_ORDER: str = 'matcher-order'
    MATCHER_TYPE: str = 'matcher-type'
    MIN_NUM_FEATURES: str = 'min-num-features'
    PC_QUALITY: str = 'pc-quality'
    RADIOMETRIC_CALIBRATION: str = 'radiometric-calibration'
    ROLLING_SHUTTER: str = 'rolling-shutter'
    ROLLING_SHUTTER_READOUT: str = 'rolling-shutter-readout'
    SFM_ALGORITHM: str = 'sfm-algorithm'
    SFM_NO_PARTIAL: str = 'sfm-no-partial'
    SKIP_BAND_ALIGNMENT: str = 'skip-band-alignment'
    USE_FIXED_CAMERA_PARAMS: str = 'use-fixed-camera-params'
    USE_HYBRID_BUNDLE_ADJUSTMENT: str = 'use-hybrid-bundle-adjustment'

@dataclass(frozen=True)
class OpenMVSOptions:
    PC_FILTER: str = 'pc-filter'
    PC_SKIP_GEOMETRIC: str = 'pc-skip-geometric'

@dataclass(frozen=True)
class FilterPointsOptions:
    AUTO_BOUNDARY: str = 'auto-boundary'
    AUTO_BOUNDARY_DISTANCE: str = 'auto-boundary-distance'
    BOUNDARY: str = 'boundary'
    FAST_ORTHOPHOTO: str = 'fast-orthophoto'
    PC_SAMPLE: str = 'pc-sample'

@dataclass(frozen=True)
class MeshingOptions:
    MESH_OCTREE_DEPTH: str = 'mesh-octree-depth'
    MESH_SIZE: str = 'mesh-size'
    SKIP_3DMODEL: str = 'skip-3dmodel'

@dataclass(frozen=True)
class MVSTexturingOptions:
    GLTF: str = 'gltf'
    TEXTURING_KEEP_UNSEEN_FACES: str = 'texturing-keep-unseen-faces'
    TEXTURING_SINGLE_MATERIAL: str = 'texturing-single-material'
    TEXTURING_SKIP_GLOBAL_SEAM_LEVELING: str = 'texturing-skip-global-seam-leveling'
    USE_3DMESH: str = 'use-3dmesh'

@dataclass(frozen=True)
class GeoreferencingOptions:
    ALIGN: str = 'align'
    CROP: str = 'crop'
    PC_CLASSIFY: str = 'pc-classify'
    PC_COPC: str = 'pc-copc'
    PC_CSV: str = 'pc-csv'
    PC_EPT: str = 'pc-ept'
    PC_LAS: str = 'pc-las'
    PC_RECTIFY: str = 'pc-rectify'

@dataclass(frozen=True)
class DEMOptions:
    COG: str = 'cog'
    DEM_DECIMATION: str = 'dem-decimation'
    DEM_EUCLIDEAN_MAP: str = 'dem-euclidean-map'
    DEM_GAPFILL_STEPS: str = 'dem-gapfill-steps'
    DEM_RESOLUTION: str = 'dem-resolution'
    DSM: str = 'dsm'
    DTM: str = 'dtm'
    SMRF_SCALAR: str = 'smrf-scalar'
    SMRF_SLOPE: str = 'smrf-slope'
    SMRF_THRESHOLD: str = 'smrf-threshold'
    SMRF_WINDOW: str = 'smrf-window'

@dataclass(frozen=True)
class OrthophotoOptions:
    BUILD_OVERVIEWS: str = 'build-overviews'
    ORTHOPHOTO_COMPRESSION: str = 'orthophoto-compression'
    ORTHOPHOTO_CUTLINE: str = 'orthophoto-cutline'
    ORTHOPHOTO_KMZ: str = 'orthophoto-kmz'
    ORTHOPHOTO_NO_TILED: str = 'orthophoto-no-tiled'
    ORTHOPHOTO_PNG: str = 'orthophoto-png'
    ORTHOPHOTO_RESOLUTION: str = 'orthophoto-resolution'
    SKIP_ORTHOPHOTO: str = 'skip-orthophoto'

@dataclass(frozen=True)
class ReportOptions:
    SKIP_REPORT: str = 'skip-report'

@dataclass(frozen=True)
class PostprocessOptions:
    THREE_D_TILES: str = '3d-tiles'
    COPY_TO: str = 'copy-to'

@dataclass(frozen=True)
class ODMTaskOptions:
    DATASET_STAGE: DatasetStageOptions = DatasetStageOptions()
    SPLIT: SplitOptions = SplitOptions()
    OPEN_SFM: OpenSFMOptions = OpenSFMOptions()
    OPEN_MVS: OpenMVSOptions = OpenMVSOptions()
    FILTERPOINTS: FilterPointsOptions = FilterPointsOptions()
    MESHING: MeshingOptions = MeshingOptions()
    MVS_TEXTURING: MVSTexturingOptions = MVSTexturingOptions()
    GEOREFERENCING: GeoreferencingOptions = GeoreferencingOptions()
    DEM: DEMOptions = DEMOptions()
    ORTHOPHOTO: OrthophotoOptions = OrthophotoOptions()
    REPORT: ReportOptions = ReportOptions()
    POSTPROCESS: PostprocessOptions = PostprocessOptions()

    @classmethod
    def find_group_by_option(cls, option_name: str):
        class_vars = {
            key: value for key, value in vars(cls).items()
            if not key.startswith('__') and isinstance(value, (
                DatasetStageOptions, SplitOptions, OpenSFMOptions, OpenMVSOptions,
                FilterPointsOptions, MeshingOptions, MVSTexturingOptions,
                GeoreferencingOptions, DEMOptions, OrthophotoOptions,
                ReportOptions, PostprocessOptions
            ))
        }
        for group, dataclass_instance in class_vars.items():
            if option_name in vars(dataclass_instance).values():
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
                    group_name = cls.find_group_by_option(option.name)
                    grouped_options[group_name].append({
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
                    "group": cls.find_group_by_option(option.name),
                    "domain": "non-negative" if option.type in ["float", "int"] else option.domain,
                    "help": sub(r'[^.]*%\([^)]+\)s[^.]*\.?', '', option.help),
                } for option in node_options]
