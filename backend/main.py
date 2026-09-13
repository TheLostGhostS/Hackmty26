from fastapi import FastAPI
from pydantic import BaseModel
import os
import pyodbc
from dotenv import load_dotenv
from google import genai
from typing import Optional

load_dotenv()

print("API KEY CARGADA:", bool(os.getenv("GEMINI_API_KEY")))

cliente_gemini = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

app = FastAPI()

class FinancialData(BaseModel):
    saldo_total_disponible: Optional[float] = None
    ingresos_totales: Optional[float] = None
    numero_transacciones: Optional[int] = None


class A2UIResponse(BaseModel):
    type: str
    title: Optional[str] = None
    content: Optional[str] = None
    data: Optional[FinancialData] = None

# -------------------------
# Modelo del mensaje
# -------------------------

class ChatRequest(BaseModel):
    user_id: int
    message: str


# -------------------------
# Conexión a la base de datos
# -------------------------

def obtener_conexion_db():

    cadena = (
        "DRIVER={ODBC Driver 18 for SQL Server};"
        f"SERVER={os.getenv('DB_HOST')};"
        f"DATABASE={os.getenv('DB_NAME')};"
        f"UID={os.getenv('DB_USER')};"
        f"PWD={os.getenv('DB_PASSWORD')};"
        "Encrypt=yes;"
        "TrustServerCertificate=yes;"
    )

    return pyodbc.connect(cadena, timeout=10)

def probar_gemini():
    respuesta = cliente_gemini.models.generate_content(
        model="gemini-3.5-flash-lite",
        contents="Responde solamente: Gemini conectado"
    )

    return respuesta.text

def preguntar_a_gemini(mensaje, contexto):

    herramienta = {
        "function_declarations": [
            herramienta_consultar_saldo,
            herramienta_consultar_gastos,
            herramienta_obtener_resumen
        ]
    }

    prompt = f"""
Eres un asistente financiero de Banorte.

Estos son los datos disponibles del usuario:

{contexto}

El usuario escribió:

{mensaje}

Responde de manera clara y útil.

REGLAS IMPORTANTES:

1. Nunca respondas preguntas financieras utilizando los datos del contexto directamente si existe una herramienta que pueda obtener esos datos.

2. Si el usuario pregunta por su saldo disponible, DEBES utilizar la herramienta consultar_saldo.

3. Si el usuario pregunta por sus gastos, DEBES utilizar la herramienta consultar_gastos.

4. Si el usuario pregunta por su situación financiera general, ingresos, gastos, balance o análisis financiero, DEBES utilizar la herramienta obtener_resumen_financiero.

5. No inventes nombres, cantidades, objetivos, inversiones ni ninguna otra información.

6. Para las herramientas utiliza user_id = 1.

7. En "data" incluye únicamente saldo_total_disponible, ingresos_totales y numero_transacciones cuando estén disponibles.
"""


    respuesta = cliente_gemini.models.generate_content(
        model="gemini-3.5-flash-lite",
        contents=prompt,
        config={
            "tools": [herramienta]
        }
    )

    print("RESPUESTA GEMINI:", respuesta)
    print("FUNCTION CALLS:", respuesta.function_calls)

    if respuesta.function_calls:

        llamada = respuesta.function_calls[0]

        if llamada.name == "consultar_saldo":

            resultado = consultar_saldo(
                llamada.args["user_id"]
            )

        elif llamada.name == "consultar_gastos":

            resultado = consultar_gastos(
                llamada.args["user_id"]
            )

        elif llamada.name == "obtener_resumen_financiero":

            resultado = obtener_resumen_financiero(
                llamada.args["user_id"]
            )

        else:
            return respuesta.text

        print("GEMINI SOLICITÓ:", llamada.name)
        print("RESULTADO DE LA HERRAMIENTA:", resultado)

        respuesta_final = cliente_gemini.models.generate_content(
            model="gemini-3.5-flash-lite",
            contents=f"""
            El usuario preguntó:

            {mensaje}

            La herramienta {llamada.name} devolvió este resultado:

            {resultado}

            Responde utilizando únicamente la información disponible.

            Devuelve únicamente un JSON válido con esta estructura:

            {{
                "type": "text",
                "title": "Respuesta financiera",
                "content": "respuesta clara para el usuario",
                "data": {{}}
            }}

            Reglas:
            - No inventes información.
            - No agregues datos que no estén en el resultado de la herramienta.
            - El campo "content" debe contener la respuesta que verá directamente el usuario.
            - El campo "data" debe contener los datos estructurados relevantes obtenidos de la herramienta.
            - Si la herramienta devuelve cantidades financieras, inclúyelas en "data".
            - Si no hay datos estructurados relevantes, utiliza "data": {{}}.
            - No utilices Markdown fuera del campo "content".
            """,
            config={
                "response_mime_type": "application/json",
                "response_schema": A2UIResponse
            }
        )

        return respuesta_final.parsed

    return respuesta.text

