// frontend/src/App.jsx
import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';

// --- Subcomponente para la Tabla de Ejercicios ---
function EjerciciosFieldArray({ nestIndex, control, register }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `dias.${nestIndex}.ejercicios`
  });

  return (
    <div className="overflow-x-auto mt-4">
      <table className="min-w-full text-xs text-left text-gray-500 border">
        <thead className="bg-gray-100 uppercase font-bold text-gray-700">
          <tr>
            <th className="p-2">Ejercicio</th>
            <th className="p-2 w-16">Series</th>
            <th className="p-2 w-16">Reps</th>
            <th className="p-2 w-16">Peso</th>
            <th className="p-2 w-20">Intensidad</th>
            <th className="p-2 w-20">Pausa</th>
            <th className="p-2 w-20">Tempo</th>
            <th className="p-2 w-12">RIR</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {fields.map((item, k) => (
            <tr key={item.id}>
              <td className="p-1"><input {...register(`dias.${nestIndex}.ejercicios.${k}.nombre`)} className="border rounded p-1 w-full" placeholder="Nombre" /></td>
              <td className="p-1"><input {...register(`dias.${nestIndex}.ejercicios.${k}.series`)} className="border rounded p-1 w-full" /></td>
              <td className="p-1"><input {...register(`dias.${nestIndex}.ejercicios.${k}.reps`)} className="border rounded p-1 w-full" /></td>
              <td className="p-1"><input {...register(`dias.${nestIndex}.ejercicios.${k}.peso`)} className="border rounded p-1 w-full" /></td>
              <td className="p-1"><input {...register(`dias.${nestIndex}.ejercicios.${k}.intensidad`)} className="border rounded p-1 w-full" /></td>
              <td className="p-1"><input {...register(`dias.${nestIndex}.ejercicios.${k}.pausa`)} className="border rounded p-1 w-full" /></td>
              <td className="p-1"><input {...register(`dias.${nestIndex}.ejercicios.${k}.tempo`)} className="border rounded p-1 w-full" /></td>
              <td className="p-1"><input {...register(`dias.${nestIndex}.ejercicios.${k}.rir`)} className="border rounded p-1 w-full" /></td>
              <td className="p-1 text-center"><button type="button" onClick={() => remove(k)} className="text-red-600 font-bold">X</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <button 
        type="button" 
        onClick={() => append({ nombre: '', series: '', reps: '', peso: '', intensidad: '', pausa: '', tempo: '', rir: '' })}
        className="mt-2 text-sm text-blue-600 font-bold hover:underline"
      >
        + Añadir Ejercicio
      </button>
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
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center text-red-700">AB GYM STUDIO - Generador</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded shadow">
            <input {...register("nombre_cliente")} placeholder="Nombre Cliente" className="border p-2 rounded" required />
            <input {...register("objetivo")} placeholder="Objetivo" className="border p-2 rounded" />
            <select {...register("nivel")} className="border p-2 rounded">
              <option value="Principiante">Principiante</option>
              <option value="Moderado">Moderado</option>
              <option value="Avanzado">Avanzado</option>
            </select>
            <select {...register("num_dias")} className="border p-2 rounded">
              {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} Días</option>)}
            </select>
          </div>

          {fields.map((dia, index) => (
            <div key={dia.id} className="bg-white p-4 rounded shadow border-l-4 border-red-600">
              <div className="flex gap-4 mb-2">
                <input {...register(`dias.${index}.nombre_dia`)} className="border p-1 font-bold w-32" />
                <input {...register(`dias.${index}.grupo_muscular`)} placeholder="Grupo Muscular (Ej: Pierna)" className="border p-1 w-full" />
              </div>
              <EjerciciosFieldArray nestIndex={index} control={control} register={register} />
            </div>
          ))}

          <button type="submit" disabled={isGenerating} className="w-full bg-red-600 text-white font-bold py-4 rounded hover:bg-red-700 transition">
            {isGenerating ? "Generando PDF..." : "DESCARGAR PLANIFICACIÓN"}
          </button>
        </form>
      </div>
    </div>
  );
}