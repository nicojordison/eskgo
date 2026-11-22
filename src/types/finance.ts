export type Transaction = {
  id: number
  name: string
  category: string
  date: string
  amount: number
  mark: string
  card: string
}

export type CardData = {
  id: number
  name: string
  last4: string
  total: number
  color: string
  limit: number
  due: number
}

export type Goal = {
  id: number
  name: string
  saved: number
  target: number
  date?: string
}
