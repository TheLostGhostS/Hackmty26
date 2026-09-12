import os
import json
from pydantic import BaseModel, Field
from google import genai
from google.genai import types
from dotenv import load_dotenv

class BotonUI(BaseModel):
    texto_boton: str = Field(description="Texto corto y orientado a la acción para el botón.")
    accion_id: str = Field(description="Identificador único de la acción en formato snake_case, ej: 'iniciar_tramite'.")

class ComponenteUI(BaseModel):
    tipo_componente: str = Field(description="Debe ser estrictamente 'tarjeta'.")
    titulo: str = Field(description="Título principal de la interfaz.")
    mensaje: str = Field(description="Mensaje descriptivo que responde a la intención del usuario.")
    boton: BotonUI

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