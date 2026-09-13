USER_ID_ACTUAL: str | None = None

def set_current_user(user_id: str) -> None:
    global USER_ID_ACTUAL
    USER_ID_ACTUAL = user_id

def get_current_user() -> str:
    if USER_ID_ACTUAL is None:
        raise RuntimeError("No hay un usuario autenticado.")
    return USER_ID_ACTUAL
