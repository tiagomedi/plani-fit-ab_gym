// frontend/src/App.jsx
import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';

// --- NUEVO ICONO BÍCEPS SVG (Reemplaza al casco) ---
const BicepsIcon = ({ className }) => (
  // Icono de brazo flexionado (estilo sólido para que se pinte de rojo)
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M15.75 1.5a1.125 1.125 0 00-1.125 1.125v.351A2.625 2.625 0 0012 5.625c0 1.021.585 1.914 1.444 2.353a2.625 2.625 0 101.306 5.109V16.5h-3v-4.125a2.625 2.625 0 10-5.25 0V16.5H3.375A1.125 1.125 0 002.25 17.625v3.75c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.75a1.125 1.125 0 00-1.125-1.125H17.25v-3.387a2.625 2.625 0 101.454-5.129 2.625 2.625 0 101.306-5.109c.859-.439 1.444-1.332 1.444-2.353a2.625 2.625 0 00-2.625-2.625v-.351c0-.621-.504-1.125-1.125-1.125h-1.954z" />
  </svg>
);

// --- Estilos Reutilizables ---
const inputDarkStyle = "w-full bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-700/50 text-zinc-100 px-4 py-3 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all placeholder-zinc-500 hover:border-zinc-600 shadow-sm";
const labelStyle = "block text-red-400 text-xs font-semibold uppercase tracking-widest mb-2";

