// frontend/src/App.jsx
import React, { useState, useCallback } from 'react';
import { useForm, useFieldArray, useController } from 'react-hook-form';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PDFDocument } from 'pdf-lib';
import { supabase } from './supabase';

// --- Estilos Reutilizables ---
const inputDarkStyle = "w-full bg-zinc-900 border border-zinc-800 text-zinc-100 px-3 py-2 rounded focus:outline-none focus:bg-zinc-900 focus:border-red-500 placeholder-zinc-500";
const labelStyle = "block text-zinc-400 text-xs font-medium mb-1.5";

const selectCellStyle = "w-full bg-zinc-900 border border-zinc-800 text-zinc-100 px-1.5 py-1.5 rounded focus:outline-none focus:bg-zinc-900 focus:border-red-500 text-center text-xs cursor-pointer";
const inputCellStyle  = "w-full bg-zinc-900 border border-zinc-800 text-zinc-100 px-2 py-1.5 rounded focus:outline-none focus:bg-zinc-900 focus:border-red-500 placeholder-zinc-500 text-center text-xs";

// --- Input de Tempo: tres números editables separados por guiones fijos ---
function TempoInput({ name, control }) {
  const { field } = useController({ name, control, defaultValue: '0-0-0' });
  const parts = (field.value || '').split('-');
  const p = [parts[0] ?? '', parts[1] ?? '', parts[2] ?? ''];

  const update = (idx, val) => {
    const next = [...p];
    next[idx] = val.replace(/\D/g, '').slice(0, 2);
    field.onChange(next.join('-'));
  };

  const tinyInput = "w-7 bg-zinc-900 border border-zinc-800 text-zinc-100 text-center text-xs py-1.5 rounded focus:outline-none focus:bg-zinc-900 focus:border-red-500 placeholder-zinc-500";

  return (
    <div className="flex items-center justify-center gap-1">
      <input value={p[0]} onChange={e => update(0, e.target.value)} placeholder="0" className={tinyInput} maxLength={2} inputMode="numeric" />
      <span className="text-zinc-500 text-xs select-none font-bold">-</span>
      <input value={p[1]} onChange={e => update(1, e.target.value)} placeholder="0" className={tinyInput} maxLength={2} inputMode="numeric" />
      <span className="text-zinc-500 text-xs select-none font-bold">-</span>
      <input value={p[2]} onChange={e => update(2, e.target.value)} placeholder="0" className={tinyInput} maxLength={2} inputMode="numeric" />
    </div>
  );
}

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
            <th className="px-2 py-3 text-center font-medium text-zinc-300 w-14">Series</th>
            <th className="px-2 py-3 text-center font-medium text-zinc-300 w-24">Reps</th>
            <th className="px-2 py-3 text-center font-medium text-zinc-300 w-24">Peso</th>
            <th className="px-2 py-3 text-center font-medium text-zinc-300 w-24">Intensidad</th>
            <th className="px-2 py-3 text-center font-medium text-zinc-300 w-28">Pausa</th>
            <th className="px-2 py-3 text-center font-medium text-zinc-300 w-20">Tempo</th>
            <th className="px-2 py-3 text-center font-medium text-zinc-300 w-14">RIR</th>
            <th className="px-2 py-3 w-10"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {fields.map((item, k) => (
            <tr key={item.id} className="hover:bg-zinc-800/30 transition-colors">

              {/* Ejercicio */}
              <td className="px-3 py-2">
                <input
                  {...register(`dias.${nestIndex}.ejercicios.${k}.nombre`)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 px-2 py-1.5 rounded focus:outline-none focus:bg-zinc-900 focus:border-red-500 placeholder-zinc-500 text-xs"
                  placeholder="Ej: Press Banca"
                />
              </td>

              {/* Series — select 1 al 8 */}
              <td className="px-2 py-2">
                <select {...register(`dias.${nestIndex}.ejercicios.${k}.series`)} className={selectCellStyle}>
                  <option value="">-</option>
                  {[1,2,3,4,5,6,7,8].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </td>

              {/* Reps — select con rangos predefinidos */}
              <td className="px-2 py-2">
                <select {...register(`dias.${nestIndex}.ejercicios.${k}.reps`)} className={selectCellStyle}>
                  <option value="">-</option>
                  {['4-6','6-8','8-10','10-12','12-15','15-20'].map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </td>

              {/* Peso — placeholder "Consultar" */}
              <td className="px-2 py-2">
                <input
                  {...register(`dias.${nestIndex}.ejercicios.${k}.peso`)}
                  className={inputCellStyle}
                  placeholder="Consultar"
                />
              </td>

              {/* Intensidad — select 50% al 100% de 5 en 5 */}
              <td className="px-2 py-2">
                <select {...register(`dias.${nestIndex}.ejercicios.${k}.intensidad`)} className={selectCellStyle}>
                  <option value="">-</option>
                  {Array.from({ length: 11 }, (_, i) => 50 + i * 5).map(v => (
                    <option key={v} value={`${v}%`}>{v}%</option>
                  ))}
                </select>
              </td>

              {/* Pausa — solo número, "seg" automático al lado */}
              <td className="px-2 py-2">
                <div className="flex items-center gap-1">
                  <input
                    {...register(`dias.${nestIndex}.ejercicios.${k}.pausa`)}
                    inputMode="numeric"
                    className="w-14 bg-zinc-900 border border-zinc-800 text-zinc-100 px-2 py-1.5 rounded focus:outline-none focus:bg-zinc-900 focus:border-red-500 placeholder-zinc-500 text-center text-xs"
                    placeholder="0"
                  />
                  <span className="text-zinc-500 text-xs shrink-0">seg</span>
                </div>
              </td>

              {/* Tempo — tres números con guiones fijos */}
              <td className="px-2 py-2">
                <TempoInput name={`dias.${nestIndex}.ejercicios.${k}.tempo`} control={control} />
              </td>

              {/* RIR — select 0 al 5 */}
              <td className="px-2 py-2">
                <select {...register(`dias.${nestIndex}.ejercicios.${k}.rir`)} className={selectCellStyle}>
                  <option value="">-</option>
                  {[0,1,2,3,4,5].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </td>

              {/* Eliminar */}
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
          onClick={() => append({ nombre: '', series: '4', reps: '10-12', peso: '', intensidad: '80%', pausa: '140', tempo: '', rir: '2' })}
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

// --- Helpers para el panel de alumnos ---
const AVATAR_GRADIENTS = [
  ['from-red-500', 'to-rose-700'],
  ['from-orange-500', 'to-amber-700'],
  ['from-blue-500', 'to-indigo-700'],
  ['from-violet-500', 'to-purple-700'],
  ['from-emerald-500', 'to-teal-700'],
  ['from-pink-500', 'to-fuchsia-700'],
  ['from-cyan-500', 'to-blue-700'],
  ['from-yellow-500', 'to-orange-700'],
];

function getAvatarGradient(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  const [from, to] = AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
  return `${from} ${to}`;
}

function SkeletonCard() {
  return (
    <div className="bg-zinc-800/60 border border-zinc-700/50 rounded-xl overflow-hidden">
      <div className="h-0.5 skeleton-shimmer" />
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full skeleton-shimmer shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 skeleton-shimmer rounded w-3/4" />
            <div className="h-2.5 skeleton-shimmer rounded w-1/2" />
          </div>
        </div>
        <div className="flex gap-1.5">
          <div className="h-5 skeleton-shimmer rounded-full w-16" />
          <div className="h-5 skeleton-shimmer rounded-full w-14" />
        </div>
        <div className="h-8 skeleton-shimmer rounded-lg" />
      </div>
    </div>
  );
}

// --- Panel de Alumnos Guardados (sidebar) ---
function AlumnosPanel({ alumnos, loading, dbDisabled, onCargar, onEliminar }) {
  const [confirmId, setConfirmId] = useState(null);
  const [removingId, setRemovingId] = useState(null);

  const handleEliminar = (id) => {
    setRemovingId(id);
    setTimeout(() => {
      onEliminar(id);
      setRemovingId(null);
      setConfirmId(null);
    }, 260);
  };

  if (dbDisabled) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-zinc-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375" />
          </svg>
        </div>
        <p className="text-zinc-600 text-xs">Sin base de datos configurada</p>
      </div>
    );
  }

  return (
    <div className="panel-fade flex flex-col h-full">
      {/* Sidebar Header */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-zinc-800 shrink-0">
        <div className="w-7 h-7 rounded-lg bg-red-600/10 border border-red-500/20 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-red-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-zinc-100 leading-none">Alumnos Guardados</p>
          <p className="text-zinc-500 text-xs mt-0.5">
            {loading ? 'Cargando...' : alumnos.length === 0 ? 'Ninguno todavía' : `${alumnos.length} alumno${alumnos.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        {alumnos.length > 0 && !loading && (
          <span className="px-2 py-0.5 rounded-full bg-red-600/15 border border-red-500/25 text-red-400 text-xs font-semibold shrink-0">
            {alumnos.length}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {/* Loading skeletons */}
        {loading && [...Array(3)].map((_, i) => <SkeletonCard key={i} />)}

        {/* Empty state */}
        {!loading && alumnos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center panel-fade">
            <div className="w-12 h-12 rounded-2xl bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" className="w-6 h-6 text-zinc-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
            <p className="text-zinc-300 text-xs font-medium mb-1">Sin alumnos guardados</p>
            <p className="text-zinc-600 text-xs max-w-[160px]">Completá el formulario y hacé click en <span className="text-zinc-400">"Guardar Alumno"</span> para tener los planes a mano siempre.</p>
          </div>
        )}

        {/* Cards */}
        {!loading && alumnos.map((alumno, index) => (
          <div
            key={alumno.id}
            className={`group relative bg-zinc-800/60 border rounded-xl overflow-hidden transition-all duration-300
              ${removingId === alumno.id
                ? 'card-exit border-red-500/30'
                : 'card-enter border-zinc-700/50 hover:border-red-500/30 hover:shadow-lg hover:shadow-red-950/30'
              }`}
            style={{ animationDelay: removingId === alumno.id ? '0ms' : `${index * 55}ms` }}
          >
            <div className={`h-0.5 w-full bg-gradient-to-r ${getAvatarGradient(alumno.nombre)} opacity-60 group-hover:opacity-100 transition-opacity duration-300`} />
            <div className="p-3">
              <div className="flex items-start justify-between mb-2">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarGradient(alumno.nombre)} flex items-center justify-center text-white font-bold text-sm shadow-lg shrink-0`}>
                  {alumno.nombre.charAt(0).toUpperCase()}
                </div>
                {confirmId === alumno.id ? (
                  <div className="flex items-center gap-1 bg-red-950/60 border border-red-800/50 rounded-lg px-1.5 py-1">
                    <button type="button" onClick={() => handleEliminar(alumno.id)} className="text-red-400 hover:text-red-300 transition-colors p-0.5" title="Confirmar">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </button>
                    <button type="button" onClick={() => setConfirmId(null)} className="text-zinc-500 hover:text-zinc-300 transition-colors p-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => setConfirmId(alumno.id)} className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-all duration-200 p-1 rounded-lg hover:bg-red-500/10" title="Eliminar alumno">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                )}
              </div>
              <p className="font-semibold text-zinc-100 text-xs leading-tight truncate mb-2">{alumno.nombre}</p>
              <div className="flex flex-wrap gap-1 mb-2">
                <span className="px-1.5 py-0.5 rounded-md text-xs bg-zinc-700/70 text-zinc-400 truncate max-w-[90px]" title={alumno.objetivo}>{alumno.objetivo}</span>
                <span className="px-1.5 py-0.5 rounded-md text-xs bg-zinc-700/70 text-zinc-500">{alumno.nivel}</span>
                <span className="px-1.5 py-0.5 rounded-md text-xs bg-red-500/10 text-red-400 border border-red-500/15 font-medium">{alumno.num_dias}d</span>
              </div>
              <button
                type="button"
                onClick={() => onCargar(alumno)}
                className="w-full text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200 bg-zinc-700/60 text-zinc-400 border border-zinc-700/50 group-hover:bg-red-600 group-hover:text-white group-hover:border-red-600 group-hover:shadow-lg group-hover:shadow-red-900/30"
              >
                Cargar Plan
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Generación de PDF en el cliente ---
async function generarPDF(plan) {
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

    tablasPdf.setFont('helvetica', 'bold');
    tablasPdf.setFontSize(16);
    tablasPdf.setTextColor(...RED);
    tablasPdf.text(dia.nombre_dia.toUpperCase(), 15, y);
    y += 8;

    tablasPdf.setFont('helvetica', 'italic');
    tablasPdf.setFontSize(11);
    tablasPdf.setTextColor(...GRAY_DARK);
    tablasPdf.text(dia.grupo_muscular || '', 15, y);
    y += 10;

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

  try {
    const templateRes = await fetch('/template_static.pdf');
    if (!templateRes.ok) throw new Error('template not found');
    const templateBytes = await templateRes.arrayBuffer();
    const tablasBytes = tablasPdf.output('arraybuffer');

    const mergedDoc = await PDFDocument.create();
    const templateDoc = await PDFDocument.load(templateBytes);
    const tablasDoc = await PDFDocument.load(tablasBytes);

    const templatePages = templateDoc.getPages();
    const pagesToCopy = Math.min(2, templatePages.length);
    const copiedTemplate = await mergedDoc.copyPages(templateDoc, [...Array(pagesToCopy).keys()]);
    copiedTemplate.forEach(p => mergedDoc.addPage(p));

    const tablasPages = tablasDoc.getPageCount();
    const copiedTablas = await mergedDoc.copyPages(tablasDoc, [...Array(tablasPages).keys()]);
    copiedTablas.forEach(p => mergedDoc.addPage(p));

    const finalBytes = await mergedDoc.save();
    return new Blob([finalBytes], { type: 'application/pdf' });
  } catch {
    const bytes = tablasPdf.output('arraybuffer');
    return new Blob([bytes], { type: 'application/pdf' });
  }
}

// --- Componente Principal ---
export default function App() {
  const { register, control, handleSubmit, watch, reset, getValues } = useForm({
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
  const [successMsg, setSuccessMsg] = useState(null);
  const [alumnos, setAlumnos] = useState([]);
  const [loadingAlumnos, setLoadingAlumnos] = useState(true);
  const [savingAlumno, setSavingAlumno] = useState(false);
  const [showAlumnos, setShowAlumnos] = useState(false);

  const numDiasSelected = watch('num_dias');
  const nombreCliente = watch('nombre_cliente');
  const { fields, append, remove } = useFieldArray({ control, name: "dias" });

  const cargarAlumnos = useCallback(async () => {
    if (!supabase) { setLoadingAlumnos(false); return; }
    setLoadingAlumnos(true);
    const { data, error } = await supabase
      .from('alumnos')
      .select('*')
      .order('updated_at', { ascending: false });
    if (!error && data) setAlumnos(data);
    setLoadingAlumnos(false);
  }, []);

  React.useEffect(() => {
    window.scrollTo(0, 0);
    cargarAlumnos();
  }, [cargarAlumnos]);

  const isResettingRef = React.useRef(false);

  React.useEffect(() => {
    if (isResettingRef.current) return;
    const current = fields.length;
    const target = parseInt(numDiasSelected);
    if (isNaN(target)) return;
    if (current < target) {
      for (let i = current; i < target; i++) append({ nombre_dia: `Día ${i + 1}`, grupo_muscular: '', ejercicios: [] });
    } else if (current > target) {
      for (let i = current; i > target; i--) remove(i - 1);
    }
  }, [numDiasSelected, append, remove, fields.length]);

  const guardarAlumno = async () => {
    if (!supabase) return;
    const data = getValues();
    if (!data.nombre_cliente.trim()) {
      setErrorMsg({ title: "Nombre requerido", body: "Completá el nombre del alumno antes de guardar." });
      return;
    }

    setSavingAlumno(true);
    const payload = {
      nombre: data.nombre_cliente.trim(),
      objetivo: data.objetivo,
      nivel: data.nivel,
      num_dias: data.num_dias,
      dias: data.dias,
      updated_at: new Date().toISOString(),
    };

    const { data: existing } = await supabase
      .from('alumnos')
      .select('id')
      .eq('nombre', payload.nombre)
      .maybeSingle();

    let error;
    if (existing) {
      ({ error } = await supabase.from('alumnos').update(payload).eq('id', existing.id));
    } else {
      ({ error } = await supabase.from('alumnos').insert(payload));
    }

    if (error) {
      setErrorMsg({ title: "Error al guardar", body: error.message });
    } else {
      showSuccess(existing ? `Plan de ${payload.nombre} actualizado.` : `${payload.nombre} guardado correctamente.`);
      await cargarAlumnos();
    }
    setSavingAlumno(false);
  };

  const cargarPlanAlumno = (alumno) => {
    if (fields.length > 0 || nombreCliente.trim()) {
      if (!window.confirm(`¿Cargar el plan de ${alumno.nombre}? Se reemplazará el formulario actual.`)) return;
    }
    isResettingRef.current = true;
    reset({
      nombre_cliente: alumno.nombre,
      objetivo: alumno.objetivo,
      nivel: alumno.nivel,
      num_dias: String(alumno.num_dias),
      dias: alumno.dias,
    });
    setTimeout(() => { isResettingRef.current = false; }, 100);
    showSuccess(`Plan de ${alumno.nombre} cargado.`);
  };

  const eliminarAlumno = async (id) => {
    if (!supabase) return;
    const { error } = await supabase.from('alumnos').delete().eq('id', id);
    if (!error) {
      setAlumnos(prev => prev.filter(a => a.id !== id));
    }
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

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
    <div className="h-screen flex flex-col text-zinc-200 overflow-hidden">

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
      <div className="fixed inset-0 bg-zinc-950/75 -z-10" />

      {/* HEADER */}
      <header className="shrink-0 border-b border-zinc-800 bg-zinc-950/60 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3 px-5 py-3">
          <img src="/img.png" alt="AB Gym Logo" className="w-9 h-9 object-contain" />
          <h1 className="text-base font-semibold text-zinc-100 leading-tight">
            Planificación Rutina Profesional
          </h1>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* BACKDROP when alumnos panel is open */}
        {showAlumnos && (
          <div
            className="absolute inset-0 z-10 bg-zinc-950/50 backdrop-blur-sm"
            onClick={() => setShowAlumnos(false)}
          />
        )}

        {/* ALUMNOS DRAWER — slides in from the left */}
        <aside
          className={`absolute left-0 top-0 bottom-0 z-20 w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col shadow-2xl shadow-black/60 transition-transform duration-300 ease-in-out ${showAlumnos ? 'translate-x-0' : '-translate-x-full'}`}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => setShowAlumnos(false)}
            className="absolute top-3 right-3 z-10 w-7 h-7 flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <AlumnosPanel
            alumnos={alumnos}
            loading={loadingAlumnos}
            dbDisabled={!supabase}
            onCargar={(alumno) => { cargarPlanAlumno(alumno); setShowAlumnos(false); }}
            onEliminar={eliminarAlumno}
          />
        </aside>

        {/* CENTER: Athlete form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-72 shrink-0 border-r border-zinc-800 bg-zinc-950/30 flex flex-col overflow-hidden"
        >
          {/* Form scrollable area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">

            <div>
              <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">
                Información del Atleta
              </h2>

              <div className="space-y-3">
                <div>
                  <label className={labelStyle}>Nombre Cliente</label>
                  <input
                    {...register("nombre_cliente")}
                    placeholder="Ej: Leónidas"
                    className={inputDarkStyle}
                    required
                  />
                </div>
                <div>
                  <label className={labelStyle}>Objetivo Principal</label>
                  <input
                    {...register("objetivo")}
                    placeholder="Ej: Hipertrofia"
                    className={inputDarkStyle}
                  />
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

            {/* Guardar Alumno */}
            {supabase && (
              <div className="pt-3 border-t border-zinc-800">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAlumnos(s => !s)}
                    title="Ver alumnos guardados"
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${showAlumnos ? 'bg-red-700 ring-2 ring-red-500/40' : 'bg-red-600 hover:bg-red-700'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-white">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={guardarAlumno}
                    disabled={savingAlumno || !nombreCliente.trim()}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-200 hover:text-white text-sm font-medium rounded border border-zinc-700 transition-colors"
                  >
                    {savingAlumno ? (
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                      </svg>
                    )}
                    Guardar Alumno
                  </button>
                </div>
              </div>
            )}

            {/* Aviso de memoria */}
            {supabase && (
              <div className="flex items-start gap-2 bg-amber-950/30 border border-amber-800/40 rounded-lg p-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4 text-amber-400 shrink-0 mt-0.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <p className="text-amber-300/80 text-xs leading-relaxed">
                  Una vez completada la rutina del alumno, recordá <span className="text-amber-300 font-medium">eliminar al alumno guardado</span> para liberar espacio en la base de datos.
                </p>
              </div>
            )}

            {/* Mensajes */}
            {successMsg && (
              <div className="bg-green-950/60 border border-green-800 rounded-lg p-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-green-400 shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-green-300 text-xs flex-1">{successMsg}</p>
              </div>
            )}

            {errorMsg && (
              <div className="bg-red-950/60 border border-red-800 rounded-lg p-3 flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-red-400 mt-0.5 shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-red-300 font-medium text-xs">{errorMsg.title}</p>
                  <p className="text-red-400 text-xs mt-0.5">{errorMsg.body}</p>
                </div>
                <button type="button" onClick={() => setErrorMsg(null)} className="text-red-600 hover:text-red-400 transition-colors shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Download button — pinned to bottom of center panel */}
          <div className="shrink-0 p-4 border-t border-zinc-800">
            <button
              type="submit"
              disabled={isGenerating}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-600"
            >
              <span className="flex items-center justify-center gap-2 text-sm">
                {isGenerating ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generando PDF...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Descargar Planificación
                  </>
                )}
              </span>
            </button>
          </div>
        </form>

        {/* RIGHT: Exercise day tables */}
        <main className="flex-1 overflow-y-auto p-5 space-y-4">
          {fields.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 text-zinc-600 mb-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              <p className="text-zinc-400 text-sm font-medium">Seleccioná la frecuencia semanal</p>
              <p className="text-zinc-600 text-xs mt-1">Los días aparecerán aquí para que cargues los ejercicios</p>
            </div>
          ) : (
            fields.map((dia, index) => (
              <div key={dia.id} className="bg-zinc-900/60 rounded-lg border border-zinc-800 overflow-hidden">
                <div className="flex items-center gap-4 px-5 py-3 bg-zinc-900/80 border-b border-zinc-800">
                  <div className="flex-1">
                    <label className="block text-zinc-500 text-xs mb-1">Día de la Semana</label>
                    <input
                      {...register(`dias.${index}.nombre_dia`)}
                      className="bg-transparent focus:bg-zinc-800/60 text-zinc-100 text-sm font-semibold focus:outline-none placeholder-zinc-600 w-full rounded px-1 -mx-1 transition-colors"
                      placeholder="Ej: Lunes"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-zinc-500 text-xs mb-1">Enfoque Muscular</label>
                    <input
                      {...register(`dias.${index}.grupo_muscular`)}
                      placeholder="Ej: Pectoral, Deltoides"
                      className="bg-transparent focus:bg-zinc-800/60 text-zinc-300 text-sm focus:outline-none placeholder-zinc-600 w-full rounded px-1 -mx-1 transition-colors"
                    />
                  </div>
                </div>
                <EjerciciosFieldArray nestIndex={index} control={control} register={register} />
              </div>
            ))
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-5 right-5 z-20">
        <a
          href="https://ismedina.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-full text-xs text-zinc-400 hover:text-white hover:border-red-500 transition-all duration-300 shadow-lg hover:shadow-red-500/20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
          </svg>
          <span className="font-medium">created by igna</span>
        </a>
      </footer>
    </div>
  );
}
