from __future__ import annotations
from dataclasses import dataclass, field, fields, is_dataclass
from pathlib import Path
from typing import Optional


class PathNode:
    _parent: Optional[PathNode] = None
    _name_in_parent: Optional[str] = None

    def __init__(self, outputs_folder: Path):
        self._attach(parent_path=outputs_folder)

    def __setattr__(self, key, value):
        if isinstance(value, PathNode):
            value._parent = self
            value._name_in_parent = key
        super().__setattr__(key, value)

    def __getattribute__(self, name):
        value = super().__getattribute__(name)

        # Resolve sub-paths dynamically
        if isinstance(value, str):
            base = self._get_full_path_prefix()
            return str(base / value)
        return value

    def _get_full_path_prefix(self):
        """Recursively build path from parent names"""
        path_parts = []
        current = self
        while current and current._name_in_parent:
            path_parts.insert(0, current._name_in_parent)
            current = current._parent
        if isinstance(current, Path):
            path_parts.insert(0, str(current))
        return Path(*path_parts)

    def _attach(self, parent_path: Path):
        """Initialize root path and propagate to children."""
        self._parent = parent_path
        for f in fields(self):
            child = getattr(self, f.name)
            if isinstance(child, PathNode):
                child._parent = self
                child._name_in_parent = f.name
                child.attach(parent_path=None)

@dataclass(frozen=True)
class Depthmaps(PathNode):
    merged_ply: str = 'merged.ply'

@dataclass(frozen=True)
class OpenSfM(PathNode):
    config_yaml: str = 'config.yaml'
    images: str = 'images/'
    masks: str = 'masks/'
    gcp_list_txt: str = 'gcp_list.txt'
    metadata: str = 'metadata/'
    features: str = 'features/'
    matches: str = 'matches/'
    tracks_csv: str = 'tracks.csv'
    reconstruction_json: str = 'reconstruction.json'
    reconstruction_meshed_json: str = 'reconstruction.meshed.json'
    undistorted: str = 'undistorted/'
    undistorted_tracks_json: str = 'undistorted_tracks.json'
    undistorted_reconstruction_json: str = 'undistorted_reconstruction.json'
    depthmaps: Depthmaps = field(default_factory=Depthmaps)

@dataclass(frozen=True)
class ODM_Meshing(PathNode):
    mesh_ply: str = 'odm_mesh.ply'
    log_file: str = 'odm_meshing_log.txt'

@dataclass(frozen=True)
class ODM_Texturing(PathNode):
    obj: str = 'odm_textured_model.obj'
    geo_obj: str = 'odm_textured_model_geo.obj'
    texture_N_jpg: str = 'texture_N.jpg'

@dataclass(frozen=True)
class ODM_Georeferencing(PathNode):
    ply: str = 'odm_georeferenced_model.ply'
    laz: str = 'odm_georeferenced_model.laz'
    csv: str = 'odm_georeferenced_model.csv'
    log_file: str = 'odm_georeferencing_log.txt'
    utm_log_file: str = 'odm_georeferencing_utm_log.txt'

@dataclass(frozen=True)
class ODM_Orthophoto(PathNode):
    png: str = 'odm_orthophoto.png'
    tif: str = 'odm_orthophoto.tif'
    log_file: str = 'odm_orthophoto_log.txt'
    gdal_translate_log_file: str = 'gdal_translate_log.txt'

@dataclass(frozen=True)
class ODM_DEM(PathNode):
    dsm: str = 'dsm.tif'
    dtm: str = 'dtm.tif'

@dataclass(frozen=True)
class ODMTaskOutputs(PathNode):
    opensfm: OpenSfM = field(default_factory=OpenSfM)
    meshing: ODM_Meshing = field(default_factory=ODM_Meshing)
    texturing: ODM_Texturing = field(default_factory=ODM_Texturing)
    georeferencing: ODM_Georeferencing = field(default_factory=ODM_Georeferencing)
    orthophoto: ODM_Orthophoto = field(default_factory=ODM_Orthophoto)
    dem: ODM_DEM = field(default_factory=ODM_DEM)
