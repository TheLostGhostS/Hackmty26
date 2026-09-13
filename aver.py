import os
import json
from pydantic import BaseModel, Field
from google import genai
from google.genai import types
from dotenv import load_dotenv
import time
import sqlalchemy
from sqlalchemy import text
from google.cloud.sql.connector import Connector
from decimal import Decimal
from datetime import date, datetime
import atexit


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

USER_ID_ACTUAL = None
connector = Connector()
INSTANCE_CONNECTION_NAME = "t-cogency-435402-c6:us-central1:reto-banorte-db" 

def get_connection():
    return connector.connect(
        INSTANCE_CONNECTION_NAME,
        "pytds",
        user=os.environ.get("DB_USER"),
        password=os.environ.get("DB_PASSWORD"),
        db=os.environ.get("DB_NAME"),
    )

engine = sqlalchemy.create_engine(
    "mssql+pytds://",
    creator=get_connection
)

def consultar_saldo_tarjeta() -> dict:
    """Útil para obtener el saldo actual y la tasa de interés de la tarjeta de crédito del usuario."""
    print(f"\n[⚙️ MCP EJECUTADO: Consultando tarjeta vía SQLAlchemy para {USER_ID_ACTUAL}...]")
    
    with engine.connect() as conn:
        sql = sqlalchemy.text("""
            SELECT tc.saldo_utilizado, tc.tasa_interes 
            FROM dbo.TarjetasCredito tc
            JOIN dbo.Productos p ON tc.producto_id = p.producto_id
            WHERE p.usuario_id = :uid AND p.tipo = 'Tarjeta de Crédito'
        """)
        resultado = conn.execute(sql, {"uid": USER_ID_ACTUAL}).fetchone()
        
        if resultado:
            return dict(resultado._mapping)
        return {"error": "Tarjeta no encontrada."}

def aplicar_plan_reestructura(meses: int) -> dict:
    """¡PELIGRO! Herramienta de escritura. Solo úsala con confirmación explícita."""
    print(f"\n[⚙️ MCP EJECUTADO: Reestructurando deuda a {meses} meses vía SQLAlchemy...]")
    
    try:
        with engine.begin() as conn:
            sql = sqlalchemy.text("""
                UPDATE tc
                SET tc.saldo_utilizado = 0.0 
                FROM dbo.TarjetasCredito tc
                JOIN dbo.Productos p ON tc.producto_id = p.producto_id
                WHERE p.usuario_id = :uid AND p.tipo = 'Tarjeta de Crédito'
            """)
            conn.execute(sql, {"uid": USER_ID_ACTUAL})
            
        return {"status": "éxito", "mensaje": f"La deuda ha sido reestructurada a {meses} meses."}
    except Exception as e:
        return {"status": "error", "mensaje": str(e)}

