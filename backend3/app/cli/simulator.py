import time
import sqlalchemy

from app.db.database import engine
from app.models.ui import (
    ButtonComponent, ChartComponent, CheckboxComponent,
    DropdownComponent, MultiSelectComponent, SliderComponent, TextComponent,
)
from app.services.agent import generar_interfaz
from app.services.session import set_current_user

def autenticar_usuario():
    while True:
        uid = input("\nIngresa tu ID de usuario para iniciar sesión: ").strip()
        if uid not in {"1", "2", "3", "4"}:
            print("[❌] ID inválido.")
            continue

        try:
            with engine.connect() as conn:
                nombre = conn.execute(
                    sqlalchemy.text("SELECT nombre FROM dbo.Usuarios WHERE usuario_id = :uid"),
                    {"uid": uid},
                ).scalar()

            if nombre:
                set_current_user(uid)
                print(f"\n[✅] Autenticado como: {nombre} (ID: {uid})")
                return
            print("[⚠️] Usuario no encontrado.")
        except Exception as e:
            print(f"\n[❌] Error SQL Server: {e}")

def renderizar_interfaz(ui):
    print("\n===== JSON GENERADO =====")
    print(ui.model_dump_json(indent=4, exclude_none=True))
    print("\n===== INTERFAZ =====")

    botones = []
    for componente in ui.components:
        if isinstance(componente, TextComponent):
            pref = "# " if componente.variant == "title" else "## " if componente.variant == "subtitle" else ""
            print(f"\n{pref}{componente.text}")
        elif isinstance(componente, ButtonComponent):
            botones.append(componente)
            print(f"\n[{len(botones)}] {componente.label}")
        elif isinstance(componente, SliderComponent):
            print(f"\n{componente.label}: [{componente.min} ----●---- {componente.max}]")
        elif isinstance(componente, DropdownComponent):
            print(f"\n{componente.label}:")
            for i, option in enumerate(componente.options, 1):
                print(f"  {i}. {option.label}")
        elif isinstance(componente, MultiSelectComponent):
            print(f"\n{componente.label}:")
            for i, option in enumerate(componente.options, 1):
                print(f"  [ ] {i}. {option.label}")
        elif isinstance(componente, CheckboxComponent):
            print(f"\n[{'X' if componente.default_checked else ' '}] {componente.label}")
        elif isinstance(componente, ChartComponent):
            print(f"\n📊 {componente.title} ({componente.chart_type})")
    return botones

def simular_frontend():
    print("=== SIMULADOR GENUI + MCP INICIADO ===")
    autenticar_usuario()
    entrada_usuario = input("\n[Usuario] -> ")

    while True:
        try:
            ui = generar_interfaz(entrada_usuario)
            botones = renderizar_interfaz(ui)

            print("\nM = Escribir mensaje")
            print("Q = Salir")
            opcion = input("\n> ").strip()

            if opcion.isdigit():
                idx = int(opcion) - 1
                if 0 <= idx < len(botones):
                    boton = botones[idx]
                    entrada_usuario = (
                        f"[ACCIÓN EJECUTADA: {boton.action}]. "
                        "Ejecuta la acción en el sistema y muéstrame el resultado."
                    )
                else:
                    entrada_usuario = "El usuario se equivocó de botón."
            elif opcion.lower() == "m":
                entrada_usuario = input("\n[Usuario] -> ")
            elif opcion.lower() == "q":
                break
            else:
                entrada_usuario = input("\n[Usuario] -> ")

        except Exception as e:
            if "429" in str(e):
                print("\n[⏳] Límite de API alcanzado. Esperando 15 segundos...")
                time.sleep(15)
                continue
            print(f"\n[❌] Error inesperado: {e}")
            break
