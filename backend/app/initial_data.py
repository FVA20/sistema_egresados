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
from app.models.graduate import Graduate
from app.models.employment import EmploymentRecord
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

    # ── Programas oficiales IESTP Enrique López Albújar (9 carreras) ──────────
    # Solo se crean si la tabla está completamente vacía (primera ejecución).
    # En reinicios posteriores NO se toca nada para evitar duplicados.
    if db.query(Program).count() == 0:
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

    # ── Egresados de ejemplo (solo en BD vacía) ───────────────────────────────
    if db.query(Graduate).count() == 0 and db.query(Program).count() > 0:
        progs = {p.name: p.id for p in db.query(Program).all()}

        sample = [
            Graduate(first_name="Ana",     last_name="Garcia Lopez",      document_number="71234567", email="ana.garcia@gmail.com",       phone="987654321", program_id=progs.get("Administración de Empresas"),                                                              graduation_year=2022, enrollment_year=2019),
            Graduate(first_name="Carlos",  last_name="Mendoza Rios",      document_number="72345678", email="c.mendoza@gmail.com",         phone="976543210", program_id=progs.get("Contabilidad"),                                                                           graduation_year=2022, enrollment_year=2019),
            Graduate(first_name="Maria",   last_name="Flores Sanchez",    document_number="73456789", email="maria.flores@gmail.com",      phone="965432109", program_id=progs.get("Enfermería Técnica"),                                                                     graduation_year=2023, enrollment_year=2020),
            Graduate(first_name="Juan",    last_name="Perez Torres",      document_number="74567890", email="juan.perez@gmail.com",        phone="954321098", program_id=progs.get("Industrias Alimentarias"),                                                               graduation_year=2023, enrollment_year=2020),
            Graduate(first_name="Rosa",    last_name="Diaz Vargas",       document_number="75678901", email="rosa.diaz@gmail.com",         phone="943210987", program_id=progs.get("Mecatrónica de Producción Industrial"),                                                   graduation_year=2021, enrollment_year=2018),
            Graduate(first_name="Luis",    last_name="Ramirez Cruz",      document_number="76789012", email="luis.ramirez@gmail.com",      phone="932109876", program_id=progs.get("Producción Agropecuaria"),                                                               graduation_year=2023, enrollment_year=2020),
            Graduate(first_name="Carmen",  last_name="Silva Vega",        document_number="77890123", email="carmen.silva@gmail.com",      phone="921098765", program_id=progs.get("Mecánica Automotriz"),                                                                   graduation_year=2022, enrollment_year=2019),
            Graduate(first_name="Miguel",  last_name="Castillo Huaman",   document_number="78901234", email="miguel.castillo@gmail.com",   phone="910987654", program_id=progs.get("Construcción Civil"),                                                                    graduation_year=2021, enrollment_year=2018),
            Graduate(first_name="Elena",   last_name="Torres Quispe",     document_number="79012345", email="elena.torres@gmail.com",      phone="909876543", program_id=progs.get("Arquitectura de Plataformas y Servicios de Tecnología de la Información"),               graduation_year=2023, enrollment_year=2020),
            Graduate(first_name="Pedro",   last_name="Lozano Chavez",     document_number="71122334", email="pedro.lozano@gmail.com",      phone="998877665", program_id=progs.get("Administración de Empresas"),                                                            graduation_year=2024, enrollment_year=2021),
            Graduate(first_name="Sofia",   last_name="Huanca Morales",    document_number="72233445", email="sofia.huanca@gmail.com",      phone="997766554", program_id=progs.get("Contabilidad"),                                                                          graduation_year=2023, enrollment_year=2020),
            Graduate(first_name="Diego",   last_name="Villanueva Puma",   document_number="73344556", email="diego.villanueva@gmail.com",  phone="996655443", program_id=progs.get("Arquitectura de Plataformas y Servicios de Tecnología de la Información"),               graduation_year=2024, enrollment_year=2021),
        ]
        for g in sample:
            if g.program_id:
                db.add(g)
        db.flush()  # asigna IDs antes de crear registros laborales

        employment_data = [
            (sample[0],  "Importaciones del Norte SAC",    "Asistente Administrativo",   "Administración",  True),
            (sample[1],  "Estudio Contable Mendoza",       "Técnico Contable",            "Contabilidad",    True),
            (sample[4],  "Industrias Metalúrgicas SAC",    "Técnico de Producción",       "Industria",       True),
            (sample[6],  "Transportes Chiclayo SRL",       "Técnico Mecánico Automotriz", "Transporte",      True),
            (sample[7],  "Constructora Pacífico SAC",      "Asistente de Obra",           "Construcción",    True),
            (sample[8],  "TechSolutions Perú",             "Soporte Técnico IT",          "Tecnología",      True),
        ]
        from datetime import date
        for grad, company, job_title, sector, is_career in employment_data:
            if grad.id:
                db.add(EmploymentRecord(
                    graduate_id=grad.id,
                    is_employed=True,
                    company_name=company,
                    company_sector=sector,
                    job_title=job_title,
                    is_career_related=is_career,
                    employment_type="Full-time",
                    location_city="Chiclayo",
                    location_country="Perú",
                    start_date=date(2022, 6, 1),
                    is_current=True,
                ))
        print(f"Egresados de ejemplo creados: {len([g for g in sample if g.program_id])}")

    db.commit()
    db.close()
    print("Base de datos inicializada correctamente.")


if __name__ == "__main__":
    init_db()
