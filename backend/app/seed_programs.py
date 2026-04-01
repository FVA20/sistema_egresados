"""
Script para insertar las carreras del IESTP Enrique López Albújar.
Ejecutar: py -m app.seed_programs
"""
from app.core.database import SessionLocal, Base, engine
from app.models.program import Program
import app.models  # noqa


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    carreras = [
        {"name": "Administración de Empresas",                                        "faculty": "Administración",          "degree_level": "Técnico", "duration_years": 3},
        {"name": "Arquitectura de Plataformas y Servicios de Tecnología de la Información", "faculty": "Tecnología",        "degree_level": "Técnico", "duration_years": 3},
        {"name": "Contabilidad",                                                       "faculty": "Ciencias Contables",      "degree_level": "Técnico", "duration_years": 3},
        {"name": "Construcción Civil",                                                 "faculty": "Ingeniería",              "degree_level": "Técnico", "duration_years": 3},
        {"name": "Enfermería Técnica",                                                 "faculty": "Ciencias de la Salud",    "degree_level": "Técnico", "duration_years": 3},
        {"name": "Industrias Alimentarias",                                            "faculty": "Industrias",              "degree_level": "Técnico", "duration_years": 3},
        {"name": "Mecatrónica de Producción Industrial",                               "faculty": "Ingeniería",              "degree_level": "Técnico", "duration_years": 3},
        {"name": "Producción Agropecuaria",                                            "faculty": "Agropecuaria",            "degree_level": "Técnico", "duration_years": 3},
    ]

    for c in carreras:
        existe = db.query(Program).filter(Program.name == c["name"]).first()
        if not existe:
            db.add(Program(**c))
            print(f"  [+] Agregado: {c['name']}")
        else:
            print(f"  [=] Ya existe: {c['name']}")

    db.commit()
    db.close()
    print("\nListo.")


if __name__ == "__main__":
    seed()