def obtener_resumen_financiero() -> dict:
    """
    ¡OBLIGATORIO! Ejecuta SIEMPRE esta herramienta para obtener TODA la radiografía patrimonial, 
    demográfica, de productos, inversiones, deudas y objetivos del usuario en la base de datos 
    antes de generar cualquier diagnóstico. Si no la usas, estarás mintiendo.
    """
    print(f"\n[⚙️ MCP EJECUTADO: Extrayendo radiografía completa de la BD para el usuario {USER_ID_ACTUAL} ...]")
    
    with engine.connect() as conn:
        # 1. Datos Demográficos y Perfil General
        sql_usuario = sqlalchemy.text("""
            SELECT nombre, fecha_nacimiento, ocupacion, ciudad, region, estado_civil, dependientes_economicos
            FROM dbo.Usuarios WHERE usuario_id = :uid
        """)
        res_usuario = conn.execute(sql_usuario, {"uid": USER_ID_ACTUAL}).fetchone()
        
        # 2. Resumen Financiero Macro (Ingresos vs Gastos / Obligaciones)
        sql_macro = sqlalchemy.text("""
            SELECT 
                ISNULL((SELECT SUM(monto) FROM dbo.Ingresos WHERE usuario_id = :uid), 0) AS ingresos_totales,
                ISNULL((SELECT SUM(monto) FROM dbo.PagosObligaciones WHERE usuario_id = :uid), 0) AS gastos_obligaciones_totales
        """)
        res_macro = conn.execute(sql_macro, {"uid": USER_ID_ACTUAL}).fetchone()

        # 3. Listado de Cuentas de Débito / Efectivo
        sql_cuentas = sqlalchemy.text("""
            SELECT c.tipo, c.nombre, c.moneda, c.saldo, c.saldo_disponible
            FROM dbo.Cuentas c
            JOIN dbo.Productos p ON c.producto_id = p.producto_id
            WHERE p.usuario_id = :uid AND p.estado = 'Activo'
        """)
        res_cuentas = conn.execute(sql_cuentas, {"uid": USER_ID_ACTUAL}).fetchall()

        # 4. Listado de Tarjetas de Crédito y Deudas
        sql_tc = sqlalchemy.text("""
            SELECT tc.tipo, p.nombre, tc.limite_credito, tc.credito_disponible, 
                   tc.saldo_utilizado, tc.pago_minimo, tc.tasa_interes, tc.fecha_corte, tc.fecha_pago
            FROM dbo.TarjetasCredito tc
            JOIN dbo.Productos p ON tc.producto_id = p.producto_id
            WHERE p.usuario_id = :uid AND tc.estado = 'Activo'
        """)
        res_tc = conn.execute(sql_tc, {"uid": USER_ID_ACTUAL}).fetchall()

        # 5. Listado de Inversiones y Rendimientos
        sql_inv = sqlalchemy.text("""
            SELECT inv.tipo_instrumento, p.nombre, inv.monto_invertido, 
                   inv.valor_actual, inv.rendimiento, inv.liquidez
            FROM dbo.Inversiones inv
            JOIN dbo.Productos p ON inv.producto_id = p.producto_id
            WHERE p.usuario_id = :uid AND inv.estado = 'Activo'
        """)
        res_inv = conn.execute(sql_inv, {"uid": USER_ID_ACTUAL}).fetchall()

        # 6. Créditos Activos (Hipotecarios, Automotrices, Personales)
        sql_creditos = sqlalchemy.text("""
            SELECT cr.tipo, p.nombre, cr.monto_original, cr.saldo_pendiente, 
                   cr.pago_mensual, cr.tasa, cr.plazo, cr.pagos_restantes
            FROM dbo.Creditos cr
            JOIN dbo.Productos p ON cr.producto_id = p.producto_id
            WHERE p.usuario_id = :uid AND cr.estado = 'Activo'
        """)
        res_creditos = conn.execute(sql_creditos, {"uid": USER_ID_ACTUAL}).fetchall()

        # 7. Objetivos Financieros
        sql_objetivos = sqlalchemy.text("""
            SELECT tipo_objetivo, nombre, cantidad_objetivo, cantidad_actual, prioridad, estado
            FROM dbo.ObjetivosFinancieros WHERE usuario_id = :uid
        """)
        res_objetivos = conn.execute(sql_objetivos, {"uid": USER_ID_ACTUAL}).fetchall()

        # 8. Preferencias Declaradas y de Experiencia
        sql_prefs = sqlalchemy.text("""
            SELECT preferencia_ahorro, preferencia_inversion, preferencia_riesgo
            FROM dbo.PreferenciasDeclaradas WHERE usuario_id = :uid
        """)
        res_prefs = conn.execute(sql_prefs, {"uid": USER_ID_ACTUAL}).fetchone()

        # Consolidación segura en un diccionario maestro serializable (convirtiendo Decimals a float)
        def limpiar_decimales(registro):
            if not registro: return {}
            d = dict(registro._mapping)
            for k, v in d.items():
                if type(v).__name__ == 'Decimal':
                    d[k] = float(v)
                elif hasattr(v, 'isoformat'): # Manejo de fechas (DATE / DATETIME)
                    d[k] = v.isoformat()
            return d

        radiografia_completa = {
            "perfil_demografico": limpiar_decimales(res_usuario),
            "resumen_macro": limpiar_decimales(res_macro),
            "cuentas_debito": [limpiar_decimales(row) for row in res_cuentas],
            "tarjetas_credito": [limpiar_decimales(row) for row in res_tc],
            "inversiones": [limpiar_decimales(row) for row in res_inv],
            "creditos_activos": [limpiar_decimales(row) for row in res_creditos],
            "objetivos": [limpiar_decimales(row) for row in res_objetivos],
            "preferencias": limpiar_decimales(res_prefs)
        }

        # Cálculo dinámico complementario para flujo neto en MXN
        macro = radiografia_completa["resumen_macro"]
        ingresos = macro.get("ingresos_totales", 0.0)
        gastos = macro.get("gastos_obligaciones_totales", 0.0)
        radiografia_completa["dinero_libre_mensual_calculado_mxn"] = ingresos - gastos

        return radiografia_completa

