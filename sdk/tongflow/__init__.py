"""Tongflow plugin convention + deploy scan (no per-repo JSON).

Backend-neutral: this package imports no backend SDK (no ``modal``). A plugin
that runs on a deploy-first backend marks its handler class with ``@deploy`` and
ships its own local bridge (``entry.py``) that imports the backend lazily.
"""

from __future__ import annotations

from .deploy_marker import deploy
from .engine import run_workflow
from .progress import progress
from .serve import (
    run_and_report,
    serve_slot,
    serve_stream,
    serve_stream_from_spec,
)

__version__ = "0.2.23"

# PyPI distribution name. Deliberately different from the import package name
# (`tongflow`): this fork cannot publish under the upstream distribution, but
# renaming the import package would touch every plugin. Anything that installs
# the SDK by name must read this constant rather than hard-coding a string, so
# the two can never drift — `pip install <__distribution__>==<__version__>`.
__distribution__ = "oneflow-sdk"

__all__ = [
    "deploy",
    "progress",
    "run_and_report",
    "run_workflow",
    "serve_slot",
    "serve_stream",
    "serve_stream_from_spec",
]
