# Contrato CRUD antes do backend

Este documento descreve o contrato esperado para os mocks da interface e para uma futura API/Supabase. Nenhuma tabela ou chamada de rede foi criada nesta etapa.

## Regra comum

- Toda entidade persistida tem `id` UUID, `user_id` UUID (`auth.users.id`), `created_at` e `updated_at` em `timestamptz`.
- Cada consulta, edição e exclusão é escopada pelo usuário autenticado. No banco exposto, RLS deve cobrir SELECT, INSERT, UPDATE (USING e WITH CHECK) e DELETE com `auth.uid() = user_id`.
- IDs e valores monetários trafegam em tipos explícitos. Saldo, limite e valor guardado são derivados dos registros sempre que possível, evitando cópias divergentes.
- Exclusão de dados financeiros exige confirmação na UI. Cartões referenciados por lançamentos devem ser arquivados ou ter a exclusão bloqueada; nunca apagar lançamentos em cascata silenciosamente.

## Entidades e campos

| Entidade | Campos de domínio | Relações |
|---|---|---|
| `transactions` | `description`, `amount` (numeric; despesa negativa, receita positiva), `category_id`, `card_id` nullable, `occurred_at`, `notes` nullable, `source` (`manual`/`invoice`) | pertence ao usuário; cartão opcional |
| `cards` | `name`, `last_four`, `credit_limit` numeric, `closing_day`, `due_day`, `brand` nullable, `archived_at` nullable | pertence ao usuário; lançamentos referenciam cartão |
| `goals` | `name`, `target_amount` numeric, `target_date` nullable, `status` (`active`/`completed`/`archived`), `notes` nullable | pertence ao usuário; possui contribuições |
| `goal_contributions` | `goal_id`, `amount` numeric positivo, `contributed_at`, `notes` nullable | FK para meta; criar/ler/editar/excluir contribuições individualmente |
| `categories` | `name`, `kind` (`expense`/`income`), `color` nullable, `archived_at` nullable | pertence ao usuário ou catálogo de sistema |
| `budgets` | `category_id`, `period` (primeiro dia do mês), `limit_amount` numeric | categoria + período únicos por usuário |
| `invoice_imports` | `file_name`, `status`, `uploaded_at`, `processed_at` nullable | importação do usuário; linhas confirmadas tornam-se lançamentos |

Valores em BRL usam `numeric(14,2)`, nunca ponto flutuante no banco. Datas são `date` quando representam apenas um dia e `timestamptz` para eventos com horário. Não armazenar PAN completo, CVV ou dados bancários de autenticação em `cards`.

## Contrato de operações por tela

| Tela/recurso | Create | Read | Update | Delete |
|---|---|---|---|---|
| Lançamentos | formulário e linhas da fatura | lista, detalhe e filtros | editar todos os campos | confirmar e remover |
| Cartões | novo cartão | carteira e detalhe | editar nome, final, limite e vencimento | arquivar/remover se sem lançamentos |
| Metas | criar objetivo | lista e detalhe/progresso | editar título, alvo, data e status | confirmar e remover |
| Contribuições | adicionar valor à meta | histórico por meta | editar valor/data/nota | confirmar e remover, recalculando progresso |
| Orçamentos | criar teto mensal | por categoria/período | atualizar teto | remover teto |
| Categorias | criar categoria pessoal | lista/catálogo | renomear, cor e tipo | arquivar se já usada |
| Importações | iniciar leitura | histórico/estado | revisar linhas antes de confirmar | cancelar ou excluir rascunho |

## Estado do protótipo e checklist de implementação

- [x] Lançamentos: create/read/update/delete simulados no navegador.
- [x] Cartões: create/read/update; delete com bloqueio quando existem lançamentos vinculados.
- [x] Metas: create/read/update/delete; excluir meta também remove seu histórico local após confirmação.
- [x] Contribuições: registro individual criado ao guardar, histórico lido, edição e exclusão com recálculo do progresso.
- [x] Orçamentos: update simulado de teto por categoria.
- [ ] Orçamentos: create/read/delete e período explícito.
- [x] Fatura: fluxo simulado de importação/revisão; confirmar cria lançamentos locais.
- [ ] Persistência, autenticação, autorização por `user_id`, políticas RLS, validação no servidor e testes de integração.

Este contrato deve ser validado junto ao briefing antes de criar migrations. O CRUD principal de lançamentos, cartões, metas e contribuições está exercitável no protótipo; categorias e orçamentos ainda não têm CRUD integral. O fluxo de importação de fatura revisa lançamentos antes de confirmá-los, mas não mantém entidade de importação/histórico persistido.
