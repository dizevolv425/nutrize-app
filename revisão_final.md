# Revisão Final — Índices 1 a 10

> **Objetivo:** Mapear itens pendentes e parcialmente implementados nos índices 1 a 10, para execução após a conclusão dos índices 11 a 13.

---

## Legenda

| Símbolo | Status |
|---------|--------|
| ✅ | Implementado e verificado |
| ⚠️ | Parcialmente implementado |
| ❌ | Pendente — não implementado |

---

## 1. Estético

| Item | Título | Status | Observação |
|------|--------|--------|------------|
| 1.1 | Alterar cor para `#e88413` | ⚠️ | CSS variables criadas e aplicadas. **Pendente:** `src/pages/Register/Form/Form.css` linha 204 ainda tem gradiente **verde** (`#14532d`, `#064e3b`) no botão de submit. Hover é laranja, mas estado padrão é verde. |
| 1.2 | Alterar nome para "Nutrize" | ⚠️ | Feito em todos os arquivos de UI. **Pendente:** `src/services/emailService.ts` linha 13 ainda tem `fromEmail: "noreply@nutrimanager.com"`. |
| 1.3 | Atualizar logos | ✅ | Logos presentes em `dist/assets` e referenciados corretamente. |

### Correções pendentes do item 1:

**`src/pages/Register/Form/Form.css` — linha 204:**
```css
/* ATUAL (verde — incorreto) */
.login-form__submit-btn {
  background: linear-gradient(135deg, #14532d 0%, #064e3b 100%) !important;
}

/* CORRETO */
.login-form__submit-btn {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%) !important;
}
```

**`src/services/emailService.ts` — linha 13:**
```typescript
// ATUAL
fromEmail: "noreply@nutrimanager.com",

// CORRETO
fromEmail: "noreply@nutrize.com.br",
```

---

## 2. Responsividade Mobile

| Item | Título | Status | Observação |
|------|--------|--------|------------|
| 2.1 | Responsividade mobile em todo o sistema | ✅ | Media queries implementadas em todos os componentes principais. |

---

## 3. Página de Cadastro de Nutricionista

| Item | Título | Status | Observação |
|------|--------|--------|------------|
| 3.1 | Campo telefone com máscara | ✅ | `src/utils/masks.ts` criado. Aplicado em `Register/Form/Form.tsx` e `Clients/ClientForm.tsx`. |

---

## 4. Página de Login

| Item | Título | Status | Observação |
|------|--------|--------|------------|
| 4.1 | Criar página "Esqueci Senha" | ✅ | `src/pages/ForgotPassword/ForgotPassword.tsx` criado, rota configurada em `AppRoutes.tsx` e `authService.ts`. |

---

## 5. Home (Dashboard)

| Item | Título | Status | Observação |
|------|--------|--------|------------|
| 5.1 | Aviso de dias restantes + "Assine agora" | ✅ | Implementado no Header: `"Faltam X dias restantes"` e botão `"Assine agora"` via `useTrial()`. |
| 5.2 | Cálculo de ocupação da agenda incorreto | ❌ | `src/pages/Dashboard/components/OccupancyChart.tsx` ainda usa `WORK_HOURS` hardcoded (8h–18h, `SLOTS_PER_HOUR = 2`). Não lê os horários configurados do nutricionista. |
| 5.3 | Mensagem de aniversário: remover emojis | ✅ | `BirthdayCard.tsx` linha 107: mensagem do WhatsApp sem emojis. Emoji `🎉` mantido apenas na decoração visual. |
| 5.4 | Card de aniversário: exibir próxima consulta | ❌ | `BirthdayCard.tsx` não busca nem exibe o próximo agendamento do paciente. |
| 5.5 | Agenda resumida: card clicável abre consulta | ⚠️ | `ScheduleSummary.tsx` linha 147: `onClick` navega para `/dashboard/agenda` mas **sem** passar o `?appointment={id}`. O compromisso não é aberto automaticamente. |
| 5.6 | Sino de notificação: filtrar só solicitações | ❌ | `NotificationContext` e `Header.tsx` não têm filtro por categoria. Todas as notificações aparecem no sino. |
| 5.7 | Card financeiro: corrigir título | ❌ | Verificar em `Dashboard.tsx` se o card financeiro ainda exibe título "Projeções" ou texto de "próximas consultas" indevido. |
| 5.8 | Distribuição por gênero: % com menu recolhido | ❌ | Verificar se `ResponsiveContainer` do gráfico de gênero tem `minWidth={280}`. |

