import os
import atexit
import sqlalchemy
from dotenv import load_dotenv
from google.cloud.sql.connector import Connector

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
