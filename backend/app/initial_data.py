"""
Script para crear el primer admin y datos iniciales.
Ejecutar una sola vez: python -m app.initial_data
"""
from app.core.database import SessionLocal
from app.core.security import hash_password
from app.core.config import settings
from app.models.user import User
from app.models.program import Program
from app.models.contact_info import ContactInfo
import app.models  # noqa: importa todos los modelos
from app.core.database import Base, engine


def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Crear admin inicial
    admin = db.query(User).filter(User.email == settings.FIRST_ADMIN_EMAIL).first()
    if not admin:
        admin = User(
            username="admin",
            email=settings.FIRST_ADMIN_EMAIL,
            password_hash=hash_password(settings.FIRST_ADMIN_PASSWORD),
            role="admin",
        )
        db.add(admin)
        print(f"Admin creado: {settings.FIRST_ADMIN_EMAIL}")

    # Programas oficiales IESTP Enrique López Albújar (9 carreras)
    programs = [
        {"name": "Administración de Empresas",                                              "faculty": "Administración",        "degree_level": "Técnico", "duration_years": 3},
        {"name": "Contabilidad",                                                             "faculty": "Ciencias Contables",    "degree_level": "Técnico", "duration_years": 3},
        {"name": "Enfermería Técnica",                                                       "faculty": "Salud",                 "degree_level": "Técnico", "duration_years": 3},
        {"name": "Industrias Alimentarias",                                                  "faculty": "Industrias",            "degree_level": "Técnico", "duration_years": 3},
        {"name": "Mecatrónica de Producción Industrial",                                     "faculty": "Mecatrónica",           "degree_level": "Técnico", "duration_years": 3},
        {"name": "Producción Agropecuaria",                                                  "faculty": "Agropecuaria",          "degree_level": "Técnico", "duration_years": 3},
        {"name": "Mecánica Automotriz",                                                      "faculty": "Mecánica",              "degree_level": "Técnico", "duration_years": 3},
        {"name": "Construcción Civil",                                                       "faculty": "Construcción",          "degree_level": "Técnico", "duration_years": 3},
        {"name": "Arquitectura de Plataformas y Servicios de Tecnología de la Información", "faculty": "Tecnología",            "degree_level": "Técnico", "duration_years": 3},
    ]
    for p in programs:
        exists = db.query(Program).filter(Program.name == p["name"]).first()
        if not exists:
            db.add(Program(**p))
            print(f"Programa creado: {p['name']}")

    # Datos de contacto iniciales
    contact_defaults = [
        {"key": "horario",  "label": "Horario de Atención",  "title": "Lunes – Viernes",          "description": "9:00 AM – 5:00 PM"},
        {"key": "direccion","label": "Dirección",             "title": "Pueblo Nuevo",              "description": "Victor Raúl Haya de la Torre #214, Pueblo Nuevo"},
        {"key": "correo",   "label": "Correo Electrónico",    "title": "Escríbenos",                "description": "direccion@iestpela.edu.pe"},
    ]
    for c in contact_defaults:
        exists = db.query(ContactInfo).filter(ContactInfo.key == c["key"]).first()
        if not exists:
            db.add(ContactInfo(**c))
            print(f"Contacto creado: {c['key']}")

    db.commit()
    db.close()
    print("Base de datos inicializada correctamente.")


if __name__ == "__main__":
    init_db()
