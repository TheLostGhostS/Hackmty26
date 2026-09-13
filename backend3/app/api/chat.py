import json
import os
import threading
from typing import Annotated, Any

import sqlalchemy
from fastapi import APIRouter, Header, HTTPException

from app import state
from app.db.database import engine
from app.models.api import ChatRequest
from app.models.ui import UIResponse
from app.services.a2ui_adapter import DEFAULT_SURFACE_ID, ui_response_to_a2ui
from app.services.agent import get_chat
from app.tools.financial import obtener_resumen_financiero


router = APIRouter(prefix="/api", tags=["chat"])

# financial.py todavía usa state.USER_ID_ACTUAL. Serializamos esta sección para
# impedir que dos requests cambien el usuario global en mitad de una tool call.
# Para producción, lo ideal es migrar esa variable a contexto de autenticación por request.
_agent_lock = threading.RLock()


def _resolve_user_id(body: ChatRequest, header_user_id: str | None) -> str:
    user_id = body.userId or header_user_id or os.getenv("DEFAULT_USER_ID")
    if not user_id:
        raise HTTPException(
            status_code=401,
            detail=(
                "No hay usuario asociado al request. Envía userId, X-User-ID "
                "o define DEFAULT_USER_ID para desarrollo."
            ),
        )
    return str(user_id)


def _validate_user(user_id: str) -> str:
    try:
        with engine.connect() as conn:
            name = conn.execute(
                sqlalchemy.text("SELECT nombre FROM dbo.Usuarios WHERE usuario_id = :uid"),
                {"uid": user_id},
            ).scalar()
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"No se pudo consultar SQL Server: {exc}") from exc

    if not name:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")
    return str(name)


def _surface_ids_from_metadata(metadata: dict[str, Any]) -> set[str]:
    client_model = metadata.get("a2uiClientDataModel")
    if not isinstance(client_model, dict):
        return set()
    surfaces = client_model.get("surfaces")
    return set(surfaces.keys()) if isinstance(surfaces, dict) else set()


def _input_from_request(body: ChatRequest) -> tuple[str, str, bool]:
    if body.message is not None:
        surface_id = DEFAULT_SURFACE_ID
        exists = surface_id in _surface_ids_from_metadata(body.metadata)
        return body.message.strip(), surface_id, exists

    assert body.a2ui is not None
    action = body.a2ui.action
    context_text = json.dumps(action.context, ensure_ascii=False)
    prompt = (
        f"[ACCIÓN EJECUTADA: {action.name}]. "
        "Ejecuta la acción en el sistema y muéstrame el resultado.\n"
        f"[CONTEXTO DE LA INTERFAZ A2UI]\n{context_text}"
    )
    return prompt, action.surfaceId, True


@router.get("/health")
def health():
    return {"status": "ok"}


@router.post("/chat")
def chat_endpoint(
    body: ChatRequest,
    x_user_id: Annotated[str | None, Header(alias="X-User-ID")] = None,
):
    user_id = _resolve_user_id(body, x_user_id)

    with _agent_lock:
        # Mantiene exactamente el mecanismo que ya usaban tus tools.
        state.USER_ID_ACTUAL = user_id
        _validate_user(user_id)

        entrada_usuario, surface_id, surface_exists = _input_from_request(body)

        estado_financiero_real = obtener_resumen_financiero()
        paquete_al_modelo = f"""
        [CONTEXTO DE SISTEMA OBLIGATORIO - ESTADO ACTUAL DE LA BASE DE DATOS]
        {json.dumps(estado_financiero_real)}

        [INTENCIÓN DEL USUARIO]
        {entrada_usuario}
        """

        # Un chat por usuario evita mezclar el historial de Gemini entre clientes.
        chat = get_chat(user_id)
        respuesta = chat.send_message(paquete_al_modelo)
        ui = UIResponse.model_validate_json(respuesta.text)

        return ui_response_to_a2ui(
            ui,
            surface_id=surface_id,
            surface_exists=surface_exists,
        )
