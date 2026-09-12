import os
import json
from typing import Literal, Union
from pydantic import BaseModel, Field
from google import genai
from google.genai import types
from dotenv import load_dotenv
import time

class Option(BaseModel):
    label: str
    value: str


class ChartDataset(BaseModel):
    label: str
    values: list[float]

class TextComponent(BaseModel):
    type: Literal["text"]
    id: str
    text: str
    variant: Literal["title", "subtitle", "body", "caption"] = "body"


class ButtonComponent(BaseModel):
    type: Literal["button"]
    id: str
    label: str
    action: str


class SliderComponent(BaseModel):
    type: Literal["slider"]
    id: str
    label: str
    min: float
    max: float
    step: float = 1
    default_value: float | None = None


class DropdownComponent(BaseModel):
    type: Literal["dropdown"]
    id: str
    label: str
    options: list[Option]
    default_value: str | None = None


class MultiSelectComponent(BaseModel):
    type: Literal["multi_select"]
    id: str
    label: str
    options: list[Option]
    default_values: list[str] | None = None


class CheckboxComponent(BaseModel):
    type: Literal["checkbox"]
    id: str
    label: str
    default_checked: bool | None = None


class ChartComponent(BaseModel):
    type: Literal["chart"]
    id: str
    title: str
    chart_type: Literal["bar", "line", "pie"]
    labels: list[str]
    datasets: list[ChartDataset]

UIComponent = Union[
    TextComponent,
    ButtonComponent,
    SliderComponent,
    DropdownComponent,
    MultiSelectComponent,
    CheckboxComponent,
    ChartComponent,
]

class UIResponse(BaseModel):
    components: list[UIComponent] = Field(
        description=(
            "Components required to build the interface. "
            "Include only components that are useful for the user's request. "
            "Any component type may appear zero, one, or multiple times."
        )
    )

db_bancaria = {
    "saldo_tarjeta": 18400.0,
    "tasa_interes_anual": 35.0
}

# 2. Creamos las herramientas que el LLM podrá usar
def consultar_saldo_tarjeta() -> dict:
    """Útil para obtener el saldo actual y la tasa de interés de la tarjeta de crédito del usuario."""
    print("\n[⚙️ MCP EJECUTADO EN SEGUNDO PLANO: consultando base de datos...]")
    return db_bancaria

def aplicar_plan_reestructura(meses: int) -> dict:
    """
    ¡PELIGRO! Herramienta de escritura.
    ESTÁ ESTRICTAMENTE PROHIBIDO ejecutar esta función a menos que el usuario haya presionado un botón de confirmación.
    Solo úsala si el mensaje del usuario contiene la frase "[ACCIÓN EJECUTADA...]".
    """
    print(f"\n[⚙️ MCP EJECUTADO EN SEGUNDO PLANO: reestructurando deuda a {meses} meses...]")
    # Simulamos el cambio en la base de datos
    db_bancaria["saldo_tarjeta"] = 0.0
    return {"status": "éxito", "mensaje": f"La deuda ha sido reestructurada a {meses} meses."}


load_dotenv()
client = genai.Client()

instrucciones = """Eres el motor de interfaz de un banco (GenUI).

El usuario puede:
1. Hablar en lenguaje natural.
2. Interactuar con componentes de la interfaz.

Tu trabajo es generar la interfaz más apropiada para satisfacer
la intención actual del usuario.

REGLAS DE HERRAMIENTAS (MCP):
- Consultas de lectura: Usa `consultar_saldo_tarjeta` libremente cuando necesites contexto.
- Herramientas de escritura (`aplicar_plan_reestructura`): NUNCA las uses por iniciativa propia. Si el usuario pide reestructurar, PRIMERO genera una interfaz con los datos reales y botones para elegir planes de 12, 18 o 24 meses. ESPERA a que el usuario presione un botón. SÓLO ejecuta la herramienta cuando recibas el comando "[ACCIÓN EJECUTADA...]".
REGLAS DE UI:
- Utiliza solamente los componentes que sean útiles para la interacción actual.
- Prefiere interfaces simples y claras.
- Usa gráficas cuando ayuden a comprender información numérica.
- Usa texto para títulos, explicaciones, valores o confirmaciones.

Cuando recibas: [ACCIÓN EJECUTADA: nombre_accion]
Asume que el usuario presionó un botón. Revisa si necesitas ejecutar una herramienta para cumplir esa acción, y luego genera la siguiente interfaz apropiada.
"""

