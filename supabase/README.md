# Supabase — Eskgo

O schema do projeto remoto `lrfhikogzomkgyrpdjdi` foi aplicado pelo SQL Editor e está versionado em `migrations/20261122190000_eskgo_core_schema.sql`. A migration define o domínio financeiro, índices, trigger de perfil, RLS por usuário, seed de categorias e o bucket privado `invoice-files`.

O contrato Prisma equivalente está em `../prisma/schema.prisma` e a lista de verificação em `../docs/SUPABASE_IMPLEMENTATION_CHECKLIST.md`.

O front ainda usa mocks e não faz chamadas ao Supabase. Na próxima etapa, configure apenas a URL pública e a chave publicável nas variáveis de ambiente. Nunca publique uma `service_role` key no navegador.
