"""Modal deploy entry for compose-overlay.

Deploy:
  modal deploy deploy.py
"""

from __future__ import annotations

import logging
from pathlib import Path

import modal
from tongflow import deploy
from tongflow.node_slots import NodeSlots
from tongflow.slots import node_slot

# This plugin is the default implementation for its slot (module-level constant
# on purpose — a constant is never executed, so older deployed SDKs still import).
TONGFLOW_DEFAULT_SLOTS = ["compose-overlay"]

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

# CPU-only image. Pillow/freetype/ffmpeg are pinned via the image so re-runs are
# byte-identical within one plugin rev (Tier A determinism boundary).
image = (
    modal.Image.debian_slim(python_version="3.13")
    .apt_install("ffmpeg")
    .uv_pip_install(
        "oneflow-sdk==0.2.18",
        "fastapi[standard]",
        "pillow==11.3.0",
    )
    .add_local_dir(Path(__file__).resolve().parent / "overlay", remote_path="/root/overlay")
)
app = modal.App(Path(__file__).resolve().parent.name, image=image)

with image.imports():
    from tongflow.models.compose_overlay import ComposeOverlayInput, ComposeOverlayOutput

    from overlay.composite import run_compose


@deploy
@app.cls(cpu=2, memory=2048, timeout=600)
class Inference:
    @modal.method()
    @node_slot(NodeSlots.COMPOSE_OVERLAY)
    def compose_overlay(self, input: ComposeOverlayInput) -> ComposeOverlayOutput:
        logger.info("compose-overlay: %d ops", len(input.ops))
        return run_compose(input)
