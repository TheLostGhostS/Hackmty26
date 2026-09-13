import sqlalchemy
from decimal import Decimal
from datetime import date, datetime

from app.db.database import engine
from app import state

# 2. Creamos las herramientas que el LLM podrá usar

def consultar_saldo_tarjeta() -> dict:
    """Útil para obtener el saldo actual y la tasa de interés de la tarjeta de crédito del usuario."""
    print(f"\n[⚙️ MCP EJECUTADO: Consultando tarjeta vía SQLAlchemy para {state.USER_ID_ACTUAL}...]")
    
    with engine.connect() as conn:
        sql = sqlalchemy.text("""
            SELECT tc.saldo_utilizado, tc.tasa_interes 
            FROM dbo.TarjetasCredito tc
            JOIN dbo.Productos p ON tc.producto_id = p.producto_id
            WHERE p.usuario_id = :uid AND p.tipo = 'Tarjeta de Crédito'
        """)
        resultado = conn.execute(sql, {"uid": state.USER_ID_ACTUAL}).fetchone()
        
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
            conn.execute(sql, {"uid": state.USER_ID_ACTUAL})
            
        return {"status": "éxito", "mensaje": f"La deuda ha sido reestructurada a {meses} meses."}
    except Exception as e:
        return {"status": "error", "mensaje": str(e)}

