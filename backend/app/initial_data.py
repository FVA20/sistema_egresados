"""
Script para crear el primer admin y datos iniciales.
Ejecutar una sola vez: python -m app.initial_data
"""
import unicodedata
from app.core.database import SessionLocal
from app.core.security import hash_password
from app.core.config import settings
from app.models.user import User
from app.models.program import Program
from app.models.contact_info import ContactInfo
from app.models.graduate import Graduate
from app.models.workplan import WorkPlan
import app.models  # noqa: importa todos los modelos
from app.core.database import Base, engine


def _norm(s: str) -> str:
    """Normaliza nombre: NFC, sin espacios extra, minúsculas. Evita duplicados por tildes."""
    return unicodedata.normalize('NFC', s.strip().lower())


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

    # ── Eliminar programas duplicados y corregir nombres ──────────────────────
    # Mapa de nombre canónico (con tildes correctas) por nombre normalizado
    canonical_names = {_norm(p["name"]): p["name"] for p in [
        {"name": "Administración de Empresas"},
        {"name": "Contabilidad"},
        {"name": "Enfermería Técnica"},
        {"name": "Industrias Alimentarias"},
        {"name": "Mecatrónica de Producción Industrial"},
        {"name": "Producción Agropecuaria"},
        {"name": "Mecánica Automotriz"},
        {"name": "Construcción Civil"},
        {"name": "Arquitectura de Plataformas y Servicios de Tecnología de la Información"},
    ]}

    all_programs = db.query(Program).order_by(Program.id).all()
    canonical: dict[str, int] = {}   # normalized_name -> canonical_id
    for prog in all_programs:
        norm = _norm(prog.name)
        if norm not in canonical:
            canonical[norm] = prog.id
            # Corregir nombre si tiene error de tilde
            correct_name = canonical_names.get(norm)
            if correct_name and prog.name != correct_name:
                prog.name = correct_name
                print(f"Nombre corregido: '{prog.name}' → '{correct_name}' (id={prog.id})")
        else:
            # Es un duplicado — reasignar egresados y planes antes de borrar
            can_id = canonical[norm]
            db.query(Graduate).filter(Graduate.program_id == prog.id).update(
                {"program_id": can_id}, synchronize_session=False
            )
            db.query(WorkPlan).filter(WorkPlan.program_id == prog.id).update(
                {"program_id": can_id}, synchronize_session=False
            )
            db.delete(prog)
            print(f"Duplicado eliminado: '{prog.name}' (id={prog.id}) → conservado id={can_id}")
    db.flush()

    # ── Programas oficiales IESTP Enrique López Albújar (9 carreras) ──────────
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
    # Comparación normalizada para no depender de tildes o mayúsculas
    existing_norms = {_norm(p.name) for p in db.query(Program).all()}
    for p in programs:
        if _norm(p["name"]) not in existing_norms:
            db.add(Program(**p))
            print(f"Programa creado: {p['name']}")

    # ── Datos de contacto iniciales ────────────────────────────────────────────
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
