import * as XLSX from 'xlsx';

function s2ab(s) {
  const buf = new ArrayBuffer(s.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
  return buf;
}

function triggerDownload(wb, fileName) {
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
  const blob = new Blob([s2ab(wbout)], { type: "application/octet-stream" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";
  a.href = url;
  a.download = fileName;
  a.click();
  setTimeout(() => {
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }, 0);
}

export function exportBOQToExcel(parts, items, projectName) {
  const wb = XLSX.utils.book_new();
  const rows = [['MASTER BILL OF QUANTITIES'], [projectName], []];
  rows.push(['Item No.', 'Description', 'Unit', 'BOQ Qty', 'Rate (₹)', 'Amount (₹)', 'Billed Qty']);

  parts.forEach(part => {
    rows.push([`${part.name} — ${part.description}`, '', '', '', '', '', '']);
    items.filter(i => i.partId === part.id).forEach(item => {
      rows.push([item.no, item.description, item.unit, item.boqQty, item.rate, item.boqQty * item.rate, item.billedQty]);
    });
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, 'Master BOQ');
  triggerDownload(wb, `BOQ_${projectName?.replace(/\s/g, '_') || 'Export'}.xlsx`);
}

export function exportBillToExcel(bill, measurements, items, projectName) {
  const wb = XLSX.utils.book_new();
  const rows = [[`RA BILL No. ${bill.billNo}`], [projectName], []];
  rows.push(['#', 'Description', 'No.', 'L', 'W', 'D', 'Qty', 'Unit']);

  measurements.forEach((m, idx) => {
    const item = items.find(i => i.id === m.itemId);
    rows.push([idx + 1, m.member || m.description, m.no, m.length, m.width, m.depth || '', m.qty, item?.unit || '']);
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, `RA Bill ${bill.billNo}`);
  triggerDownload(wb, `RA_Bill_${bill.billNo}.xlsx`);
}

export function exportCementStatement(entries, projectName) {
  const wb = XLSX.utils.book_new();
  const rows = [
    ['CEMENT CONSUMPTION STATEMENT'],
    [projectName],
    [],
    ['Week', 'Item of Work', 'Work Qty', 'Norm', 'Norm Cons.', 'Actual Cons.', 'Variance', 'Remarks']
  ];

  entries.forEach(e => {
    const normQty = e.work_qty * e.norm;
    const variance = e.actual_bags - normQty;
    rows.push([
      e.week_label, e.item_name, e.work_qty, e.norm,
      normQty.toFixed(0),
      e.actual_bags,
      variance > 0 ? `+${variance.toFixed(0)}` : variance.toFixed(0),
      variance > 10 ? 'Excess — investigate' : 'Within norms'
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [{ wch: 10 }, { wch: 20 }, { wch: 12 }, { wch: 8 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, ws, 'Cement Statement');
  triggerDownload(wb, `Cement_Statement_${projectName?.replace(/\s/g, '_') || 'Export'}.xlsx`);
}
export const exportCementToExcel = exportCementStatement;
