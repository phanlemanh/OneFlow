"""Re-export of the package-level subprocess helpers.

The helper moved up to ``tongflow._subproc`` because ``tongflow.scan`` needs it
too, and ``tongflow.engine.plugins`` imports ``tongflow.scan`` — so a scanner
that reached into the engine for it closed an import cycle. That cycle only
stayed invisible because ``tongflow/__init__`` happens to pull the engine in
first; trimming or reordering that file broke the whole plugin scanner.

This shim keeps ``from ._subproc import utf8_env`` working for engine modules.
"""

from __future__ import annotations

from .._subproc import utf8_env

__all__ = ["utf8_env"]
