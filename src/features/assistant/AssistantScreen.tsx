import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowUp, Check, Copy, MessageCircle, Sparkles, ThumbsDown, ThumbsUp } from 'lucide-react'
import { answerMoneyQuestion } from '../../services/ai/mockAssistant'

type Message = { id: number; role: 'assistant' | 'user'; text: string; feedback?: 'up' | 'down' }
const prompts = ['Quanto gastei com delivery?', 'Como guardo mais para a viagem?', 'Quais assinaturas posso rever?']

export function AssistantScreen({ onBack, monthTotal, onToast }: { onBack: () => void; monthTotal: number; onToast: (message: string) => void }) {
  const [messages, setMessages] = useState<Message[]>([{ id: 1, role: 'assistant', text: 'Oi, Vinícius! Posso te ajudar a entender seus gastos e pensar nos próximos passos. O que você quer descobrir?' }])
  const [draft, setDraft] = useState('')
  const [thinking, setThinking] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => { endRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'end' }) }, [messages, thinking])
  const send = (text = draft) => {
    const question = text.trim()
    if (!question || thinking) return
    setMessages((current) => [...current, { id: Date.now(), role: 'user', text: question }])
    setDraft('')
    setThinking(true)
    window.setTimeout(() => {
      setMessages((current) => [...current, { id: Date.now() + 1, role: 'assistant', text: answerMoneyQuestion(question, monthTotal) }])
      setThinking(false)
    }, 1050)
  }
  const reactTo = (id: number, feedback: 'up' | 'down') => {
    setMessages((current) => current.map((message) => message.id === id ? { ...message, feedback } : message))
    onToast(feedback === 'up' ? 'Que bom que ajudou' : 'Obrigado pelo retorno')
  }

  return <section className="page-view feature-page assistant-page">
    <button className="back-link" onClick={onBack}><ArrowLeft size={17}/> Voltar</button>
    <div className="assistant-shell panel"><header className="assistant-header"><div className="assistant-avatar"><Sparkles size={20}/></div><div><p className="eyebrow">ASSISTENTE ESKGO · DEMO</p><h1>Seu dinheiro, em conversa.</h1><span><i className="assistant-live-dot"/> Pronto para ajudar</span></div><button className="icon-button assistant-back-icon" onClick={onBack} aria-label="Voltar"><ArrowLeft size={18}/></button></header>
      <div className="assistant-context"><span>COM SEUS DADOS</span><b>{currencyBR(monthTotal)} em gastos este mês</b><span className="context-lock"><Check size={12}/> Contexto de demonstração</span></div>
      <div className="chat-messages">{messages.map((message) => <article className={`chat-message ${message.role}`} key={message.id}><span className="message-avatar">{message.role === 'assistant' ? <Sparkles size={14}/> : 'V'}</span><div className="message-content"><div className="message-bubble">{message.text}</div>{message.role === 'assistant' && <div className="message-tools"><button onClick={() => { void navigator.clipboard?.writeText(message.text); onToast('Resposta copiada') }} aria-label="Copiar resposta"><Copy size={13}/></button><button className={message.feedback === 'up' ? 'reacted' : ''} onClick={() => reactTo(message.id, 'up')} aria-label="Resposta útil"><ThumbsUp size={13}/></button><button className={message.feedback === 'down' ? 'reacted' : ''} onClick={() => reactTo(message.id, 'down')} aria-label="Resposta não útil"><ThumbsDown size={13}/></button></div>}</div></article>)}{thinking && <article className="chat-message assistant"><span className="message-avatar"><Sparkles size={14}/></span><div className="message-bubble typing-bubble"><i/><i/><i/></div></article>}<div ref={endRef}/></div>
      {messages.length === 1 && <div className="prompt-suggestions"><p>EXPERIMENTE PERGUNTAR</p>{prompts.map((prompt) => <button key={prompt} onClick={() => send(prompt)}>{prompt}<ArrowUp size={14}/></button>)}</div>}
      <form className="chat-composer" onSubmit={(event) => { event.preventDefault(); send() }}><MessageCircle size={18}/><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Pergunte sobre seu dinheiro" aria-label="Pergunte sobre seu dinheiro"/><button className="send-message" disabled={!draft.trim() || thinking} aria-label="Enviar mensagem"><ArrowUp size={18}/></button></form>
      <p className="chat-disclaimer"><Sparkles size={12}/> Assistente demonstrativo: respostas simuladas, sem conexão com OpenAI.</p>
    </div>
  </section>
}

const currencyBR = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