### Correção pendente 5.2 — OccupancyChart:
**Arquivo:** `src/pages/Dashboard/components/OccupancyChart.tsx`

Substituir as constantes hardcoded por leitura do `scheduleService`:
```typescript
// Remover:
const WORK_HOURS = [8, 9, 10, ...];
const SLOTS_PER_HOUR = 2;

// Adicionar: carregar schedule e calcular minutos disponíveis
const weeklyAvailableMinutes = schedule.days
  .filter(d => d.isActive)
  .flatMap(d => d.slots)
  .reduce((sum, slot) => {
    const start = parseTime(slot.startTime);
    const end = parseTime(slot.endTime);
    return sum + (end - start);
  }, 0);
```

### Correção pendente 5.5 — ScheduleSummary:
**Arquivo:** `src/pages/Dashboard/components/ScheduleSummary.tsx` — linha 147:
```tsx
// ATUAL
onClick={() => navigate("/dashboard/agenda")}

// CORRETO
onClick={() => navigate(`/dashboard/agenda?appointment=${appointment.id}`)}
```
E em `Agenda.tsx`, ler o query param `appointment` ao montar e abrir o modal correspondente.

---

## 6. Pacientes

| Item | Título | Status | Observação |
|------|--------|--------|------------|
| 6.1 | Campo "sexo" não obrigatório | ✅ | Sem `errors.gender` no `ClientForm.tsx`. Campo opcional. |
| 6.2 | Separar nome em "nome" e "sobrenome" | ✅ | `types/client.ts` tem `firstName` e `lastName`. |
| 6.3 | Medida corporal: última consulta | ✅ | `getLatestBodyMeasurements()` implementado em `clientService.ts` linha 646. |
| 6.4 | Histórico de consulta: editar e excluir | ❌ | `ClientProfile.tsx` não tem botões de editar/excluir no histórico. Verificar se `updateConsultation` e `deleteConsultation` existem em `clientService.ts`. |
| 6.5 | Histórico de consulta: minimizado por padrão | ❌ | Verificar se existe estado `expandedConsultations` em `ClientProfile.tsx`. |
| 6.6 | Função "adicionar documento" | ❌ | Verificar funcionamento completo do upload. Confirmar tratamento de erro visível. |
| 6.7 | Objetivos: ativar/desativar e editar | ❌ | Verificar se há toggle e modal de edição de objetivos em `ClientProfile.tsx`. |
| 6.8 | Objetivos: minimizados por padrão | ❌ | Verificar se objetivos são renderizados colapsados. |
| 6.9 | Importar clientes em lote | ✅ | `src/pages/Clients/components/ImportClientsModal.tsx` criado e integrado ao `ClientList.tsx`. |
| 6.10 | Senha do paciente: 4 últimos dígitos | ✅ | `clientService.ts` linha 48: `const autoPassword = phoneDigits.slice(-4)`. Campo de senha removido do formulário. |
| 6.11 | Retirar trial da área do paciente | ✅ | `TrialBlockModal` está apenas em `AdminRoutes.tsx`, não afeta rotas de clientes. |
| 6.12 | Contas novas sem paciente de teste | ❌ | Verificar função `register` em `authService.ts` — confirmar que não cria documento na coleção `clients` ao registrar. |
| 6.13 | Aniversário: data salva com D-1 | ❌ | Verificar se `ClientForm.tsx` usa `new Date("YYYY-MM-DD")` (UTC) ou `new Date("YYYY-MM-DDT00:00:00")` (local) ao salvar `birthDate`. |

