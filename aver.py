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



bd_banco = {

    "USR-8472": {

        "identidad": {

            "nombre": "Carlos Mendoza Ríos",

            "edad": 34,

            "ocupacion": "Arquitecto",

            "preferencia_comunicacion": "Push/App",

            "nivel_detalle_preferido": "Alto"

        },

        "inteligencia_financiera": {

            "ingreso_promedio": 45000.00,

            "gasto_promedio_mensual": 32000.00,

            "flujo_neto": 13000.00, # Dinero libre al mes

            "capacidad_estimada_ahorro": 5000.00

        },

        "productos": {

            "ACC-101": {

                "tipo": "Cuenta de Débito",

                "nombre": "Nómina Principal",

                "saldo_disponible": 24500.50

            },

            "CRD-202": {

                "tipo": "Tarjeta de Crédito",

                "nombre": "Tarjeta Oro",

                "saldo_utilizado": 18400.00,

                "limite_credito": 35000.00,

                "tasa_interes": 35.0,

                "pago_minimo": 1200.00

            },

            "INV-404": {

                "tipo": "Inversión",

                "nombre": "Fondo Liquidez",

                "valor_actual": 50000.00,

                "rendimiento": 9.5

            }

        },

        "objetivos": {

            "OBJ-002": {

                "tipo": "reducción de deuda",

                "nombre": "Pagar Tarjeta Oro",

                "cantidad_objetivo": 18400.00,

                "estado": "Atrasado"

            }

        }

    }

}



# 2. Creamos las herramientas que el LLM podrá usar

def consultar_saldo_tarjeta() -> dict:

    """Útil para obtener el saldo actual y la tasa de interés de la tarjeta de crédito del usuario."""

    print("\n[⚙️ MCP EJECUTADO EN SEGUNDO PLANO: consultando base de datos...]")

    return bd_banco



def aplicar_plan_reestructura(meses: int) -> dict:

    """

    ¡PELIGRO! Herramienta de escritura.

    ESTÁ ESTRICTAMENTE PROHIBIDO ejecutar esta función a menos que el usuario haya presionado un botón de confirmación.

    Solo úsala si el mensaje del usuario contiene la frase "[ACCIÓN EJECUTADA...]".

    """

    print(f"\n[⚙️ MCP EJECUTADO EN SEGUNDO PLANO: reestructurando deuda a {meses} meses...]")

    # Simulamos el cambio en la base de datos

    bd_banco["saldo_tarjeta"] = 0.0

    return {"status": "éxito", "mensaje": f"La deuda ha sido reestructurada a {meses} meses."}



def obtener_resumen_financiero(user_id: str = "USR-8472") -> dict:

    """

    Útil para diagnosticar la salud financiera del usuario.

    Devuelve su flujo neto, deudas (tarjetas) e inversiones actuales.

    """

    print(f"\n[⚙️ MCP EJECUTADO: Consultando perfil de {user_id} ...]")

   

    # Extraemos solo lo relevante para no saturar el contexto del LLM

    usuario = bd_banco[user_id]

   

    resumen = {

        "nombre": usuario["identidad"]["nombre"],

        "dinero_libre_mensual": usuario["inteligencia_financiera"]["flujo_neto"],

        "deuda_tarjeta": usuario["productos"]["CRD-202"]["saldo_utilizado"],

        "tasa_deuda": usuario["productos"]["CRD-202"]["tasa_interes"],

        "dinero_invertido": usuario["productos"]["INV-404"]["valor_actual"],

        "tasa_inversion": usuario["productos"]["INV-404"]["rendimiento"]

    }

    return resumen



