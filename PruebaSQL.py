from google.cloud.sql.connector import Connector
import sqlalchemy

INSTANCE_CONNECTION_NAME = "t-cogency-435402-c6:us-central1:bdd-banorte-sql"
DB_USER = "sqlserver"
DB_PASSWORD = "VhKnxmC9z4"
DB_NAME = "BanorteBDD"

connector = Connector()

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
    creator=get_connection
)

with engine.connect() as conn:
    result = conn.execute(
        sqlalchemy.text("SELECT * FROM dbo.Usuarios")
    )

    for row in result:
        print(row)