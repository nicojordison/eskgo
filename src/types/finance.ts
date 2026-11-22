export type Transaction = {
  id: string | number
  name: string
  category: string
  date: string
  amount: number
  mark: string
  card: string
}

export type CardData = {
  id: string | number
  name: string
  last4: string
  total: number
  color: string
  limit: number
  due: number
}

export type Goal = {
  id: string | number
  name: string
  saved: number
  target: number
  date?: string
}
