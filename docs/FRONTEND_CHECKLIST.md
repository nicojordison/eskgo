# Plano e checklist de validação do front-end

## Plano e status

1. Preparar estrutura, variáveis de ambiente de exemplo, mocks e documentação sem conectar serviços externos.
2. Fechar login/cadastro livre e completar as telas de home, cartões, metas, fatura e assistente.
3. Simular estados de leitura de fatura e resposta do chat, mantendo arquivos e mensagens somente no navegador.
4. Validar a compilação e os fluxos da interface; conferir responsividade e registrar o que segue pendente para mobile e backend.

## Checklist de telas do briefing

- [x] Entrar (demo: abre a home sem credenciais).
- [x] Criar conta (demo: abre a home sem credenciais).
- [x] Home: saldo ocultável, mês, resumo, atalhos e transações.
- [x] Folha de adicionar gasto.
- [x] Detalhe de transação com opções de editar e apagar.
- [x] Cartões: carteira, alternância do cartão, limite e próxima fatura.
- [x] Folha de cadastro de cartão.
- [x] Metas: orçamento mensal e objetivos de poupança.
- [x] Ajustar o teto mensal por categoria.
- [x] Folha de nova meta e guardar valor.
- [x] Fatura: seleção de PDF/foto, progresso de leitura simulado, revisão e confirmação.
- [x] Assistente: perguntas rápidas, conversa, estado de resposta e feedback por mensagem.
- [x] Conta e saída para a tela de entrar.
- [x] Regras responsivas: navegação desktop, menu inferior mobile e ajustes mobile para telas de fatura, assistente, formulários e cartões.
- [ ] Revisão visual em viewport móvel dedicado em todas as telas; a conferência desta retomada foi feita no viewport desktop.
- [x] Estados vazios/feedback e animações de transição, leitura e envio de mensagem.

## Fluxos de validação manual

- [x] Entrar e criar conta sem preencher os campos.
- [x] Adicionar cartão e conferir o cartão, limite e fatura na carteira.
- [x] Criar objetivo e guardar um valor nele.
- [x] Abrir fatura, iniciar leitura de demonstração, remover uma linha e confirmar o restante na home.
- [x] Abrir o assistente por um insight e enviar mensagem livre ou pergunta sugerida.
- [x] Editar um lançamento existente e conferir saldo, total mensal e cartão.
- [x] Apagar um lançamento existente e conferir remoção e totais.
- [x] Alterar teto de categoria e conferir valor e indicador atualizados.
- [x] Sair e voltar para entrar.
- [x] Compilação de produção (`npm run build`, concluída nesta revisão).

## Fora do escopo desta validação

- [ ] Auth Supabase, banco, armazenamento de arquivos e persistência entre sessões.
- [ ] Extração real de PDF/foto e chat real via OpenAI. Exigem rotas seguras no servidor.
- [ ] Validação de credenciais, políticas RLS e deploy em Vercel.

## Conferência de estrutura e segurança

- [x] `.gitignore` cobre `.env` e arquivos `.env.*`, liberando somente `.env.example`.
- [x] `.env.local` tem somente valores vazios/de demonstração; nenhuma chave real foi adicionada.
- [x] `src/services/supabase/client.ts` e mocks documentam pontos de integração sem chamadas externas.
- [x] Verificar no navegador os fluxos de edição/exclusão e atualização de orçamento listados acima.
