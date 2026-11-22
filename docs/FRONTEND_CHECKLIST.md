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
- [x] Revisão visual em viewport móvel: navegação inferior, metas, cartão, fatura e assistente.
- [x] Estados vazios/feedback, transições de tela, leitura de fatura, envio/resposta do chat e feedback útil/não útil.
- [x] Microinterações de foco/hover, transições de progresso e animação de entrada de mensagens; respeito a `prefers-reduced-motion`.

## Fluxos de validação manual

- [x] Entrar e criar conta sem preencher os campos.
- [x] Adicionar, editar e remover cartão de demonstração; conferir carteira/limites/fatura.
- [x] Criar e editar objetivo, registrar contribuição em qualquer meta, editar/excluir contribuição e conferir progresso/histórico.
- [x] Abrir fatura, iniciar leitura de demonstração, remover uma linha e confirmar o restante na home.
- [x] Abrir o assistente por um insight; enviar mensagem livre e pergunta sugerida; ver resposta contextual e feedback útil/não útil.
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

## Limites conhecidos para a validação

- A revisão usa estado de demonstração em memória; recarregar reinicia dados e não representa persistência entre usuários.
- Orçamentos permitem leitura/edição do teto atual, mas ainda não possuem CRUD completo de período.
- Categorias são catálogo fixo e não possuem CRUD na interface.
- O fluxo de fatura é demonstração: arquivo não é processado por OCR real e não há histórico persistido de importações.
- Não há autenticação real nem integração real com o modelo de IA; respostas e feedback são simulados no cliente.
