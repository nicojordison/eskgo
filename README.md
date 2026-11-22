# Eskgo

Protótipo financeiro mobile-first em React 19, TypeScript, Vite e Tailwind CSS v4. A interface se adapta a desktop e mobile e usa dados simulados em memória para validar os fluxos sem backend.

## Executar localmente

```bash
npm install
npm run dev
```

O Vite informa o endereço local no terminal (normalmente `http://localhost:5173`).

## Funcionalidades de demonstração

- Entrar e criar conta sem credenciais, com o nome padrão Vinícius.
- Home com saldo ocultável, resumo mensal, gastos recentes e atalhos.
- Cartões: criar, selecionar e consultar limite e faturas.
- Metas: criar objetivos, adicionar contribuições e ajustar tetos de categorias.
- Gastos: adicionar, editar e remover lançamentos.
- Fatura: selecionar PDF ou imagem, simular leitura, revisar lançamentos e confirmar a importação local.
- Assistente: perguntas rápidas, chat simulado, estado de carregamento e feedback por resposta.

## Estrutura preparada para integração futura

- `src/features/`: telas de autenticação, fatura e assistente.
- `src/services/ai/`: respostas simuladas e pontos de substituição para serviços reais.
- `src/services/supabase/`: configuração inicial sem conexão de rede.
- `src/types/`: tipos compartilhados do domínio financeiro.
- `supabase/`: notas para a futura integração.
- `docs/FRONTEND_CHECKLIST.md`: plano e validação da interface.

Copie `.env.example` para `.env.local` ao configurar integrações locais. `.env.local` está ignorado pelo Git. Valores `VITE_*` são expostos no bundle do navegador e devem conter somente dados públicos, como URL e chave anon do Supabase com RLS ativo. Segredos como `OPENAI_API_KEY` devem existir somente em ambiente de servidor (por exemplo, funções serverless da Vercel), nunca em variáveis `VITE_*` ou código cliente.

Atualmente não há autenticação Supabase, persistência, upload externo, extração real de fatura ou chamadas à OpenAI. Os dados e interações são demonstrações locais e reiniciam ao recarregar a página.