### Correção pendente 6.13 — Data de aniversário:
**Arquivo:** `src/pages/Clients/ClientForm.tsx` e qualquer ponto que converte `birthDate`:
```typescript
// ERRADO (D-1 no UTC-3)
const date = new Date(birthDateInput); // "2000-03-15" → 14/03 às 21h

// CORRETO (horário local)
const date = new Date(birthDateInput + "T00:00:00");
// ou
const [year, month, day] = birthDateInput.split('-').map(Number);
const date = new Date(year, month - 1, day);
```

---

## 7. Agenda

| Item | Título | Status | Observação |
|------|--------|--------|------------|
| 7.1 | Layout em português | ✅ | `moment.locale("pt-br")` e `messages` traduzidas em `Agenda.tsx`. |
| 7.2 | Botão "Configurações da agenda" | ✅ | Texto correto em `Agenda.tsx` linha 316. |
| 7.3 | Mensagem de erro ao cadastrar serviço | ❌ | Verificar `ServicesManager.tsx` — confirmar que erro só é exibido dentro do `catch`, nunca após sucesso. |
| 7.4 | Duração do serviço: qualquer valor | ❌ | Verificar se o campo de duração em `ServicesManager.tsx` usa `<input type="number" min={1} step={1}>` sem opções fixas. |
| 7.5 | Máscara de moeda no preço do serviço | ✅ | `maskCurrency` importado e aplicado em `ServicesManager.tsx`. |
| 7.6 | Função "adicionar serviço" | ❌ | Verificar se `nutritionistId` vem de `useAuth()` e está disponível ao chamar `addService`. Testar fluxo completo. |
| 7.7 | Grade da agenda respeita horários | ❌ | `Agenda.tsx` precisa calcular `minTime`/`maxTime` a partir do `scheduleService`, passando-os para `<Calendar min={} max={}>`. |
| 7.8 | Bloquear horários indisponíveis | ✅ | `slotPropGetter` implementado em `Agenda.tsx` linha 170. |
| 7.9 | Atualizar agendamento com erro | ❌ | Verificar `AppointmentModal.tsx` — confirmar que `appointment.id` é passado e que datas são convertidas para `Timestamp`. |
| 7.10 | Arrastar agendamentos (drag-and-drop) | ✅ | `withDragAndDrop` configurado em `Agenda.tsx` linha 3. |
| 7.11 | Solicitações pendentes mais transparentes | ❌ | Verificar `eventStyleGetter` em `Agenda.tsx` — confirmar se status `pending` recebe `opacity: 0.7` e borda pontilhada. |

---

## 8. Calculadora de Dieta

| Item | Título | Status | Observação |
|------|--------|--------|------------|
| 8.1 | Busca de alimentos inconsistente | ❌ | Verificar `FoodSearch.tsx` — confirmar que o filtro por `allowedMeals` foi removido da busca. |
| 8.2 | Resumo nutricional flutuante | ✅ | `DietCalculator.css` linha 213: `position: sticky` aplicado. |
| 8.3 | Trocar "gorduras" por "lipídeos" | ⚠️ | Feito em: `DietCalculator.tsx`, `DietDetail.tsx`, `DietList.tsx`, `MyDiets.tsx`, `MyDietDetail.tsx`, `FoodManagement.tsx`. **Pendente:** `src/pages/Clients/ClientProfile.tsx` linha 1067 ainda exibe `"Gorduras"`. |
| 8.4 | Adicionar/excluir/editar refeições com nomes customizados | ❌ | Verificar se `DietCalculator.tsx` usa nomes de refeição dinâmicos ou ainda tem as 4 fixas (`cafe-manha`, `almoco`, `lanche`, `jantar`). |

### Correção pendente 8.3:
**Arquivo:** `src/pages/Clients/ClientProfile.tsx` — linha 1067:
```tsx
// ATUAL
<span className="client-profile__diet-nutrition-label">Gorduras</span>

// CORRETO
<span className="client-profile__diet-nutrition-label">Lipídeos</span>
```

---

## 9. Financeiro

