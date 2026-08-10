import ExcelJS from 'exceljs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_PATH = path.join(moduleDir, 'PLANTILLA_EXCEL.xlsx');

const BLOCK_SIZE = 14; // filas por bloque de día
const BLOCK_STARTS = [2, 16, 30, 44, 58]; // filas de inicio de cada bloque pre-hecho (1-indexed)
const MAX_EXERCISES = 11; // filas de ejercicios por bloque

// Columnas (1-indexed)
const COL_EJERCICIO = 2; // B
const COL_TIPO = 3; // C (tempo)
const COL_INTENSIDAD = 4; // D
const COL_PAUSA_GEN = 5; // E (Tiemp.Desc)
// Columna PESO de cada semana; SERIES=+1, REPS=+2, DESCANSO=+3, RIR=+4
const SEMANA_PESO_COLS = [7, 13, 19, 25]; // G, M, S, Y

function parseCellAddress(addr) {
  const [, colLetters, rowStr] = addr.match(/^([A-Z]+)(\d+)$/);
  let col = 0;
  for (const ch of colLetters) col = col * 26 + (ch.charCodeAt(0) - 64);
  return { row: parseInt(rowStr, 10), col };
}

function copyBlockStyle(ws, srcStart, dstStart) {
  const rowOffset = dstStart - srcStart;

  for (let r = 0; r < BLOCK_SIZE; r++) {
    const height = ws.getRow(srcStart + r).height;
    if (height) ws.getRow(dstStart + r).height = height;
  }

  const merges = (ws.model.merges || []).filter((range) => {
    const { row } = parseCellAddress(range.split(':')[0]);
    return row >= srcStart && row <= srcStart + BLOCK_SIZE - 1;
  });
  for (const range of merges) {
    const [startAddr, endAddr] = range.split(':');
    const s = parseCellAddress(startAddr);
    const e = parseCellAddress(endAddr);
    ws.mergeCells(s.row + rowOffset, s.col, e.row + rowOffset, e.col);
  }

  for (let r = 0; r < BLOCK_SIZE; r++) {
    for (let c = 1; c <= 29; c++) {
      const src = ws.getCell(srcStart + r, c);
      const dst = ws.getCell(dstStart + r, c);
      if (src.isMerged && src.master !== src) continue;
      if (dst.isMerged && dst.master !== dst) continue;
      if (src.font) dst.font = { ...src.font };
      if (src.fill) dst.fill = JSON.parse(JSON.stringify(src.fill));
      if (src.border) dst.border = JSON.parse(JSON.stringify(src.border));
      if (src.alignment) dst.alignment = { ...src.alignment };
      dst.numFmt = src.numFmt;
      // Copiar texto de las filas de semana y cabecera (offsets 1 y 2)
      if (r === 1 || r === 2) dst.value = src.value;
    }
  }
}

function fillDayBlock(ws, blockStart, dia) {
  const title = `${dia.nombre_dia.toUpperCase()} | ${dia.grupo_muscular.toUpperCase()}`;
  ws.getCell(blockStart, COL_EJERCICIO).value = title;

  dia.ejercicios.slice(0, MAX_EXERCISES).forEach((ej, i) => {
    const row = blockStart + 3 + i;
    ws.getCell(row, COL_EJERCICIO).value = ej.nombre;
    ws.getCell(row, COL_TIPO).value = ej.tempo || '';
    ws.getCell(row, COL_INTENSIDAD).value = ej.intensidad || '';
    ws.getCell(row, COL_PAUSA_GEN).value = ej.pausa || '';

    const peso = ej.peso || '-';
    for (const sc of SEMANA_PESO_COLS) {
      ws.getCell(row, sc).value = peso;
      ws.getCell(row, sc + 1).value = ej.series || '';
      ws.getCell(row, sc + 2).value = ej.reps || '';
      ws.getCell(row, sc + 3).value = ej.pausa || '';
      ws.getCell(row, sc + 4).value = ej.rir || '';
    }
  });
}

async function createXlsx(plan) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(TEMPLATE_PATH);
  const ws = wb.getWorksheet('Hoja1');

  plan.dias.forEach((dia, dayIdx) => {
    let blockStart;
    if (dayIdx < BLOCK_STARTS.length) {
      blockStart = BLOCK_STARTS[dayIdx];
    } else {
      // Crear bloque extra copiando el formato del último bloque de la plantilla
      const extra = dayIdx - BLOCK_STARTS.length + 1;
      blockStart = BLOCK_STARTS[BLOCK_STARTS.length - 1] + extra * BLOCK_SIZE;
      copyBlockStyle(ws, BLOCK_STARTS[BLOCK_STARTS.length - 1], blockStart);
    }
    fillDayBlock(ws, blockStart, dia);
  });

  // Eliminar los bloques de la plantilla que no fueron utilizados
  const nDays = plan.dias.length;
  if (nDays < BLOCK_STARTS.length) {
    const firstUnusedRow = BLOCK_STARTS[nDays];
    const rowsToDelete = (BLOCK_STARTS.length - nDays) * BLOCK_SIZE;
    ws.spliceRows(firstUnusedRow, rowsToDelete);
  }

  return wb.xlsx.writeBuffer();
}

function validatePlan(plan) {
  if (!plan || typeof plan !== 'object') return 'Body inválido';
  if (!plan.nombre_cliente || typeof plan.nombre_cliente !== 'string') return 'Falta nombre_cliente';
  if (!Array.isArray(plan.dias)) return 'Falta dias (array)';
  for (const dia of plan.dias) {
    if (!dia.nombre_dia || !dia.grupo_muscular || !Array.isArray(dia.ejercicios)) {
      return 'Cada día requiere nombre_dia, grupo_muscular y ejercicios';
    }
  }
  return null;
}

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  let plan;
  try {
    plan = await req.json();
  } catch {
    return new Response('JSON inválido', { status: 400 });
  }

  const validationError = validatePlan(plan);
  if (validationError) {
    return new Response(validationError, { status: 400 });
  }

  try {
    const buffer = await createXlsx(plan);
    const safeName = plan.nombre_cliente.replace(/\s+/g, '_');
    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="Planificacion_Rutina_${safeName}.xlsx"`,
      },
    });
  } catch (err) {
    console.error('Error al generar Excel:', err);
    return new Response(`Error interno: ${err.message}`, { status: 500 });
  }
};
