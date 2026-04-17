# Plano de Correção - Software Nutrize

> **Objetivo:** Implementar correções identificadas na revisão do dia 14/04 via Claude Code.
> **Legenda de prioridade:** 🔴 Crítico (bloqueia uso) · 🟡 Alto (funcional quebrado) · 🟢 Médio (UX/estético) · ⚪ Baixo (ajuste textual)

---

## ⚠️ Bloqueadores identificados (validar antes de prosseguir)

Os itens abaixo impedem a validação completa do sistema porque quebram fluxos centrais. **Devem ser resolvidos primeiro**, pois outras correções dependem deles para serem testadas.

| # | Fluxo | Erro observado | Prioridade |
|---|---|---|---|
| B1 | Cadastro de paciente | "Erro ao criar cliente" ao salvar novo paciente | 🔴 |
| B2 | Importação em lote de pacientes | `Firebase: Password should be at least 6 characters (auth/weak-password)` | 🔴 |
| B3 | Cadastro rápido de paciente via Agenda | `404: NOT_FOUND` (`gru1::2vcc6-...`) | 🔴 |
| B4 | Serviços na Agenda | "Erro ao carregar serviços. Tente novamente." | 🔴 |
| B5 | Criação de secretária | `Missing or insufficient permissions` e `Firebase: Error (auth/email-already-in-use)` | 🔴 |
| B6 | Gráficos do Financeiro na Home | Gráficos não são gerados (área em branco) | 🟡 |
| B7 | Ocupação de Agenda (dashboard) | Não reflete a disponibilidade configurada no módulo Agenda | 🟡 |

### Diagnósticos prováveis (para investigar no Claude Code)

- **B1 / B3:** Provavelmente o mesmo problema — criação de paciente provavelmente tenta gravar em Firestore/Auth e falha por regra de segurança ou schema divergente. Checar `createPatient` / `createClient` service e as regras do Firestore para a coleção `patients` (ou `clients`). O ID `gru1::...` indica erro de roteamento do Vercel na API — verificar se o endpoint existe e se a rota dinâmica está registrada.
- **B2:** O fluxo de importação está gerando senha automática abaixo do mínimo do Firebase Auth (6 caracteres). Ajustar o gerador de senha temporária para ≥ 8 caracteres aleatórios, ou remover a criação de conta Auth na importação em lote (paciente pode ser cadastrado sem Auth até o primeiro convite).
- **B4:** Erro ao carregar serviços sugere coleção `services` inexistente ou regra do Firestore bloqueando leitura pelo `uid` do nutricionista. Verificar `getServices(userId)` e as regras.
- **B5:** `Missing or insufficient permissions` é Firestore rules; `email-already-in-use` é Firebase Auth. Dois bugs em cascata: (1) a regra não permite o nutricionista criar subdocumento em `secretaries`; (2) após falha, o e-mail fica registrado no Auth e impede nova tentativa. Implementar rollback: se falhar a criação do Firestore, apagar o usuário do Auth (`admin.auth().deleteUser`).
- **B6:** Dashboard não gera gráficos do financeiro — provavelmente `data` chega vazio ou componente do gráfico não recebe `props`. Validar se a query retorna dados e se há tratamento para array vazio.
- **B7:** Sincronização entre `availability` do módulo Agenda e o cálculo de "Horários Livres" no dashboard. Revisar a função que calcula `ocupacao_media` para usar a configuração real de horários de trabalho.

---

## 1. Tela de Pagamentos (Nutricionista) 🟡

**Arquivo alvo provável:** `src/pages/Payments.tsx` ou `src/components/PricingPlans.tsx`

- [ ] **1.1** Exibir apenas os itens **inclusos** em cada plano (remover os marcados com `X`).
- [ ] **1.2** Trocar o texto do link **"voltar para o login"** → **"voltar para a home"**.
- [ ] **1.3** Corrigir corte de texto no zoom padrão 100% (texto cortado em cima e embaixo). Revisar `overflow`, `padding` e `line-height` do card.
- [ ] **1.4** Validar se as **limitações de cada plano** estão efetivamente vinculadas à liberação do sistema (feature flags por plano).
  - Validar: Starter → até 30 pacientes, sem secretária, sem 2º nutri.
  - Plus → pacientes ilimitados, com secretária, sem 2º nutri.
  - Advanced → tudo + 2 nutris.