def simular_pago_deuda(pago_mensual: float, user_id: str = "USR-8472") -> dict:

    """

    Simula el impacto de un pago mensual sobre la deuda de la tarjeta de crédito.

    Útil para mostrarle al usuario cuánto ahorrará si paga más del mínimo.

    Recibe el monto que el usuario pretende pagar al mes.

    """

    print(f"\n[⚙️ MCP: Simulando amortización con pago de ${pago_mensual} ...]")

   

    tarjeta = bd_banco[user_id]["productos"]["CRD-202"]

    saldo = tarjeta["saldo_utilizado"]

    tasa_anual = tarjeta["tasa_interes"]

    tasa_mensual = (tasa_anual / 100) / 12

   

    # Prevención de error: Si el pago no cubre ni los intereses

    interes_primer_mes = saldo * tasa_mensual

    if pago_mensual <= interes_primer_mes:

        return {"error": "El pago es tan bajo que la deuda crecerá infinitamente."}

   

    meses = 0

    interes_total = 0

    saldo_restante = saldo

   

    # Bucle simple de amortización

    while saldo_restante > 0 and meses < 120: # Límite de 10 años

        interes_mes = saldo_restante * tasa_mensual

        interes_total += interes_mes

        saldo_restante = saldo_restante + interes_mes - pago_mensual

        meses += 1

       

    return {

        "meses_para_liquidar": meses,

        "interes_total_a_pagar": round(interes_total, 2),

        "pago_total_final": round(saldo + interes_total, 2)

    }



def evaluar_costo_oportunidad(user_id: str = "USR-8472") -> dict:

    """

    Calcula si el usuario está perdiendo dinero por mantener deudas caras

    mientras tiene dinero en inversiones con menor rendimiento.

    """

    print("\n[⚙️ MCP: Evaluando costo de oportunidad patrimonial ...]")

   

    tarjeta = bd_banco[user_id]["productos"]["CRD-202"]

    inversion = bd_banco[user_id]["productos"]["INV-404"]

   

    costo_deuda_anual = tarjeta["saldo_utilizado"] * (tarjeta["tasa_interes"] / 100)

    ganancia_inversion_anual = inversion["valor_actual"] * (inversion["rendimiento"] / 100)

   

    fuga_de_capital = costo_deuda_anual > ganancia_inversion_anual

   

    return {

        "costo_deuda_anual": round(costo_deuda_anual, 2),

        "ganancia_inversion_anual": round(ganancia_inversion_anual, 2),

        "fuga_detectada": fuga_de_capital,

        "diferencia_neta": round(ganancia_inversion_anual - costo_deuda_anual, 2),

        "consejo_matematico": "La tasa de la deuda es mayor que el rendimiento de la inversión. Conviene liquidar la deuda."

    }



def liquidar_deuda_con_inversion(monto_a_transferir: float, user_id: str = "USR-8472") -> dict:

    """

    ¡PELIGRO! Herramienta transaccional.

    Transfiere fondos de la inversión del usuario para pagar su tarjeta de crédito.

    NUNCA usar sin que el usuario presione un botón de confirmación.

    """

    print(f"\n[⚙️ MCP: Transfiriendo ${monto_a_transferir} de inversión a tarjeta ...]")

   

    usuario = bd_banco[user_id]

    saldo_inversion = usuario["productos"]["INV-404"]["valor_actual"]

    saldo_tarjeta = usuario["productos"]["CRD-202"]["saldo_utilizado"]

   

    if monto_a_transferir > saldo_inversion:

        return {"status": "error", "mensaje": "Fondos insuficientes en la inversión."}

       

    # Ejecutamos el cambio en la base de datos hardcodeada

    usuario["productos"]["INV-404"]["valor_actual"] -= monto_a_transferir

    usuario["productos"]["CRD-202"]["saldo_utilizado"] = max(0, saldo_tarjeta - monto_a_transferir)

   

    nuevo_saldo_tarjeta = usuario["productos"]["CRD-202"]["saldo_utilizado"]

   

    return {

        "status": "éxito",

        "mensaje": "Rebalanceo ejecutado.",

        "nuevo_saldo_tarjeta": nuevo_saldo_tarjeta,

        "nuevo_saldo_inversion": usuario["productos"]["INV-404"]["valor_actual"]

    }



load_dotenv()

client = genai.Client()