def simular_pago_deuda(pago_mensual: float) -> dict:
    """Simula el impacto de un pago mensual sobre la deuda de la tarjeta."""
    print(f"\n[⚙️ MCP EJECUTADO: Simulando amortización de ${pago_mensual} ...]")
    
    tarjeta = consultar_saldo_tarjeta()
    if "error" in tarjeta:
        return tarjeta
        
    saldo = float(tarjeta["saldo_utilizado"])
    tasa_anual = float(tarjeta["tasa_interes"])
    tasa_mensual = (tasa_anual / 100) / 12
    
    interes_primer_mes = saldo * tasa_mensual
    if pago_mensual <= interes_primer_mes:
        return {"error": "El pago es tan bajo que la deuda crecerá infinitamente."}
    
    meses = 0
    interes_total = 0
    saldo_restante = saldo
    
    while saldo_restante > 0 and meses < 120:
        interes_mes = saldo_restante * tasa_mensual
        interes_total += interes_mes
        saldo_restante = saldo_restante + interes_mes - pago_mensual
        meses += 1
        
    return {
        "meses_para_liquidar": meses,
        "interes_total_a_pagar": round(interes_total, 2),
        "pago_total_final": round(saldo + interes_total, 2)
    }

def evaluar_costo_oportunidad() -> dict:
    """Calcula si el usuario está perdiendo dinero por mantener deudas caras."""
    print("\n[⚙️ MCP EJECUTADO: Evaluando costo de oportunidad vía SQLAlchemy ...]")
    
    with engine.connect() as conn:
        # Consulta de Tarjeta
        sql_tc = sqlalchemy.text("""
            SELECT tc.saldo_utilizado, tc.tasa_interes 
            FROM dbo.TarjetasCredito tc JOIN dbo.Productos p ON tc.producto_id = p.producto_id 
            WHERE p.usuario_id = :uid
        """)
        res_tc = conn.execute(sql_tc, {"uid": USER_ID_ACTUAL}).fetchone()
        
        # Consulta de Inversión
        sql_inv = sqlalchemy.text("""
            SELECT inv.valor_actual, inv.rendimiento 
            FROM dbo.Inversiones inv JOIN dbo.Productos p ON inv.producto_id = p.producto_id 
            WHERE p.usuario_id = :uid
        """)
        res_inv = conn.execute(sql_inv, {"uid": USER_ID_ACTUAL}).fetchone()
        
        if not res_tc or not res_inv:
            return {"error": "Faltan productos para evaluar el costo de oportunidad."}
            
        tarjeta = {"saldo": float(res_tc[0]), "tasa": float(res_tc[1])}
        inversion = {"saldo": float(res_inv[0]), "tasa": float(res_inv[1])}
            
        costo_deuda_anual = tarjeta["saldo"] * (tarjeta["tasa"] / 100)
        ganancia_inversion_anual = inversion["saldo"] * (inversion["tasa"] / 100)
        fuga_de_capital = costo_deuda_anual > ganancia_inversion_anual
        
        return {
            "costo_deuda_anual": round(costo_deuda_anual, 2),
            "ganancia_inversion_anual": round(ganancia_inversion_anual, 2),
            "fuga_detectada": fuga_de_capital,
            "diferencia_neta": round(ganancia_inversion_anual - costo_deuda_anual, 2),
            "consejo_matematico": "La tasa de la deuda es mayor que el rendimiento de la inversión."
        }