- [ ] **1.5** **Incluir API de gateway de pagamento** (Stripe / Mercado Pago / Pagar.me — definir com o time). Criar endpoint `/api/checkout` e webhook `/api/webhook/payment` para atualizar o status da assinatura.

---

## 2. Tela de Perfil (Nutricionista) 🟢

**Arquivo alvo provável:** `src/pages/Profile.tsx`

- [ ] **2.1** Tornar **editáveis** os dados pessoais do perfil (nome, e-mail, telefone) **e a foto de perfil** (upload + preview + salvar em storage).
- [ ] **2.2** Alterar o gradiente/fundo **roxo** do banner "Meu Perfil" para **cinza `#667085`**.

---

## 3. Home / Dashboard (Nutricionista) 🟡

**Arquivo alvo provável:** `src/pages/Dashboard.tsx`

- [ ] **3.1** Trocar o título do card **"Total de Clientes"** → **"Total de Pacientes"**.
- [ ] **3.2** **[B7]** Corrigir cálculo de **Ocupação de Agenda** para refletir a disponibilidade configurada no módulo Agenda. Atualmente mostra 770 horários livres — valor que ignora as configurações reais.

---

## 4. Pacientes (Nutricionista) 🔴

**Arquivo alvo provável:** `src/pages/Patients.tsx` + `src/services/patients.ts`

- [ ] **4.1** **[B1]** Corrigir o erro "Erro ao criar cliente" ao cadastrar paciente.
- [ ] **4.2** **[B2]** Corrigir a importação em lote (erro `auth/weak-password`).
- [ ] **4.3** Substituir todas as ocorrências da palavra **"cliente"** por **"paciente"** nesta tela:
  - Título "Meus Pacientes" ✓ (já ok)
  - Subtítulo: "Gerencie seus **clientes** e acompanhe o progresso" → "Gerencie seus **pacientes**..."
  - Botão: "+ Adicionar Novo **Cliente**" → "+ Adicionar Novo **Paciente**"
  - Placeholder busca: "Buscar **cliente** por nome..." → "Buscar **paciente** por nome..."
  - Contador: "0 **clientes** encontrados" → "0 **pacientes** encontrados"
  - Mensagem de erro: "Erro ao criar **cliente**" → "Erro ao criar **paciente**"

---

## 5. Agenda (Nutricionista) 🔴

**Arquivo alvo provável:** `src/pages/Schedule.tsx` + `src/components/NewAppointmentModal.tsx`

- [ ] **5.1** **[B3]** Corrigir o cadastro de "Novo cliente" dentro do modal de Novo Agendamento (erro `404: NOT_FOUND`).
- [ ] **5.2** Substituir **"cliente" → "paciente"** nesta tela:
  - "Selecione o **Cliente**" → "Selecione o **Paciente**"
  - "Buscar **cliente** por nome, email ou telefone" → "Buscar **paciente**..."
  - "Nenhum **cliente** cadastrado" → "Nenhum **paciente** cadastrado"
  - "+ Cadastrar novo **cliente**" → "+ Cadastrar novo **paciente**"
- [ ] **5.3** Traduzir os **dias da semana** do calendário para PT-BR (`Sun→Dom`, `Mon→Seg`, `Tue→Ter`, `Wed→Qua`, `Thu→Qui`, `Fri→Sex`, `Sat→Sáb`). Também traduzir "April 12 – 18" → "12 – 18 de Abril".
  - Se for `react-big-calendar` ou `FullCalendar`, configurar `locale: 'pt-BR'`.
