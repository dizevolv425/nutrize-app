# Stripe — Guia de configuração

Este guia descreve como **ligar o Stripe de verdade** no Nutrize.
A estrutura de código já está pronta (endpoints, webhook, frontend,
mapas de planos). O que falta é configurar conta + chaves + produtos
+ webhook. Estimativa: 30–40 minutos na primeira vez.

---

## Arquitetura (o que já existe no código)

```
netlify/
├── functions/
│   ├── checkout.ts           POST /api/checkout
│   └── stripe-webhook.ts     POST /api/webhook/payment
└── lib/
    ├── stripe.ts             instância do Stripe SDK (backend)
    ├── firebase-admin.ts     Firestore server-side (webhook)
    └── plans.ts              map (plan, period) → STRIPE_PRICE_ID_*

src/
├── lib/stripe-client.ts      loadStripe + redirectToCheckout (frontend)
└── pages/Subscription/Subscription.tsx   CTA chama /api/checkout
```

**Eventos do webhook já tratados:**
- `checkout.session.completed` — ativa o plano no primeiro pagamento.
- `customer.subscription.updated` — upgrade/downgrade/renovação.
- `customer.subscription.deleted` — cancelamento (remove `user.plan`).
- `invoice.payment_failed` — grava `lastPaymentFailedAt` em `users/{uid}`.

**Como user ↔ Stripe são vinculados:**
O checkout é criado com `client_reference_id = user.uid` e
`metadata: { userId, planId, period }`. Nos eventos subsequentes, o
`userId` vem no `subscription.metadata.userId`.

**Onde cada dado é gravado no Firestore:**
```
users/{uid}                    ← plan, planPeriod, planActivatedAt, updatedAt
users/{uid}/billing/current    ← stripeCustomerId, stripeSubscriptionId,
                                  stripeSubscriptionStatus, lastPaymentFailedAt
```
A subcoleção `billing` tem `allow read: if request.auth.uid == userId`
e `allow write: if false` — só o webhook (via Admin SDK) escreve.
Isso isola dados sensíveis do Stripe da leitura ampla em `/users/*`.

---

## Checklist — passo a passo

### 1. Criar conta Stripe
- Acesse https://stripe.com → **Start now** → criar conta.
- Fornecer nome do negócio, endereço, CPF/CNPJ (pode ser "em análise" no início).
- Você começa automaticamente em **modo teste** (sandbox). Não precisa ativar a conta para modo live enquanto estiver desenvolvendo.

### 2. Confirmar que está em modo teste
- No topo do Dashboard do Stripe, há um toggle **Ver dados de teste**.
- Deixe ligado (ícone com texto "Modo Teste" aparece no topo).
- Todas as chaves começam com `sk_test_` / `pk_test_` / `whsec_` em modo teste.

### 3. Criar os 3 produtos (Starter, Plus, Advanced)
Para **cada produto**, crie **2 preços** (mensal e anual).
No Dashboard: **Produtos → + Adicionar produto**.

| Produto   | Preço mensal | Preço anual (cobrado 1x/ano) |
|-----------|--------------|------------------------------|
| Starter   | R$ 69,90     | R$ 671,00                    |
| Plus      | R$ 99,90     | R$ 959,04                    |
| Advanced  | R$ 169,90    | R$ 1.535,04                  |

Para cada um:
1. Nome: `Nutrize Starter` / `Nutrize Plus` / `Nutrize Advanced`.
2. Descrição: breve texto do plano (ex: "Até 30 pacientes").
3. **Preço 1** — recurring, **monthly**, BRL, valor mensal.
4. Clique **Adicionar outro preço** → recurring, **yearly**, BRL,
   valor anual.
5. Salve e **copie os dois `price_id`** (começam com `price_`).

Você terá 6 `price_id` no total.

### 4. Copiar chaves de API para o .env
No Dashboard: **Desenvolvedores → Chaves de API**.
- **Chave publicável** (pk_test_...) → `VITE_STRIPE_PUBLISHABLE_KEY`
- **Chave secreta** (sk_test_...) → `STRIPE_SECRET_KEY`

Cole no `.env` local (copiando de `.env.example`):

```bash
cp .env.example .env
```

Preencha também os 6 `STRIPE_PRICE_ID_*` e `STRIPE_SUCCESS_URL` /
`STRIPE_CANCEL_URL`.

Em produção (Netlify), configurar em
**Site Settings → Environment Variables**. **Nunca** commitar o `.env`.

### 5. Credenciais do Firebase Admin SDK
O webhook precisa de acesso server-side ao Firestore para atualizar
`user.plan`. Gere uma service account:

1. Firebase Console → **⚙ Project Settings → Service Accounts**.
2. **Generate new private key** → baixa um JSON.
3. Do JSON, copie para o `.env`:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (**entre aspas**, preservando `\n`)

No Netlify, cole o private_key inteiro entre aspas na env var —
o código faz `.replace(/\\n/g, "\n")` automaticamente.

### 6. Configurar o webhook

#### Opção A — Desenvolvimento local com Stripe CLI
```bash
# instalar a CLI uma vez
brew install stripe/stripe-cli/stripe          # macOS
# ou scoop install stripe                      # Windows

stripe login

# rodar o servidor de functions local
netlify dev

# em outro terminal, tunelar os eventos do Stripe
stripe listen --forward-to http://localhost:8888/api/webhook/payment

# a CLI imprime um whsec_... — cole em STRIPE_WEBHOOK_SECRET no .env
```

