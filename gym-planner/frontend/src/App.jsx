// frontend/src/App.jsx
import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PDFDocument } from 'pdf-lib';

// --- Estilos Reutilizables ---
const inputDarkStyle = "w-full bg-zinc-900 border border-zinc-800 text-zinc-100 px-3 py-2 rounded focus:outline-none focus:border-red-500 placeholder-zinc-500";
const labelStyle = "block text-zinc-400 text-xs font-medium mb-1.5";

// --- Subcomponente para la Tabla de Ejercicios ---
function EjerciciosFieldArray({ nestIndex, control, register }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `dias.${nestIndex}.ejercicios`
  });

  return (
    <div className="overflow-x-auto mt-4 bg-zinc-900 rounded-lg border border-zinc-800">
      <table className="min-w-full text-xs text-left text-zinc-300">
        <thead className="bg-zinc-800/50 border-b border-zinc-800">
          <tr>
            <th className="px-3 py-3 text-left font-medium text-zinc-300">Ejercicio</th>
            <th className="px-2 py-3 text-center font-medium text-zinc-300 w-16">Series</th>
            <th className="px-2 py-3 text-center font-medium text-zinc-300 w-16">Reps</th>
            <th className="px-2 py-3 text-center font-medium text-zinc-300 w-20">Peso</th>
            <th className="px-2 py-3 text-center font-medium text-zinc-300 w-24">Intensidad</th>
            <th className="px-2 py-3 text-center font-medium text-zinc-300 w-20">Pausa</th>
            <th className="px-2 py-3 text-center font-medium text-zinc-300 w-20">Tempo</th>
            <th className="px-2 py-3 text-center font-medium text-zinc-300 w-14">RIR</th>
            <th className="px-2 py-3 w-12"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {fields.map((item, k) => (
            <tr key={item.id} className="hover:bg-zinc-800/30 transition-colors">
              <td className="px-3 py-2"><input {...register(`dias.${nestIndex}.ejercicios.${k}.nombre`)} className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 px-2 py-1.5 rounded focus:outline-none focus:border-red-500 placeholder-zinc-500 text-xs" placeholder="Ej: Press Banca" /></td>
              <td className="px-2 py-2"><input {...register(`dias.${nestIndex}.ejercicios.${k}.series`)} className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 px-2 py-1.5 rounded focus:outline-none focus:border-red-500 placeholder-zinc-500 text-center text-xs" placeholder="4" /></td>
              <td className="px-2 py-2"><input {...register(`dias.${nestIndex}.ejercicios.${k}.reps`)} className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 px-2 py-1.5 rounded focus:outline-none focus:border-red-500 placeholder-zinc-500 text-center text-xs" placeholder="12" /></td>
              <td className="px-2 py-2"><input {...register(`dias.${nestIndex}.ejercicios.${k}.peso`)} className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 px-2 py-1.5 rounded focus:outline-none focus:border-red-500 placeholder-zinc-500 text-center text-xs" placeholder="Kg" /></td>
              <td className="px-2 py-2"><input {...register(`dias.${nestIndex}.ejercicios.${k}.intensidad`)} className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 px-2 py-1.5 rounded focus:outline-none focus:border-red-500 placeholder-zinc-500 text-center text-xs" placeholder="80%" /></td>
              <td className="px-2 py-2"><input {...register(`dias.${nestIndex}.ejercicios.${k}.pausa`)} className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 px-2 py-1.5 rounded focus:outline-none focus:border-red-500 placeholder-zinc-500 text-center text-xs" placeholder="140s" /></td>
              <td className="px-2 py-2"><input {...register(`dias.${nestIndex}.ejercicios.${k}.tempo`)} className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 px-2 py-1.5 rounded focus:outline-none focus:border-red-500 placeholder-zinc-500 text-center text-xs" placeholder="2s" /></td>
              <td className="px-2 py-2"><input {...register(`dias.${nestIndex}.ejercicios.${k}.rir`)} className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 px-2 py-1.5 rounded focus:outline-none focus:border-red-500 placeholder-zinc-500 text-center text-xs" placeholder="2" /></td>
              <td className="px-2 py-2 text-center">
                <button type="button" onClick={() => remove(k)} className="text-zinc-500 hover:text-red-500 transition-colors p-1 rounded">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="p-3 border-t border-zinc-800">
        <button
            type="button"
            onClick={() => append({ nombre: '', series: '', reps: '', peso: '', intensidad: '', pausa: '', tempo: '', rir: '' })}
            className="w-full flex items-center justify-center gap-2 text-sm text-zinc-300 hover:text-white transition-colors px-4 py-2 rounded border border-zinc-800 hover:bg-zinc-800/50"
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Añadir Ejercicio
        </button>
      </div>
    </div>
  );
}

// --- Generación de PDF en el cliente ---
async function generarPDF(plan) {
  // Colores (RGB)
  const RED = [220, 38, 38];
  const DARK = [24, 24, 27];
  const GRAY_LIGHT = [244, 244, 245];
  const GRAY_DARK = [82, 82, 91];
  const TEXT = [39, 39, 42];
  const WHITE = [255, 255, 255];

  const tablasPdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  plan.dias.forEach((dia, idx) => {
    if (idx > 0) tablasPdf.addPage();

    let y = 20;

    // Título del día
    tablasPdf.setFont('helvetica', 'bold');
    tablasPdf.setFontSize(16);
    tablasPdf.setTextColor(...RED);
    tablasPdf.text(dia.nombre_dia.toUpperCase(), 15, y);
    y += 8;

    // Subtítulo grupo muscular
    tablasPdf.setFont('helvetica', 'italic');
    tablasPdf.setFontSize(11);
    tablasPdf.setTextColor(...GRAY_DARK);
    tablasPdf.text(dia.grupo_muscular || '', 15, y);
    y += 10;

    // Tabla de info del atleta
    autoTable(tablasPdf, {
      startY: y,
      body: [
        ['ATLETA:', plan.nombre_cliente, 'OBJETIVO:', plan.objetivo],
        ['NIVEL:', plan.nivel, 'FRECUENCIA:', plan.frecuencia],
      ],
      columnStyles: {
        0: { fontStyle: 'bold', halign: 'right', fillColor: GRAY_LIGHT, textColor: TEXT, cellWidth: 25 },
        1: { halign: 'left', textColor: TEXT, cellWidth: 70 },
        2: { fontStyle: 'bold', halign: 'right', fillColor: GRAY_LIGHT, textColor: TEXT, cellWidth: 28 },
        3: { halign: 'left', textColor: TEXT, cellWidth: 70 },
      },
      styles: { fontSize: 9, cellPadding: 3 },
      theme: 'plain',
      tableLineColor: GRAY_DARK,
      tableLineWidth: 0.3,
    });

    y = tablasPdf.lastAutoTable.finalY + 8;

    // Tabla de ejercicios
    const headers = [['EJERCICIO', 'SERIES', 'REPS', 'PESO (Kg)', 'INTENSIDAD (%)', 'PAUSA (seg)', 'TEMPO', 'RIR']];
    const rows = dia.ejercicios.map(ej => [
      ej.nombre,
      ej.series,
      ej.reps,
      ej.peso || '-',
      ej.intensidad,
      ej.pausa,
      ej.tempo,
      ej.rir,
    ]);

    autoTable(tablasPdf, {
      startY: y,
      head: headers,
      body: rows,
      headStyles: {
        fillColor: RED,
        textColor: WHITE,
        fontStyle: 'bold',
        fontSize: 9,
        halign: 'center',
        valign: 'middle',
      },
      bodyStyles: {
        fontSize: 8,
        textColor: TEXT,
        valign: 'middle',
      },
      alternateRowStyles: { fillColor: GRAY_LIGHT },
      columnStyles: {
        0: { fontStyle: 'bold', halign: 'left', cellWidth: 55 },
        1: { halign: 'center', cellWidth: 17 },
        2: { halign: 'center', cellWidth: 14 },
        3: { halign: 'center', cellWidth: 18 },
        4: { halign: 'center', cellWidth: 23 },
        5: { halign: 'center', cellWidth: 21 },
        6: { halign: 'center', cellWidth: 21 },
        7: { halign: 'center', cellWidth: 12 },
      },
      tableLineColor: DARK,
      tableLineWidth: 0.4,
      styles: { cellPadding: { top: 3, bottom: 3, left: 2, right: 2 } },
      theme: 'grid',
    });
  });

  // Intentar combinar con template_static.pdf
  try {
    const templateRes = await fetch('/template_static.pdf');
    if (!templateRes.ok) throw new Error('template not found');
    const templateBytes = await templateRes.arrayBuffer();
    const tablasBytes = tablasPdf.output('arraybuffer');

    const mergedDoc = await PDFDocument.create();
    const templateDoc = await PDFDocument.load(templateBytes);
    const tablasDoc = await PDFDocument.load(tablasBytes);

    // Copiar las primeras 2 páginas del template
    const templatePages = templateDoc.getPages();
    const pagesToCopy = Math.min(2, templatePages.length);
    const copiedTemplate = await mergedDoc.copyPages(templateDoc, [...Array(pagesToCopy).keys()]);
    copiedTemplate.forEach(p => mergedDoc.addPage(p));

    // Copiar todas las páginas de tablas
    const tablasPages = tablasDoc.getPageCount();
    const copiedTablas = await mergedDoc.copyPages(tablasDoc, [...Array(tablasPages).keys()]);
    copiedTablas.forEach(p => mergedDoc.addPage(p));

    const finalBytes = await mergedDoc.save();
    return new Blob([finalBytes], { type: 'application/pdf' });
  } catch {
    // Si no hay template, devolver solo las tablas
    const bytes = tablasPdf.output('arraybuffer');
    return new Blob([bytes], { type: 'application/pdf' });
  }
}

// --- Componente Principal ---
export default function App() {
  const { register, control, handleSubmit, watch } = useForm({
    defaultValues: {
      nombre_cliente: '',
      objetivo: 'Hipertrofia',
      nivel: 'Moderado',
      num_dias: '',
      dias: []
    }
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const numDiasSelected = watch('num_dias');
  const { fields, append, remove } = useFieldArray({ control, name: "dias" });

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  React.useEffect(() => {
    const current = fields.length;
    const target = parseInt(numDiasSelected);
    if (current < target) {
      for (let i = current; i < target; i++) append({ nombre_dia: `Día ${i + 1}`, grupo_muscular: '', ejercicios: [{ nombre: '', series: '4', reps: '12', intensidad: '80%', pausa: '140seg', tempo: 'exen2seg', rir: '2' }] });
    } else if (current > target) {
      for (let i = current; i > target; i--) remove(i - 1);
    }
  }, [numDiasSelected, append, remove, fields.length]);

  const onSubmit = async (data) => {
    setIsGenerating(true);
    setErrorMsg(null);

    const plan = {
      nombre_cliente: data.nombre_cliente,
      objetivo: data.objetivo,
      nivel: data.nivel,
      frecuencia: `Frecuencia ${data.num_dias}`,
      dias: data.dias
    };

    try {
      const blob = await generarPDF(plan);
      const url = window.URL.createObjectURL(blob);
      const nombreArchivo = data.nombre_cliente
        ? `planificacion_${data.nombre_cliente.replace(/\s+/g, '_')}.pdf`
        : 'planificacion.pdf';
      const a = document.createElement('a');
      a.href = url;
      a.download = nombreArchivo;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      setErrorMsg({
        title: "Error al generar el PDF",
        body: "Ocurrió un error al generar el PDF. Por favor, intenta de nuevo."
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 text-zinc-200 relative">
      {/* Fondo estático */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: 'url(/fondo.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#09090b'
        }}
      />
      {/* Overlay oscuro para mejorar legibilidad */}
      <div className="fixed inset-0 bg-zinc-950/70 -z-10" />
      <div className="max-w-7xl mx-auto relative z-10">

        {/* HEADER */}
        <header className="mb-8">
            <div className="flex items-center gap-4 pb-6 border-b border-zinc-800">
                <img src="/img.png" alt="AB Gym Logo" className="w-12 h-12 object-contain" />
                <h1 className="text-2xl font-semibold text-zinc-100">
                    Planificación Rutina Profesional
                </h1>
            </div>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

          {/* Panel de Datos */}
          <div className="bg-zinc-900/50 p-6 rounded-lg border border-zinc-800">
            <div className="mb-6">
                <h2 className="text-lg font-medium text-zinc-100">
                    Información del Atleta
                </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className={labelStyle}>Nombre Cliente</label>
                <input {...register("nombre_cliente")} placeholder="Ej: Leónidas" className={inputDarkStyle} required />
              </div>
              <div>
                <label className={labelStyle}>Objetivo Principal</label>
                <input {...register("objetivo")} placeholder="Ej: Hipertrofia" className={inputDarkStyle} />
              </div>
              <div>
                <label className={labelStyle}>Nivel de Experiencia</label>
                <select {...register("nivel")} className={inputDarkStyle}>
                  <option value="Principiante">Principiante</option>
                  <option value="Moderado">Moderado</option>
                  <option value="Avanzado">Avanzado</option>
                  <option value="Élite">Élite</option>
                </select>
              </div>
              <div>
                 <label className={labelStyle}>Frecuencia Semanal</label>
                <select {...register("num_dias")} className={inputDarkStyle}>
                  <option value="">Seleccionar</option>
                  {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} días</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Tarjetas de Días */}
          {fields.length > 0 && (
          <div className="space-y-4">
            {fields.map((dia, index) => (
                <div key={dia.id} className="bg-zinc-900/50 p-6 rounded-lg border border-zinc-800">

                <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <div className="w-full md:w-1/3">
                        <label className={labelStyle}>Día de la Semana</label>
                        <input
                            {...register(`dias.${index}.nombre_dia`)}
                            className={inputDarkStyle}
                            placeholder="Ej: Lunes"
                        />
                    </div>
                    <div className="w-full md:w-2/3">
                        <label className={labelStyle}>Enfoque Muscular</label>
                        <input
                            {...register(`dias.${index}.grupo_muscular`)}
                            placeholder="Ej: Pectoral, Deltoides"
                            className={inputDarkStyle}
                        />
                    </div>
                </div>

                <EjerciciosFieldArray nestIndex={index} control={control} register={register} />
                </div>
            ))}
          </div>
          )}

          {/* Error inline */}
          {errorMsg && (
            <div className="bg-red-950/60 border border-red-800 rounded-lg p-4 flex items-start gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-red-400 mt-0.5 shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-red-300 font-medium text-sm">{errorMsg.title}</p>
                <p className="text-red-400 text-xs mt-1">{errorMsg.body}</p>
              </div>
              <button
                type="button"
                onClick={() => setErrorMsg(null)}
                className="text-red-600 hover:text-red-400 transition-colors shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Botón de Envío */}
          <button
            type="submit"
            disabled={isGenerating}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-600"
          >
            <span className="flex items-center justify-center gap-2">
                {isGenerating ? (
                    <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generando PDF...
                    </>
                ) : (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                        Descargar Planificación
                    </>
                )}
            </span>
          </button>
        </form>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-6 right-6 z-20">
        <a
          href="https://santiagom.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-full text-xs text-zinc-400 hover:text-white hover:border-red-500 transition-all duration-300 shadow-lg hover:shadow-red-500/20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
          </svg>
          <span className="font-medium">created by tiaago</span>
        </a>
      </footer>
    </div>
  );
}
