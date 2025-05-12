from django.urls import path, include
from django.views.generic import View
from typing import Tuple, List


def generate_path_patterns(patterns_config: Tuple[str, View, str]):
    return [path(endpoint, view.as_view(), name=alias) for endpoint, view, alias in patterns_config]


def generate_path_namespace(endpoint: str, namespace: str, path_patterns: List["PathPattern"]):
    return path(endpoint, include((path_patterns, namespace)))