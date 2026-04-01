# 📋 Review da Plataforma Nutrize — Tarefas em Aberto

---

## 🎨 Estético

- [ ] Alterar a cor principal do sistema para `#e88413` (trocar o verde para laranja)
- [ ] Alterar o nome do sistema para **"Nutrize"**
- [ ] Alterar as logos para as que estão nessa pasta: [logo final nutrize](https://drive.google.com/drive/folders/1uz83RiKPpoN2PrQugzCPP75RE0URtSof?usp=sharing)

---

## ⚙️ Funcional

### Geral

- [ ] Ajuste de responsividade para mobile em todo o sistema

---

### 👤 Página de Criação de Login de Nutricionista

- [ ] Campo telefone não está com máscara

---

### 🔐 Página de Login

- [ ] Criar página de **"Esqueci senha"**

---

## 🥗 Usuário Nutricionista

### 🏠 Home

- [ ] Alterar o aviso de dias restantes no topo da página → *Faltam X dias restantes* (botão **"Assine agora"** que leva para a página de planos)
- [ ] **Ocupação da agenda:** alterar o cálculo passando a considerar minutos disponíveis na semana ao invés de quantidade de consultas (baseado nas configurações de horas a trabalhar definidas pelo nutricionista no botão *"Configurar agenda"*)
- [ ] **Mensagem de aniversário:** retirar os emojis da mensagem padrão — não estão sendo lidos corretamente pelo WhatsApp
- [ ] **Card de aniversário:** mostrar abaixo do telefone a *próxima consulta*, caso exista. Se não houver próximo agendamento, deixar em branco
- [ ] **Agenda resumida:** o card da consulta confirmada está como clicável, mas não navega para lugar nenhum → deve abrir o compromisso
- [ ] Deixar o ícone de notificação (sino) apenas para notificações de novas solicitações de consulta
- [ ] **Card financeiro:** alterar o título de *"Projeções"* para *"Projeções de receita"* e retirar o texto de *"próximas consultas"* que consta abaixo
- [ ] A distribuição por gênero no perfil de clientes muitas vezes não fica visível as % na tela quando o menu lateral é recolhido

---

### 🧑‍⚕️ Pacientes

- [ ] Retirar o campo **sexo** como campo obrigatório
- [ ] Separar o campo **"nome completo"** em **"nome"** e **"sobrenome"**
- [ ] **Medida corporal:** atualizar conforme dados acrescentados na última consulta (histórico de consultas)
- [ ] **Histórico de consulta:**
  - [ ] Incluir opção de **editar** e **excluir**
  - [ ] Exibir cada linha do histórico como **minimizada** por padrão, expandindo ao clicar para mostrar todas as informações daquela consulta
- [ ] Função **adicionar documento** não está funcionando
- [ ] **Objetivos:**
  - [ ] Não estão editáveis — incluir opção de ativar e desativar
  - [ ] Exibir cada objetivo como **minimizado** por padrão, expandindo ao clicar
- [ ] **Importar clientes em lote:** ao lado do botão *"Adicionar pacientes"*, adicionar um botão de importação em lote
  - Disponibilizar um arquivo modelo para download pelo nutricionista
  - O nutricionista deve conseguir preencher e subir a planilha com os dados dos clientes
  - Incluir pequeno texto de instrução ao nutricionista
  - Planilha base: [Importar clientes](https://docs.google.com/spreadsheets/d/1zYG6h8pEuFgw2vKO-KNZBU8O6sKbkaiIrmU30vHp7E0/edit?usp=sharing)
- [ ] **Senha da área do cliente:** retirar campo de senha — a senha deve ser os **4 últimos dígitos do telefone** cadastrado pelo nutricionista
- [ ] Retirar qualquer anúncio referente ao trial
- [ ] Ao criar uma conta nova, não deve vir com paciente de teste pré-cadastrado (contas novas devem ser criadas sem informações de pacientes)
- [ ] **Aniversário:** ao ser cadastrado, está saindo com D-1 (um dia antes)

---

### 📅 Agenda

- [ ] Deixar todo o layout em **português**
- [ ] Trocar o nome do botão **"Editar horários"** para **"Configurações da agenda"**
- [ ] Retirar mensagem de erro ao cadastrar um serviço
- [ ] Permitir que a duração do serviço cadastrado tenha **qualquer valor em minutos** (atualmente está limitado a números específicos terminados em 1 e 6)
- [ ] Colocar **máscara de moeda/preço** no campo de valor
- [ ] A função **"adicionar serviço"** não está funcionando
- [ ] **Horários de trabalho:** quando selecionado horário antes das 8h, a agenda abre novos horários. Ao configurar todos os horários após as 8h, a grade não fecha os horários fora do parâmetro → *atualizar a grade de acordo com os horários configurados*
- [ ] **Bloquear horários indisponíveis** na agenda (tom mais escuro) para evitar marcações fora dos horários disponíveis
- [ ] Atualizar agendamento está com erro
- [ ] Incluir possibilidade de **arrastar agendamentos** na agenda para mudar dia/horário
- [ ] Mostrar solicitações ainda **não aceitas** com cor levemente mais transparente na agenda

---

### 🥦 Calculadora de Dieta

- [ ] Ao buscar um alimento, nem todos os alimentos presentes na base aparecem e/ou aparecem termos diferentes do digitado (ex: *pão trigo sovado* aparece no gerenciador, mas não na calculadora; *frango* retorna resultados além de itens com frango)
- [ ] Deixar o **"Resumo Nutricional Total"** flutuante na tela ao rolar a página
- [ ] Trocar o nome **"gorduras"** para **"lipídeos"**
- [ ] Adicionar possibilidade de **inclusão, exclusão e edição de refeições**, com campo para o nutricionista nomear cada refeição

---

### 💰 Financeiro

- [ ] Receitas com status **pendente** não devem ser contabilizadas como *receita realizada* — devem constar apenas como **projeção** em um novo campo de soma de projeções, exibido abaixo das receitas
- [ ] O mesmo comportamento deve ser aplicado para **despesas** (atualmente só funciona para receitas)
- [ ] Adicionar possibilidade de **recorrência de despesas**, com configuração de frequência por despesa (diária, semanal, mensal, etc.)
- [ ] Ajustar o **saldo** para considerar apenas o que foi pago e o que foi recebido, excluindo o que está pendente (tanto a receber quanto a pagar)

---

### 🍽️ Gerenciar Alimentos

- [ ] Página está **descentralizada**
- [ ] Mudar nome **"gorduras"** para **"lipídeos"**
- [ ] Retirar a opção de **refeições permitidas** no cadastro de alimentos
- [ ] Adicionar botão para **importar novamente a base de alimentos** (voltar ao padrão de fábrica)

---

## 📱 Conta Paciente — App iOS e Android

- [ ] Criar app para iOS e Android
- [ ] Mostrar apenas **3 menus**: Dietas, Exames, Agenda Nutricionista
- [ ] Parte inferior do app exibir: menu Dieta | menu Exame | menu Agenda

### Menu Dieta
- [ ] Mostrar a **dieta mais recente** criada para o paciente
- [ ] Possibilidade de visualizar **dietas antigas**

### Menu Exame
- [ ] Visualização dos **exames e documentos** incluídos pelo nutricionista
- [ ] Possibilidade do paciente **anexar exames em PDF**

### Menu Agenda
- [ ] Visualização dos **horários disponíveis** da agenda do nutricionista
- [ ] Possibilidade de **solicitar marcação de horário**

---

## 🗂️ Conta Secretaria

- [ ] Criar um **usuário de secretaria** com acesso configurável às funções de: Pacientes, Agenda e Financeiro
- [ ] O nutricionista deve conseguir **criar o usuário** de secretaria e **definir quais módulos** ele terá acesso

---

## 💳 Tela de Planos

### Plano Starter — *Ideal para começar*

| | |
|---|---|
| **Mensal** | R$ 69,90 |
| **Anual** | R$ 671,00 *(R$ 55,92/mês)* |

**Incluso:**
- [ ] Até 30 pacientes
- [ ] Agendamento de consultas
- [ ] Criação de dietas
- [ ] Base de alimentos completa

---

### Plano Plus — *Para nutricionistas*

| | |
|---|---|
| **Mensal** | R$ 99,90 |
| **Anual** | R$ 959,04 *(R$ 79,92/mês)* |

**Incluso:**
- [ ] Agendamento de consultas
- [ ] Criação de dietas
- [ ] Base de alimentos completa
- [ ] Pacientes ilimitados
- [ ] Usuário secretaria

---

### Plano Advanced

| | |
|---|---|
| **Mensal** | R$ 169,90 |
| **Anual** | R$ 1.535,04 *(R$ 127,92/mês)* |

**Incluso:**
- [ ] Agendamento de consultas
- [ ] Criação de dietas
- [ ] Base de alimentos completa
- [ ] Pacientes ilimitados
- [ ] Usuário secretaria
- [ ] Possibilidade de **2 nutricionistas** na mesma conta