from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, PageBreak, Spacer, Paragraph
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT
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
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=30, leftMargin=30, topMargin=30, bottomMargin=30)
    elements = []
    
    # Colores personalizados profesionales
    color_primario = colors.HexColor('#DC2626')  # Rojo
    color_secundario = colors.HexColor('#18181B')  # Negro zinc
    color_gris_claro = colors.HexColor('#F4F4F5')  # Gris claro
    color_gris_oscuro = colors.HexColor('#52525B')  # Gris oscuro
    color_texto = colors.HexColor('#27272A')  # Texto oscuro
    
    # Estilos
    styles = getSampleStyleSheet()
    titulo_dia_style = ParagraphStyle(
        'TituloDia',
        parent=styles['Heading1'],
        fontSize=16,
        textColor=color_primario,
        spaceAfter=12,
        fontName='Helvetica-Bold',
        alignment=TA_LEFT
    )
    
    subtitulo_style = ParagraphStyle(
        'Subtitulo',
        parent=styles['Normal'],
        fontSize=11,
        textColor=color_gris_oscuro,
        spaceAfter=20,
        fontName='Helvetica',
        alignment=TA_LEFT
    )

    for idx, dia in enumerate(plan.dias):
        # Título del día con borde decorativo
        titulo_dia = Paragraph(f"<b>{dia.nombre_dia.upper()}</b>", titulo_dia_style)
        elements.append(titulo_dia)
        
        # Subtítulo con grupo muscular
        subtitulo = Paragraph(f"<i>{dia.grupo_muscular}</i>", subtitulo_style)
        elements.append(subtitulo)
        
        # Información del cliente en una tabla compacta y elegante
        info_data = [
            ["ATLETA:", plan.nombre_cliente, "OBJETIVO:", plan.objetivo],
            ["NIVEL:", plan.nivel, "FRECUENCIA:", plan.frecuencia]
        ]
        
        info_table = Table(info_data, colWidths=[60, 180, 70, 180])
        info_table.setStyle(TableStyle([
            # Fondo alternado elegante
            ('BACKGROUND', (0, 0), (0, -1), color_gris_claro),
            ('BACKGROUND', (2, 0), (2, -1), color_gris_claro),
            
            # Texto
            ('TEXTCOLOR', (0, 0), (-1, -1), color_texto),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (2, 0), (2, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTNAME', (3, 0), (3, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            
            # Alineación
            ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
            ('ALIGN', (2, 0), (2, -1), 'RIGHT'),
            ('ALIGN', (1, 0), (1, -1), 'LEFT'),
            ('ALIGN', (3, 0), (3, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            
            # Padding
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            
            # Bordes sutiles
            ('BOX', (0, 0), (-1, -1), 1, color_gris_oscuro),
            ('LINEBELOW', (0, 0), (-1, 0), 1, color_gris_oscuro),
        ]))
        elements.append(info_table)
        elements.append(Spacer(1, 20))

        # Tabla de ejercicios con diseño profesional
        ejercicio_headers = ["EJERCICIO", "SERIES", "REPS", "PESO\n(Kg)", "INTENSIDAD\n(%)", "PAUSA\n(seg)", "TEMPO", "RIR"]
        data = [ejercicio_headers]
        
        for ej in dia.ejercicios:
            data.append([
                ej.nombre,
                ej.series,
                ej.reps,
                ej.peso if ej.peso else "-",
                ej.intensidad,
                ej.pausa,
                ej.tempo,
                ej.rir
            ])

        # Anchos optimizados para mejor legibilidad
        col_widths = [150, 45, 45, 45, 55, 55, 55, 35]
        t_body = Table(data, colWidths=col_widths, repeatRows=1)
        
        t_body.setStyle(TableStyle([
            # Encabezado con diseño impactante
            ('BACKGROUND', (0, 0), (-1, 0), color_primario),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('VALIGN', (0, 0), (-1, 0), 'MIDDLE'),
            
            # Filas de datos con fondo alternado
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, color_gris_claro]),
            
            # Texto del cuerpo
            ('TEXTCOLOR', (0, 1), (-1, -1), color_texto),
            ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),  # Nombre del ejercicio en bold
            ('FONTNAME', (1, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
            
            # Alineación
            ('ALIGN', (0, 1), (0, -1), 'LEFT'),  # Ejercicio a la izquierda
            ('ALIGN', (1, 1), (-1, -1), 'CENTER'),  # Resto centrado
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            
            # Padding para mejor legibilidad
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('RIGHTPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            
            # Bordes profesionales
            ('BOX', (0, 0), (-1, -1), 1.5, color_secundario),
            ('LINEBELOW', (0, 0), (-1, 0), 2, color_secundario),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, color_gris_oscuro),
        ]))
        
        elements.append(t_body)
        
        # Agregar PageBreak solo si no es el último día
        if idx < len(plan.dias) - 1:
            elements.append(PageBreak())

    doc.build(elements)

@app.post("/generate-pdf")
async def generate_pdf_endpoint(plan: Planificacion):
    try:
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
    except Exception as e:
        import traceback
        print(f"ERROR: {str(e)}")
        print(traceback.format_exc())
        return Response(content=f"Error interno: {str(e)}", status_code=500)