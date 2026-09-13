import os
import sqlalchemy
from dotenv import load_dotenv
from google.cloud.sql.connector import Connector
import atexit

# Inicializamos el conector de Google Cloud
connector = Connector()

# Extraemos el nombre de la instancia desde el .env o lo ponemos directo (como mostraste)
INSTANCE_CONNECTION_NAME = "t-cogency-435402-c6:us-central1:reto-banorte-db" # Asegúrate de que termine con la región y nombre correctos

def get_connection():
    return connector.connect(
        INSTANCE_CONNECTION_NAME,
        "pytds",
        user=os.environ.get("DB_USER"),
        password=os.environ.get("DB_PASSWORD"),
        db=os.environ.get("DB_NAME"),
    )

# Creamos el motor (Engine) que las herramientas MCP usarán
engine = sqlalchemy.create_engine(
    "mssql+pytds://",
    creator=get_connection
)


load_dotenv()

INSTANCE_CONNECTION_NAME = os.getenv("INSTANCE_CONNECTION_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME")

connector = Connector(refresh_strategy="LAZY")


def get_connection():
    return connector.connect(
        INSTANCE_CONNECTION_NAME,
        "pytds",
        user=DB_USER,
        password=DB_PASSWORD,
        db=DB_NAME,
    )


engine = sqlalchemy.create_engine(
    "mssql+pytds://",
    creator=get_connection,
    pool_pre_ping=True,
)


atexit.register(connector.close)
