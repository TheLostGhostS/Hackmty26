import sqlalchemy
from app.db.database import engine
from app.services.session import get_current_user

def _uid():
    return get_current_user()

def consultar_saldo_tarjeta() -> dict:
    uid = _uid()
    with engine.connect() as conn:
        sql = sqlalchemy.text("""
            SELECT tc.saldo_utilizado, tc.tasa_interes
            FROM dbo.TarjetasCredito tc
            JOIN dbo.Productos p ON tc.producto_id = p.producto_id
            WHERE p.usuario_id = :uid AND p.tipo = 'Tarjeta de Crédito'
        """)
        resultado = conn.execute(sql, {"uid": uid}).fetchone()
        return dict(resultado._mapping) if resultado else {"error": "Tarjeta no encontrada."}

def aplicar_plan_reestructura(meses: int) -> dict:
    uid = _uid()
    try:
        with engine.begin() as conn:
            conn.execute(sqlalchemy.text("""
                UPDATE tc
                SET tc.saldo_utilizado = 0.0
                FROM dbo.TarjetasCredito tc
                JOIN dbo.Productos p ON tc.producto_id = p.producto_id
                WHERE p.usuario_id = :uid AND p.tipo = 'Tarjeta de Crédito'
            """), {"uid": uid})
        return {"status": "éxito", "mensaje": f"La deuda ha sido reestructurada a {meses} meses."}
    except Exception as e:
        return {"status": "error", "mensaje": str(e)}

def _serializar(row):
    if not row:
        return {}
    d = dict(row._mapping)
    for k, v in d.items():
        if type(v).__name__ == "Decimal":
            d[k] = float(v)
        elif hasattr(v, "isoformat"):
            d[k] = v.isoformat()
    return d

def obtener_resumen_financiero() -> dict:
    uid = _uid()
    with engine.connect() as conn:
        res_usuario = conn.execute(sqlalchemy.text("""
            SELECT nombre, fecha_nacimiento, ocupacion, ciudad, region, estado_civil, dependientes_economicos
            FROM dbo.Usuarios WHERE usuario_id = :uid
        """), {"uid": uid}).fetchone()

        res_macro = conn.execute(sqlalchemy.text("""
            SELECT 
                ISNULL((SELECT SUM(monto) FROM dbo.Ingresos WHERE usuario_id = :uid), 0) AS ingresos_totales,
                ISNULL((SELECT SUM(monto) FROM dbo.PagosObligaciones WHERE usuario_id = :uid), 0) AS gastos_obligaciones_totales
        """), {"uid": uid}).fetchone()

        res_cuentas = conn.execute(sqlalchemy.text("""
            SELECT c.tipo, c.nombre, c.moneda, c.saldo, c.saldo_disponible
            FROM dbo.Cuentas c
            JOIN dbo.Productos p ON c.producto_id = p.producto_id
            WHERE p.usuario_id = :uid AND p.estado = 'Activo'
        """), {"uid": uid}).fetchall()

        res_tc = conn.execute(sqlalchemy.text("""
            SELECT tc.tipo, p.nombre, tc.limite_credito, tc.credito_disponible,
                   tc.saldo_utilizado, tc.pago_minimo, tc.tasa_interes, tc.fecha_corte, tc.fecha_pago
            FROM dbo.TarjetasCredito tc
            JOIN dbo.Productos p ON tc.producto_id = p.producto_id
            WHERE p.usuario_id = :uid AND tc.estado = 'Activo'
        """), {"uid": uid}).fetchall()

        res_inv = conn.execute(sqlalchemy.text("""
            SELECT inv.tipo_instrumento, p.nombre, inv.monto_invertido, inv.valor_actual,
                   inv.rendimiento, inv.liquidez
            FROM dbo.Inversiones inv
            JOIN dbo.Productos p ON inv.producto_id = p.producto_id
            WHERE p.usuario_id = :uid AND inv.estado = 'Activo'
        """), {"uid": uid}).fetchall()

        res_creditos = conn.execute(sqlalchemy.text("""
            SELECT cr.tipo, p.nombre, cr.monto_original, cr.saldo_pendiente,
                   cr.pago_mensual, cr.tasa, cr.plazo, cr.pagos_restantes
            FROM dbo.Creditos cr
            JOIN dbo.Productos p ON cr.producto_id = p.producto_id
            WHERE p.usuario_id = :uid AND cr.estado = 'Activo'
        """), {"uid": uid}).fetchall()

        res_objetivos = conn.execute(sqlalchemy.text("""
            SELECT tipo_objetivo, nombre, cantidad_objetivo, cantidad_actual, prioridad, estado
            FROM dbo.ObjetivosFinancieros WHERE usuario_id = :uid
        """), {"uid": uid}).fetchall()

        res_prefs = conn.execute(sqlalchemy.text("""
            SELECT preferencia_ahorro, preferencia_inversion, preferencia_riesgo
            FROM dbo.PreferenciasDeclaradas WHERE usuario_id = :uid
        """), {"uid": uid}).fetchone()

    data = {
        "perfil_demografico": _serializar(res_usuario),
        "resumen_macro": _serializar(res_macro),
        "cuentas_debito": [_serializar(r) for r in res_cuentas],
        "tarjetas_credito": [_serializar(r) for r in res_tc],
        "inversiones": [_serializar(r) for r in res_inv],
        "creditos_activos": [_serializar(r) for r in res_creditos],
        "objetivos": [_serializar(r) for r in res_objetivos],
        "preferencias": _serializar(res_prefs),
    }
    macro = data["resumen_macro"]
    data["dinero_libre_mensual_calculado_mxn"] = (
        macro.get("ingresos_totales", 0.0) - macro.get("gastos_obligaciones_totales", 0.0)
    )
    return data