- [ ] **5.4** Melhorar **visualização e contraste** entre horários disponíveis vs indisponíveis. Usar fundo claro (`#F9FAFB`) para indisponíveis e branco (`#FFFFFF`) para disponíveis, com borda sutil para separar.
- [ ] **5.5** Restringir o **highlight do dia atual** apenas ao cabeçalho da coluna (não aplicar fundo na coluna inteira). Manter a linha vermelha horizontal de "hora atual" intacta.
- [ ] **5.6** **[B4]** Corrigir "Erro ao carregar serviços" na aba **Serviços** dentro de **Configurações da Agenda**, incluindo o fluxo de cadastrar novo serviço.

---

## 6. Dieta (Nutricionista) 🟢

**Arquivo alvo provável:** `src/pages/DietPlan.tsx`

- [ ] **6.1** Tornar o banner **"Resumo Nutricional Total"** flutuante (sticky) ao rolar a página. CSS: `position: sticky; top: 0; z-index: 10;`.
- [ ] **6.2** Implementar **drag-and-drop** para reordenar refeições (padrão e criadas). Sugestão: biblioteca `@dnd-kit/sortable` (leve e acessível).
- [ ] **6.3** Criar função de **exportar dieta em PDF**. Usar `jsPDF` + `html2canvas` ou `react-pdf`.
- [ ] **6.4** Substituir **"cliente" → "paciente"**:
  - Label do select: "**Cliente** \*" → "**Paciente** \*"
  - Placeholder: "Selecione um **cliente**..." → "Selecione um **paciente**..."

---

## 7. Financeiro (Nutricionista) 🟡

**Arquivo alvo provável:** `src/pages/Finance.tsx`

- [ ] **7.1** Corrigir a **escrita da palavra "transações"** nos cards do Financeiro **e nos cards da Home**. Verificar singular/plural: `1 transação`, `2 transações`, `0 transações`.
- [ ] **7.2** **[B6]** Corrigir a **geração dos gráficos** do financeiro na home (atualmente em branco).
- [ ] **7.3** Incluir **filtros por dia, semana e mês** no Financeiro (mesmo padrão UI já existente na Agenda).

---

## 8. Alimentos (Nutricionista) 🟢

**Arquivo alvo provável:** `src/pages/Foods.tsx`

- [ ] **8.1** Incluir **botão flutuante "Voltar ao topo"** no canto inferior direito. Aparecer após scroll > 300px com `smooth scroll` ao clicar.

---

## 9. Secretária (Nutricionista) 🔴

**Arquivo alvo provável:** `src/pages/Secretaries.tsx` + regras do Firestore

- [ ] **9.1** **[B5]** Corrigir o fluxo de **criar secretária**:
  - Corrigir regras do Firestore para permitir que o nutricionista crie documentos na coleção `secretaries` vinculada ao seu `uid`.
  - Implementar **rollback** no Firebase Auth: se a gravação no Firestore falhar após criar o usuário no Auth, executar `deleteUser` para não deixar e-mail órfão (causa do `auth/email-already-in-use` nas tentativas subsequentes).
- [ ] **9.2** *(Observação: "Possibilidade de alterar a ordem das refeições" aparece nesta tela no PDF, mas parece pertencer ao módulo de Dieta — ver item 6.2. Confirmar com o cliente.)*

---

## 10. Perfil (Master/Admin) 🟡

**Arquivo alvo provável:** `src/pages/admin/Profile.tsx`

- [ ] **10.1** Alterar e-mail do usuário master: **`admin@gmail.com`** → **`appnutri.saas@gmail.com`**. Atualizar no Firebase Auth e em qualquer seed/script.
- [ ] **10.2** Tornar editáveis: nome, e-mail e telefone.
- [ ] **10.3** **Excluir o trial** e o aviso "Trial Expirado / Assine agora" para a conta master (flag `isMaster: true` → bypass do trial check). Acesso deve ser mantido indefinidamente.
- [ ] **10.4** Alterar gradiente roxo de fundo para **cinza `#667085`** (mesmo ajuste do item 2.2).

---

## 11. Home (Master/Admin) ⚪

**Arquivo alvo provável:** `src/layouts/AdminLayout.tsx` ou `src/components/Topbar.tsx`

- [ ] **11.1** **Remover a logo** do topo direito da Home — está duplicada com a logo da barra lateral.

