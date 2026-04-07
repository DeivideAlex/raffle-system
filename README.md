# Sistema de Rifas Online

Este é o sistema completo de rifas construído com React, TypeScript e Tailwind CSS 4, pronto para integração com o Vercel e com as Edge Functions do Supabase e Mercado Pago.

## Como Iniciar (Ambiente Local)

1. Você precisará ter o Node.js e o NPM instalados para gerenciar pacotes.
2. Com o Node.js instalado, execute na pasta \`/scratch/raffle-system\`:
   \`\`\`bash
   npm install
   npm run dev
   \`\`\`

## Funcionalidades Prontas

- **Interface Pública (`/`)**: Lista de todas as rifas ativas mockadas localmente.
- **Página da Rifa (`/r/:id`)**: Interface de conversão, onde os números podem ser selecionados, carrinho persistente e checkout Mock para PIX implementado.
- **Área do Cliente (`/my-numbers`)**: O histórico do cliente é listado informando telefone e e-mail.
- **Painel de Admin (`/admin`)**: Login (senha padrão: `admin123`), Dashboard com listagem completa, funcionalidade de definir ganhadores, bloqueios de vendas e sistema de deleção.
- **Criar Rifa (`/admin/create`)**: Cria rifas e processa a imagem em BASE64 salva localmente.

## Configuração do Backend (Supabase + Mercado Pago)

A pasta `supabase/functions/dynamic-action` contém o código serverless em TypeScript (Edge Functions) para processar transações.

1. Instale o **Supabase CLI**.
2. Faça login no Supabase via CLI (`supabase login`).
3. Vincule ao seu projeto: `supabase link --project-ref SEU_PROJECT_ID`
4. Aplique a estrutura de banco base na ferramenta *SQL Editor* do Supabase:
   \`\`\`sql
   CREATE TABLE kv_store_0639182c (
     key TEXT NOT NULL PRIMARY KEY,
     value JSONB NOT NULL
   );
   \`\`\`
5. Adicione seus tokens no Supabase:
   \`\`\`bash
   supabase secrets set MERCADO_PAGO_ACCESS_TOKEN=APP_USR-...
   \`\`\`
6. Faça o Deploy das functions:
   \`\`\`bash
   supabase functions deploy dynamic-action --no-verify-jwt
   \`\`\`

## Deployment no Vercel

O arquivo `vercel.json` na raiz da aplicação já assegura que o roteamento Client-Side gerido pelo React Router v7 funcione e as páginas não deem erro 404.

Basta adicionar esse repositório no seu GitHub, acessar seu painel do Vercel (`vercel.com`) e "Import Project". O Vercel detectará automaticamente a stack (Vite) e fará a entrega otimizada!
