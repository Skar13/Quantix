export function evalFormula(expr) {
  if (!expr || String(expr).trim() === '') return 0
  const str = String(expr).trim()
  if (/^-?\d+(\.\d+)?$/.test(str)) return parseFloat(str)
  const safe = str.replace(/\s/g, '').replace(/\^/g, '**')
  if (!/^[\d+\-*/().eE]+$/.test(safe)) return null
  try {
    const result = Function('"use strict"; return (' + safe + ')')()
    if (!isFinite(result)) return null
    return parseFloat(result.toFixed(6))
  } catch { return null }
}
export function formatINR(amount, decimals = 2) {
  if (amount == null || isNaN(amount)) return '—'
  const num = parseFloat(amount)
  if (Math.abs(num) >= 10000000) return '₹' + (num / 10000000).toFixed(2) + ' Cr'
  if (Math.abs(num) >= 100000)   return '₹' + (num / 100000).toFixed(2) + ' L'
  return '₹' + num.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}
export function fmtQty(val) {
  const n = parseFloat(val)
  if (isNaN(n)) return '—'
  return n.toFixed(3)
}
export function calcMeasQty(no, length, width, depth) {
  const vNo = evalFormula(no) || 1
  const vL  = evalFormula(length) || 0
  const vW  = evalFormula(width)  || 0
  const vD  = evalFormula(depth)  || 0
  if (vL && vW && vD) return parseFloat((vNo * vL * vW * vD).toFixed(4))
  if (vL && vW)       return parseFloat((vNo * vL * vW).toFixed(4))
  if (vL)             return parseFloat((vNo * vL).toFixed(4))
  return 0
}
export function getVariation(boqQty, billedQty) {
  if (!boqQty) return { pct: 0, status: 'normal' }
  const pct = ((billedQty - boqQty) / boqQty) * 100
  return { pct: parseFloat(pct.toFixed(2)), status: pct > 10 ? 'high' : pct > 0 ? 'moderate' : 'normal' }
}
export function parseExcelPaste(clipText) {
  return clipText.trim().split('\n').map(row => row.split('\t').map(c => c.trim())).filter(row => row.some(c => c !== ''))
}
