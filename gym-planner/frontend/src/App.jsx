// frontend/src/App.jsx
import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';

// Configuración de API: usa variable de entorno en producción, localhost en desarrollo
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// --- NUEVO ICONO BÍCEPS SVG (Reemplaza al casco) ---
const BicepsIcon = ({ className }) => (
  // Icono de brazo flexionado (estilo sólido para que se pinte de rojo)
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M15.75 1.5a1.125 1.125 0 00-1.125 1.125v.351A2.625 2.625 0 0012 5.625c0 1.021.585 1.914 1.444 2.353a2.625 2.625 0 101.306 5.109V16.5h-3v-4.125a2.625 2.625 0 10-5.25 0V16.5H3.375A1.125 1.125 0 002.25 17.625v3.75c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.75a1.125 1.125 0 00-1.125-1.125H17.25v-3.387a2.625 2.625 0 101.454-5.129 2.625 2.625 0 101.306-5.109c.859-.439 1.444-1.332 1.444-2.353a2.625 2.625 0 00-2.625-2.625v-.351c0-.621-.504-1.125-1.125-1.125h-1.954z" />
  </svg>
);

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

  const checkBackendHealth = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const response = await fetch(`${API_URL}/health`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  const onSubmit = async (data) => {
    setIsGenerating(true);
    
    // Verificar conexión al backend primero
    const isBackendRunning = await checkBackendHealth();
    if (!isBackendRunning) {
      alert(
        "❌ ERROR DE CONEXIÓN\n\n" +
        "El backend no está respondiendo.\n\n" +
        "SOLUCIÓN:\n" +
        "1. Abre una terminal\n" +
        "2. Ve a: gym-planner/backend\n" +
        "3. Ejecuta: ./start_backend.sh\n\n" +
        "Si persiste el error, verifica que el puerto 8000 no esté ocupado."
      );
      setIsGenerating(false);
      return;
    }

    const payload = {
      nombre_cliente: data.nombre_cliente,
      objetivo: data.objetivo,
      nivel: data.nivel,
      frecuencia: `Frecuencia ${data.num_dias}`,
      dias: data.dias
    };

    try {
      const response = await fetch(`${API_URL}/generate-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url);
      } else {
        const errorText = await response.text();
        alert(
          "❌ ERROR DEL SERVIDOR\n\n" +
          `Estado: ${response.status}\n` +
          `Detalles: ${errorText}\n\n` +
          "Verifica los logs del backend en la terminal."
        );
      }
    } catch (error) {
      console.error('Error completo:', error);
      alert(
        "❌ ERROR DE CONEXIÓN\n\n" +
        "No se pudo conectar con el servidor.\n\n" +
        "Causas posibles:\n" +
        "• El backend no está ejecutándose\n" +
        "• El puerto 8000 está bloqueado\n" +
        "• Firewall bloqueando la conexión\n\n" +
        `Error técnico: ${error.message}`
      );
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
          href="https://github.com/tiagomedi" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-full text-xs text-zinc-400 hover:text-white hover:border-red-500 transition-all duration-300 shadow-lg hover:shadow-red-500/20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          <span className="font-medium">created by tiaago</span>
        </a>
      </footer>
    </div>
  );
}