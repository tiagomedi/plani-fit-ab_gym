# backend/main.py
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, PageBreak, Spacer
from pypdf import PdfWriter, PdfReader
import io

app = FastAPI()

# --- CONFIGURACIÓN CORS (CRUCIAL PARA LOCALHOST) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # Puerto por defecto de Vite
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- MODELOS ---
class Ejercicio(BaseModel):
    nombre: str
    series: str
    reps: str
    peso: Optional[str] = ""
    intensidad: str
    pausa: str
    tempo: str
    rir: str

class DiaEntrenamiento(BaseModel):
    nombre_dia: str
    grupo_muscular: str
    ejercicios: List[Ejercicio]

class Planificacion(BaseModel):
    nombre_cliente: str
    objetivo: str
    nivel: str
    frecuencia: str
    dias: List[DiaEntrenamiento]

# --- LÓGICA PDF ---
def create_dynamic_pdf(plan: Planificacion, buffer):
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=20, leftMargin=20, topMargin=20, bottomMargin=20)
    elements = []

    for dia in plan.dias:
        # Encabezado
        header_data = [
            ["NOMBRE", plan.nombre_cliente],
            ["OBJETIVO", plan.objetivo],
            ["FRECUENCIA", plan.frecuencia],
            ["NIVEL DE ENTRENAMIENTO", plan.nivel],
            ["EJERCICIO MUSCULAR", dia.grupo_muscular],
            ["DÍAS", dia.nombre_dia]
        ]
        t_header = Table(header_data, colWidths=[160, 350])
        t_header.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.black),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.white),
            ('BACKGROUND', (1, 0), (1, -1), colors.white),
            ('TEXTCOLOR', (1, 0), (1, -1), colors.black),
            ('BOX', (0, 0), (-1, -1), 1, colors.black),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
        ]))
        elements.append(t_header)
        elements.append(Spacer(1, 15))

        # Tabla Ejercicios
        data = [["EJERCICIO", "SERIES", "REP", "PESO", "INTENSIDAD", "PAUSAS", "TEMPO", "RIR"]]
        for ej in dia.ejercicios:
            data.append([ej.nombre, ej.series, ej.reps, ej.peso, ej.intensidad, ej.pausa, ej.tempo, ej.rir])

        # Anchos ajustados
        col_widths = [130, 40, 40, 40, 60, 60, 60, 30]
        t_body = Table(data, colWidths=col_widths)
        t_body.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
            ('FONTSIZE', (0, 0), (-1, -1), 7),
            ('ALIGN', (0, 1), (0, -1), 'LEFT'),
        ]))
        elements.append(t_body)
        elements.append(PageBreak())

    doc.build(elements)

@app.post("/generate-pdf")
async def generate_pdf_endpoint(plan: Planificacion):
    tablas_buffer = io.BytesIO()
    create_dynamic_pdf(plan, tablas_buffer)
    tablas_buffer.seek(0)

    try:
        reader_template = PdfReader("template_static.pdf")
    except FileNotFoundError:
        return Response(content="Error: Falta template_static.pdf en la carpeta backend", status_code=500)

    reader_tablas = PdfReader(tablas_buffer)
    writer = PdfWriter()

    # Copiar páginas del template (1 y 2)
    for i in range(min(2, len(reader_template.pages))):
        writer.add_page(reader_template.pages[i])

    # Agregar tablas generadas
    for page in reader_tablas.pages:
        writer.add_page(page)

    output_buffer = io.BytesIO()
    writer.write(output_buffer)
    return Response(content=output_buffer.getvalue(), media_type="application/pdf")