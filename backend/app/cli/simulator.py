import json
import time
import sqlalchemy

from app import state
from app.db.database import engine
from app.models.ui import (
    TextComponent,
    ButtonComponent,
    SliderComponent,
    DropdownComponent,
    MultiSelectComponent,
    CheckboxComponent,
    ChartComponent,
    UIResponse,
)
from app.services.agent import chat
from app.tools.financial import obtener_resumen_financiero

def simular_frontend():
    print("=== SIMULADOR GENUI + MCP INICIADO ===")
    
    
    while True:
        intento_login = input("\nIngresa tu ID de usuario para iniciar sesión: ").strip()
        
        # Validamos que sea un usuario existente
        if intento_login in ["1", "2", "3", "4"]:
            state.USER_ID_ACTUAL = intento_login
            
            # --- NUEVA LÓGICA DE VERIFICACIÓN ---
            try:
                with engine.connect() as conn:
                    # Se corrige 'user_id' por 'usuario_id'
                    sql_login = sqlalchemy.text("SELECT nombre FROM dbo.Usuarios WHERE usuario_id = :uid")
                    nombre_usuario = conn.execute(sql_login, {"uid": state.USER_ID_ACTUAL}).scalar()
                    
                    if nombre_usuario:
                        print(f"\n[✅] Conexión exitosa. Autenticado como: {nombre_usuario} (ID: {state.USER_ID_ACTUAL})")
                        break
                    else:
                        print(f"\n[⚠️] Autenticado con ID {state.USER_ID_ACTUAL}, pero no se encontró el nombre en la BD.")
                        break
            except Exception as e:
                print(f"\n[❌] Error crítico al contactar SQL Server: {e}")
                continue
            # ------------------------------------
        else:
            print("[❌] ID inválido. Por favor ingresa 1, 2, 3 o 4.")

    print("\nPrueba escribiendo: 'Quiero pagar menos intereses en mi tarjeta'")
    entrada_usuario = input("\n[Usuario] -> ")

    while True:
        try:

            estado_financiero_real = obtener_resumen_financiero() 
            paquete_al_modelo = f"""
            [CONTEXTO DE SISTEMA OBLIGATORIO - ESTADO ACTUAL DE LA BASE DE DATOS]
            {json.dumps(estado_financiero_real)}
            
            [INTENCIÓN DEL USUARIO]
            {entrada_usuario}
            """

            respuesta = chat.send_message(paquete_al_modelo)

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

