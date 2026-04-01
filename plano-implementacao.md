# Plano de Implementação — Nutrize Platform

> **Metodologia de análise:** Para bugs e maus funcionamentos, aplicamos a análise de causa raiz por Diagrama de Ishikawa (espinha de peixe), cobrindo as categorias: **Sistema/Código**, **Dados/Modelo**, **Lógica de Negócio**, **UI/UX** e **Integração**. Para melhorias e novas funcionalidades, apresentamos diretamente o plano de implementação.

---

## Legenda de Prioridade

| Símbolo | Prioridade | Critério |
|---------|-----------|----------|
| 🔴 | **Crítica** | Funcionalidade quebrada / dados incorretos |
| 🟠 | **Alta** | Impacto direto na experiência do usuário |
| 🟡 | **Média** | Melhoria importante mas sistema funciona sem ela |
| 🟢 | **Baixa** | Polimento / refinamento visual |

---

## Índice

1. [Estético](#1-estético)
2. [Funcional Geral — Responsividade](#2-funcional-geral--responsividade-mobile)
3. [Página de Cadastro de Nutricionista](#3-página-de-cadastro-de-nutricionista)
4. [Página de Login](#4-página-de-login)
5. [Home (Dashboard)](#5-home-dashboard)
6. [Pacientes](#6-pacientes)
7. [Agenda](#7-agenda)
8. [Calculadora de Dieta](#8-calculadora-de-dieta)
9. [Financeiro](#9-financeiro)
10. [Gerenciar Alimentos](#10-gerenciar-alimentos)
11. [Conta Paciente — App iOS e Android](#11-conta-paciente--app-ios-e-android)
12. [Conta Secretaria](#12-conta-secretaria)
13. [Tela de Planos](#13-tela-de-planos)

---

---

# 1. Estético

## 1.1 🟠 Alterar cor principal para `#e88413` (laranja)

### Plano de Implementação

**Problema atual:** Todas as cores primárias estão hardcoded nos arquivos CSS individuais (verde `#16a34a`, `#15803d`, `#166534`). Não existem CSS custom properties (variáveis) centralizadas.

**Solução:**

**Passo 1 — Criar variáveis CSS globais em `src/index.css`:**
```css
:root {
  --color-primary:      #e88413;
  --color-primary-dark: #c96d0a;
  --color-primary-light:#f0a63a;
  --color-primary-focus:rgba(232, 132, 19, 0.25);
}
```

**Passo 2 — Substituir ocorrências hardcoded nos arquivos abaixo:**

| Arquivo | Ocorrências | Cor atual | Substituir por |
|---------|-------------|-----------|----------------|
| `src/pages/Login/Login.css` | 1 | `#16a34a`, `#15803d`, `#166534` (gradiente) | `var(--color-primary)`, `var(--color-primary-dark)`, `var(--color-primary-dark)` |
| `src/pages/Login/Form/Form.css` | 2 | `#16a34a` | `var(--color-primary)` |
| `src/components/ui/Button/Button.css` | 3 | `#16a34a`, `#15803d` | `var(--color-primary)`, `var(--color-primary-dark)` |
| `src/components/layout/Sidebar/Sidebar.css` | 6 | `#16a34a`, `#15803d` | `var(--color-primary)`, `var(--color-primary-dark)` |
| `src/components/ui/InputField/InputField.css` | 3 | `#16a34a` | `var(--color-primary)` |
| `src/pages/Agenda/Agenda.css` | ~8 | `#16a34a`, `#15803d` | variáveis |
| `src/pages/Agenda/components/AppointmentModal.css` | ~3 | `#16a34a` | variáveis |
| `src/pages/Agenda/components/ClientSearch.css` | ~2 | `#16a34a` | variáveis |
| `src/pages/Admin/AppointmentRequests.css` | ~2 | `#16a34a` | variáveis |
| `src/components/ui/TrialBlockModal/TrialBlockModal.css` | ~2 | `#16a34a` | variáveis |

---

## 1.2 🟠 Alterar nome do sistema para "Nutrize"

### Plano de Implementação

**Problema atual:** O nome "NutriManager" está hardcoded em 11+ locais.

**Arquivos e localizações a alterar:**

| Arquivo | Linha(s) | Texto atual | Novo texto |
|---------|---------|-------------|------------|
| `src/pages/Login/Login.tsx` | 29 | `NutriManager` | `Nutrize` |
| `src/pages/Login/Form/Form.tsx` | 59 | `NutriManager` | `Nutrize` |
| `src/pages/Register/Form/Form.tsx` | 114 | `Cadastro de Nutricionista - NutriManager` | `Cadastro de Nutricionista - Nutrize` |
| `src/components/layout/Header/Header.tsx` | 144 | `NutriManager` | `Nutrize` |
| `src/components/layout/Sidebar/Sidebar.tsx` | 1, 16 | `NutriManager` | `Nutrize` |
| `src/pages/ClientLogin/ClientLogin.tsx` | — | `NutriManager` | `Nutrize` |
| `src/pages/Dashboard/Dashboard.tsx` | 33, 49 | `NutriManager` | `Nutrize` |
| `src/services/emailService.ts` | múltiplas | `NutriManager`, `fromName: "NutriManager"` | `Nutrize` |
| `src/components/ui/TrialWarningModal/TrialWarningModal.tsx` | — | `NutriManager` | `Nutrize` |
| `index.html` | `<title>` | verificar | `Nutrize` |

---

## 1.3 🟡 Atualizar logos

### Plano de Implementação

1. Baixar os arquivos de logo da pasta indicada no Google Drive.
2. Salvar em `src/assets/logo-nutrize.svg` (ou `.png`).
3. Substituir o uso de `FaAppleAlt` (ícone react-icons) por `<img src={logo} />` nos arquivos:
   - `src/pages/Login/Login.tsx` — logo no topo do formulário
   - `src/components/layout/Sidebar/Sidebar.tsx` — logo no menu lateral
   - `src/components/layout/Header/Header.tsx` — logo no cabeçalho mobile
4. Ajustar dimensões via CSS (`width: 140px`, `height: auto`).

---

---

# 2. Funcional Geral — Responsividade Mobile

## 2.1 🟠 Responsividade para mobile em todo o sistema

### Plano de Implementação

**Estratégia:** Revisão com abordagem *mobile-first* usando media queries.

1. **Definir breakpoints padrão em `src/index.css`:**
   ```css
   /* breakpoints */
   /* sm: 640px | md: 768px | lg: 1024px | xl: 1280px */
   ```

2. **Priorizar os componentes com mais impacto visual:**
   - `src/components/layout/Sidebar/Sidebar.css` — menu recolhível no mobile (hambúrguer)
   - `src/components/layout/Header/Header.css` — cabeçalho compacto
   - `src/pages/Dashboard/Dashboard.tsx` — cards em coluna única no mobile
   - `src/pages/Clients/ClientList.tsx` — tabela responsiva ou cards
   - `src/pages/Agenda/Agenda.css` — calendário com scroll horizontal
   - `src/pages/Financeiro/Financeiro.css` — tabela com scroll ou cards

3. **Para cada componente:** adicionar `@media (max-width: 768px)` com layout em coluna única, fontes reduzidas e botões full-width.

---

---

# 3. Página de Cadastro de Nutricionista

## 3.1 🔴 Campo telefone sem máscara

### Análise Ishikawa (Causa Raiz)

```
                        [Campo telefone sem máscara]
                                    |
        ┌───────────┬───────────────┼───────────────┬───────────────┐
     Sistema      Dados          Lógica            UI             Integração
        |           |              |                |                 |
  Sem biblioteca  Telefone      Nenhuma          Input type=      Dados salvos
  de máscara     salvo como    validação         "tel" sem        sem formato
  instalada      string livre  de formato        máscara          padrão
```

**Causa raiz principal:** O campo de telefone em `src/pages/Register/Form/Form.tsx` usa `<input type="text">` simples sem qualquer máscara ou validação de formato. Não há biblioteca de máscara instalada no projeto.

**Causa secundária:** O mesmo problema ocorre em `src/pages/Clients/ClientForm.tsx` (campo telefone do paciente).

### Solução

1. **Instalar biblioteca de máscara:**
   ```bash
   npm install react-input-mask
   # ou usar implementação nativa com onKeyUp/onChange
   ```

2. **Implementar função de máscara nativa** (sem dependência extra) em `src/utils/masks.ts`:
   ```typescript
   export function maskPhone(value: string): string {
     const digits = value.replace(/\D/g, '').slice(0, 11);
     if (digits.length <= 10) {
       return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
     }
     return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
   }
   ```

3. **Aplicar nos campos:** `Register/Form/Form.tsx` e `Clients/ClientForm.tsx`
   ```tsx
   onChange={(e) => setPhone(maskPhone(e.target.value))}
   ```

4. **Validar no submit:** mínimo 14 caracteres após máscara (`(XX) XXXXX-XXXX`).

---

---

# 4. Página de Login

## 4.1 🟠 Criar página de "Esqueci Senha"

### Plano de Implementação

**Estado atual:** O link "Esqueceu sua senha?" existe em `src/pages/Login/Form/Form.tsx` mas o `onClick` faz apenas `console.log` — sem funcionalidade real.

**Solução:**

1. **Criar página:** `src/pages/ForgotPassword/ForgotPassword.tsx`
   - Campo de e-mail
   - Botão "Enviar link de recuperação"
   - Mensagem de sucesso após envio

2. **Adicionar rota em `src/routes/AppRoutes.tsx`:**
   ```tsx
   <Route path="/recuperar-senha" element={<ForgotPasswordPage />} />
   ```

3. **Implementar o serviço em `src/services/authService.ts`:**
   ```typescript
   import { sendPasswordResetEmail } from 'firebase/auth';

   export async function sendPasswordReset(email: string): Promise<void> {
     await sendPasswordResetEmail(auth, email);
   }
   ```

4. **Atualizar o `onClick` em `Form.tsx`** para navegar a `/recuperar-senha`.

5. **Criar página de confirmação** após reset bem-sucedido com link para voltar ao login.

---

---

# 5. Home (Dashboard)

## 5.1 🟠 Aviso de dias restantes com botão "Assine agora"

### Plano de Implementação

**Arquivo:** `src/pages/Dashboard/Dashboard.tsx` + `src/hooks/useTrial.ts`

1. Localizar o banner/aviso de trial existente no Dashboard.
2. Alterar o texto para: `"Faltam X dias para o fim do seu período de teste"`
3. Adicionar botão `"Assine agora"` que navega para `/assinatura` (rota já existente).
4. Usar o hook `useTrial()` para obter `daysRemaining`.

---

## 5.2 🔴 Cálculo de ocupação da agenda incorreto

### Análise Ishikawa (Causa Raiz)

```
                   [Ocupação da agenda calculada incorretamente]
                                       |
      ┌──────────────┬─────────────────┼────────────────┬──────────────┐
   Sistema         Dados            Lógica             UI           Integração
      |               |                |                |                |
  OccupancyChart  Trabalha com     Conta número      Percentual     Não usa
  usa constante   quantidade de    de consultas      exibido é      workingHours
  SLOTS fixos     consultas, não   vs. slots         baseado em     do usuário
  (8h-18h, 2      com minutos      fixos, não        slots fixos
  slots/hora)     de agenda        com minutos
                                   configurados
```

**Causa raiz principal:** `src/pages/Dashboard/components/OccupancyChart.tsx` define `WORK_HOURS` como constante hardcoded de 8h-18h e `SLOTS_PER_HOUR = 2` (slots de 30 min). Não lê os horários de trabalho configurados pelo nutricionista em `schedules`.

**Causa secundária:** A métrica compara número de consultas vs. slots disponíveis, mas deveria comparar minutos agendados vs. minutos disponíveis totais na semana.

### Solução

1. **Buscar horários configurados** do nutricionista via `scheduleService` em `OccupancyChart.tsx`.
2. **Calcular minutos disponíveis por semana:**
   ```typescript
   const weeklyAvailableMinutes = schedule.days
     .filter(d => d.isActive)
     .flatMap(d => d.slots)
     .reduce((sum, slot) => {
       const start = parseTime(slot.startTime);
       const end = parseTime(slot.endTime);
       return sum + (end - start);
     }, 0);
   ```
3. **Calcular minutos ocupados** somando `duration` de cada consulta agendada na semana.
4. **Calcular ocupação:** `(minutosOcupados / minutosDisponiveis) * 100`.

---

## 5.3 🟠 Mensagem de aniversário: remover emojis

### Análise Ishikawa (Causa Raiz)

```
                    [Emojis não lidos corretamente pelo WhatsApp]
                                    |
      ┌──────────────┬──────────────┼───────────────┬────────────────┐
   Sistema         Dados          Lógica            UI            Integração
      |               |               |              |                |
  URL do          Template do    encodeURIComponent Emojis        WhatsApp Web
  WhatsApp        mensaje usa    encoda os          visíveis      pode não
  gerada com      emojis:        emojis mas         na preview    renderizar
  emojis no       🎉 🎂 ✨        alguns clientes    do card       em todos
  payload                        não os suportam                  dispositivos
```

**Causa raiz principal:** `src/pages/Dashboard/components/BirthdayCard.tsx` linha ~97 inclui emojis `🎉 🎂 ✨` diretamente no template da mensagem enviada via URL do WhatsApp. Em alguns dispositivos e versões do WhatsApp, emojis no payload da URL geram caracteres quebrados.

### Solução

Editar `BirthdayCard.tsx`, linha ~97 — remover os emojis do template:
```typescript
// Antes
const message = encodeURIComponent(
  `Olá ${name}! 🎉 Feliz aniversário! Desejamos um dia maravilhoso e cheio de realizações! 🎂✨`
);

// Depois
const message = encodeURIComponent(
  `Olá ${name}! Feliz aniversário! Desejamos um dia maravilhoso e cheio de realizações!`
);
```

Manter o emoji `🎉` apenas na decoração visual do card (HTML), não no texto da mensagem WhatsApp.

---

## 5.4 🟡 Card de aniversário: exibir próxima consulta

### Plano de Implementação

**Arquivo:** `src/pages/Dashboard/components/BirthdayCard.tsx`

1. Ao renderizar o card de aniversário, fazer query adicional em `appointments` para buscar o próximo agendamento do paciente (status `scheduled`, data futura, `clientId` correspondente).
2. Se existir próxima consulta: exibir abaixo do telefone `"Próxima consulta: DD/MM/AAAA às HH:mm"`.
3. Se não existir: deixar o campo em branco (não exibir nada).
4. Fazer a query via `appointmentService` já existente, filtrado por `clientId` e `date >= today`.

---

## 5.5 🔴 Agenda resumida: card de consulta confirmada não abre o compromisso

### Análise Ishikawa (Causa Raiz)

```
             [Card clicável na agenda resumida não navega para o compromisso]
                                      |
      ┌──────────────┬────────────────┼────────────────┬──────────────┐
   Sistema         Dados           Lógica              UI          Integração
      |               |               |                |               |
  ScheduleSummary Appointments    onClick do        Card tem      Não há rota
  renderiza cards  têm ID         card sem          cursor:       de detalhe
  como clicáveis  disponível      handler de        pointer       de consulta
  mas sem ação                    navegação         no CSS        individual
                                  implementado
```

**Causa raiz principal:** `src/pages/Dashboard/components/ScheduleSummary.tsx` renderiza os cards de consulta com estilo clicável (cursor pointer), mas o handler `onClick` não está implementado — ou está vazio.

### Solução

1. Em `ScheduleSummary.tsx`, adicionar `onClick` nos cards de consulta:
   ```tsx
   const navigate = useNavigate();
   // no card:
   onClick={() => navigate(`/dashboard/agenda?appointment=${appointment.id}`)}
   ```
2. Em `src/pages/Agenda/Agenda.tsx`, ler o query param `appointment` na montagem e abrir o modal do compromisso correspondente automaticamente.

---

## 5.6 🟠 Sino de notificação: filtrar apenas novas solicitações de consulta

### Análise Ishikawa (Causa Raiz)

```
                [Sino exibe todos os tipos de notificação]
                                    |
      ┌──────────────┬──────────────┼────────────────┬──────────────┐
   Sistema         Dados          Lógica             UI           Integração
      |               |               |               |               |
  NotificationContext Notificações  Sem filtro de   Ícone do    Todas ações
  adiciona todo   de tipos        tipo ao exibir  sino mostra  disparam
  tipo de         variados        no dropdown     badge para   addNotification
  notificação     (success,       do sino         todo tipo    genérica
  no contexto     error, info,
                  warning, etc.)
```

**Causa raiz principal:** `src/contexts/NotificationContext.tsx` armazena todas as notificações do sistema (success, error, warning, info) e `src/components/layout/Header/Header.tsx` exibe todas no dropdown do sino, sem filtro por tipo.

### Solução

1. Adicionar campo `category` ao tipo de notificação:
   ```typescript
   type NotificationCategory = 'system' | 'appointment_request';
   ```
2. Ao criar notificação de nova solicitação de consulta (em `appointmentService.ts`), usar `category: 'appointment_request'`.
3. Em `Header.tsx`, filtrar o badge e o dropdown para exibir apenas `category === 'appointment_request'`:
   ```tsx
   const appointmentNotifications = notifications.filter(
     n => n.category === 'appointment_request' && !n.read
   );
   ```
4. Notificações de sistema (erros, sucessos) continuam aparecendo via Toast, mas não no sino.

---

## 5.7 🟠 Card financeiro: corrigir título e remover texto desnecessário

### Análise Ishikawa (Causa Raiz)

```
          [Card financeiro com título incorreto e texto desnecessário]
                                    |
         ┌────────────┬─────────────┼────────────────┬──────────────┐
      Sistema       Dados         Lógica             UI           Integração
         |              |              |               |               |
   Dashboard.tsx   Dados de       Título "Projeções" Texto de     Financeiro.tsx
   renderiza card  projeção e     não descreve       "próximas    e Dashboard
   com título      próximas       completamente      consultas"   não alinhados
   desatualizado   consultas      o conteúdo         sobrepõe     na nomenclatura
                   misturados     do card            informação
```

**Causa raiz principal:** O card financeiro no Dashboard tem título desatualizado ("Projeções") e exibe um subtexto de "próximas consultas" que não pertence a esse card — falta de alinhamento entre o design atual e o código em `src/pages/Dashboard/Dashboard.tsx`.

### Solução

Localizar o card financeiro em `Dashboard.tsx` e:
1. Alterar o título de `"Projeções"` para `"Projeções de receita"`.
2. Remover o texto/elemento que exibe "próximas consultas" abaixo do card.

---

## 5.8 🟠 Distribuição por gênero: % não visível com menu recolhido

### Análise Ishikawa (Causa Raiz)

```
                [% de gênero não visível com sidebar recolhida]
                                    |
      ┌──────────────┬──────────────┼────────────────┬────────────────┐
   Sistema         Dados          Lógica             UI            Integração
      |               |               |               |                |
  Gráfico de      Dados de        Labels do        Container do   Sidebar
  distribuição    distribuição    gráfico em       gráfico não    recolhida
  usa posição     calculados      posição          tem width      não redispara
  absoluta para   corretamente    absoluta         mínimo         resize no
  os labels                       sobre o gráfico  garantido      gráfico
```

**Causa raiz principal:** O componente de distribuição por gênero (provavelmente usando Recharts) usa labels com posição absoluta dentro de um container que não tem largura mínima garantida. Quando o sidebar recolhe, o container encolhe e as labels ficam fora dos limites visíveis.

### Solução

1. Localizar o componente de gráfico de gênero no Dashboard.
2. Adicionar `minWidth: 280px` ao container do gráfico via CSS.
3. Usar `ResponsiveContainer` do Recharts com `width="100%"` e garantir que as labels usem `position: 'inside'` ou percentuais relativos:
   ```tsx
   <ResponsiveContainer width="100%" minWidth={280} height={200}>
   ```

---

---

# 6. Pacientes

## 6.1 🟠 Campo "sexo" não deve ser obrigatório

### Análise Ishikawa (Causa Raiz)

```
               [Campo sexo obrigatório impede cadastro]
                                |
      ┌────────────┬────────────┼────────────┬────────────┐
   Sistema       Dados       Lógica         UI         Integração
      |             |             |           |              |
  ClientForm.tsx  gender no    Validação    Radio buttons  Tipo Client
  tem gender      tipo Client  bloqueia     sem opção     tem gender
  como required   como campo   submit se    "prefiro      como campo
  na validação    obrigatório  gender       não informar" obrigatório
                               vazio
```

**Causa raiz principal:** Em `src/pages/Clients/ClientForm.tsx`, a função de validação verifica se `gender` está preenchido e bloqueia o submit se não estiver. O campo deveria ser opcional.

### Solução

1. Em `ClientForm.tsx`, remover `gender` da validação obrigatória.
2. Garantir que o tipo `Client` em `src/types/client.ts` tenha `gender` como opcional: `gender?: "masculino" | "feminino" | "outro"`.
3. Atualizar queries/filtros que dependem de `gender` para tratar `undefined` com segurança.

---

## 6.2 🟡 Separar "nome completo" em "nome" e "sobrenome"

### Plano de Implementação

1. **Atualizar o tipo** em `src/types/client.ts`:
   ```typescript
   firstName: string;
   lastName: string;
   // manter fullName como campo computado ou remover
   ```
2. **Atualizar `ClientForm.tsx`:** substituir o campo `fullName` por dois campos `firstName` e `lastName`.
3. **Atualizar `clientService.ts`:** ao salvar, compor `fullName = firstName + ' ' + lastName` para manter compatibilidade com exibições que usam nome completo.
4. **Atualizar todas as buscas e exibições** que referenciam `client.fullName` — substituir por `${client.firstName} ${client.lastName}` ou manter `fullName` como campo derivado.

---

## 6.3 🔴 Medida corporal: não atualiza com dados da última consulta

### Análise Ishikawa (Causa Raiz)

```
               [Medidas corporais não refletem última consulta]
                                    |
      ┌──────────────┬──────────────┼────────────────┬──────────────┐
   Sistema         Dados          Lógica             UI           Integração
      |               |               |               |               |
  ClientProfile   Consultas têm  Perfil do       Exibe dados    clientService
  não busca       peso/altura    paciente lê     do cadastro    não provê
  histórico de    registrados    apenas o        inicial, não   função de
  consultas       em cada        cadastro        do histórico   "última medida"
  para medidas    entrada        inicial         de consultas
```

**Causa raiz principal:** `src/pages/ClientProfile/ClientProfile.tsx` exibe as medidas corporais (peso, altura) lendo diretamente do documento do cliente (`client.weight`, `client.height`) que foi preenchido no cadastro inicial. Não busca o histórico de consultas para obter os dados mais recentes.

### Solução

1. Em `clientService.ts`, criar função `getLatestBodyMeasurements(clientId)` que busca a consulta mais recente com medidas registradas.
2. Em `ClientProfile.tsx`, após carregar o cliente, fazer query adicional para obter as medidas da última consulta.
3. Exibir as medidas mais recentes com indicação da data: `"Peso: 70kg (atualizado em 15/03/2026)"`.
4. Se não houver consulta com medidas, usar os dados do cadastro inicial.

---

## 6.4 🟡 Histórico de consulta: opções de editar e excluir

### Plano de Implementação

**Arquivo:** `src/pages/ClientProfile/ClientProfile.tsx`

1. Adicionar botões "Editar" e "Excluir" em cada linha do histórico de consultas.
2. "Editar": abre modal com os campos da consulta pré-preenchidos → ao salvar, chama `updateConsultation(id, data)` em `clientService.ts`.
3. "Excluir": exibe confirmação modal → ao confirmar, chama `deleteConsultation(id)` em `clientService.ts`.
4. Implementar as funções `updateConsultation` e `deleteConsultation` em `clientService.ts` usando `updateDoc` e `deleteDoc` do Firestore.

---

## 6.5 🟡 Histórico de consulta: minimizado por padrão

### Plano de Implementação

1. Cada entrada do histórico deve ser renderizada em modo colapsado por padrão, exibindo apenas: data, tipo de consulta e um ícone de expansão.
2. Ao clicar, expandir para mostrar todos os detalhes daquela consulta.
3. Implementar com estado local `expandedConsultations: Set<string>` em `ClientProfile.tsx`.
4. Estilizar o header colapsado com fundo diferenciado e seta/chevron animado.

---

## 6.6 🔴 Função "adicionar documento" não funciona

### Análise Ishikawa (Causa Raiz)

```
               [Adicionar documento não funciona]
                                |
      ┌────────────┬────────────┼────────────┬────────────┐
   Sistema       Dados       Lógica         UI         Integração
      |             |             |           |              |
  AddDocument   Firebase      Upload para  Botão de    storageService
  Modal com     Storage       Storage pode upload      pode ter
  erro não      rules podem   estar falhando sem       permissões
  tratado       bloquear      silenciosamente feedback  incorretas
  visualmente   o upload      ou com erro   de erro    no Storage
```

**Causa raiz principal:** A função de upload de documento provavelmente falha silenciosamente (erro não exibido ao usuário) por uma combinação de: regras do Firebase Storage (`storage.rules`) restritivas, ou erro no `storageService.ts` não capturado no componente.

### Solução

1. Verificar `storage.rules` — garantir que nutricionistas autenticados podem fazer upload para o caminho `clients/{clientId}/documents/`.
2. Em `storageService.ts`, garantir tratamento de erro adequado e retorno da URL do arquivo.
3. Em `AddDocumentModal` (ou similar), adicionar loading state e exibir erro em caso de falha:
   ```tsx
   try {
     const url = await uploadDocument(file, clientId);
     await addClientDocument(clientId, { url, name: file.name, ... });
   } catch (err) {
     setError("Falha ao enviar documento. Tente novamente.");
   }
   ```
4. Testar o fluxo completo: seleção de arquivo → upload → gravação no Firestore → exibição na lista.

---

## 6.7 🟡 Objetivos: ativar/desativar e editar

### Plano de Implementação

1. Em `src/types/client.ts`, garantir que `ClientGoal` tem campo `isActive: boolean`.
2. Em `ClientProfile.tsx`, para cada objetivo:
   - Adicionar toggle (switch) para ativar/desativar → chama `updateGoal(id, { isActive: !current })`.
   - Adicionar botão "Editar" que abre modal com campos pré-preenchidos.
3. Implementar `updateGoal` em `clientService.ts`.

---

## 6.8 🟡 Objetivos: minimizados por padrão

### Plano de Implementação

Mesma abordagem do item 6.5 (histórico de consulta), aplicado aos objetivos:
- Exibir apenas o título do objetivo por padrão.
- Expandir ao clicar para mostrar descrição, meta, data limite e status.

---

## 6.9 🟡 Importar clientes em lote

### Plano de Implementação

1. **Criar componente de importação:** `src/pages/Clients/components/ImportClientsModal.tsx`
2. **Disponibilizar planilha modelo** para download (CSV com colunas: nome, sobrenome, email, telefone, nascimento, gênero, peso, altura).
3. **Parser CSV** no frontend usando `FileReader` e split por linha/vírgula.
4. **Validar cada linha** antes de importar (email válido, telefone formatado, etc.).
5. **Exibir prévia** dos dados antes de confirmar.
6. **Importar em lote** via `Promise.allSettled` para cada linha → `addClient(clientData)`.
7. **Exibir relatório** de sucesso/falha por linha.
8. Adicionar botão "Importar em lote" ao lado do botão "Adicionar paciente" em `ClientList.tsx`.
9. Incluir texto de instrução no modal explicando o formato esperado.

**Referência da planilha:** [https://docs.google.com/spreadsheets/d/1zYG6h8pEuFgw2vKO-KNZBU8O6sKbkaiIrmU30vHp7E0](https://docs.google.com/spreadsheets/d/1zYG6h8pEuFgw2vKO-KNZBU8O6sKbkaiIrmU30vHp7E0)

---

## 6.10 🟠 Senha da área do cliente: 4 últimos dígitos do telefone

### Análise Ishikawa (Causa Raiz)

```
            [Campo de senha desnecessário no cadastro de paciente]
                                    |
      ┌──────────────┬──────────────┼────────────────┬──────────────┐
   Sistema         Dados          Lógica             UI           Integração
      |               |               |               |               |
  ClientForm tem  Senha          Senha precisa    Campo de      clientAuthService
  campo de senha  definida       ser definida     senha         usa a senha
  obrigatório     manualmente    manualmente      manual no     para criar
  no cadastro     pelo nutri     pelo nutri       formulário    conta Firebase
                                                               Auth do paciente
```

**Causa raiz principal:** `ClientForm.tsx` exige que o nutricionista defina manualmente uma senha para o paciente. A regra de negócio correta é usar automaticamente os 4 últimos dígitos do telefone como senha.

### Solução

1. **Remover** o campo de senha de `ClientForm.tsx`.
2. Em `clientService.ts` / `clientAuthService.ts`, ao criar a conta do paciente no Firebase Auth, gerar a senha automaticamente:
   ```typescript
   const digits = phone.replace(/\D/g, '');
   const password = digits.slice(-4);
   await createClientAccount(email, password);
   ```
3. **Garantir que o telefone está preenchido** antes de criar a conta (validação prévia).
4. Informar ao nutricionista: *"A senha de acesso do paciente será os 4 últimos dígitos do telefone cadastrado."*

---

## 6.11 🟡 Retirar qualquer anúncio referente ao trial para pacientes

### Plano de Implementação

1. Identificar todos os locais onde modais, banners ou avisos de trial são exibidos na área do paciente.
2. Verificar se o componente `TrialBlockModal` ou `TrialWarningModal` pode ser renderizado em rotas de pacientes.
3. Garantir que os guards de trial (`useTrial`, `AdminRoutes`) afetam apenas rotas de nutricionistas, não a área do paciente.

---

## 6.12 🔴 Contas novas criadas sem paciente de teste pré-cadastrado

### Análise Ishikawa (Causa Raiz)

```
             [Conta nova vem com paciente de teste pré-cadastrado]
                                    |
      ┌──────────────┬──────────────┼────────────────┬────────────────┐
   Sistema         Dados          Lógica             UI            Integração
      |               |               |               |                |
  authService.ts  Documento de   Ao criar conta,  Lista de       Firebase
  ou script de    paciente de    cria automatica- pacientes      inicializado
  inicialização   teste no       mente um         mostra o       com dados
  cria dados      Firestore      documento de     paciente       de seed
  de seed                        paciente seed    de teste
```

**Causa raiz principal:** Provavelmente `src/services/authService.ts` (função `register`) ou um script de inicialização cria um documento de paciente de demonstração ao registrar um novo nutricionista.

### Solução

1. Localizar em `authService.ts` (função `register` ou similar) qualquer chamada a `addDoc` na coleção `clients` após criar o usuário.
2. Remover essa criação de dados de seed.
3. Garantir que a coleção `clients` do novo nutricionista inicia vazia.
4. Testar: registrar nova conta → verificar que lista de pacientes está vazia.

---

## 6.13 🔴 Aniversário: data salva com D-1 (um dia antes)

### Análise Ishikawa (Causa Raiz)

```
                   [Data de aniversário exibida com D-1]
                                    |
      ┌──────────────┬──────────────┼────────────────┬──────────────┐
   Sistema         Dados          Lógica             UI           Integração
      |               |               |               |               |
  ClientForm.tsx  birthDate       new Date("YYYY-  Data exibida  Firestore
  usa input       salva como      MM-DD") cria     com 1 dia     armazena o
  type="date"     string ISO      Date em UTC,     a menos do    Timestamp
  que retorna     ou Timestamp    ao converter      esperado      convertido
  "YYYY-MM-DD"    com offset      para local perde              com offset
                  de fuso         1 dia no         
                  horário         fuso BR (-3h)
```

**Causa raiz principal:** O campo `<input type="date">` retorna `"YYYY-MM-DD"`. Ao fazer `new Date("YYYY-MM-DD")`, o JavaScript interpreta como meia-noite UTC. No fuso horário brasileiro (UTC-3), isso se torna 21h do dia anterior — resultando em D-1 ao ser exibido.

### Solução

Em `ClientForm.tsx` e em qualquer ponto que converte `birthDate` de string para Date:

```typescript
// Errado — interpreta como UTC meia-noite
const date = new Date("2000-03-15"); // → 14/03 às 21h no UTC-3

// Correto — adicionar T00:00:00 para forçar horário local
const date = new Date("2000-03-15T00:00:00");

// Ou ainda mais explícito: parsear manualmente
function parseDateLocal(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day); // new Date(year, month, day) = horário local
}
```

Aplicar a mesma correção ao exibir a data e ao calcular se hoje é aniversário.

---

---

# 7. Agenda

## 7.1 🟠 Layout da agenda em português

### Análise Ishikawa (Causa Raiz)

```
                    [Elementos da agenda em inglês]
                                  |
      ┌────────────┬──────────────┼────────────────┬──────────────┐
   Sistema       Dados          Lógica             UI           Integração
      |             |               |               |               |
  react-big-    Sem localização Localizer do    Botões:        moment.js
  calendar não  pt-BR aplicada  moment não      "Today",       instalado mas
  vem localizado ao calendário  configurado     "Back",        sem locale
  por padrão                    com pt-BR       "Next" em      pt-BR aplicado
                                                inglês
```

**Causa raiz principal:** `src/pages/Agenda/Agenda.tsx` usa `react-big-calendar` com `momentLocalizer` mas não configura `moment` para o locale `pt-BR`, e não passa as `messages` de tradução para o componente `<Calendar>`.

### Solução

```typescript
// Em Agenda.tsx, no topo:
import moment from 'moment';
import 'moment/locale/pt-br';
moment.locale('pt-br');

// No componente <Calendar>, adicionar prop messages:
const messages = {
  today: 'Hoje',
  previous: 'Anterior',
  next: 'Próximo',
  month: 'Mês',
  week: 'Semana',
  day: 'Dia',
  agenda: 'Agenda',
  date: 'Data',
  time: 'Hora',
  event: 'Consulta',
  noEventsInRange: 'Sem consultas neste período.',
  showMore: (total: number) => `+ ${total} consultas`,
};

<Calendar messages={messages} ... />
```

---

## 7.2 🟢 Botão "Editar horários" → "Configurações da agenda"

### Solução

Localizar em `src/pages/Agenda/Agenda.tsx` o botão com texto "Editar horários" e alterar o texto para "Configurações da agenda".

---

## 7.3 🔴 Mensagem de erro ao cadastrar serviço

### Análise Ishikawa (Causa Raiz)

```
              [Mensagem de erro indevida ao cadastrar serviço]
                                  |
      ┌────────────┬──────────────┼────────────────┬──────────────┐
   Sistema       Dados          Lógica             UI           Integração
      |             |               |               |               |
  ServicesManager  Dados do      Erro disparado   Toast/alert   serviceService
  captura erro    serviço        antes da         de erro       addService pode
  mas exibe mesmo válidos        conclusão da     exibido mesmo estar com
  quando operação               operação ou       com sucesso   promise mal
  bem-sucedida                  em código de                    encadeada
                                sucesso
```

**Causa raiz principal:** Em `src/pages/Agenda/components/ServicesManager.tsx`, provavelmente um `catch` está sendo acionado indevidamente, ou a notificação de erro é disparada antes da resolução da Promise. Pode ser um `async/await` mal estruturado onde o erro é exibido mesmo após sucesso.

### Solução

1. Revisar o fluxo de `handleAddService` em `ServicesManager.tsx`:
   ```typescript
   try {
     await serviceService.addService(serviceData);
     showSuccess("Serviço cadastrado com sucesso!");
     resetForm();
   } catch (error) {
     // só exibir erro AQUI, nunca fora do catch
     showError("Erro ao cadastrar serviço.");
   }
   ```
2. Garantir que não há `setError(null)` ou notificação de erro fora do bloco `catch`.
3. Testar o fluxo completo: preencher formulário → salvar → verificar que apenas a mensagem de sucesso aparece.

---

## 7.4 🔴 Duração do serviço: aceitar qualquer valor em minutos

### Análise Ishikawa (Causa Raiz)

```
              [Duração do serviço limitada a valores específicos]
                                    |
      ┌──────────────┬──────────────┼────────────────┬──────────────┐
   Sistema         Dados          Lógica             UI           Integração
      |               |               |               |               |
  ServicesManager Campo duration  Validação ou     Input com     Calendar usa
  com input       aceita apenas   select com       step="5" ou   slot size
  restritivo      certos valores  opções fixas     options fixas  de 30 min
                  (terminados     de duração       pre-definidas
                  em 1 e 6)
```

**Causa raiz principal:** O campo de duração em `ServicesManager.tsx` provavelmente usa um `<select>` com opções fixas ou um `<input type="number">` com `step` que restringe os valores.

### Solução

1. Substituir por `<input type="number" min={1} step={1} />` sem restrição de valores específicos.
2. Validação: apenas `duration > 0` e `duration <= 480` (8 horas máximo).
3. Se o calendário (`react-big-calendar`) usa `step` fixo: configurar `step={1}` e `timeslots={60}` para suportar qualquer granularidade.

---

## 7.5 🟠 Máscara de moeda no campo de valor do serviço

### Solução

Em `ServicesManager.tsx`, aplicar máscara de moeda no campo `price`:

```typescript
// Em src/utils/masks.ts (já criado no item 3.1)
export function maskCurrency(value: string): string {
  const digits = value.replace(/\D/g, '');
  const number = parseInt(digits || '0', 10) / 100;
  return number.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

// No campo:
onChange={(e) => setPrice(maskCurrency(e.target.value))}
// Ao salvar, converter de volta para número:
const numericPrice = parseFloat(price.replace(/[R$\s.]/g, '').replace(',', '.'));
```

---

## 7.6 🔴 Função "adicionar serviço" não funciona

### Análise Ishikawa (Causa Raiz)

```
                  [Adicionar serviço sem efeito]
                                |
      ┌────────────┬────────────┼────────────┬────────────┐
   Sistema       Dados       Lógica         UI         Integração
      |             |             |           |              |
  Formulário    nutritionistId  addService  Sem feedback  serviceService
  não captura   pode estar     pode estar  de loading    addDoc pode
  nutritionistId undefined ao  falhando    ou erro       estar com
  do usuário    chamar o       silencio-   visível       coleção ou
  atual         serviço        samente                   path errado
```

**Causa raiz principal:** `serviceService.addService()` provavelmente falha silenciosamente porque `nutritionistId` está `undefined` ao ser passado, ou o caminho da coleção no Firestore está incorreto.

### Solução

1. Em `ServicesManager.tsx`, garantir que `nutritionistId` vem de `useAuth()` e está disponível antes de chamar o serviço:
   ```typescript
   const { user } = useAuth();
   const handleAddService = async () => {
     if (!user?.uid) return;
     await serviceService.addService({ ...serviceData, nutritionistId: user.uid });
   };
   ```
2. Em `serviceService.ts`, verificar o caminho da coleção no Firestore: deve ser `collection(db, 'services')` com `nutritionistId` como campo de filtro.
3. Verificar `firestore.rules` — o nutricionista deve ter permissão para criar documentos na coleção `services`.
4. Adicionar loading state e tratamento de erro visível no componente.

---

## 7.7 🔴 Grade da agenda não respeita horários configurados

### Análise Ishikawa (Causa Raiz)

```
       [Grade de horários não atualiza conforme configuração do nutricionista]
                                       |
      ┌──────────────┬─────────────────┼────────────────┬──────────────┐
   Sistema         Dados            Lógica             UI           Integração
      |               |                |                |               |
  Agenda.tsx      schedules        getMinMaxWorking  Calendar     scheduleService
  com min/max     do nutricionista Hours() pode      com min=8,   retorna dados
  hardcoded       carregados       não ser passada   max=18       mas Agenda.tsx
  8h-18h          mas não usados   ao <Calendar>     hardcoded    não os aplica
```

**Causa raiz principal:** `src/pages/Agenda/Agenda.tsx` define horários mínimo/máximo do calendário como constantes fixas (8h-18h) sem usar os horários configurados pelo nutricionista, mesmo que exista a função `getMinMaxWorkingHours()`.

### Solução

1. Carregar o schedule do nutricionista ao montar `Agenda.tsx`:
   ```typescript
   const [schedule, setSchedule] = useState<Schedule | null>(null);
   useEffect(() => {
     scheduleService.getSchedule(user.uid).then(setSchedule);
   }, [user.uid]);
   ```
2. Calcular `minTime` e `maxTime` dinamicamente:
   ```typescript
   const minTime = schedule ? parseTime(schedule.earliestStart) : new Date(0, 0, 0, 8, 0);
   const maxTime = schedule ? parseTime(schedule.latestEnd) : new Date(0, 0, 0, 18, 0);
   ```
3. Passar para o `<Calendar min={minTime} max={maxTime} />`.

---

## 7.8 🟠 Bloquear horários indisponíveis na grade (tom mais escuro)

### Plano de Implementação

1. Em `Agenda.tsx`, implementar `dayPropGetter` ou `slotPropGetter` do `react-big-calendar`:
   ```typescript
   const slotPropGetter = (date: Date) => {
     const hour = date.getHours();
     const minute = date.getMinutes();
     const isAvailable = isWithinWorkingHours(date, schedule);
     return isAvailable
       ? {}
       : { style: { backgroundColor: '#f0f0f0', opacity: 0.6 } };
   };
   <Calendar slotPropGetter={slotPropGetter} ... />
   ```
2. Implementar `isWithinWorkingHours(date, schedule)` que verifica se o slot está dentro dos horários configurados no dia da semana correspondente.

---

## 7.9 🔴 Atualizar agendamento com erro

### Análise Ishikawa (Causa Raiz)

```
              [Erro ao atualizar agendamento existente]
                                  |
      ┌────────────┬──────────────┼────────────────┬──────────────┐
   Sistema       Dados          Lógica             UI           Integração
      |             |               |               |               |
  AppointmentModal ID do        updateAppointment Sem feedback  appointmentService
  pode não        appointment   pode estar        claro do      updateDoc pode
  passar o ID     pode estar    recebendo         motivo        falhar por
  correto ao      undefined     dados parciais    do erro       permissão ou
  chamar update   no modal      ou inválidos                    campo inválido
```

**Causa raiz principal:** `src/pages/Agenda/components/AppointmentModal.tsx` provavelmente não está passando o `id` do agendamento existente para a função de atualização, ou está enviando campos com tipos incompatíveis com o Firestore (ex.: `Date` vs `Timestamp`).

### Solução

1. Verificar que ao abrir o modal para editar, o `appointment.id` é passado e armazenado no estado.
2. Em `appointmentService.ts`, confirmar que `updateAppointment(id, data)` usa:
   ```typescript
   const ref = doc(db, 'appointments', id);
   await updateDoc(ref, {
     ...data,
     updatedAt: Timestamp.now(),
   });
   ```
3. Garantir que datas são convertidas para `Timestamp` antes de passar ao Firestore.
4. Adicionar mensagem de erro clara no modal caso o update falhe.

---

## 7.10 🟡 Arrastar agendamentos para mudar dia/horário

### Plano de Implementação

1. Instalar o addon de drag-and-drop do react-big-calendar:
   ```bash
   npm install react-big-calendar
   # DnD já incluído no pacote — usar withDragAndDrop HOC
   ```
2. Configurar em `Agenda.tsx`:
   ```typescript
   import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
   import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
   const DnDCalendar = withDragAndDrop(Calendar);
   ```
3. Implementar handler `onEventDrop` e `onEventResize`:
   ```typescript
   const onEventDrop = async ({ event, start, end }) => {
     await appointmentService.updateAppointment(event.id, {
       date: start,
       startTime: format(start, 'HH:mm'),
       endTime: format(end, 'HH:mm'),
     });
   };
   ```
4. Verificar conflito com outros agendamentos antes de confirmar o drop.

---

## 7.11 🟠 Solicitações não aceitas com cor mais transparente

### Plano de Implementação

Em `Agenda.tsx`, na função `eventStyleGetter`, adicionar estilo para status `pending`:
```typescript
const eventStyleGetter = (event: CalendarEvent) => {
  const isPending = event.status === 'pending';
  return {
    style: {
      backgroundColor: isPending ? 'rgba(232, 132, 19, 0.4)' : '#e88413',
      border: isPending ? '1px dashed #e88413' : 'none',
      opacity: isPending ? 0.7 : 1,
    },
  };
};
```

---

---

# 8. Calculadora de Dieta

## 8.1 🔴 Busca de alimentos inconsistente

### Análise Ishikawa (Causa Raiz)

```
              [Busca de alimentos retorna resultados inconsistentes]
                                       |
      ┌──────────────┬─────────────────┼─────────────────┬──────────────┐
   Sistema         Dados            Lógica               UI           Integração
      |               |                |                  |               |
  FoodSearch.tsx  Alimentos com    Filtro por         Limite de     foodService
  aplica filtro   allowedMeals     allowedMeals       100 results   busca todos
  de allowedMeals definidos        exclui alimentos   pode ocultar  os alimentos
  durante a       excluem da       válidos            resultados    mas filtra
  busca           busca na         da busca           relevantes    por refeição
                  calculadora
```

**Causa raiz principal:** `src/pages/Diet/components/FoodSearch.tsx` filtra alimentos pelo campo `allowedMeals` durante a busca — se um alimento não tiver a refeição atual na lista `allowedMeals`, ele é excluído dos resultados, mesmo sendo válido. Alimentos sem `allowedMeals` definido podem não aparecer em todas as refeições.

**Causa secundária:** O alias de categoria (ex: "frango" → categoria "proteínas") pode retornar alimentos não relacionados.

### Solução

1. **Remover o filtro por `allowedMeals` na busca da calculadora** — o campo `allowedMeals` será removido (ver item 10.3), então a busca não deve depender dele.
2. **Refinar o sistema de alias de categorias** em `foodService.ts` para ser mais específico.
3. **Corrigir deduplicação:** garantir que alimentos com IDs diferentes mas mesmo nome normalizado não sejam duplicados nem excluídos indevidamente.
4. **Aumentar o limite** de resultados ou paginar para não esconder alimentos válidos.

---

## 8.2 🟡 Resumo nutricional flutuante ao rolar a página

### Plano de Implementação

Em `src/pages/Diet/DietCalculator.tsx`, aplicar `position: sticky` no container do "Resumo Nutricional Total":
```css
.diet-summary {
  position: sticky;
  top: 80px; /* altura do header */
  z-index: 10;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
```
Ou reorganizar o layout em duas colunas: coluna esquerda com as refeições (scrollável) e coluna direita com o resumo (sticky).

---

## 8.3 🟢 Trocar "gorduras" por "lipídeos"

### Solução

Buscar todas as ocorrências de `"gorduras"` (case-insensitive) em:
- `src/pages/Diet/DietCalculator.tsx`
- `src/pages/Diet/components/MealSection.tsx`
- `src/pages/Food/FoodManagement.tsx`
- `src/types/food.ts` (campo `fat` pode ter label "gorduras")

Substituir todas por `"lipídeos"`.

---

## 8.4 🟡 Adicionar, excluir e editar refeições com nomes customizados

### Plano de Implementação

**Mudança de modelo de dados:**

```typescript
// Tipo atual (fixo)
type MealName = "cafe-manha" | "almoco" | "lanche" | "jantar";

// Novo tipo (dinâmico)
interface Meal {
  id: string;
  name: string; // customizável
  foods: MealFood[];
}
```

1. **Atualizar `src/types/food.ts`** para remover o enum fixo de refeições.
2. **Em `DietCalculator.tsx`:**
   - Inicializar com as 4 refeições padrão (como antes), mas agora editáveis.
   - Adicionar botão "+" para criar nova refeição (modal com campo de nome).
   - Botão de editar nome da refeição (ícone de lápis no header de cada refeição).
   - Botão de excluir refeição (ícone de lixeira), com confirmação.
3. **Persistir no Firestore** o array de refeições com IDs e nomes customizados.

---

---

# 9. Financeiro

## 9.1 🔴 Receitas pendentes não devem ser contabilizadas como realizadas

### Análise Ishikawa (Causa Raiz)

```
           [Receitas pendentes contabilizadas como receita realizada]
                                       |
      ┌──────────────┬─────────────────┼────────────────┬──────────────┐
   Sistema         Dados            Lógica             UI           Integração
      |               |                |                |               |
  financialService Transações com  getFinancialSummary Sem campo    Appointment
  soma todas as   paymentStatus:  soma TODAS as      de "Projeção" service cria
  receitas sem    "pending"       incomes sem        separado      income com
  filtrar por     existem no      filtrar por        na tela       status pending
  paymentStatus   Firestore       paymentStatus
```

**Causa raiz principal:** `src/services/financialService.ts`, função `getFinancialSummary()`, soma todas as transações de income sem verificar `paymentStatus`. A lógica atual inclui receitas pendentes no total realizado.

### Solução

```typescript
// Em financialService.ts — getFinancialSummary():
const paidIncomes = incomes.filter(t => t.paymentStatus === 'paid');
const pendingIncomes = incomes.filter(t => t.paymentStatus === 'pending');

const totalPaidIncome = paidIncomes.reduce((sum, t) => sum + t.amount, 0);
const totalPendingIncome = pendingIncomes.reduce((sum, t) => sum + t.amount, 0);

return {
  totalIncome: totalPaidIncome,       // apenas recebido
  totalPendingIncome,                  // novo campo — projeção de receita
  totalExpense,
  balance: totalPaidIncome - totalPaidExpense,
};
```

Em `Financeiro.tsx`, adicionar card separado de "Projeção de receita" com o valor `totalPendingIncome`.

---

## 9.2 🔴 Despesas: mesmo comportamento de status pendente/realizado

### Análise Ishikawa (Causa Raiz)

```
                   [Despesas não têm status de pagamento]
                                    |
      ┌──────────────┬──────────────┼────────────────┬──────────────┐
   Sistema         Dados          Lógica             UI           Integração
      |               |               |               |               |
  FinancialTransaction tipo não tem  Sem diferença  Sem campo     Saldo inclui
  só tem          paymentStatus   entre despesa   de status     despesas não
  paymentStatus   em expenses     paga e          em expenses   pagas no
  em incomes                      pendente                      cálculo
```

**Causa raiz principal:** O tipo `FinancialTransaction` em `src/types/financial.ts` tem `paymentStatus` apenas para receitas (incomes), não para despesas (expenses).

### Solução

1. **Atualizar o tipo** em `src/types/financial.ts`:
   ```typescript
   paymentStatus?: "paid" | "pending"; // aplicar tanto a income quanto a expense
   ```
2. **Atualizar `ExpenseModal.tsx`** para incluir campo de status (pago/pendente).
3. **Atualizar `getFinancialSummary()`** para calcular despesas pagas e pendentes separadamente.
4. **Atualizar o cálculo de saldo:** `saldo = receitasPagas - despesasPagas`.

---

## 9.3 🟡 Recorrência de despesas

### Plano de Implementação

1. **Atualizar o tipo** em `src/types/financial.ts`:
   ```typescript
   recurrence?: {
     enabled: boolean;
     frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
     endDate?: Date;
   };
   ```
2. **Atualizar `ExpenseModal.tsx`** com toggle de recorrência e seletor de frequência.
3. **Em `financialService.ts`**, ao salvar despesa recorrente, criar as próximas ocorrências automaticamente (ou criar job/trigger para geração futura).
4. **Opção mais simples:** salvar a despesa com os metadados de recorrência e gerar as próximas instâncias via Cloud Function ou no próximo acesso do usuário.

---

## 9.4 🔴 Saldo deve considerar apenas valores pagos/recebidos

**Mesma solução do item 9.1 e 9.2.** Após implementar `paymentStatus` em ambos os tipos:

```typescript
const balance = totalPaidIncome - totalPaidExpense;
// excluindo pendingIncome e pendingExpense do saldo
```

---

---

# 10. Gerenciar Alimentos

## 10.1 🟠 Página descentralizada

### Análise Ishikawa (Causa Raiz)

```
                  [Página de gerenciar alimentos descentralizada]
                                    |
      ┌────────────┬────────────────┼────────────────┬──────────────┐
   Sistema       Dados           Lógica              UI           Integração
      |             |                |                |               |
  FoodManagement Container sem  Layout não usa   Sem max-width   CSS da página
  sem wrapper   dados de        flexbox/grid     ou margin:auto  não tem
  centralizado  layout          centralizado                     container
                                                                 centrado
```

**Causa raiz principal:** `src/pages/Food/FoodManagement.tsx` não tem um container com `max-width` e `margin: 0 auto` aplicados, ou o CSS correspondente está ausente/incorreto.

### Solução

Em `FoodManagement.css` (ou inline), adicionar:
```css
.food-management {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px;
}
```

---

## 10.2 🟢 Trocar "gorduras" por "lipídeos"

Ver item 8.3 — mesma solução, mesmos arquivos.

---

## 10.3 🟠 Remover campo "refeições permitidas" do cadastro de alimentos

### Plano de Implementação

1. Em `FoodManagement.tsx`, remover o campo de seleção de `allowedMeals` do formulário.
2. Em `src/types/food.ts`, marcar `allowedMeals` como deprecated (ou remover se não houver mais uso).
3. Em `foodService.ts`, remover qualquer filtro por `allowedMeals` na busca de alimentos.
4. Em `FoodSearch.tsx` (calculadora), garantir que a busca não filtra por `allowedMeals`.
5. Manter compatibilidade com documentos existentes que já têm o campo (simplesmente ignorá-lo).

---

## 10.4 🟡 Botão para reimportar base de alimentos (TACO)

### Plano de Implementação

1. Verificar que o script de importação TACO existe (provavelmente em `scripts/` ou `src/pages/Admin/`).
2. Criar função `reimportTacoFoods(nutritionistId)` em `foodService.ts` que:
   - Busca os alimentos TACO originais (de um JSON local ou coleção de template).
   - Para cada alimento TACO, verifica se já existe (por nome normalizado) e pula; ou oferece opção de sobrescrever.
3. Adicionar botão "Restaurar base TACO" em `FoodManagement.tsx` com modal de confirmação: *"Isso irá reimportar todos os alimentos da base TACO. Alimentos customizados não serão afetados."*

---

---

# 11. Conta Paciente — App iOS e Android

> **Escopo:** Novo produto (aplicativo mobile). Requer desenvolvimento separado.

### Plano de Alto Nível

**Tecnologia recomendada:** React Native (compartilha lógica com o projeto web) ou Flutter.

**Estrutura de menus (3 abas):**
- Menu Dieta
- Menu Exame
- Menu Agenda

**Menu Dieta:**
- Exibir a dieta mais recente do paciente (busca por `clientId` na coleção `diets`, ordenado por `createdAt DESC`).
- Opção de ver dietas anteriores.

**Menu Exame:**
- Listar documentos em `clientDocuments` do paciente.
- Botão de upload de exame em PDF (usa Firebase Storage).

**Menu Agenda:**
- Exibir horários disponíveis do nutricionista (lê `schedules` e compara com `appointments` existentes).
- Botão "Solicitar consulta" → cria appointment com `status: "pending"`.

**Autenticação:** Firebase Auth (mesmo backend) com login via email + senha (4 últimos dígitos do telefone).

---

---

# 12. Conta Secretaria

> **Escopo:** Nova funcionalidade de controle de acesso por papel (role-based access).

### Plano de Alto Nível

1. **Novo papel no sistema:** `role: "secretary"` em `src/types/user.ts`.
2. **Tela de criação da secretaria** acessível pelo nutricionista (configurações da conta).
3. **Configuração de módulos:** o nutricionista define quais módulos a secretaria acessa: Pacientes, Agenda, Financeiro.
4. **Guards de rota** que verificam permissões de módulo além do papel.
5. **Armazenamento:** documento no Firestore com `{ uid, nutritionistId, role: "secretary", permissions: ["clients", "agenda", "financial"] }`.
6. **Login:** mesma tela de login do nutricionista, distinguindo pelo papel após autenticação.

---

---

# 13. Tela de Planos

### Plano de Implementação

**Estrutura dos 3 planos:**

| Plano | Mensal | Anual |
|-------|--------|-------|
| **Starter** | R$ 69,90 | R$ 671,00 (R$ 55,92/mês) |
| **Plus** | R$ 99,90 | R$ 959,04 (R$ 79,92/mês) |
| **Advanced** | R$ 169,90 | R$ 1.535,04 (R$ 127,92/mês) |

**Funcionalidades por plano:**

| Funcionalidade | Starter | Plus | Advanced |
|----------------|---------|------|----------|
| Até 30 pacientes | ✅ | — | — |
| Pacientes ilimitados | — | ✅ | ✅ |
| Agendamento de consultas | ✅ | ✅ | ✅ |
| Criação de dietas | ✅ | ✅ | ✅ |
| Base de alimentos completa | ✅ | ✅ | ✅ |
| Usuário secretaria | — | ✅ | ✅ |
| 2 nutricionistas na conta | — | — | ✅ |

**Implementação:**
1. Atualizar `src/pages/Subscription/` com os 3 planos e preços corretos.
2. Exibir toggle Mensal/Anual para alternar os preços.
3. Destacar o plano Plus como "Mais popular".
4. Integrar com Stripe Checkout (já presente no projeto via `/checkout`) passando os IDs de preço corretos.
5. Ao assinar, atualizar o campo `plan` no documento do usuário no Firestore.
6. Usar o plano do usuário para aplicar limites (ex: bloquear adição de pacientes além de 30 no Starter).

---

---

## Sumário de Prioridades

| # | Item | Módulo | Prioridade |
|---|------|--------|-----------|
| 3.1 | Máscara de telefone | Cadastro | 🔴 Crítica |
| 5.2 | Cálculo de ocupação da agenda | Home | 🔴 Crítica |
| 6.6 | Adicionar documento não funciona | Pacientes | 🔴 Crítica |
| 6.12 | Conta nova com paciente de teste | Pacientes | 🔴 Crítica |
| 6.13 | Aniversário D-1 | Pacientes | 🔴 Crítica |
| 7.3 | Mensagem de erro ao cadastrar serviço | Agenda | 🔴 Crítica |
| 7.4 | Duração limitada a valores específicos | Agenda | 🔴 Crítica |
| 7.6 | Adicionar serviço não funciona | Agenda | 🔴 Crítica |
| 7.7 | Grade não respeita horários configurados | Agenda | 🔴 Crítica |
| 7.9 | Atualizar agendamento com erro | Agenda | 🔴 Crítica |
| 8.1 | Busca de alimentos inconsistente | Calculadora | 🔴 Crítica |
| 9.1 | Receitas pendentes no total realizado | Financeiro | 🔴 Crítica |
| 9.2 | Despesas sem status de pagamento | Financeiro | 🔴 Crítica |
| 9.4 | Saldo inclui valores pendentes | Financeiro | 🔴 Crítica |
| 1.1 | Cor laranja #e88413 | Estético | 🟠 Alta |
| 1.2 | Nome "Nutrize" | Estético | 🟠 Alta |
| 4.1 | Página "Esqueci senha" | Login | 🟠 Alta |
| 5.3 | Remover emojis da mensagem WhatsApp | Home | 🟠 Alta |
| 5.5 | Card agenda resumida não navega | Home | 🟠 Alta |
| 5.6 | Sino filtrar só solicitações | Home | 🟠 Alta |
| 5.7 | Card financeiro título e texto | Home | 🟠 Alta |
| 5.8 | % gênero invisível com menu recolhido | Home | 🟠 Alta |
| 6.1 | Sexo não obrigatório | Pacientes | 🟠 Alta |
| 6.10 | Senha = 4 últimos dígitos do telefone | Pacientes | 🟠 Alta |
| 7.1 | Layout agenda em português | Agenda | 🟠 Alta |
| 7.5 | Máscara de moeda no valor do serviço | Agenda | 🟠 Alta |
| 7.8 | Bloquear horários indisponíveis | Agenda | 🟠 Alta |
| 7.11 | Solicitações pendentes transparentes | Agenda | 🟠 Alta |
| 10.1 | Página alimentos descentralizada | Alimentos | 🟠 Alta |
| 10.3 | Remover "refeições permitidas" | Alimentos | 🟠 Alta |
| 2.1 | Responsividade mobile | Geral | 🟠 Alta |
| 5.1 | Aviso de dias restantes + botão | Home | 🟡 Média |
| 5.4 | Card aniversário com próxima consulta | Home | 🟡 Média |
| 6.2 | Separar nome e sobrenome | Pacientes | 🟡 Média |
| 6.3 | Medidas corporais da última consulta | Pacientes | 🟡 Média |
| 6.4 | Histórico: editar e excluir | Pacientes | 🟡 Média |
| 6.5 | Histórico: minimizado por padrão | Pacientes | 🟡 Média |
| 6.7 | Objetivos: ativar/desativar/editar | Pacientes | 🟡 Média |
| 6.8 | Objetivos: minimizados por padrão | Pacientes | 🟡 Média |
| 6.9 | Importar clientes em lote | Pacientes | 🟡 Média |
| 6.11 | Remover trial da área do paciente | Pacientes | 🟡 Média |
| 7.2 | Renomear botão "Configurações da agenda" | Agenda | 🟡 Média |
| 7.10 | Arrastar agendamentos | Agenda | 🟡 Média |
| 8.2 | Resumo nutricional flutuante | Calculadora | 🟡 Média |
| 8.4 | Refeições customizáveis | Calculadora | 🟡 Média |
| 9.3 | Recorrência de despesas | Financeiro | 🟡 Média |
| 10.4 | Botão reimportar base TACO | Alimentos | 🟡 Média |
| 13 | Tela de planos atualizada | Planos | 🟡 Média |
| 1.3 | Atualizar logos | Estético | 🟡 Média |
| 8.3 | "gorduras" → "lipídeos" | Calculadora | 🟢 Baixa |
| 10.2 | "gorduras" → "lipídeos" | Alimentos | 🟢 Baixa |
| 7.2 | Renomear botão agenda | Agenda | 🟢 Baixa |
| 11 | App iOS e Android | Mobile | Escopo futuro |
| 12 | Conta Secretaria | Secretaria | Escopo futuro |
