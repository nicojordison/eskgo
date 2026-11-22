export function answerMoneyQuestion(question: string, monthTotal: number) {
  const normalized = question.toLocaleLowerCase('pt-BR')
  if (normalized.includes('delivery') || normalized.includes('entrega')) {
    return 'Neste mês, você gastou R$ 480 com delivery. Reduzindo esse valor em R$ 120 por mês, sua viagem pode acontecer até 3 meses antes.'
  }
  if (normalized.includes('assinatura') || normalized.includes('netflix')) {
    return 'Encontrei 6 assinaturas na sua fatura. Duas que você quase não usa somam R$ 320. Se cancelar as duas, esse valor pode ir direto para sua meta.'
  }
  if (normalized.includes('viagem') || normalized.includes('guardar') || normalized.includes('meta')) {
    return 'Sua meta Viagem ao Japão está em 68%, com R$ 13.600 guardados. Reservando R$ 500 por mês, você mantém o plano no ritmo para dezembro de 2027.'
  }
  return `Até agora, seus gastos registrados no mês somam ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(monthTotal)}. Posso ajudar a entender categorias, assinaturas ou o ritmo das suas metas.`
}
