import { useState } from 'react'
import { ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react'

type AuthMode = 'login' | 'signup'

export function AuthScreen({ onEnter }: { onEnter: (name: string, email: string, password: string, mode: AuthMode) => Promise<string | void> | string | void }) {
  const [mode, setMode] = useState<AuthMode>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState('Vinícius')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')

  return <main className="auth-screen">
    <section className="auth-brand-panel">
      <button className="brand auth-brand" onClick={() => setMode('login')}><span className="brand-mark">e</span><span>eskgo</span></button>
      <div className="auth-intro"><p className="eyebrow">SEU DINHEIRO, MAIS CLARO</p><h1>Um plano para o<br/><span>que importa.</span></h1><p>Saldo, cartões e metas no mesmo lugar. Sem complicar.</p></div>
      <div className="auth-visual" aria-hidden="true"><span className="auth-orbit orbit-a"/><span className="auth-orbit orbit-b"/><div className="auth-balance-card"><small>SEU SALDO</small><strong>R$ 14.500</strong><span>Seu próximo passo começa aqui <i>↗</i></span></div><div className="auth-mini-card"><span/><b>Principal</b><small>•••• 4552</small></div></div>
      <p className="auth-footer">Eskgo · Seu assistente financeiro para grandes conquistas.</p>
    </section>
    <section className="auth-form-panel"><div className="auth-mobile-brand"><span className="brand-mark">e</span><b>eskgo</b></div><div className="auth-card">
      <div className="auth-heading"><p className="eyebrow">{mode === 'login' ? 'BEM-VINDO DE VOLTA' : 'COMECE POR AQUI'}</p><h2>{mode === 'login' ? 'Entre no seu espaço' : 'Crie sua conta'}</h2><p>{mode === 'login' ? 'Seu dinheiro está esperando por você.' : 'Um passo simples para cuidar dos seus planos.'}</p></div>
      <div className="auth-tabs"><button className={mode === 'login' ? 'auth-tab current' : 'auth-tab'} onClick={() => setMode('login')}>Entrar</button><button className={mode === 'signup' ? 'auth-tab current' : 'auth-tab'} onClick={() => setMode('signup')}>Criar conta</button></div>
      <form className="auth-fields" onSubmit={async (event) => { event.preventDefault(); setBusy(true); const result = await onEnter(name.trim() || 'Vinícius', email.trim(), password, mode); if (result) setNotice(result); setBusy(false) }}>
        {mode === 'signup' && <label>Seu nome<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Como podemos te chamar?" autoComplete="name"/></label>}
        <label>E-mail<input type="email" placeholder="voce@email.com" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required/></label>
        <label>Senha<span className="password-input"><input type={showPassword ? 'text' : 'password'} placeholder="Sua senha" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={(event) => setPassword(event.target.value)} required minLength={6}/><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}>{showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}</button></span></label>
        {mode === 'login' && <button type="button" className="auth-forgot" onClick={() => setNotice('No modo de demonstração, você pode entrar sem recuperar a senha.')}>Esqueci minha senha</button>}
        {notice && <p className="auth-inline-notice" role="status">{notice}</p>}
        <button className="button-lime auth-submit" type="submit" disabled={busy}>{busy ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'} {!busy && <ArrowRight size={17}/>}</button>
      </form>
      <div className="demo-notice"><ShieldCheck size={16}/><span>Login conectado ao Supabase. Crie uma conta ou use suas credenciais.</span></div>
      <p className="auth-legal">Ao continuar, você concorda com nossos termos e política de privacidade.</p>
    </div><p className="auth-version">ESKGO · FINANÇAS COM INTENÇÃO</p></section>
  </main>
}