@app.get("/probar-gemini-contexto/{user_id}")
def probar_gemini_contexto(user_id: int):

    contexto = construir_contexto_usuario(user_id)

    respuesta = preguntar_a_gemini(
        "¿En qué categorías estoy gastando más dinero?",
        contexto
    )

    return {
        "respuesta": respuesta
    }

@app.get("/probar-gemini")
def probar_gemini_endpoint():
    return {
        "respuesta": probar_gemini()
    }

# -------------------------
# Endpoint principal
# -------------------------
def obtener_usuario(user_id):
    
    conexion = obtener_conexion_db()
    cursor = conexion.cursor()

    cursor.execute(
        """
        SELECT usuario_id, nombre, ocupacion, ciudad
        FROM dbo.Usuarios
        WHERE usuario_id = ?
        """,
        user_id
    )

    usuario = cursor.fetchone()

    cursor.close()
    conexion.close()

    return usuario

def obtener_cuentas(user_id):

    conexion = obtener_conexion_db()
    cursor = conexion.cursor()

    cursor.execute(
        """
        SELECT
            c.cuenta_id,
            c.tipo,
            c.nombre,
            c.moneda,
            c.saldo,
            c.saldo_disponible
        FROM dbo.Productos p
        INNER JOIN dbo.Cuentas c
            ON c.producto_id = p.producto_id
        WHERE p.usuario_id = ?
        """,
        user_id
    )

    cuentas = cursor.fetchall()

    cursor.close()
    conexion.close()

    return cuentas

def obtener_ingresos(user_id):

    conexion = obtener_conexion_db()
    cursor = conexion.cursor()

    cursor.execute(
        """
        SELECT
            ingreso_id,
            fecha,
            monto,
            fuente,
            frecuencia,
            naturaleza
        FROM dbo.Ingresos
        WHERE usuario_id = ?
        ORDER BY fecha DESC
        """,
        user_id
    )

    ingresos = cursor.fetchall()

    cursor.close()
    conexion.close()

    return ingresos

def obtener_transacciones(user_id):

    conexion = obtener_conexion_db()
    cursor = conexion.cursor()

    cursor.execute(
        """
        SELECT
            t.transaccion_id,
            t.producto_id,
            t.fecha,
            t.monto,
            t.tipo,
            t.comercio,
            t.categoria,
            t.descripcion,
            t.moneda,
            t.estado,
            t.ubicacion
        FROM dbo.Transacciones t
        INNER JOIN dbo.Productos p
            ON p.producto_id = t.producto_id
        WHERE p.usuario_id = ?
        ORDER BY t.fecha DESC
        """,
        user_id
    )

    transacciones = cursor.fetchall()

    cursor.close()
    conexion.close()

    return transacciones

def calcular_resumen_financiero(cuentas, ingresos, transacciones):

    saldo_total = sum(
        float(cuenta.saldo_disponible)
        for cuenta in cuentas
    )

    ingresos_totales = sum(
        float(ingreso.monto)
        for ingreso in ingresos
    )

    gastos_por_categoria = {}

    for transaccion in transacciones:

        if transaccion.tipo == "Cargo":

            categoria = transaccion.categoria
            monto = float(transaccion.monto)

            if categoria not in gastos_por_categoria:
                gastos_por_categoria[categoria] = 0

            gastos_por_categoria[categoria] += monto

    return {
        "saldo_total_disponible": saldo_total,
        "ingresos_totales": ingresos_totales,
        "numero_transacciones": len(transacciones),
        "gastos_por_categoria": gastos_por_categoria
    }
    
