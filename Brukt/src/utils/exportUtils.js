/**
 * Utilidades para exportar datos a diferentes formatos
 */

/**
 * Exporta gastos a formato CSV
 * @param {Array} expenses - Array de gastos
 * @param {Object} group - Información del grupo
 */
export function exportExpensesToCSV(expenses, group) {
  if (!expenses || expenses.length === 0) {
    throw new Error('No hay gastos para exportar');
  }

  // Encabezados CSV
  const headers = ['Fecha', 'Descripción', 'Categoría', 'Monto', 'Pagado por', 'Email'];
  
  // Convertir gastos a filas CSV
  const rows = expenses.map(expense => {
    const fecha = new Date(expense.fecha).toLocaleDateString('es-ES');
    const descripcion = `"${(expense.descripcion || '').replace(/"/g, '""')}"`;
    const categoria = expense.categoria || 'Sin categoría';
    const monto = Number(expense.monto || 0).toFixed(2);
    const pagadoPor = `"${(expense.paid_by_name || expense.paid_by_email || 'Desconocido').replace(/"/g, '""')}"`;
    const email = expense.paid_by_email || '';
    
    return [fecha, descripcion, categoria, monto, pagadoPor, email].join(',');
  });

  // Calcular totales
  const total = expenses.reduce((sum, exp) => sum + Number(exp.monto || 0), 0);
  const totalRow = `\nTOTAL,,,${total.toFixed(2)},,`;

  // Combinar todo
  const csvContent = [
    `Grupo: ${group?.nombre || group?.name || 'Sin nombre'}`,
    `Fecha de exportación: ${new Date().toLocaleString('es-ES')}`,
    `Total de gastos: ${expenses.length}`,
    '',
    headers.join(','),
    ...rows,
    totalRow
  ].join('\n');

  // Crear blob y descargar
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `gastos_${group?.nombre || 'grupo'}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Exporta análisis de deudas a CSV
 * @param {Object} debtAnalysis - Análisis de deudas
 * @param {Object} group - Información del grupo
 */
export function exportDebtAnalysisToCSV(debtAnalysis, group) {
  if (!debtAnalysis || !debtAnalysis.memberBalances) {
    throw new Error('No hay datos de deudas para exportar');
  }

  const headers = ['Miembro', 'Total Gastado', 'Balance', 'Estado'];
  
  const rows = debtAnalysis.memberBalances.map(member => {
    const nombre = `"${member.name || member.email}"`;
    const totalGastado = Number(member.totalSpent || 0).toFixed(2);
    const balance = Number(member.balance || 0).toFixed(2);
    const estado = member.isPositive ? 'Acreedor' : 'Deudor';
    
    return [nombre, totalGastado, balance, estado].join(',');
  });

  // Agregar deudas pendientes
  let deudasSection = '\n\nDEUDAS PENDIENTES\n';
  deudasSection += 'De,Para,Monto\n';
  
  if (debtAnalysis.pendingDebts && debtAnalysis.pendingDebts.length > 0) {
    debtAnalysis.pendingDebts.forEach(debt => {
      deudasSection += `"${debt.from}","${debt.to}",${Number(debt.amount || 0).toFixed(2)}\n`;
    });
  } else {
    deudasSection += 'No hay deudas pendientes\n';
  }

  const csvContent = [
    `Grupo: ${group?.nombre || group?.name || 'Sin nombre'}`,
    `Fecha de exportación: ${new Date().toLocaleString('es-ES')}`,
    `Total de deuda pendiente: $${(debtAnalysis.totalDebts || 0).toFixed(2)}`,
    '',
    headers.join(','),
    ...rows,
    deudasSection
  ].join('\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `analisis_deudas_${group?.nombre || 'grupo'}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Genera un resumen en texto plano
 * @param {Object} data - Datos del grupo
 */
export function generateTextSummary(data) {
  const { group, expenses, stats, debtAnalysis } = data;
  
  let summary = `\n=== RESUMEN DE GRUPO ===\n\n`;
  summary += `Grupo: ${group?.nombre || 'Sin nombre'}\n`;
  summary += `Descripción: ${group?.descripcion || 'Sin descripción'}\n`;
  summary += `Miembros: ${group?.members?.length || 0}\n`;
  summary += `Fecha: ${new Date().toLocaleString('es-ES')}\n\n`;
  
  summary += `=== ESTADÍSTICAS ===\n`;
  summary += `Total gastado: $${(stats?.totalExpenses || 0).toLocaleString()}\n`;
  summary += `Número de gastos: ${stats?.expenseCount || 0}\n`;
  summary += `Promedio por persona: $${(stats?.averagePerPerson || 0).toFixed(2)}\n\n`;
  
  if (debtAnalysis) {
    summary += `=== ANÁLISIS DE DEUDAS ===\n`;
    summary += `Deuda total pendiente: $${(debtAnalysis.totalDebts || 0).toFixed(2)}\n`;
    summary += `Transacciones pendientes: ${debtAnalysis.pendingTransactionsCount || 0}\n\n`;
    
    summary += `Balances por miembro:\n`;
    debtAnalysis.memberBalances?.forEach(member => {
      summary += `  - ${member.name}: $${member.balance.toFixed(2)} (${member.isPositive ? 'Acreedor' : 'Deudor'})\n`;
    });
  }
  
  return summary;
}

