import os
import pyodbc
from dotenv import load_dotenv

load_dotenv()

server = os.getenv("DB_HOST")
database = os.getenv("DB_NAME")
username = os.getenv("DB_USER")
password = os.getenv("DB_PASSWORD")

cadena = (
    "DRIVER={ODBC Driver 18 for SQL Server};"
    f"SERVER={server};"
    f"DATABASE={database};"
    f"UID={username};"
    f"PWD={password};"
    "Encrypt=yes;"
    "TrustServerCertificate=yes;"
)

try:
    conexion = pyodbc.connect(cadena, timeout=10)
    cursor = conexion.cursor()

    cursor.execute("""
        SELECT TOP 5
            usuario_id,
            nombre,
            ocupacion,
            ciudad
        FROM dbo.Usuarios
        ORDER BY usuario_id
    """)

    usuarios = cursor.fetchall()

    print("CONEXIÓN EXITOSA")
    print("\nUSUARIOS:\n")

    for usuario in usuarios:
        print(
            f"ID: {usuario.usuario_id} | "
            f"Nombre: {usuario.nombre} | "
            f"Ocupación: {usuario.ocupacion} | "
            f"Ciudad: {usuario.ciudad}"
        )

    conexion.close()

except Exception as e:
    print("ERROR:")
    print(e)