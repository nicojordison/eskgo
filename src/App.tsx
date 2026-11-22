import { useMemo, useState } from 'react'
import {
  ArrowRight, ArrowUpRight, CalendarDays, Check, ChevronDown,
  ChevronRight, CircleHelp, CreditCard, Ellipsis, Eye, EyeOff,
  Home, LogOut, Plus, Receipt, Settings2, Sparkles, Target, Trash2, Wallet, X,
} from 'lucide-react'
import { AuthScreen } from './features/auth/AuthScreen'
import { InvoiceScreen } from './features/invoice/InvoiceScreen'
import { AssistantScreen } from './features/assistant/AssistantScreen'
import type { CardData, Goal, Transaction } from './types/finance'

type View = 'auth' | 'home' | 'cards' | 'goals' | 'invoice' | 'assistant'

const currency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
const parseMoney = (value: string) => Number(value.replace(/\./g, '').replace(',', '.'))
const monthNames = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
function dateInputValue(label: string | undefined, today: string) {
  const now = new Date(`${today}T12:00:00`)
  if (!label || label.startsWith('Hoje')) return today
  if (label.startsWith('Ontem')) { now.setDate(now.getDate() - 1); return localDateValue(now) }
  const match = label.match(/^(\d{1,2})\s+([a-zç]{3})/i)
  const month = match ? monthNames.indexOf(match[2].toLowerCase()) : -1
  if (match && month >= 0) return localDateValue(new Date(now.getFullYear(), month, Number(match[1]), 12))
  return today
}
function localDateValue(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` }
const startingTransactions: Transaction[] = [
  { id: 1, name: 'Mercado Pão de Açúcar', category: 'Alimentação', date: 'Hoje, 10:42', amount: -184.72, mark: 'P', card: 'Principal' },
  { id: 2, name: 'Netflix', category: 'Assinaturas', date: 'Hoje, 08:15', amount: -44.90, mark: 'N', card: 'Salário' },
  { id: 3, name: 'Uber', category: 'Transporte', date: 'Ontem, 19:30', amount: -32.80, mark: 'U', card: 'Principal' },
  { id: 4, name: 'Restaurante Cora', category: 'Alimentação', date: 'Ontem, 13:05', amount: -86.00, mark: 'C', card: 'Viagem' },
]
const initialCards: CardData[] = [
  { id: 1, name: 'Principal', last4: '4552', total: 1284, color: 'lilac', limit: 3000, due: 8 },
  { id: 2, name: 'Salário', last4: '6917', total: 640, color: 'peach', limit: 2500, due: 12 },
  { id: 3, name: 'Viagem', last4: '1180', total: 98, color: 'teal', limit: 1800, due: 27 },
]
const initialGoals: Goal[] = [
  { id: 1, name: 'Viagem ao Japão', saved: 13600, target: 20000, date: 'Dez 2027' },
  { id: 2, name: 'Reserva', saved: 7200, target: 10000 },
  { id: 3, name: 'Curso', saved: 2700, target: 3000 },
  { id: 4, name: 'Carro novo', saved: 9600, target: 40000 },
]

export default function App() {
  const [view, setView] = useState<View>('auth')
  const [viewHistory, setViewHistory] = useState<View[]>([])
  const [userName, setUserName] = useState('Vinícius')
  const [transactions, setTransactions] = useState(startingTransactions)
  const [cards, setCards] = useState(initialCards)
  const [goals, setGoals] = useState(initialGoals)
  const [sheet, setSheet] = useState<'expense' | 'card' | 'goal' | 'save' | 'budget' | 'account' | 'transaction' | null>(null)
  const [activeTransaction, setActiveTransaction] = useState<Transaction | null>(null)
  const [budgetCategory, setBudgetCategory] = useState({ name: 'Alimentação', limit: 800 })
  const [categoryLimits, setCategoryLimits] = useState<Record<string, number>>({ Alimentação: 800, Moradia: 1200, Transporte: 600, Lazer: 600 })
  const [selectedCard, setSelectedCard] = useState(0)
  const [hidden, setHidden] = useState(false)
  const [toast, setToast] = useState('')
  const [saveGoal, setSaveGoal] = useState<Goal | null>(null)
  const [authenticated, setAuthenticated] = useState(false)

  const spendingDelta = useMemo(() => transactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0) - startingTransactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0), [transactions])
  const monthTotal = 2340 + spendingDelta
  const balance = 14500 - spendingDelta
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(''), 2600) }
  const openExpense = () => { setActiveTransaction(null); setSheet('expense') }
  const addTransaction = (tx: Transaction) => {
    setTransactions((current) => [tx, ...current])
    if (tx.card !== 'Dinheiro / Pix') setCards((current) => current.map((card) => card.name === tx.card ? { ...card, total: card.total + Math.abs(tx.amount) } : card))
    setSheet(null)
    notify('Gasto adicionado')
  }
  const updateTransaction = (tx: Transaction) => {
    if (!activeTransaction) return addTransaction(tx)
    const previous = activeTransaction
    setTransactions((current) => current.map((item) => item.id === previous.id ? { ...tx, id: previous.id } : item))
    setCards((current) => current.map((card) => ({ ...card, total: card.total - (previous.card === card.name ? Math.abs(previous.amount) : 0) + (tx.card === card.name ? Math.abs(tx.amount) : 0) })))
    setSheet(null)
    setActiveTransaction(null)
    notify('Gasto atualizado')
  }
  const removeTransaction = (tx: Transaction) => {
    setTransactions((current) => current.filter((item) => item.id !== tx.id))
    setCards((current) => current.map((card) => card.name === tx.card ? { ...card, total: Math.max(0, card.total - Math.abs(tx.amount)) } : card))
    setSheet(null)
    setActiveTransaction(null)
    notify('Gasto removido')
  }
  const addInvoiceTransactions = (rows: Transaction[]) => {
    const stamp = Date.now()
    const added = rows.map((row, index) => ({ ...row, id: stamp + index }))
    setTransactions((current) => [...added, ...current])
    setCards((current) => current.map((card) => card.name === 'Principal' ? { ...card, total: card.total + added.filter((row) => row.card === card.name).reduce((sum, row) => sum + Math.abs(row.amount), 0) } : card))
    setViewHistory([])
    setView('home')
    notify(`${rows.length} lançamentos adicionados à home`)
  }
  const navigate = (next: View) => { setViewHistory((history) => [...history, view]); setView(next); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const goBack = () => { const previous = viewHistory[viewHistory.length - 1]; setViewHistory((history) => history.slice(0, -1)); setView(previous ?? 'home'); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const goHome = () => { setViewHistory([]); setView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const enterDemo = (name: string) => { setUserName(name); setAuthenticated(true); setViewHistory([]); setView('home') }

  if (view === 'auth' || !authenticated) return <AuthScreen onEnter={enterDemo} />

  return <div className="app-shell">
    <header className="topbar">
      <button className="brand" onClick={goHome} aria-label="Eskgo, início"><span className="brand-mark">e</span><span>eskgo</span></button>
      <nav className="desktop-nav" aria-label="Navegação principal">
        <button className={view === 'home' ? 'nav-link active' : 'nav-link'} onClick={() => navigate('home')}>Visão geral</button>
        <button className={view === 'cards' ? 'nav-link active' : 'nav-link'} onClick={() => navigate('cards')}>Cartões</button>
        <button className={view === 'goals' ? 'nav-link active' : 'nav-link'} onClick={() => navigate('goals')}>Metas</button>
        <button className={view === 'invoice' ? 'nav-link active' : 'nav-link'} onClick={() => navigate('invoice')}>Fatura</button>
      </nav>
      <button className="profile-button" onClick={() => setSheet('account')} aria-label="Abrir conta">
        <span className="avatar">{userName[0]?.toLocaleUpperCase('pt-BR')}</span><span className="profile-copy"><small>Bem-vindo de volta,</small><strong>{userName}</strong></span><ChevronDown size={15} className="profile-chevron" />
      </button>
    </header>

    <main className="main-content">
      {view === 'home' && <>
        <div className="welcome-row"><div><p className="eyebrow">SÁBADO, 21 DE NOVEMBRO</p><h1>Olá, {userName} <span className="wave">✳</span></h1><p className="welcome-sub">Aqui está um resumo do seu dinheiro.</p></div><button className="account-mobile" onClick={() => setSheet('account')} aria-label="Conta"><span className="avatar">{userName[0]?.toLocaleUpperCase('pt-BR')}</span></button></div>
        <section className="hero-grid">
          <div className="balance-card">
            <div className="balance-top"><span className="brand-word">eskgo<span className="brand-dot">.</span></span><button className="icon-button on-hero" onClick={() => setHidden(!hidden)} aria-label={hidden ? 'Mostrar saldo' : 'Ocultar saldo'}>{hidden ? <EyeOff size={19} /> : <Eye size={19} />}</button></div>
            <div className="balance-label">Seu saldo</div><div className="balance-value">{hidden ? '••••••' : currency(balance)}</div>
            <div className="balance-bottom"><span><i className="live-dot" /> Atualizado agora</span><span className="hero-arrow"><ArrowUpRight size={16} /> +8,4% este mês</span></div>
            <div className="hero-orb orb-one"/><div className="hero-orb orb-two"/>
          </div>
          <div className="month-card panel">
            <div className="section-heading compact"><div><p className="eyebrow">FINANÇAS · NOVEMBRO</p><h2>Este mês</h2></div><button className="round-button" onClick={() => navigate('goals')} aria-label="Ver metas"><ChevronRight size={18}/></button></div>
            <div className="month-amount">{currency(monthTotal)}</div><p className="month-compare"><span className="compare-pill">↓ 12%</span> em relação a outubro</p>
            <div className="month-bars" aria-label="Gastos por semana"><span style={{height:'42%'}}/><span style={{height:'65%'}}/><span style={{height:'54%'}}/><span style={{height:'82%'}}/><span style={{height:'58%'}}/><span style={{height:'72%'}}/><span style={{height:'39%'}}/><span style={{height:'68%'}}/><span style={{height:'49%'}}/><span style={{height:'89%'}}/><span style={{height:'60%'}}/><span className="bar-current" style={{height:'34%'}}/></div>
            <div className="month-caption"><span>01 nov</span><span>Hoje, 21 nov</span></div>
          </div>
        </section>

        <div className="shortcut-row">
          <button className="shortcut primary" onClick={openExpense}><span className="shortcut-icon"><Plus size={20}/></span><span>Adicionar gasto</span><ArrowUpRight size={16} className="shortcut-end"/></button>
          <button className="shortcut" onClick={() => navigate('invoice')}><span className="shortcut-icon peach-icon"><Receipt size={19}/></span><span>Enviar fatura</span><ChevronRight size={16} className="shortcut-end"/></button>
          <button className="shortcut" onClick={() => navigate('cards')}><span className="shortcut-icon lilac-icon"><CreditCard size={19}/></span><span>Meus cartões</span><ChevronRight size={16} className="shortcut-end"/></button>
          <button className="shortcut" onClick={() => navigate('goals')}><span className="shortcut-icon peach-icon"><Target size={19}/></span><span>Minhas metas</span><ChevronRight size={16} className="shortcut-end"/></button>
        </div>

        <section className="home-lower">
          <div className="panel transactions-panel">
            <div className="section-heading"><div><p className="eyebrow">SEU DINHEIRO EM MOVIMENTO</p><h2>Transações recentes</h2></div><button className="text-link" onClick={() => notify('Você está vendo as últimas transações')}>Ver todas <ArrowUpRight size={14}/></button></div>
            <div className="transaction-list">{transactions.slice(0, 5).map((tx) => <TransactionRow key={tx.id} tx={tx} onClick={() => { setActiveTransaction(tx); setSheet('transaction') }} />)}</div>
            {transactions.length === 0 && <div className="empty-state"><span className="empty-icon"><Wallet size={22}/></span><strong>Seu mês começa aqui</strong><p>Adicione o primeiro gasto para acompanhar seu dinheiro.</p><button className="button-lime small" onClick={openExpense}>Adicionar gasto</button></div>}
          </div>
          <div className="side-stack">
            <div className="panel categories-panel"><div className="section-heading"><div><p className="eyebrow">VISÃO DO MÊS</p><h2>Onde você gastou</h2></div><span className="more-dot"><Ellipsis size={20}/></span></div>
              <CategoryBar name="Moradia" value="R$ 980" percent={82} color="lime"/><CategoryBar name="Alimentação" value="R$ 720" percent={64} color="lilac"/><CategoryBar name="Transporte" value="R$ 390" percent={42} color="peach"/>
              <button className="category-foot" onClick={() => navigate('goals')}>Ver orçamento do mês <ArrowUpRight size={14}/></button>
            </div>
            <button className="goal-peek" onClick={() => navigate('goals')}><div className="goal-peek-icon"><Target size={21}/></div><div className="goal-peek-copy"><span>SEU FOCO</span><strong>Viagem ao Japão</strong><small>68% da meta alcançada</small></div><div className="mini-ring"><span>68%</span></div></button>
            <button className="assistant-insight" onClick={() => navigate('assistant')}><span className="assistant-insight-icon"><Sparkles size={17}/></span><span><small>INSIGHT DO ESKGO</small><b>R$ 120 a mais para sua viagem</b><em>Entenda seus gastos com o assistente</em></span><ArrowRight size={16}/></button>
          </div>
        </section>
      </>}

      {view === 'cards' && <section className="page-view"><PageHeading kicker="SUA CARTEIRA" title="Cartões" subtitle="Seus cartões, organizados em um só lugar." action={<button className="button-lime" onClick={() => setSheet('card')}><Plus size={18}/> Novo cartão</button>} />
        <div className="cards-layout"><div className="wallet-stack">{cards.map((card, index) => <button key={card.id} className={`wallet-card ${card.color} ${selectedCard === index ? 'selected' : ''}`} onClick={() => setSelectedCard(index)} style={{ zIndex: cards.length - index, transform: `translateY(${index * 26}px) scale(${1 - index * 0.035})` }}><div className="wallet-card-top"><span className="brand-word">eskgo<span className="brand-dot">.</span></span><span className="card-chip"/></div><span className="wallet-card-label">{card.name}</span><strong>{currency(card.total)}</strong><div className="wallet-card-bottom"><span>•••• {card.last4}</span><span>VENCE EM {card.due} DIAS</span></div></button>)}</div>
          <div className="panel card-details"><p className="eyebrow">FATURA ATUAL</p><h2>{cards[selectedCard]?.name}</h2><div className="detail-total">{currency(cards[selectedCard]?.total ?? 0)}</div><div className="limit-caption"><span>Limite usado</span><strong>{Math.round(((cards[selectedCard]?.total ?? 0) / (cards[selectedCard]?.limit ?? 1)) * 100)}%</strong></div><div className="progress-track"><span style={{width:`${Math.min(((cards[selectedCard]?.total ?? 0) / (cards[selectedCard]?.limit ?? 1)) * 100, 100)}%`}}/></div><p className="detail-muted">de {currency(cards[selectedCard]?.limit ?? 0)} de limite</p><div className="due-row"><CalendarDays size={18}/><span>Próximo vencimento</span><strong>Em {cards[selectedCard]?.due} dias</strong></div><button className="outline-button full" onClick={() => setSheet('card')}><Settings2 size={17}/> Gerenciar cartões</button></div></div>
        <section className="panel upcoming-panel"><div className="section-heading"><div><p className="eyebrow">ORGANIZAÇÃO</p><h2>Próximas faturas</h2></div><span className="upcoming-label">NOVEMBRO</span></div>{cards.map((card) => <div className="upcoming-row" key={card.id}><span className={`tiny-card ${card.color}`}><CreditCard size={16}/></span><div><strong>{card.name}</strong><small>•••• {card.last4} · vence em {card.due} dias</small></div><b>{currency(card.total)}</b></div>)}</section>
      </section>}

      {view === 'goals' && <section className="page-view"><PageHeading kicker="SEU PLANO, NO SEU TEMPO" title="Metas" subtitle="Acompanhe o mês e tudo o que você está construindo." action={<button className="button-lime" onClick={() => setSheet('goal')}><Plus size={18}/> Nova meta</button>} />
        <div className="goals-grid"><div className="panel budget-panel"><div className="section-heading"><div><p className="eyebrow">NOVEMBRO · 20 DIAS RESTANTES</p><h2>Ainda pode gastar</h2></div><button className="round-button" onClick={() => notify('Toque em uma categoria para ajustar o teto.')} aria-label="Ajuda sobre limites"><Ellipsis size={18}/></button></div><div className="budget-big">R$ 860 <span>de R$ 3.200</span></div><div className="progress-track budget-track"><span style={{width:'73%'}}/></div><p className="detail-muted">Você já usou 73% do seu limite mensal.</p><div className="budget-categories"><BudgetCategory name="Alimentação" amount={496} limit={categoryLimits.Alimentação} color="lime" onClick={() => { setBudgetCategory({ name: 'Alimentação', limit: categoryLimits.Alimentação }); setSheet('budget') }}/><BudgetCategory name="Moradia" amount={1200} limit={categoryLimits.Moradia} color="lilac" onClick={() => { setBudgetCategory({ name: 'Moradia', limit: categoryLimits.Moradia }); setSheet('budget') }}/><BudgetCategory name="Transporte" amount={240} limit={categoryLimits.Transporte} color="teal" onClick={() => { setBudgetCategory({ name: 'Transporte', limit: categoryLimits.Transporte }); setSheet('budget') }}/><BudgetCategory name="Lazer" amount={234} limit={categoryLimits.Lazer} color="peach" onClick={() => { setBudgetCategory({ name: 'Lazer', limit: categoryLimits.Lazer }); setSheet('budget') }}/></div></div>
          <div className="panel savings-panel"><div className="section-heading"><div><p className="eyebrow">UM POUCO DE CADA VEZ</p><h2>Guardando para</h2></div><button className="round-button" onClick={() => setSheet('goal')} aria-label="Nova meta"><Plus size={19}/></button></div>
            {goals.map((goal, index) => { const pct = Math.min(Math.round(goal.saved / goal.target * 100), 100); return <div className={index === 0 ? 'featured-goal' : 'saving-row'} key={goal.id}><div className="saving-top"><span className="goal-emoji">{['✈','◉','✳','⌂'][index % 4]}</span><div className="saving-info"><strong>{goal.name}</strong><small>{goal.date || `${currency(goal.saved)} guardados`}</small></div><span className="saving-pct">{pct}%</span></div><div className="progress-track"><span style={{width:`${pct}%`}}/></div>{index === 0 && <div className="featured-bottom"><div><strong>{currency(goal.saved)}</strong><small>de {currency(goal.target)}</small></div><button className="button-lime small" onClick={() => { setSaveGoal(goal); setSheet('save') }}><Plus size={15}/> Guardar</button></div>}</div> })}
          </div></div>
        <button className="assistant-insight goals-insight" onClick={() => navigate('assistant')}><span className="assistant-insight-icon"><Sparkles size={19}/></span><span><small>ASSISTENTE ESKGO · SEU PRÓXIMO PASSO</small><b>Cancelando duas assinaturas, você guarda mais R$ 320.</b><em>Ver a análise com seus dados <ArrowRight size={14}/></em></span><div className="insight-number">+R$ 320</div></button>
      </section>}

      {view === 'invoice' && <InvoiceScreen onBack={goBack} onConfirm={addInvoiceTransactions}/>}
      {view === 'assistant' && <AssistantScreen onBack={goBack} monthTotal={monthTotal} onToast={notify}/>}
    </main>

    {!['invoice', 'assistant'].includes(view) && <nav className="mobile-nav" aria-label="Navegação móvel"><button className={view === 'home' ? 'mobile-nav-item selected' : 'mobile-nav-item'} onClick={goHome}><Home size={19}/><span>Início</span></button><button className={view === 'cards' ? 'mobile-nav-item selected' : 'mobile-nav-item'} onClick={() => navigate('cards')}><CreditCard size={19}/><span>Cartões</span></button><button className="mobile-add" onClick={openExpense} aria-label="Adicionar gasto"><Plus size={23}/></button><button className={view === 'goals' ? 'mobile-nav-item selected' : 'mobile-nav-item'} onClick={() => navigate('goals')}><Target size={19}/><span>Metas</span></button><button className="mobile-nav-item" onClick={() => setSheet('account')}><Ellipsis size={20}/><span>Conta</span></button></nav>}
    {toast && <div className="toast"><span className="toast-check"><Check size={14}/></span>{toast}</div>}
    {sheet && <Sheet onClose={() => setSheet(null)}>
      {sheet === 'expense' && <ExpenseForm cards={cards} initial={activeTransaction ?? undefined} onCancel={() => setSheet(null)} onSave={updateTransaction}/>}
      {sheet === 'card' && <CardForm onCancel={() => setSheet(null)} onSave={(card) => { setCards((current) => [...current, { ...card, id: Date.now(), total: 0, color: ['lilac','peach','teal'][current.length % 3] }]); setSheet(null); notify('Cartão adicionado') }}/>}
      {sheet === 'goal' && <GoalForm onCancel={() => setSheet(null)} onSave={(goal) => { setGoals((current) => [...current, { ...goal, id: Date.now() }]); setSheet(null); notify('Meta criada') }}/>}
      {sheet === 'save' && saveGoal && <SaveForm goal={saveGoal} onCancel={() => setSheet(null)} onSave={(amount) => { setGoals((current) => current.map((goal) => goal.id === saveGoal.id ? { ...goal, saved: goal.saved + amount } : goal)); setSheet(null); notify('Valor guardado na sua meta') }}/>}
      {sheet === 'budget' && <BudgetForm category={budgetCategory} onCancel={() => setSheet(null)} onSave={(limit) => { setCategoryLimits((current) => ({ ...current, [budgetCategory.name]: limit })); setSheet(null); notify(`Teto de ${budgetCategory.name.toLocaleLowerCase('pt-BR')} atualizado`) }}/>} 
      {sheet === 'account' && <div className="sheet-content"><div className="sheet-grab"/><div className="sheet-title-row"><div><p className="eyebrow">SUA CONTA</p><h2>Seu espaço</h2></div><button className="icon-button" onClick={() => setSheet(null)}><X size={20}/></button></div><div className="account-card"><span className="avatar large">{userName[0]?.toLocaleUpperCase('pt-BR')}</span><div><strong>{userName}</strong><small>conta de demonstração</small></div></div><button className="account-option" onClick={() => setHidden(!hidden)}>{hidden ? <Eye size={18}/> : <EyeOff size={18}/>}<span>{hidden ? 'Mostrar saldo' : 'Ocultar saldo'}</span><ChevronRight size={17}/></button><button className="account-option" onClick={() => notify('Tudo certo por aqui')}><CircleHelp size={18}/><span>Ajuda</span><ChevronRight size={17}/></button><button className="account-option logout" onClick={() => { setSheet(null); setAuthenticated(false); setViewHistory([]); setView('auth'); notify('Você saiu da sua conta') }}><LogOut size={18}/><span>Sair da conta</span><ChevronRight size={17}/></button><p className="account-version">Eskgo · versão 1.0</p></div>}
      {sheet === 'transaction' && activeTransaction && <div className="sheet-content"><div className="sheet-grab"/><div className="sheet-title-row"><div><p className="eyebrow">DETALHE DA COMPRA</p><h2>{activeTransaction.name}</h2></div><button className="icon-button" onClick={() => setSheet(null)}><X size={20}/></button></div><div className="tx-detail-amount">− {currency(Math.abs(activeTransaction.amount))}</div><div className="tx-detail-lines"><div><span>Categoria</span><strong>{activeTransaction.category}</strong></div><div><span>Cartão</span><strong>{activeTransaction.card}</strong></div><div><span>Data</span><strong>{activeTransaction.date}</strong></div></div><div className="sheet-actions"><button className="outline-button" onClick={() => setSheet('expense')}><Settings2 size={16}/> Editar gasto</button><button className="outline-button delete-action" onClick={() => removeTransaction(activeTransaction)}><Trash2 size={16}/> Apagar</button></div></div>}
    </Sheet>}
  </div>
}

function TransactionRow({ tx, onClick }: { tx: Transaction; onClick: () => void }) {
  return <button className="transaction-row" onClick={onClick}><span className={`merchant-mark mark-${tx.mark.toLowerCase()}`}>{tx.mark}</span><span className="transaction-info"><strong>{tx.name}</strong><small>{tx.category} <i/> {tx.date}</small></span><span className="transaction-amount">− {currency(Math.abs(tx.amount))}</span><ChevronRight size={16} className="transaction-chevron"/></button>
}
function CategoryBar({ name, value, percent, color }: { name:string; value:string; percent:number; color:string }) { return <div className="category-item"><div className="category-top"><span>{name}</span><strong>{value}</strong></div><div className="progress-track"><span className={`fill-${color}`} style={{width:`${percent}%`}}/></div></div> }
function BudgetCategory({ name, amount, limit, color, onClick }: { name:string; amount:number; limit:number; color:string; onClick:() => void }) { const percent = Math.min(Math.round(amount / Math.max(limit, 1) * 100), 100); return <button className="budget-category" onClick={onClick} aria-label={`Ajustar teto de ${name}`}><div className="category-top"><span>{name}</span><strong>{percent}%</strong></div><small>{currency(amount)} / {currency(limit)}</small><div className="progress-track"><span className={`fill-${color}`} style={{width:`${percent}%`}}/></div></button> }
function PageHeading({ kicker, title, subtitle, action }: { kicker:string; title:string; subtitle:string; action:React.ReactNode }) { return <div className="page-heading"><div><p className="eyebrow">{kicker}</p><h1>{title}</h1><p className="welcome-sub">{subtitle}</p></div>{action}</div> }
function Sheet({ children, onClose }: { children:React.ReactNode; onClose:() => void }) { return <div className="sheet-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="sheet" role="dialog" aria-modal="true">{children}</section></div> }
function SheetHead({ kicker, title, onClose }: { kicker:string; title:string; onClose:() => void }) { return <><div className="sheet-grab"/><div className="sheet-title-row"><div><p className="eyebrow">{kicker}</p><h2>{title}</h2></div><button type="button" className="icon-button" onClick={onClose} aria-label="Fechar"><X size={20}/></button></div></> }
function ExpenseForm({ cards, initial, onCancel, onSave }: { cards:CardData[]; initial?:Transaction; onCancel:() => void; onSave:(tx:Transaction) => void }) {
  const now = new Date(); const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const [amount, setAmount] = useState(initial ? Math.abs(initial.amount).toFixed(2).replace('.', ',') : ''); const [name, setName] = useState(initial?.name ?? ''); const [category, setCategory] = useState(initial?.category ?? 'Alimentação'); const [card, setCard] = useState(initial?.card ?? cards[0]?.name ?? 'Dinheiro / Pix'); const [date, setDate] = useState(dateInputValue(initial?.date, today))
  return <form className="sheet-content" onSubmit={(event) => { event.preventDefault(); const parsed = parseMoney(amount); if (!parsed || !name.trim()) return; const parsedDate = new Date(`${date}T12:00:00`); const dateLabel = date === today ? 'Hoje, agora' : parsedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }); onSave({ id:initial?.id ?? Date.now(), name:name.trim(), category, date:dateLabel, amount:-parsed, mark:name.trim()[0].toLocaleUpperCase('pt-BR'), card }) }}><SheetHead kicker={initial ? 'EDITAR LANÇAMENTO' : 'NOVO LANÇAMENTO'} title={initial ? 'Editar gasto' : 'Adicionar gasto'} onClose={onCancel}/><label className="field-label">Valor da compra<div className="amount-field"><span>R$</span><input autoFocus inputMode="decimal" placeholder="0,00" value={amount} onChange={(e) => setAmount(e.target.value)} required/></div></label><label className="field-label">O que você comprou<input className="text-field" placeholder="Ex.: almoço, mercado..." value={name} onChange={(e) => setName(e.target.value)} required/></label><div className="form-row"><label className="field-label">Categoria<select className="text-field" value={category} onChange={(e) => setCategory(e.target.value)}>{['Alimentação','Moradia','Transporte','Lazer','Assinaturas','Saúde','Outros'].map((item) => <option key={item}>{item}</option>)}</select></label><label className="field-label">Cartão<select className="text-field" value={card} onChange={(e) => setCard(e.target.value)}><option>Dinheiro / Pix</option>{cards.map((item) => <option key={item.id}>{item.name}</option>)}</select></label></div><label className="field-label">Data<input className="text-field" type="date" value={date} onChange={(e) => setDate(e.target.value)}/></label><div className="sheet-actions"><button type="button" className="outline-button" onClick={onCancel}>Cancelar</button><button className="button-lime" type="submit">{initial ? 'Salvar alterações' : 'Salvar gasto'} <ArrowUpRight size={17}/></button></div></form>
}
function CardForm({ onCancel, onSave }: { onCancel:() => void; onSave:(card:Omit<CardData,'id'|'total'|'color'|'due'> & {due:number}) => void }) { const [name,setName]=useState(''); const [last4,setLast4]=useState(''); const [limit,setLimit]=useState(''); const [due,setDue]=useState('8'); return <form className="sheet-content" onSubmit={(e)=>{e.preventDefault();const parsedLimit=parseMoney(limit);if(!name.trim()||parsedLimit<=0)return;onSave({name:name.trim(),last4,limit:parsedLimit,due:Number(due)})}}><SheetHead kicker="SUA CARTEIRA" title="Novo cartão" onClose={onCancel}/><label className="field-label">Apelido do cartão<input className="text-field" placeholder="Ex.: Principal" value={name} onChange={(e)=>setName(e.target.value)} required/></label><div className="form-row"><label className="field-label">Final do cartão<input className="text-field" maxLength={4} inputMode="numeric" placeholder="4552" value={last4} onChange={(e)=>setLast4(e.target.value)} required/></label><label className="field-label">Limite total<input className="text-field" inputMode="decimal" placeholder="3.000,00" value={limit} onChange={(e)=>setLimit(e.target.value)} required/></label></div><label className="field-label">Vence em (dias)<input className="text-field" inputMode="numeric" value={due} onChange={(e)=>setDue(e.target.value)}/></label><div className="sheet-actions"><button type="button" className="outline-button" onClick={onCancel}>Cancelar</button><button className="button-lime" type="submit">Salvar cartão <ArrowUpRight size={17}/></button></div></form> }
function GoalForm({ onCancel, onSave }: { onCancel:() => void; onSave:(goal:Omit<Goal,'id'>) => void }) { const [name,setName]=useState(''); const [target,setTarget]=useState(''); const [date,setDate]=useState(''); return <form className="sheet-content" onSubmit={(e)=>{e.preventDefault();const parsedTarget=parseMoney(target);if(!name.trim()||parsedTarget<=0)return;onSave({name:name.trim(),saved:0,target:parsedTarget,date:date||undefined})}}><SheetHead kicker="SEU PRÓXIMO PASSO" title="Criar uma meta" onClose={onCancel}/><label className="field-label">O que você está planejando?<input className="text-field" placeholder="Ex.: viagem, reserva..." value={name} onChange={(e)=>setName(e.target.value)} required/></label><div className="form-row"><label className="field-label">Valor que quer juntar<input className="text-field" inputMode="decimal" placeholder="10.000,00" value={target} onChange={(e)=>setTarget(e.target.value)} required/></label><label className="field-label">Até quando?<input className="text-field" placeholder="Dez 2027" value={date} onChange={(e)=>setDate(e.target.value)}/></label></div><div className="sheet-actions"><button type="button" className="outline-button" onClick={onCancel}>Cancelar</button><button className="button-lime" type="submit">Criar meta <ArrowUpRight size={17}/></button></div></form> }
function SaveForm({ goal, onCancel, onSave }: { goal:Goal; onCancel:() => void; onSave:(amount:number) => void }) { const [amount,setAmount]=useState('500'); return <form className="sheet-content" onSubmit={(e)=>{e.preventDefault();const value=parseMoney(amount);if(value>0)onSave(value)}}><SheetHead kicker="GUARDANDO PARA" title={goal.name} onClose={onCancel}/><p className="save-context">Você já guardou <strong>{currency(goal.saved)}</strong> de {currency(goal.target)}.</p><label className="field-label">Quanto quer guardar agora?<div className="amount-field"><span>R$</span><input inputMode="decimal" value={amount} onChange={(e)=>setAmount(e.target.value)} required/></div></label><div className="sheet-actions"><button type="button" className="outline-button" onClick={onCancel}>Agora não</button><button className="button-lime" type="submit">Guardar valor <Check size={17}/></button></div></form> }
function BudgetForm({ category, onCancel, onSave }: { category:{name:string;limit:number}; onCancel:() => void; onSave:(limit:number)=>void }) { const [limit,setLimit]=useState(category.limit.toFixed(2).replace('.',',')); return <form className="sheet-content" onSubmit={(event)=>{event.preventDefault();const parsed=parseMoney(limit);if(parsed>0)onSave(parsed)}}><SheetHead kicker="TETO DO MÊS" title={category.name} onClose={onCancel}/><p className="save-context">Defina quanto você quer reservar para esta categoria neste mês.</p><label className="field-label">Limite da categoria<div className="amount-field"><span>R$</span><input autoFocus inputMode="decimal" value={limit} onChange={(event)=>setLimit(event.target.value)} required/></div></label><div className="sheet-actions"><button type="button" className="outline-button" onClick={onCancel}>Cancelar</button><button className="button-lime" type="submit">Atualizar teto <Check size={17}/></button></div></form> }