def liquidar_deuda_con_inversion(monto_a_transferir: float) -> dict:
    """¡PELIGRO! Herramienta transaccional. Transfiere fondos de la inversión a la tarjeta."""
    print(f"\n[⚙️ MCP EJECUTADO: Transfiriendo ${monto_a_transferir} vía SQLAlchemy ...]")
    
    try:
        with engine.begin() as conn:
            # 1. Validar fondos
            sql_check = sqlalchemy.text("""
                SELECT inv.valor_actual 
                FROM dbo.Inversiones inv JOIN dbo.Productos p ON inv.producto_id = p.producto_id 
                WHERE p.usuario_id = :uid
            """)
            saldo_inversion = conn.execute(sql_check, {"uid": USER_ID_ACTUAL}).scalar()
            
            if saldo_inversion is None or monto_a_transferir > float(saldo_inversion):
                return {"status": "error", "mensaje": "Fondos insuficientes o cuenta no encontrada."}
                
            # 2. Ejecutar resta a la inversión
            sql_inv = sqlalchemy.text("""
                UPDATE inv
                SET inv.valor_actual = inv.valor_actual - :monto 
                FROM dbo.Inversiones inv JOIN dbo.Productos p ON inv.producto_id = p.producto_id
                WHERE p.usuario_id = :uid
            """)
            conn.execute(sql_inv, {"monto": monto_a_transferir, "uid": USER_ID_ACTUAL})
            
            # 3. Ejecutar resta a la tarjeta
            sql_tarjeta = sqlalchemy.text("""
                UPDATE tc
                SET tc.saldo_utilizado = tc.saldo_utilizado - :monto 
                FROM dbo.TarjetasCredito tc JOIN dbo.Productos p ON tc.producto_id = p.producto_id
                WHERE p.usuario_id = :uid
            """)
            conn.execute(sql_tarjeta, {"monto": monto_a_transferir, "uid": USER_ID_ACTUAL})
            
        return {"status": "éxito", "mensaje": "Rebalanceo ejecutado correctamente en Google Cloud."}
    except Exception as e:
        return {"status": "error", "mensaje": str(e)}


load_dotenv()
client = genai.Client()

instrucciones = """
Eres el motor de interfaz de un banco (GenUI). 
Tus usuarios interactúan contigo de dos formas:
1. Hablando en lenguaje natural (ej. "Quiero cancelar mi tarjeta").
2. Haciendo clic en botones (enviarán un texto como "[ACCIÓN EJECUTADA: cancelar_tarjeta]").

Tu trabajo es SIEMPRE responder con la siguiente interfaz que el usuario debe ver, respetando la estructura JSON.
Si el usuario envía una [ACCIÓN EJECUTADA], debes asumir que el sistema ya procesó eso y debes mostrar una pantalla de éxito, confirmación o siguientes pasos.
"""

chat = client.chats.create(
    model='gemini-3.5-flash',
    config=types.GenerateContentConfig(
        system_instruction=instrucciones,
        response_mime_type="application/json",
        response_schema=ComponenteUI,
        temperature=0.0
    )
)

def simular_frontend():
    print("=== SIMULADOR GENUI INICIADO ===")
    print("Escribe tu intención financiera para comenzar (ej. 'Quiero bloquear mi tarjeta').")
    
    # Input inicial del usuario
    entrada_usuario = input("\n[Usuario] -> ")
    
    while True:
        # 1. Enviamos el mensaje (o la acción simulada) al LLM
        respuesta = chat.send_message(entrada_usuario)
        datos_ui = json.loads(respuesta.text)
        
        # 2. Renderizamos simuladamente la interfaz en la terminal

        datos_ui = json.loads(respuesta.text)
        print(json.dumps(datos_ui, indent=4, ensure_ascii=False))
        print("\n")

        print("\n" + "="*40)
        print(f" INTERFAZ GENERADA: {datos_ui['tipo_componente'].upper()}")
        print("="*40)
        print(f"Título : {datos_ui['titulo']}")
        print(f"Mensaje: {datos_ui['mensaje']}")
        print(f"\n Botón: [{datos_ui['boton']['texto_boton']}] (ID: {datos_ui['boton']['accion_id']})")
        print("="*40)
        
        # 3. Simulamos la interacción del usuario
        print("\nOpciones:")
        print("1. Simular CLIC en el botón")
        print("2. Escribir un nuevo mensaje de texto")
        print("3. Salir")
        
        opcion = input("Elige (1/2/3): ")
        
        if opcion == '1':
            # Retroalimentamos al LLM con la ID de la acción del botón
            accion = datos_ui['boton']['accion_id']
            entrada_usuario = f"[ACCIÓN EJECUTADA: {accion}]"
            print(f"\n... Enviando acción '{accion}' de vuelta al agente ...")
            
        elif opcion == '2':
            # El usuario decide ignorar el botón y decir algo nuevo
            entrada_usuario = input("\n[Usuario] -> ")
            
        else:
            print("Saliendo del simulador...")
            break

if __name__ == "__main__":

    simular_frontend()