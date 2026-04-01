export const paths = {
  home: "/",
  login: "/login",
  register: "/register",
  dashboard: "/dashboard",
  clientes: "/dashboard/clientes",
  clientesNew: "/dashboard/clientes/new",
  clientesProfile: "/dashboard/clientes/:clientId",
  agenda: "/dashboard/agenda",
  calculadora: "/dashboard/calculadora",
  dietas: "/dashboard/dietas",
  dietaDetail: "/dashboard/dietas/:dietId",
  financeiro: "/dashboard/financeiro",
  importTaco: "/dashboard/admin/import-taco",
  // Rotas para clientes (role user)
  solicitarConsulta: "/dashboard/solicitar-consulta",
  minhasConsultas: "/dashboard/minhas-consultas",
  minhasDietas: "/dashboard/minhas-dietas",
  minhaDietaDetail: "/dashboard/minhas-dietas/:dietId",
  solicitarSubstituicao: "/dashboard/solicitar-substituicao/:dietId",
  minhasSubstituicoes: "/dashboard/minhas-substituicoes",
  // Rotas para admin
  appointmentRequests: "/dashboard/admin/appointment-requests",
  foodManagement: "/dashboard/admin/alimentos",
  // Rotas de autenticação
  forgotPassword: "/recuperar-senha",
  clientLogin: "/cliente/login",
  trialExpired: "/trial-expirado",
  subscription: "/assinatura",
  checkout: "/checkout",
  checkoutSuccess: "/checkout/sucesso",
  // Rotas para cliente
  clientePerfil: "/dashboard/cliente/perfil",
  // Rota de perfil do usuário (admin/nutricionista)
  perfil: "/dashboard/perfil",
  // Rota de teste
  notificationTest: "/dashboard/teste-notificacoes",
};