def consultar_saldo(user_id):
    cuentas = obtener_cuentas(user_id)

    saldo_total = sum(
        float(cuenta.saldo_disponible)
        for cuenta in cuentas
    )

    return {
        "saldo_total_disponible": saldo_total
    }

def consultar_gastos(user_id):

    transacciones = obtener_transacciones(user_id)

    gastos_por_categoria = {}

    for transaccion in transacciones:

        if transaccion.tipo == "Cargo":

            categoria = transaccion.categoria
            monto = float(transaccion.monto)

            if categoria not in gastos_por_categoria:
                gastos_por_categoria[categoria] = 0

            gastos_por_categoria[categoria] += monto

    return {
        "gastos_por_categoria": gastos_por_categoria
    }
    
def obtener_resumen_financiero(user_id):

    cuentas = obtener_cuentas(user_id)
    ingresos = obtener_ingresos(user_id)
    transacciones = obtener_transacciones(user_id)

    saldo_total = sum(
        float(cuenta.saldo_disponible)
        for cuenta in cuentas
    )

    ingresos_totales = sum(
        float(ingreso.monto)
        for ingreso in ingresos
    )

    gastos_por_categoria = {}

    for transaccion in transacciones:

        if transaccion.tipo == "Cargo":

            categoria = transaccion.categoria
            monto = float(transaccion.monto)

            if categoria not in gastos_por_categoria:
                gastos_por_categoria[categoria] = 0

            gastos_por_categoria[categoria] += monto

    return {
        "saldo_total_disponible": saldo_total,
        "ingresos_totales": ingresos_totales,
        "gastos_por_categoria": gastos_por_categoria,
        "numero_transacciones": len(transacciones)
    }

def consultar_saldo(user_id):

    cuentas = obtener_cuentas(user_id)

    saldo_total = sum(
        float(cuenta.saldo_disponible)
        for cuenta in cuentas
    )

    return {
        "saldo_total_disponible": saldo_total
    }
    
herramienta_consultar_saldo = {
    "name": "consultar_saldo",
    "description": "Consulta el saldo total disponible de las cuentas del usuario.",
    "parameters": {
        "type": "object",
        "properties": {
            "user_id": {
                "type": "integer",
                "description": "ID del usuario"
            }
        },
        "required": ["user_id"]
    }
}

herramienta_consultar_gastos = {
    "name": "consultar_gastos",
    "description": "Consulta los gastos del usuario agrupados por categoría.",
    "parameters": {
        "type": "object",
        "properties": {
            "user_id": {
                "type": "integer",
                "description": "ID del usuario"
            }
        },
        "required": ["user_id"]
    }
}

herramienta_obtener_resumen = {
    "name": "obtener_resumen_financiero",
    "description": "Obtiene un resumen financiero del usuario con saldo, ingresos, gastos y número de transacciones.",
    "parameters": {
        "type": "object",
        "properties": {
            "user_id": {
                "type": "integer",
                "description": "ID del usuario"
            }
        },
        "required": ["user_id"]
    }
}

def obtener_objetivos(user_id):

    conexion = obtener_conexion_db()
    cursor = conexion.cursor()

    cursor.execute(
        """
        SELECT
            objetivo_id,
            tipo_objetivo,
            nombre,
            cantidad_objetivo,
            cantidad_actual,
            fecha_objetivo,
            prioridad,
            estado
        FROM dbo.ObjetivosFinancieros
        WHERE usuario_id = ?
        """,
        user_id
    )

    objetivos = cursor.fetchall()

    cursor.close()
    conexion.close()

    return objetivos

def obtener_preferencias(user_id):

    conexion = obtener_conexion_db()
    cursor = conexion.cursor()

    cursor.execute(
        """
        SELECT
            preferencia_id,
            preferencia_ahorro,
            preferencia_inversion,
            preferencia_productos,
            preferencia_riesgo
        FROM dbo.PreferenciasDeclaradas
        WHERE usuario_id = ?
        """,
        user_id
    )

    preferencias = cursor.fetchall()

    cursor.close()
    conexion.close()

    return preferencias

