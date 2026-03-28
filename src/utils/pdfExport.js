import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatINR, fmtQty } from './formula';

const COLORS = {
  accent: [240, 165, 0],
  dark: [13, 17, 23],
  text: [230, 237, 243],
  muted: [139, 148, 158],
};

function addHeader(doc, title, projectName) {
  doc.setFillColor(...COLORS.dark);
  doc.rect(0, 0, 210, 28, 'F');
  doc.setFillColor(...COLORS.accent);
  doc.rect(0, 0, 4, 28, 'F');
  doc.setFont('helvetica', 'bold').setFontSize(14).setTextColor(...COLORS.accent);
  doc.text('Quantix', 10, 10);
  doc.setFontSize(10).setTextColor(...COLORS.text);
  doc.text(title, 10, 17);
  doc.setFontSize(8).setTextColor(...COLORS.muted);
  doc.text(projectName || '', 10, 23);
}

export function exportBillToPDF(bill, measurements, items, projectName) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  addHeader(doc, `RA Bill No. ${bill.billNo}`, projectName);

  const tableData = measurements.map((m, i) => {
    const item = items.find(it => it.id === m.itemId);
    return [i + 1, m.member || '—', m.no, m.length, m.width, m.depth || '—', fmtQty(m.qty), item?.unit || ''];
  });

  autoTable(doc, {
    startY: 32,
    head: [['#', 'Description', 'No.', 'L', 'W', 'D', 'Qty', 'Unit']],
    body: tableData,
    headStyles: { fillColor: COLORS.accent, textColor: [0, 0, 0] },
  });

  // Opens PDF in a new tab for preview/manual download
  const blobUrl = doc.output('bloburl');
  window.open(blobUrl, '_blank');
}

export function exportBOQToPDF(parts, items, projectName) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  addHeader(doc, 'Master Bill of Quantities', projectName);

  const tableData = [];
  parts.forEach(part => {
    tableData.push([{ content: `${part.name} — ${part.description}`, colSpan: 7, styles: { fillColor: [255, 245, 220], fontStyle: 'bold' } }]);
    items.filter(i => i.partId === part.id).forEach(item => {
      tableData.push([item.no, item.description, item.unit, fmtQty(item.boqQty), formatINR(item.rate, 0), formatINR(item.boqQty * item.rate), `${((item.billedQty / item.boqQty) * 100).toFixed(0)}%`]);
    });
  });

  autoTable(doc, {
    startY: 32,
    head: [['Item No.', 'Description', 'Unit', 'BOQ Qty', 'Rate', 'Amount', '%Done']],
    body: tableData,
    headStyles: { fillColor: COLORS.accent, textColor: [0, 0, 0] },
  });

  const blobUrl = doc.output('bloburl');
  window.open(blobUrl, '_blank');
}
