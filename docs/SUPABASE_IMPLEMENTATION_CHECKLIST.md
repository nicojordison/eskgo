# Checklist de implementação Supabase — Eskgo

## Banco e modelo

- [x] Tabelas de perfis, categorias, cartões, lançamentos, metas, contribuições, orçamentos, importações e linhas de fatura definidas.
- [x] `uuid`, `numeric(14,2)`, `date` e `timestamptz` usados conforme o domínio.
- [x] Foreign keys e regras `ON DELETE` documentadas na migration.
- [x] Índices para consultas por usuário, período, cartão, meta e importação.
- [x] Schema Prisma documentado em `prisma/schema.prisma`.

## Segurança

- [x] RLS ativado em todas as tabelas públicas do domínio.
- [x] Policies de proprietário para SELECT, INSERT, UPDATE e DELETE.
- [x] Categorias globais somente para leitura; categorias pessoais isoladas por `user_id`.
- [x] Trigger de criação/atualização de perfil a partir de `auth.users`.
- [x] Bucket privado `invoice-files` criado.
- [x] Policies do Storage limitadas à pasta cujo primeiro segmento é o UUID do usuário.
- [x] Security Advisor remoto sem erros ou warnings detectados após a revisão de `search_path` e `EXECUTE` da função de auth.
- [x] Grants mínimos do Data API concedidos para `authenticated`; RLS continua sendo a camada de isolamento.
- [x] Validar grants após conectar o primeiro cliente autenticado; advisors de performance seguem como revisão contínua.

## CRUD

- [x] Lançamentos: criar, listar, editar e apagar.
- [x] Cartões: criar, listar, editar e apagar/arquivar.
- [x] Metas: criar, listar, editar e apagar.
- [x] Contribuições: criar, listar, editar e apagar, recalculando progresso no front.
- [x] Orçamentos: criar, listar, editar e apagar.
- [x] Categorias: catálogo global e categorias pessoais com ciclo de vida.
- [x] Importações: criar, listar, atualizar status e cancelar/excluir rascunho.
- [x] Linhas de fatura: revisar seleção, editar metadados e confirmar como lançamento.

## Validação remota

- [x] Executar schema no projeto `lrfhikogzomkgyrpdjdi` pelo SQL Editor.
- [x] Confirmar 9 tabelas de domínio, RLS nas 9, bucket privado e 5 categorias de sistema no SQL Editor/Table Editor.
- [x] Fazer teste de criação/listagem com usuário autenticado de teste (`Teste Supabase Front 22Nov` confirmado no SQL Editor).
- [ ] Fazer teste negativo com segundo usuário para confirmar isolamento RLS.
- [ ] Fazer upload, leitura, substituição e exclusão de um arquivo no bucket privado.
- [x] Rodar Security Advisor e corrigir os alertas relevantes.
- [x] Atualizar `.env.local` apenas com chave publicável e URL do projeto; nunca usar `service_role` no browser.
- [x] Integrar autenticação e criação/listagem de lançamentos, cartões e metas ao Supabase; edição/exclusão remotas permanecem como próxima etapa de CRUD.

## Dados de demonstração

- [x] Categorias de sistema mantidas como seed para o protótipo.
- [x] Inserir registros financeiros de demonstração somente após criar um usuário de teste autenticado.