def construir_contexto_usuario(user_id):

    usuario = obtener_usuario(user_id)
    cuentas = obtener_cuentas(user_id)
    ingresos = obtener_ingresos(user_id)
    objetivos = obtener_objetivos(user_id)
    preferencias = obtener_preferencias(user_id)
    transacciones = obtener_transacciones(user_id)
    contexto = obtener_contexto_interaccion(user_id)

    resumen = calcular_resumen_financiero(
        cuentas,
        ingresos,
        transacciones
    )

    return {
        "usuario": {
            "nombre": usuario.nombre,
            "ocupacion": usuario.ocupacion,
            "ciudad": usuario.ciudad
        },
        "ingresos": [
            {
                "fecha": str(ingreso.fecha),
                "monto": float(ingreso.monto),
                "fuente": ingreso.fuente,
                "frecuencia": ingreso.frecuencia,
                "naturaleza": ingreso.naturaleza
            }
            for ingreso in ingresos
        ],

        "transacciones": [
            {
                "fecha": str(transaccion.fecha),
                "monto": float(transaccion.monto),
                "tipo": transaccion.tipo,
                "comercio": transaccion.comercio,
                "categoria": transaccion.categoria,
                "descripcion": transaccion.descripcion,
                "moneda": transaccion.moneda,
                "estado": transaccion.estado
            }
            for transaccion in transacciones
        ],

        "resumen_financiero": resumen,

        "cuentas": [
            {
                "cuenta_id": cuenta.cuenta_id,
                "tipo": cuenta.tipo,
                "nombre": cuenta.nombre,
                "moneda": cuenta.moneda,
                "saldo": float(cuenta.saldo),
                "saldo_disponible": float(cuenta.saldo_disponible)
            }
            for cuenta in cuentas
        ],

        "objetivos": [
            {
                "objetivo_id": objetivo.objetivo_id,
                "tipo_objetivo": objetivo.tipo_objetivo,
                "nombre": objetivo.nombre,
                "cantidad_objetivo": float(objetivo.cantidad_objetivo),
                "cantidad_actual": float(objetivo.cantidad_actual),
                "fecha_objetivo": str(objetivo.fecha_objetivo),
                "prioridad": objetivo.prioridad,
                "estado": objetivo.estado
            }
            for objetivo in objetivos
        ],

        "preferencias": [
            {
                "preferencia_ahorro": preferencia.preferencia_ahorro,
                "preferencia_inversion": preferencia.preferencia_inversion,
                "preferencia_productos": preferencia.preferencia_productos,
                "preferencia_riesgo": preferencia.preferencia_riesgo
            }
            for preferencia in preferencias
        ],

        "contexto_interaccion": [
            {
                "pantalla_actual": item.pantalla_actual,
                "producto_seleccionado": item.producto_seleccionado,
                "cuenta_seleccionada": item.cuenta_seleccionada,
                "periodo_seleccionado": item.periodo_seleccionado,
                "ultima_accion": item.ultima_accion,
                "tarea_actual": item.tarea_actual,
                "intencion_actual": item.intencion_actual,
                "componentes_visibles": item.componentes_visibles,
                "estado_actual_ui": item.estado_actual_ui
            }
            for item in contexto
        ]
    }

def obtener_contexto_interaccion(user_id):
    conexion = obtener_conexion_db()
    cursor = conexion.cursor()

    cursor.execute(
        """
        SELECT
            contexto_id,
            sesion_id,
            fecha_hora,
            pantalla_actual,
            producto_seleccionado,
            cuenta_seleccionada,
            tarjeta_seleccionada,
            periodo_seleccionado,
            filtros_activos,
            ultima_accion,
            interaccion_anterior_relevante,
            tarea_actual,
            intencion_actual,
            componentes_visibles,
            estado_actual_ui
        FROM dbo.ContextoInteraccion
        WHERE usuario_id = ?
        ORDER BY fecha_hora DESC
        """,
        user_id
    )

    contexto = cursor.fetchall()

    cursor.close()
    conexion.close()

    return contexto

@app.post("/chat")
def chat(request: ChatRequest):

    usuario = obtener_usuario(request.user_id)

    if usuario is None:
        return {"error": "Usuario no encontrado"}

    contexto = construir_contexto_usuario(request.user_id)

    respuesta = preguntar_a_gemini(
        request.message,
        contexto
    )

    return {
        "user_id": request.user_id,
        "mensaje_recibido": request.message,
        "respuesta": respuesta
    }


# -------------------------
# Endpoint de prueba
# -------------------------

@app.get("/")
def inicio():
    return {
        "mensaje": "Backend Banorte funcionando"
    }