Cada evento disparado pela CLI chega na sua function local.

#### Opção B — Produção (Netlify)
1. Faça deploy para o Netlify.
2. No Dashboard Stripe: **Desenvolvedores → Webhooks → + Adicionar endpoint**.
3. URL: `https://SEU-SITE.netlify.app/api/webhook/payment`
4. Selecione os eventos:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Salvar. Copiar o **Signing secret** (whsec_...) → `STRIPE_WEBHOOK_SECRET`
   nas env vars do Netlify.

### 7. Testar o fluxo ponta-a-ponta

Com o site rodando (`npm run dev` + `netlify dev` em modo local):
1. Fazer login como nutricionista (qualquer conta de teste).
2. Ir em **/assinatura**, escolher um plano, clicar **Assinar Agora**.
3. Ser redirecionado para o Stripe Checkout.
4. Usar cartão de teste:
   - **Número**: `4242 4242 4242 4242`
   - **Validade**: qualquer data futura (ex: `12/34`)
   - **CVC**: qualquer 3 dígitos (`123`)
   - **Nome/CEP**: qualquer
5. Após "Pagar", Stripe redireciona para `/checkout/sucesso?session_id=...`.
6. Verificar:
   - O evento `checkout.session.completed` chegou (no terminal do
     `stripe listen` ou no painel Stripe → Webhook events).
   - No Firestore, `users/{uid}.plan` foi atualizado para o plano escolhido.

Outros cartões de teste úteis:
- `4000 0000 0000 9995` — pagamento recusado (falta de fundos) → dispara `invoice.payment_failed`.
- `4000 0025 0000 3155` — exige 3D Secure (simula autenticação adicional).

Lista completa: https://stripe.com/docs/testing#cards

### 8. Ativar modo live

Quando estiver pronto para faturar:
1. Complete o onboarding no Stripe (dados bancários, comprovantes).
2. Alterne para **modo live** no Dashboard.
3. **Crie os produtos/preços novamente** no modo live (são independentes).
4. Crie um webhook novo em modo live (URL + eventos iguais).
5. Substitua as env vars no Netlify pelas chaves `sk_live_...`, `pk_live_...`, `whsec_...` e os novos `price_id` live.
6. Faça deploy.

---

## Como o código lida com cada caso

| Estado do pagamento | Evento Stripe | Grava em `users/{uid}` | Grava em `users/{uid}/billing/current` |
|---|---|---|---|
| Compra nova aprovada | `checkout.session.completed` | `plan`, `planPeriod`, `planActivatedAt` | `stripeCustomerId`, `stripeSubscriptionId` |
| Renovação automática mensal/anual | `customer.subscription.updated` | — | `stripeSubscriptionStatus` (active) |
| Upgrade/downgrade (mudança de price) | `customer.subscription.updated` | `plan`, `planPeriod` (pelo novo priceId) | `stripeSubscriptionStatus` |
| Cancelamento imediato | `customer.subscription.deleted` | remove `plan` e `planPeriod` | `stripeSubscriptionStatus: canceled` |
| Falha de pagamento | `invoice.payment_failed` | — | `lastPaymentFailedAt`, `stripeSubscriptionStatus`. Stripe tenta de novo; se esgotar, dispara `subscription.deleted`. |

`useTrial` já trata ausência de `plan` como "trial/free", então o
downgrade por cancelamento naturalmente volta o usuário ao fluxo
de assinatura.

---

## Coisas a saber sobre o código atual

- **`src/pages/Checkout/Checkout.tsx`** é uma tela antiga de checkout
  interno (cartão + PIX + boleto simulados). Com Stripe hosted, ela
  deixa de ser usada — você pode removê-la e a rota `paths.checkout`
  quando tudo estiver testado. Ou manter como fallback offline.

- **`src/pages/CheckoutSuccess/CheckoutSuccess.tsx`** não grava mais
  nada no Firestore — apenas observa `users/{uid}` via `onSnapshot`
  e confirma visualmente quando o webhook atualizou o plano. Se o
  webhook demorar mais de 30s, exibe fallback "pagamento em
  processamento, atualize a página". O webhook é a única fonte de
  verdade do plano.

- **`VITE_FIREBASE_FUNCTIONS_URL`** é um env separado usado por
  `clientService.ts` para deletar contas Auth. Nada a ver com Stripe.

- A conta master (admin) **não precisa assinar** — `useTrial`
  devolve `shouldBlock: false` para `role === "admin"` (item 10.3
  do plano).

---

## Problemas comuns

**"STRIPE_SECRET_KEY não configurado"** no log da function:
→ env var ausente no Netlify ou no `.env`. Confira o painel.

**Webhook rejeita todas as requisições com 400:**
→ `STRIPE_WEBHOOK_SECRET` errado. Em dev, é o que a `stripe listen`
imprime; em prod, é o signing secret do endpoint no painel. Eles
são diferentes.

**`user.plan` não atualiza após pagar:**
→ Verificar se o webhook chegou (painel Stripe → Webhooks → Events).
→ Verificar logs da function (Netlify → Functions → Logs).
→ Confirmar que as credenciais do Firebase Admin estão no ambiente.
→ Confirmar que o `price_id` do produto está mapeado num
  `STRIPE_PRICE_ID_*` correto no ambiente.

**"Cannot find module 'firebase-admin/app'"** no build:
→ Rodar `npm install` novamente. `firebase-admin` é dependência de
runtime das Netlify Functions.
