import { useRef, useState } from 'react'
import { ArrowDownToLine, ArrowLeft, ArrowRight, Check, FileCheck2, FileUp, LoaderCircle, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react'
import type { Transaction } from '../../types/finance'
import { readInvoiceDemo } from '../../services/ai/mockInvoice'

type Step = 'choose' | 'reading' | 'review'

export function InvoiceScreen({ onBack, onConfirm }: { onBack: () => void; onConfirm: (transactions: Transaction[]) => void }) {
  const [step, setStep] = useState<Step>('choose')
  const [fileName, setFileName] = useState('fatura-novembro.pdf')
  const [error, setError] = useState('')
  const [rows, setRows] = useState(readInvoiceDemo())
  const [selected, setSelected] = useState<number[]>(rows.map((row) => row.id))
  const fileRef = useRef<HTMLInputElement>(null)

  const readFile = (file?: File) => {
    setError('')
    if (file) {
      if (!/\.pdf$|image\/(jpeg|png|webp)/i.test(file.name) && !file.type.startsWith('image/')) {
        setError('Escolha um PDF ou uma imagem JPG, PNG ou WEBP.')
        return
      }
      if (file.size > 20 * 1024 * 1024) {
        setError('O arquivo precisa ter até 20 MB.')
        return
      }
      setFileName(file.name)
    }
    setStep('reading')
    window.setTimeout(() => {
      const stamp = Date.now()
      const extracted = readInvoiceDemo().map((row, index) => ({ ...row, id: stamp + index }))
      setRows(extracted)
      setSelected(extracted.map((row) => row.id))
      setStep('review')
    }, 1350)
  }
  const toggleRow = (id: number) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  const chosen = rows.filter((row) => selected.includes(row.id))
  const total = chosen.reduce((sum, row) => sum + Math.abs(row.amount), 0)

  return <section className="page-view feature-page invoice-page">
    <button className="back-link" onClick={onBack}><ArrowLeft size={17}/> Voltar</button>
    <div className="page-heading"><div><p className="eyebrow">MAIS CLAREZA, MENOS DIGITAÇÃO</p><h1>Fatura</h1><p className="welcome-sub">Organize as compras da sua fatura antes de adicionar ao mês.</p></div><span className="feature-badge"><Sparkles size={14}/> ESKGO PLUS</span></div>
    <div className="invoice-stepper"><div className={step === 'choose' ? 'step active' : 'step done'}><span>{step === 'choose' ? '1' : <Check size={14}/>}</span><small>Enviar</small></div><i/><div className={step === 'reading' ? 'step active' : step === 'review' ? 'step done' : 'step'}><span>{step === 'review' ? <Check size={14}/> : '2'}</span><small>Ler</small></div><i/><div className={step === 'review' ? 'step active' : 'step'}><span>3</span><small>Confirmar</small></div></div>
    {step === 'choose' && <div className="invoice-layout"><div className="panel invoice-upload-panel"><div className="upload-icon"><FileUp size={25}/></div><h2>Escolha sua fatura</h2><p>Envie um PDF ou uma foto. Você confere tudo antes de salvar.</p><input ref={fileRef} className="visually-hidden" type="file" accept=".pdf,image/jpeg,image/png,image/webp" onChange={(event) => readFile(event.target.files?.[0])}/><button className="button-lime" onClick={() => fileRef.current?.click()}><ArrowDownToLine size={17}/> Selecionar arquivo</button><button className="demo-file-button" onClick={() => readFile()}><FileCheck2 size={17}/><span><b>Ver demonstração</b><small>fatura-novembro.pdf · 1,2 MB</small></span><ArrowRight size={17}/></button>{error && <p className="form-error" role="alert">{error}</p>}<div className="upload-trust"><ShieldCheck size={16}/> Seus arquivos ficam nesta demonstração local.</div></div><aside className="panel invoice-side-note"><div className="invoice-note-icon"><Sparkles size={18}/></div><p className="eyebrow">COMO FUNCIONA</p><h3>Você continua no controle.</h3><p>As compras aparecem para revisão. Só entram no seu mês depois da sua confirmação.</p><div className="invoice-note-points"><span><Check size={14}/> Compras organizadas</span><span><Check size={14}/> Assinaturas sinalizadas</span><span><Check size={14}/> Confirmação antes de salvar</span></div><small className="demo-note">Extração demonstrativa, sem conexão com OpenAI.</small></aside></div>}
    {step === 'reading' && <div className="panel invoice-reading"><div className="reading-orbit"><div className="reading-document"><FileUp size={27}/></div><span className="reading-scan"/></div><p className="eyebrow">ESKGO ESTÁ ORGANIZANDO</p><h2>Lendo sua fatura</h2><p>{fileName}</p><div className="reading-progress"><span/></div><div className="reading-status"><span><Check size={13}/> Arquivo carregado</span><span className="working-status"><LoaderCircle size={13}/> Identificando compras</span><span className="muted-status">Separando categorias</span></div></div>}
    {step === 'review' && <div className="panel invoice-review"><div className="review-head"><div><span className="review-check"><Check size={15}/></span><p className="eyebrow">LEITURA CONCLUÍDA</p><h2>Confira os lançamentos</h2><p>Encontramos {rows.length} compras · arquivo {fileName}</p></div><button className="icon-button" onClick={() => { setStep('choose'); setError('') }} aria-label="Escolher outro arquivo"><RefreshCw size={17}/></button></div><div className="review-total"><span>Total selecionado</span><strong>{currencyBR(total)}</strong></div><div className="review-list">{rows.map((row) => <label className={selected.includes(row.id) ? 'review-row checked' : 'review-row'} key={row.id}><input type="checkbox" checked={selected.includes(row.id)} onChange={() => toggleRow(row.id)}/><span className="review-merchant-mark">{row.mark}</span><span className="review-row-copy"><b>{row.name}</b><small>{row.category} · {row.date}</small></span><strong>− {currencyBR(Math.abs(row.amount))}</strong></label>)}</div><div className="review-actions"><button className="outline-button" onClick={() => setStep('choose')}><ArrowLeft size={16}/> Trocar fatura</button><button className="button-lime" disabled={!chosen.length} onClick={() => onConfirm(chosen)}>Confirmar {chosen.length} lançamentos <ArrowRight size={16}/></button></div></div>}
  </section>
}

const currencyBR = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