| Item | Título | Status | Observação |
|------|--------|--------|------------|
| 9.1 | Receitas pendentes não contabilizadas como realizadas | ✅ | `financialService.ts` filtra por `paymentStatus === "paid"`. |
| 9.2 | Despesas: status pendente/realizado | ✅ | `paymentStatus` adicionado em `types/financial.ts` (linhas 14, 31, 40, 51). `ExpenseModal.tsx` tem campo de status. |
| 9.3 | Recorrência de despesas | ✅ | `ExpenseModal.tsx` tem campos `isRecurring`, `recurrenceFrequency` e `recurrenceEndDate`. |
| 9.4 | Saldo considera apenas valores pagos | ✅ | `financialService.ts` calcula `totalPendingIncome` e `totalPendingExpense` separados do saldo. |

---

## 10. Gerenciar Alimentos

| Item | Título | Status | Observação |
|------|--------|--------|------------|
| 10.1 | Página centralizada | ✅ | Classe `.food-management` existe em `FoodManagement.css`. Verificar se tem `max-width: 1100px` e `margin: 0 auto`. |
| 10.2 | Trocar "gorduras" por "lipídeos" | ✅ | `FoodManagement.tsx` já usa "Lipídeos". |
| 10.3 | Remover campo "refeições permitidas" | ❌ | `FoodManagement.tsx` ainda tem o campo `allowedMeals` no formulário (linhas 39, 92, 109, 190, 194, 376). Precisa ser removido do formulário e do `handleSubmit`. |
| 10.4 | Botão para reimportar base TACO | ❌ | Script de importação existe em `src/scripts/importTacoFoods.ts`. Falta criar o botão "Restaurar base TACO" em `FoodManagement.tsx` com modal de confirmação. |

### Correção pendente 10.3 — FoodManagement:
Remover de `FoodManagement.tsx`:
- Estado inicial: `allowedMeals: []` (linha 39 e 92)
- `handleEdit`: `allowedMeals: food.allowedMeals || []` (linha 109)
- `handleReset`: `allowedMeals: []` (linha 126)
- `handleSubmit`: `allowedMeals: formData.allowedMeals` (linha 150, 163)
- `handleAllowedMealsChange` função inteira (linha 190–194)
- JSX do formulário: checkbox group de `allowedMeals` (linha 376)

---

## Resumo Executivo

### Itens CONFIRMADOS como pendentes (verificados no código):

| # | Item | Arquivo | Linha |
|---|------|---------|-------|
| 1 | Botão submit do cadastro ainda verde | `src/pages/Register/Form/Form.css` | 204 |
| 2 | Email domain ainda "nutrimanager.com" | `src/services/emailService.ts` | 13 |
| 3 | OccupancyChart com WORK_HOURS hardcoded | `src/pages/Dashboard/components/OccupancyChart.tsx` | 20, 34 |
| 4 | ScheduleSummary click sem ID do appointment | `src/pages/Dashboard/components/ScheduleSummary.tsx` | 147 |
| 5 | "Gorduras" em ClientProfile | `src/pages/Clients/ClientProfile.tsx` | 1067 |
| 6 | allowedMeals ainda no formulário de alimentos | `src/pages/Food/FoodManagement.tsx` | 39, 92, 376 |

### Itens A VERIFICAR manualmente (não confirmados):

- **5.4** — BirthdayCard: próxima consulta
- **5.6** — Sino: filtro por categoria
- **5.7** — Card financeiro: título correto
- **5.8** — Gráfico de gênero: `minWidth`
- **6.4** — Histórico de consulta: editar/excluir
- **6.5** — Histórico minimizado por padrão
- **6.6** — Upload de documento: funcionamento e erro
- **6.7** — Objetivos: toggle e editar
- **6.8** — Objetivos minimizados
- **6.12** — Conta nova sem paciente de teste
- **6.13** — Data de aniversário D-1
- **7.3** — Erro falso ao cadastrar serviço
- **7.4** — Duração do serviço livre
- **7.6** — Cadastrar serviço funciona
- **7.7** — Grade da agenda respeita horários
- **7.9** — Editar agendamento sem erro
- **7.11** — Eventos pendentes transparentes
- **8.1** — Busca sem filtro allowedMeals
- **8.4** — Refeições customizáveis
- **10.4** — Botão reimportar TACO

---

*Documento gerado em 2026-04-08. Executar após implementação dos índices 11 a 13.*