def simular_pago_deuda(pago_mensual: float) -> dict:
    tarjeta = consultar_saldo_tarjeta()
    if "error" in tarjeta:
        return tarjeta
    saldo = float(tarjeta["saldo_utilizado"])
    tasa_mensual = (float(tarjeta["tasa_interes"]) / 100) / 12
    interes_primer_mes = saldo * tasa_mensual
    if pago_mensual <= interes_primer_mes:
        return {"error": "El pago es tan bajo que la deuda crecerá indefinidamente."}

    meses = 0
    interes_total = 0.0
    saldo_restante = saldo
    while saldo_restante > 0 and meses < 120:
        interes_mes = saldo_restante * tasa_mensual
        interes_total += interes_mes
        saldo_restante = saldo_restante + interes_mes - pago_mensual
        meses += 1

    return {
        "meses_para_liquidar": meses,
        "interes_total_a_pagar": round(interes_total, 2),
        "pago_total_final": round(saldo + interes_total, 2),
    }

def evaluar_costo_oportunidad() -> dict:
    uid = _uid()
    with engine.connect() as conn:
        res_tc = conn.execute(sqlalchemy.text("""
            SELECT tc.saldo_utilizado, tc.tasa_interes
            FROM dbo.TarjetasCredito tc
            JOIN dbo.Productos p ON tc.producto_id = p.producto_id
            WHERE p.usuario_id = :uid
        """), {"uid": uid}).fetchone()

        res_inv = conn.execute(sqlalchemy.text("""
            SELECT inv.valor_actual, inv.rendimiento
            FROM dbo.Inversiones inv
            JOIN dbo.Productos p ON inv.producto_id = p.producto_id
            WHERE p.usuario_id = :uid
        """), {"uid": uid}).fetchone()

    if not res_tc or not res_inv:
        return {"error": "Faltan productos para evaluar el costo de oportunidad."}

    costo = float(res_tc[0]) * (float(res_tc[1]) / 100)
    ganancia = float(res_inv[0]) * (float(res_inv[1]) / 100)
    return {
        "costo_deuda_anual": round(costo, 2),
        "ganancia_inversion_anual": round(ganancia, 2),
        "fuga_detectada": costo > ganancia,
        "diferencia_neta": round(ganancia - costo, 2),
    }

def liquidar_deuda_con_inversion(monto_a_transferir: float) -> dict:
    uid = _uid()
    try:
        with engine.begin() as conn:
            saldo = conn.execute(sqlalchemy.text("""
                SELECT inv.valor_actual
                FROM dbo.Inversiones inv
                JOIN dbo.Productos p ON inv.producto_id = p.producto_id
                WHERE p.usuario_id = :uid
            """), {"uid": uid}).scalar()

            if saldo is None or monto_a_transferir > float(saldo):
                return {"status": "error", "mensaje": "Fondos insuficientes o cuenta no encontrada."}

            conn.execute(sqlalchemy.text("""
                UPDATE inv
                SET inv.valor_actual = inv.valor_actual - :monto
                FROM dbo.Inversiones inv
                JOIN dbo.Productos p ON inv.producto_id = p.producto_id
                WHERE p.usuario_id = :uid
            """), {"monto": monto_a_transferir, "uid": uid})

            conn.execute(sqlalchemy.text("""
                UPDATE tc
                SET tc.saldo_utilizado = tc.saldo_utilizado - :monto
                FROM dbo.TarjetasCredito tc
                JOIN dbo.Productos p ON tc.producto_id = p.producto_id
                WHERE p.usuario_id = :uid
            """), {"monto": monto_a_transferir, "uid": uid})

        return {"status": "éxito", "mensaje": "Rebalanceo ejecutado correctamente en Google Cloud."}
    except Exception as e:
        return {"status": "error", "mensaje": str(e)}