instrucciones = """

Eres el motor de Interfaz de Usuario Generativa (GenUI) de un banco, especializado en educación financiera objetiva y basada en evidencia.



Tus usuarios interactúan contigo de dos formas:

1. Lenguaje natural (ej. "¿Cómo van mis finanzas?").

2. Eventos de la interfaz (texto exacto: "[ACCIÓN EJECUTADA: nombre_accion]").



Tu único propósito es evaluar la situación matemática del usuario, utilizar las herramientas de sistema (MCP) necesarias y responder ESTRICTAMENTE con un JSON que defina los componentes visuales para construir la pantalla. No generes texto narrativo fuera del JSON.



=== 1. ROL DE EDUCADOR FINANCIERO ===

- Basa siempre tus diagnósticos en lógica matemática (ej. comparar tasas de interés de deuda vs. rendimiento de inversión).

- Sé neutral y objetivo. No juzgues los hábitos del usuario ni asumas su intención; simplemente presenta la evidencia de su situación financiera.

- Muestra el "costo de oportunidad": si el usuario tiene deuda cara e inversión barata, explícale matemáticamente por qué está perdiendo dinero.

- PRESENTA MÚLTIPLES ALTERNATIVAS: Siempre que expongas un problema o propongas una solución, debes ofrecer diferentes opciones viables de forma equitativa (ej. pagar deuda agresivamente vs. esquema conservador). Muestra el impacto matemático de cada lado de manera imparcial para que la decisión final recaiga en el usuario.



=== 2. REGLAS DE USO DE HERRAMIENTAS (MCP) ===

Tienes acceso a herramientas de lectura (diagnóstico) y escritura (transaccionales).

- LECTURA: Eres libre de usar `obtener_resumen_financiero` y `evaluar_costo_oportunidad` de forma proactiva cada vez que necesites entender el contexto del usuario.

- SIMULACIÓN: Usa `simular_pago_deuda` para proyectar matemáticamente las diferentes alternativas que vas a presentar.

- ESCRITURA (HUMAN-IN-THE-LOOP): NUNCA uses herramientas transaccionales como `liquidar_deuda_con_inversion` por iniciativa propia. SÓLO ejecútalas cuando el usuario haya enviado explícitamente un evento "[ACCIÓN EJECUTADA: ...]".



=== 3. REGLAS DE MAPEO DE INTERFAZ (A2UI) ===

Cuando generes el JSON, utiliza los componentes de forma estratégica para educar:

- TEXT (variant: title/subtitle/body): Úsalo para explicar de forma clara y directa los resultados matemáticos y describir objetivamente cada alternativa.

- CHART (bar/line/pie): Úsalo obligatoriamente cuando compares tasas de interés o proyectes las distintas opciones a futuro. La evidencia visual es clave.

- SLIDER: Úsalo para que el usuario simule escenarios interactivos (ej. ajustar el pago mensual para ver cómo cambian los intereses).

- BUTTON: Genera un botón de acción diferente para cada alternativa presentada, permitiendo al usuario elegir su camino. Cada botón debe tener un `action` único en snake_case.

- DROPDOWN / MULTI_SELECT / CHECKBOX: Úsalos para filtrado o selección de opciones.



=== 4. FLUJO DE EJECUCIÓN ESPERADO ===

A) Si el usuario pide un diagnóstico: Consulta las herramientas -> Genera un Text con el análisis lógico -> Genera un Chart con la evidencia -> Genera componentes (Botones/Sliders) que expongan al menos dos alternativas claras.

B) Si el usuario envía "[ACCIÓN EJECUTADA: id_simulacion]": Ejecuta la herramienta de simulación -> Actualiza los componentes visuales con los nuevos datos.

C) Si el usuario envía "[ACCIÓN EJECUTADA: id_transaccion]": Ejecuta la herramienta de escritura -> Muestra un Text (variant: title) de confirmación objetiva de la operación.



La respuesta debe respetar estrictamente el esquema JSON proporcionado, sin excepciones, markdown adicional, ni preámbulos.

"""



chat = client.chats.create(

    model="gemini-3.5-flash-lite",

    config=types.GenerateContentConfig(

        system_instruction=instrucciones,

        response_mime_type="application/json",

        response_schema=UIResponse,

        tools=[consultar_saldo_tarjeta, aplicar_plan_reestructura, obtener_resumen_financiero, simular_pago_deuda, evaluar_costo_oportunidad,

               liquidar_deuda_con_inversion],

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

