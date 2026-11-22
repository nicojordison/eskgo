import type { Transaction } from '../../types/finance'

export const demoInvoiceRows: Transaction[] = [
  { id: 9101, name: 'Mercado Pão de Açúcar', category: 'Alimentação', date: '04 nov', amount: -184.72, mark: 'P', card: 'Principal' },
  { id: 9102, name: 'Netflix', category: 'Assinaturas', date: '08 nov', amount: -44.90, mark: 'N', card: 'Principal' },
  { id: 9103, name: 'Uber', category: 'Transporte', date: '11 nov', amount: -32.80, mark: 'U', card: 'Principal' },
  { id: 9104, name: 'Restaurante Cora', category: 'Alimentação', date: '15 nov', amount: -86.00, mark: 'C', card: 'Principal' },
]

/** Simulated extraction for local UI review; no file leaves the browser. */
export function readInvoiceDemo() {
  return demoInvoiceRows
}
