"""
Script de migración: agrega columnas file_name y file_path a work_plans.
Ejecutar UNA SOLA VEZ: py -m app.migrate_add_files
"""
from app.core.database import engine
from sqlalchemy import text


def migrate():
    with engine.connect() as conn:
        # Verificar si las columnas ya existen antes de agregarlas
        result = conn.execute(text("""
            SELECT column_name FROM information_schema.columns
            WHERE table_name = 'work_plans'
            AND column_name IN ('file_name', 'file_path')
        """))
        existing = {row[0] for row in result}

        if 'file_name' not in existing:
            conn.execute(text("ALTER TABLE work_plans ADD COLUMN file_name VARCHAR(300)"))
            print("Columna file_name agregada.")
        else:
            print("Columna file_name ya existe.")

        if 'file_path' not in existing:
            conn.execute(text("ALTER TABLE work_plans ADD COLUMN file_path VARCHAR(400)"))
            print("Columna file_path agregada.")
        else:
            print("Columna file_path ya existe.")

        conn.commit()
        print("Migración completada.")


if __name__ == "__main__":
    migrate()
