from __future__ import annotations

from pydantic import BaseModel, ConfigDict

from .asset import Asset, AudioRef, FileRef, ImageRef, ModelRef, VideoRef


class ComposeOverlayInputRootOpsItem(BaseModel):
    model_config = ConfigDict(extra="forbid")

    type: str
    x: float
    y: float
    align: str | None = None
    anchor: str | None = None
    bg_color: str | None = None
    bottom: float | None = None
    color: str | None = None
    end: float | None = None
    left: float | None = None
    max_width: float | None = None
    opacity: float | None = None
    padding: float | None = None
    preset: str | None = None
    radius: float | None = None
    right: float | None = None
    size: float | None = None
    start: float | None = None
    text: str | None = None
    top: float | None = None
    width: float | None = None

class ComposeOverlayInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    media: Asset
    ops: list["ComposeOverlayInputRootOpsItem"]
    logo: Asset | None = None
    text: str | None = None

class ComposeOverlayOutput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    success: bool
    error: str | None = None
    image: Asset | None = None
    video: Asset | None = None