chat = client.chats.create(
    model="gemini-3.5-flash-lite",
    config=types.GenerateContentConfig(
        system_instruction=instrucciones,
        response_mime_type="application/json",
        response_schema=UIResponse,
        tools=[consultar_saldo_tarjeta, aplicar_plan_reestructura],
        temperature=0.0
    ),
)

def simular_frontend():
    print("=== SIMULADOR GENUI + MCP INICIADO ===")
    print("Prueba escribiendo: 'Quiero pagar menos intereses en mi tarjeta'")

    entrada_usuario = input("\n[Usuario] -> ")

    while True:
        try:
            # ==============================
            # CONSULTA A GEMINI
            # ==============================
            # Si el modelo decide usar una herramienta, el SDK de Google GenAI
            # la ejecutará automáticamente por detrás y luego devolverá el JSON final.
            respuesta = chat.send_message(entrada_usuario)

            ui = UIResponse.model_validate_json(respuesta.text)

            print("\n\n===== JSON GENERADO =====")
            print(ui.model_dump_json(indent=4, exclude_none=True))

            print("\n\n===== INTERFAZ =====")
            botones = []

            # ==============================
            # RENDERIZADO
            # ==============================
            for componente in ui.components:
                # TEXT
                if isinstance(componente, TextComponent):
                    if componente.variant == "title":
                        print(f"\n# {componente.text}")
                    elif componente.variant == "subtitle":
                        print(f"\n## {componente.text}")
                    else:
                        print(f"\n{componente.text}")

                # BUTTON
                elif isinstance(componente, ButtonComponent):
                    botones.append(componente)
                    numero = len(botones)
                    print(f"\n[{numero}] {componente.label}")

                # SLIDER
                elif isinstance(componente, SliderComponent):
                    print(f"\n{componente.label}")
                    print(f"[{componente.min} ----●---- {componente.max}]")
                    if componente.default_value is not None:
                        print(f"Valor actual: {componente.default_value}")

                # DROPDOWN
                elif isinstance(componente, DropdownComponent):
                    print(f"\n{componente.label}:")
                    for i, option in enumerate(componente.options, start=1):
                        print(f"   {i}. {option.label}")

                # MULTI SELECT
                elif isinstance(componente, MultiSelectComponent):
                    print(f"\n{componente.label}:")
                    for i, option in enumerate(componente.options, start=1):
                        print(f"   [ ] {i}. {option.label}")

                # CHECKBOX
                elif isinstance(componente, CheckboxComponent):
                    estado = "X" if componente.default_checked else " "
                    print(f"\n[{estado}] {componente.label}")

                # CHART
                elif isinstance(componente, ChartComponent):
                    print(f"\n📊 {componente.title}")
                    print(f"Tipo: {componente.chart_type}")
                    for dataset in componente.datasets:
                        print(f"  {dataset.label}: {dataset.values}")

            # ==============================
            # INTERACCIÓN
            # ==============================
            print("\n" + "=" * 50)
            if botones:
                print("\nBotones disponibles:")
                for i, boton in enumerate(botones, start=1):
                    print(f"{i}. {boton.label} (ID: {boton.action})")

            print("\nOpciones:")
            print("M = Escribir mensaje")
            print("Q = Salir")

            opcion = input("\n> ").strip()

            if opcion.isdigit():
                indice = int(opcion) - 1
                if 0 <= indice < len(botones):
                    boton = botones[indice]
                    # Aquí pasamos no solo que se ejecutó, sino el contexto de texto libre
                    entrada_usuario = f"[ACCIÓN EJECUTADA: {boton.action}]. Ejecuta la acción en el sistema y muéstrame el resultado."
                    print(f"\n... Enviando interacción al modelo ...")
                else:
                    print("Botón inválido.")
                    entrada_usuario = "El usuario se equivocó de botón."

            elif opcion.lower() == "m":
                entrada_usuario = input("\n[Usuario] -> ")

            elif opcion.lower() == "q":
                print("Saliendo...")
                break
            else:
                entrada_usuario = input("\n[Usuario] -> ")

        except Exception as e:
            if "429" in str(e):
                print("\n[⏳] Límite de API alcanzado. Esperando 15 segundos...")
                time.sleep(15)
                print("Reintentando...")
                continue
            else:
                print(f"\n[❌] Error inesperado: {e}")
                break

if __name__ == "__main__":
    simular_frontend()