def obtener_resumen_financiero() -> dict:
    """
    ¡OBLIGATORIO! Ejecuta SIEMPRE esta herramienta para obtener TODA la radiografía patrimonial, 
    demográfica, de productos, inversiones, deudas y objetivos del usuario en la base de datos 
    antes de generar cualquier diagnóstico. Si no la usas, estarás mintiendo.
    """
    print(f"\n[⚙️ MCP EJECUTADO: Extrayendo radiografía completa de la BD para el usuario {state.USER_ID_ACTUAL} ...]")
    
    with engine.connect() as conn:
        # 1. Datos Demográficos y Perfil General
        sql_usuario = sqlalchemy.text("""
            SELECT nombre, fecha_nacimiento, ocupacion, ciudad, region, estado_civil, dependientes_economicos
            FROM dbo.Usuarios WHERE usuario_id = :uid
        """)
        res_usuario = conn.execute(sql_usuario, {"uid": state.USER_ID_ACTUAL}).fetchone()
        
        # 2. Resumen Financiero Macro (Ingresos vs Gastos / Obligaciones)
        sql_macro = sqlalchemy.text("""
            SELECT 
                ISNULL((SELECT SUM(monto) FROM dbo.Ingresos WHERE usuario_id = :uid), 0) AS ingresos_totales,
                ISNULL((SELECT SUM(monto) FROM dbo.PagosObligaciones WHERE usuario_id = :uid), 0) AS gastos_obligaciones_totales
        """)
        res_macro = conn.execute(sql_macro, {"uid": state.USER_ID_ACTUAL}).fetchone()

        # 3. Listado de Cuentas de Débito / Efectivo
        sql_cuentas = sqlalchemy.text("""
            SELECT c.tipo, c.nombre, c.moneda, c.saldo, c.saldo_disponible
            FROM dbo.Cuentas c
            JOIN dbo.Productos p ON c.producto_id = p.producto_id
            WHERE p.usuario_id = :uid AND p.estado = 'Activo'
        """)
        res_cuentas = conn.execute(sql_cuentas, {"uid": state.USER_ID_ACTUAL}).fetchall()

        # 4. Listado de Tarjetas de Crédito y Deudas
        sql_tc = sqlalchemy.text("""
            SELECT tc.tipo, p.nombre, tc.limite_credito, tc.credito_disponible, 
                   tc.saldo_utilizado, tc.pago_minimo, tc.tasa_interes, tc.fecha_corte, tc.fecha_pago
            FROM dbo.TarjetasCredito tc
            JOIN dbo.Productos p ON tc.producto_id = p.producto_id
            WHERE p.usuario_id = :uid AND tc.estado = 'Activo'
        """)
        res_tc = conn.execute(sql_tc, {"uid": state.USER_ID_ACTUAL}).fetchall()

        # 5. Listado de Inversiones y Rendimientos
        sql_inv = sqlalchemy.text("""
            SELECT inv.tipo_instrumento, p.nombre, inv.monto_invertido, 
                   inv.valor_actual, inv.rendimiento, inv.liquidez
            FROM dbo.Inversiones inv
            JOIN dbo.Productos p ON inv.producto_id = p.producto_id
            WHERE p.usuario_id = :uid AND inv.estado = 'Activo'
        """)
        res_inv = conn.execute(sql_inv, {"uid": state.USER_ID_ACTUAL}).fetchall()

        # 6. Créditos Activos (Hipotecarios, Automotrices, Personales)
        sql_creditos = sqlalchemy.text("""
            SELECT cr.tipo, p.nombre, cr.monto_original, cr.saldo_pendiente, 
                   cr.pago_mensual, cr.tasa, cr.plazo, cr.pagos_restantes
            FROM dbo.Creditos cr
            JOIN dbo.Productos p ON cr.producto_id = p.producto_id
            WHERE p.usuario_id = :uid AND cr.estado = 'Activo'
        """)
        res_creditos = conn.execute(sql_creditos, {"uid": state.USER_ID_ACTUAL}).fetchall()

        # 7. Objetivos Financieros
        sql_objetivos = sqlalchemy.text("""
            SELECT tipo_objetivo, nombre, cantidad_objetivo, cantidad_actual, prioridad, estado
            FROM dbo.ObjetivosFinancieros WHERE usuario_id = :uid
        """)
        res_objetivos = conn.execute(sql_objetivos, {"uid": state.USER_ID_ACTUAL}).fetchall()

        # 8. Preferencias Declaradas y de Experiencia
        sql_prefs = sqlalchemy.text("""
            SELECT preferencia_ahorro, preferencia_inversion, preferencia_riesgo
            FROM dbo.PreferenciasDeclaradas WHERE usuario_id = :uid
        """)
        res_prefs = conn.execute(sql_prefs, {"uid": state.USER_ID_ACTUAL}).fetchone()

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
        res_tc = conn.execute(sql_tc, {"uid": state.USER_ID_ACTUAL}).fetchone()
        
        # Consulta de Inversión
        sql_inv = sqlalchemy.text("""
            SELECT inv.valor_actual, inv.rendimiento 
            FROM dbo.Inversiones inv JOIN dbo.Productos p ON inv.producto_id = p.producto_id 
            WHERE p.usuario_id = :uid
        """)
        res_inv = conn.execute(sql_inv, {"uid": state.USER_ID_ACTUAL}).fetchone()
        
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
            saldo_inversion = conn.execute(sql_check, {"uid": state.USER_ID_ACTUAL}).scalar()
            
            if saldo_inversion is None or monto_a_transferir > float(saldo_inversion):
                return {"status": "error", "mensaje": "Fondos insuficientes o cuenta no encontrada."}
                
            # 2. Ejecutar resta a la inversión
            sql_inv = sqlalchemy.text("""
                UPDATE inv
                SET inv.valor_actual = inv.valor_actual - :monto 
                FROM dbo.Inversiones inv JOIN dbo.Productos p ON inv.producto_id = p.producto_id
                WHERE p.usuario_id = :uid
            """)
            conn.execute(sql_inv, {"monto": monto_a_transferir, "uid": state.USER_ID_ACTUAL})
            
            # 3. Ejecutar resta a la tarjeta
            sql_tarjeta = sqlalchemy.text("""
                UPDATE tc
                SET tc.saldo_utilizado = tc.saldo_utilizado - :monto 
                FROM dbo.TarjetasCredito tc JOIN dbo.Productos p ON tc.producto_id = p.producto_id
                WHERE p.usuario_id = :uid
            """)
            conn.execute(sql_tarjeta, {"monto": monto_a_transferir, "uid": state.USER_ID_ACTUAL})
            
        return {"status": "éxito", "mensaje": "Rebalanceo ejecutado correctamente en Google Cloud."}
    except Exception as e:
        return {"status": "error", "mensaje": str(e)}

