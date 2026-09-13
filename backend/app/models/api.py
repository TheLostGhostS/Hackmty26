from typing import Any, Literal

from pydantic import BaseModel, Field, model_validator


class A2UIClientAction(BaseModel):
    name: str
    surfaceId: str
    sourceComponentId: str
    timestamp: str
    context: dict[str, Any] = Field(default_factory=dict)


class A2UIClientActionEnvelope(BaseModel):
    version: Literal["v0.9.1"]
    action: A2UIClientAction


class ChatRequest(BaseModel):
    # Mensaje normal enviado por useA2UI.sendMessage().
    message: str | None = None

    # Acción A2UI enviada por useA2UI.invokeAction().
    a2ui: A2UIClientActionEnvelope | None = None

    # Capabilities y, cuando sendDataModel=true, el estado local de la surface.
    metadata: dict[str, Any] = Field(default_factory=dict)

    # Opcional para desarrollo. En producción debe venir de autenticación real.
    userId: str | None = None

    @model_validator(mode="after")
    def validate_transport_shape(self):
        if bool(self.message and self.message.strip()) == bool(self.a2ui):
            raise ValueError("Envía exactamente uno de: message o a2ui.")
        return self