// --- Subcomponente para la Tabla de Ejercicios ---
function EjerciciosFieldArray({ nestIndex, control, register }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `dias.${nestIndex}.ejercicios`
  });

  return (
    <div className="overflow-x-auto mt-6 bg-gradient-to-br from-zinc-900/60 to-zinc-950/80 rounded-xl border border-zinc-700/30 shadow-lg backdrop-blur-sm">
      <table className="min-w-full text-xs text-left text-zinc-300">
        <thead className="bg-gradient-to-r from-zinc-800 to-zinc-900 border-b border-zinc-700/50">
          <tr>
            <th className="px-4 py-4 text-left font-semibold text-red-400 uppercase tracking-wider">Ejercicio</th>
            <th className="px-3 py-4 text-center font-semibold text-red-400 uppercase tracking-wider w-16">Series</th>
            <th className="px-3 py-4 text-center font-semibold text-red-400 uppercase tracking-wider w-16">Reps</th>
            <th className="px-3 py-4 text-center font-semibold text-red-400 uppercase tracking-wider w-20">Peso</th>
            <th className="px-3 py-4 text-center font-semibold text-red-400 uppercase tracking-wider w-24">Intensidad</th>
            <th className="px-3 py-4 text-center font-semibold text-red-400 uppercase tracking-wider w-20">Pausa</th>
            <th className="px-3 py-4 text-center font-semibold text-red-400 uppercase tracking-wider w-20">Tempo</th>
            <th className="px-3 py-4 text-center font-semibold text-red-400 uppercase tracking-wider w-14">RIR</th>
            <th className="px-3 py-4 w-12"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/30">
          {fields.map((item, k) => (
            <tr key={item.id} className="hover:bg-zinc-800/20 transition-colors group">
              <td className="px-4 py-3"><input {...register(`dias.${nestIndex}.ejercicios.${k}.nombre`)} className="w-full bg-zinc-900/50 border border-zinc-700/30 text-zinc-100 px-3 py-2 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-all placeholder-zinc-500 text-sm" placeholder="Ej: Press Banca" /></td>
              <td className="px-2 py-3"><input {...register(`dias.${nestIndex}.ejercicios.${k}.series`)} className="w-full bg-zinc-900/50 border border-zinc-700/30 text-zinc-100 px-3 py-2 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-all placeholder-zinc-500 text-center text-sm" placeholder="set" /></td>
              <td className="px-2 py-3"><input {...register(`dias.${nestIndex}.ejercicios.${k}.reps`)} className="w-full bg-zinc-900/50 border border-zinc-700/30 text-zinc-100 px-3 py-2 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-all placeholder-zinc-500 text-center text-sm" placeholder="rep" /></td>
              <td className="px-2 py-3"><input {...register(`dias.${nestIndex}.ejercicios.${k}.peso`)} className="w-full bg-zinc-900/50 border border-zinc-700/30 text-zinc-100 px-3 py-2 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-all placeholder-zinc-500 text-center text-sm" placeholder="Kg" /></td>
              <td className="px-2 py-3"><input {...register(`dias.${nestIndex}.ejercicios.${k}.intensidad`)} className="w-full bg-zinc-900/50 border border-zinc-700/30 text-zinc-100 px-3 py-2 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-all placeholder-zinc-500 text-center text-sm" placeholder="%%" /></td>
              <td className="px-2 py-3"><input {...register(`dias.${nestIndex}.ejercicios.${k}.pausa`)} className="w-full bg-zinc-900/50 border border-zinc-700/30 text-zinc-100 px-3 py-2 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-all placeholder-zinc-500 text-center text-sm" placeholder="seg" /></td>
              <td className="px-2 py-3"><input {...register(`dias.${nestIndex}.ejercicios.${k}.tempo`)} className="w-full bg-zinc-900/50 border border-zinc-700/30 text-zinc-100 px-3 py-2 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-all placeholder-zinc-500 text-center text-sm" placeholder="exenseg" /></td>
              <td className="px-2 py-3"><input {...register(`dias.${nestIndex}.ejercicios.${k}.rir`)} className="w-full bg-zinc-900/50 border border-zinc-700/30 text-zinc-100 px-3 py-2 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-all placeholder-zinc-500 text-center text-sm" placeholder="2" /></td>
              <td className="px-2 py-3 text-center">
                <button type="button" onClick={() => remove(k)} className="text-zinc-500 hover:text-red-500 hover:bg-red-500/10 transition-all p-2 rounded-lg opacity-0 group-hover:opacity-100">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="p-4 border-t border-zinc-800/30">
        <button 
            type="button" 
            onClick={() => append({ nombre: '', series: '', reps: '', peso: '', intensidad: '', pausa: '', tempo: '', rir: '' })}
            className="w-full flex items-center justify-center gap-2 text-sm text-red-400 font-semibold uppercase tracking-wider hover:text-red-300 transition-all px-5 py-3 rounded-lg border border-red-500/30 hover:border-red-500/50 hover:bg-red-500/10 group"
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Añadir Ejercicio
        </button>
      </div>
    </div>
  );
}

// --- Componente Principal ---
export default function App() {
  const { register, control, handleSubmit, watch } = useForm({
    defaultValues: {
      nombre_cliente: '',
      objetivo: 'Hipertrofia',
      nivel: 'Moderado',
      num_dias: 3,
      dias: []
    }
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const numDiasSelected = watch('num_dias');
  const { fields, append, remove } = useFieldArray({ control, name: "dias" });

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
    const payload = {
      nombre_cliente: data.nombre_cliente,
      objetivo: data.objetivo,
      nivel: data.nivel,
      frecuencia: `Frecuencia ${data.num_dias}`,
      dias: data.dias
    };

    try {
      const response = await fetch('http://localhost:8000/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url);
      } else {
        alert("Error en el servidor. Revisa que backend esté corriendo.");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión.");
    }
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/20 via-zinc-950 to-zinc-950 py-8 px-4 text-zinc-200">
      <div className="max-w-[90rem] mx-auto">
        
        {/* HEADER */}
        <header className="text-center mb-12">
            <div className="inline-flex flex-col items-center gap-3 px-8 py-6 bg-gradient-to-br from-zinc-900/80 to-black/60 backdrop-blur-sm rounded-2xl border border-red-900/20 shadow-2xl shadow-red-950/50">
                <div className="flex items-center gap-4">
                    <span className="text-6xl">💪</span>
                    <h1 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tight">
                        AB Gym Studio
                    </h1>
                </div>
                <div className="h-0.5 w-32 bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>
                <p className="text-red-400 font-semibold tracking-[0.25em] text-xs uppercase">Sistema de Planificación Profesional</p>
            </div>
        </header>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Panel de Datos */}
          <div className="bg-gradient-to-br from-zinc-900/90 to-black/80 backdrop-blur-xl p-8 rounded-2xl border border-zinc-700/30 shadow-2xl shadow-black/50">
            <div className="flex items-center gap-3 mb-8">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-lg shadow-lg shadow-red-900/50">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-white uppercase tracking-tight">
                    Información del Atleta
                </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className={labelStyle}>Nombre Cliente</label>
                <input {...register("nombre_cliente")} placeholder="Ej: Leónidas" className={inputDarkStyle} required />
              </div>
              <div>
                <label className={labelStyle}>Objetivo Principal</label>
                <input {...register("objetivo")} placeholder="Ej: Hipertrofia / Fuerza" className={inputDarkStyle} />
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
                <select {...register("num_dias")} className={`${inputDarkStyle} font-bold text-red-500`}>
                  {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} DÍAS DE GUERRA</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Tarjetas de Días */}
          <div className="space-y-6">
            {fields.map((dia, index) => (
                <div key={dia.id} className="bg-gradient-to-br from-zinc-900/90 to-zinc-950/80 p-8 rounded-2xl border border-zinc-700/30 shadow-2xl shadow-black/30 relative overflow-hidden hover:border-zinc-600/50 transition-all duration-300 group">
                {/* Marca de agua del BÍCEPS */}
                <div className="absolute -right-16 -top-16 text-[20rem] text-red-900/5 pointer-events-none transform rotate-12 group-hover:scale-110 group-hover:text-red-900/8 transition-all duration-500">
                    💪
                </div>
                <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-red-600 via-red-500 to-red-700 rounded-tl-2xl rounded-bl-2xl"></div>
                
                <div className="flex flex-col md:flex-row gap-6 mb-6 relative z-10">
                    <div className="w-full md:w-1/3">
                        <label className={labelStyle}>Día de la Semana</label>
                        <div className="relative">
                            <input 
                                {...register(`dias.${index}.nombre_dia`)} 
                                className="w-full bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-700/50 text-zinc-100 px-4 py-3 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all placeholder-zinc-500 hover:border-zinc-600 shadow-sm font-bold text-lg" 
                                placeholder="Ej: Lunes"
                            />
                        </div>
                    </div>
                    <div className="w-full md:w-2/3">
                        <label className={labelStyle}>Enfoque Muscular</label>
                        <div className="relative">
                            <input 
                                {...register(`dias.${index}.grupo_muscular`)} 
                                placeholder="Ej: Pectoral, Deltoides y Tríceps" 
                                className="w-full bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-700/50 text-zinc-100 px-4 py-3 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all placeholder-zinc-500 hover:border-zinc-600 shadow-sm" 
                            />
                        </div>
                    </div>
                </div>
                
                <EjerciciosFieldArray nestIndex={index} control={control} register={register} />
                </div>
            ))}
          </div>

          {/* Botón de Envío */}
          <button 
            type="submit" 
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-red-600 via-red-500 to-red-700 text-white font-black uppercase tracking-[0.2em] py-6 rounded-2xl shadow-2xl shadow-red-900/50 hover:shadow-red-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 text-xl relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
            <span className="relative z-10 flex items-center justify-center gap-3">
                {isGenerating ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Forjando Planificación...
                    </>
                ) : (
                    <>
                        {/* Reemplazo aquí */}
                        <BicepsIcon className="w-8 h-8" />
                        DESCARGAR PLAN DE BATALLA
                    </>
                )}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}