---

## 12. Ajustes Estéticos (Aplicar em todas as telas) 🟢

### 12.1 Paleta do Financeiro (cards, legendas e linhas do gráfico)

| Elemento | Cor |
|---|---|
| Receitas | `#039855` |
| Despesas | `#D92D20` |
| Projeção | `#F5BC02` (fallback `#667085` em caso de baixo contraste) |

Aplicar em:
- Cards do Financeiro (Receitas / Despesas / Saldo / Projeções).
- Cards do Financeiro na Home.
- Legendas e linhas do gráfico "A Pagar / A Receber / Projeção".
- Badges de transação (✓ PAGO, ⏳ PENDENTE) mantendo consistência com a nova paleta.

### 12.2 Perfil de Clientes (dashboard de distribuição)

- [ ] Alterar card **"Homens"** para **`#3B82F6`** (azul), mantendo cards de "Total de Clientes" e "Mulheres" nas cores atuais.
- [ ] *Obs:* renomear também **"Total de Clientes" → "Total de Pacientes"** e **"Perfil de Clientes" → "Perfil de Pacientes"** (alinhado à troca de nomenclatura geral).

---

## 13. Versão Mobile (todos os perfis) 🟢

- [ ] **13.1** Melhorar a **responsividade geral** do app:
  - Agenda: calendário precisa de scroll horizontal suave e cabeçalho fixo.
  - Modal de Trial: reduzir padding e ajustar para não cortar botões.
  - Cards do Financeiro: empilhar em 1 coluna em telas < 640px.
  - Gráfico de Ocupação: ajustar tooltip para não sair da viewport.
  - Topbar: o botão "Assine agora" e o ícone de notificação estão muito próximos — adicionar espaçamento.

---

## Glossário de substituições globais

Executar um **find-and-replace cuidadoso** (considerar contexto, não substituir cegamente):

| De | Para | Onde |
|---|---|---|
| `cliente` / `Cliente` / `CLIENTE` | `paciente` / `Paciente` / `PACIENTE` | Toda UI visível ao nutricionista — **não alterar nomes de variáveis/tabelas do banco sem migração planejada** |
| `clientes` / `Clientes` | `pacientes` / `Pacientes` | Idem |
| `voltar para o login` | `voltar para a home` | Tela de Pagamentos |
| `admin@gmail.com` | `appnutri.saas@gmail.com` | Seed/env do usuário master |

> ⚠️ **Atenção:** manter os nomes internos de código (`client`, `clientId`, coleção `clients` no Firestore) **a menos que seja feita uma migração completa com script de rename**. A troca é apenas nas strings visíveis ao usuário (labels, placeholders, títulos, mensagens).

---

## Ordem de execução sugerida

1. **Sprint 1 — Desbloqueio (🔴):** B1, B2, B3, B4, B5 → permite validar o resto do sistema.
2. **Sprint 2 — Funcionalidades quebradas (🟡):** B6, B7, item 1.5 (gateway), item 7.3 (filtros), item 6.3 (export PDF).
3. **Sprint 3 — UX e textos (🟢 / ⚪):** substituições de "cliente → paciente", ajustes de cor, drag-and-drop, sticky banner, botão voltar ao topo, localização PT-BR.
4. **Sprint 4 — Mobile e polimento:** item 13 completo + retestes.

---

## Prompt pronto para colar no Claude Code

```
Estou corrigindo o software Nutrize (SaaS de nutricionistas, stack provável React + Firebase).
Leia o arquivo plano-correcao-nutrize.md na raiz do projeto e execute o Sprint 1
(itens marcados como 🔴 / bloqueadores B1–B5).

Antes de alterar qualquer coisa:
1. Mapeie a estrutura do projeto (src/, services/, pages/).
2. Identifique onde estão as funções de criação de paciente, importação em lote,
   criação de secretária e carregamento de serviços.
3. Me mostre o plano de ataque para cada bug com o arquivo/linha afetado
   antes de escrever código.
4. Valide as regras do Firestore (firestore.rules) e as Cloud Functions envolvidas.

Só então comece a editar.
```
