import json
from google import genai
from google.genai import types

from app.models.ui import UIResponse
from app.tools.financial import (
    consultar_saldo_tarjeta,
    aplicar_plan_reestructura,
    simular_pago_deuda,
    evaluar_costo_oportunidad,
    liquidar_deuda_con_inversion,
    obtener_resumen_financiero,
)

INSTRUCCIONES = """
Eres el motor de Interfaz de Usuario Generativa (GenUI) de un banco.
Debes responder únicamente con JSON compatible con UIResponse.
Usa datos reales del contexto y herramientas disponibles.
Nunca ejecutes operaciones de escritura sin confirmación explícita del usuario.
"""

client = genai.Client()

chat = client.chats.create(
    model="gemini-3.5-flash-lite",
    config=types.GenerateContentConfig(
        system_instruction=INSTRUCCIONES,
        response_mime_type="application/json",
        response_schema=UIResponse,
        tools=[
            consultar_saldo_tarjeta,
            aplicar_plan_reestructura,
            simular_pago_deuda,
            evaluar_costo_oportunidad,
            liquidar_deuda_con_inversion,
        ],
        temperature=0.0,
    ),
)

def generar_interfaz(entrada_usuario: str) -> UIResponse:
    estado = obtener_resumen_financiero()
    paquete = f"""
[CONTEXTO DE SISTEMA OBLIGATORIO - ESTADO ACTUAL DE LA BASE DE DATOS]
{json.dumps(estado, ensure_ascii=False)}

[INTENCIÓN DEL USUARIO]
{entrada_usuario}
"""
    respuesta = chat.send_message(paquete)
    return UIResponse.model_validate_json(respuesta.text)
