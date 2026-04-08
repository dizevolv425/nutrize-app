import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { paths } from "./paths";
import { RegisterPage } from "../pages/Register/Register";
import LoginPage from "../pages/Login/Login";
import ForgotPasswordPage from "../pages/ForgotPassword/ForgotPassword";
import ClientLoginPage from "../pages/ClientLogin/ClientLogin";
import { TrialExpired } from "../pages/TrialExpired/TrialExpired";
import { Subscription } from "../pages/Subscription/Subscription";
import { Checkout } from "../pages/Checkout/Checkout";
import { CheckoutSuccess } from "../pages/CheckoutSuccess/CheckoutSuccess";
import { ClientProfile as ClientSelfProfile } from "../pages/ClientProfile/ClientProfile";
import ProtectedRoutes from "./ProtectedRoutes";
import AdminRoutes from "./AdminRoutes";
import { DashboardLayout } from "../components/layout/DashboardLayout/DashboardLayout";
import { Dashboard } from "../pages/Dashboard/Dashboard";
import { ClientList } from "../pages/Clients/ClientList";
import { ClientForm } from "../pages/Clients/ClientForm";
import { ClientProfile } from "../pages/Clients/ClientProfile";
import { Agenda } from "../pages/Agenda/Agenda";
import { DietCalculator } from "../pages/Diet/DietCalculator";
import { DietList } from "../pages/Diet/DietList";
import { DietDetail } from "../pages/Diet/DietDetail";
import { ImportTacoFoods } from "../pages/Admin/ImportTacoFoods";
import { AppointmentRequests } from "../pages/Admin/AppointmentRequests";
import { Financeiro } from "../pages/Financeiro/Financeiro";
import { RequestAppointment } from "../pages/Appointments/RequestAppointment";
import { MyAppointments } from "../pages/Appointments/MyAppointments";
import { MyDiets } from "../pages/Diet/MyDiets";
import { MyDietDetail } from "../pages/Diet/MyDietDetail";
import { RequestSubstitution } from "../pages/Diet/RequestSubstitution";
import { MySubstitutions } from "../pages/Diet/MySubstitutions";
import { FoodManagement } from "../pages/Food/FoodManagement";
import { NotificationTest } from "../pages/NotificationTest/NotificationTest";
import { Profile } from "../pages/Profile/Profile";
import { SecretaryManagement } from "../pages/Settings/SecretaryManagement";
import { NotificationProvider } from "../contexts/NotificationContext";
import { ToastContainer } from "../components/ui/Toast/ToastContainer";

export default function AppRoutes() {

  return (
    <BrowserRouter>
      <NotificationProvider>
        <Routes>
          <Route path="/" element={<Navigate to={paths.login} replace />} />
          <Route path={paths.login} element={<LoginPage />} />
          <Route path={paths.forgotPassword} element={<ForgotPasswordPage />} />
          <Route path={paths.clientLogin} element={<ClientLoginPage />} />
          <Route path={paths.register} element={<RegisterPage />} />
          <Route path={paths.trialExpired} element={<TrialExpired />} />
          <Route path={paths.subscription} element={<Subscription />} />
          <Route path={paths.checkout} element={<Checkout />} />
          <Route path={paths.checkoutSuccess} element={<CheckoutSuccess />} />

          {/* Rotas protegidas com DashboardLayout */}
          <Route
            path={paths.dashboard}
            element={
              <ProtectedRoutes>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoutes>
            }
          />
          {/* Rotas para Admin, Nutricionista e Secretária (com permissão de módulo) */}
          <Route
            path={paths.clientes}
            element={
              <AdminRoutes module="clients">
                <DashboardLayout>
                  <ClientList />
                </DashboardLayout>
              </AdminRoutes>
            }
          />
          <Route
            path={paths.clientesNew}
            element={
              <AdminRoutes module="clients">
                <DashboardLayout>
                  <ClientForm />
                </DashboardLayout>
              </AdminRoutes>
            }
          />
          <Route
            path={paths.clientesProfile}
            element={
              <AdminRoutes module="clients">
                <DashboardLayout>
                  <ClientProfile />
                </DashboardLayout>
              </AdminRoutes>
            }
          />
          <Route
            path={paths.agenda}
            element={
              <AdminRoutes module="agenda">
                <DashboardLayout>
                  <Agenda />
                </DashboardLayout>
              </AdminRoutes>
            }
          />
          <Route
            path={paths.calculadora}
            element={
              <AdminRoutes>
                <DashboardLayout>
                  <DietCalculator />
                </DashboardLayout>
              </AdminRoutes>
            }
          />
          <Route
            path={paths.dietas}
            element={
              <ProtectedRoutes>
                <DashboardLayout>
                  <DietList />
                </DashboardLayout>
              </ProtectedRoutes>
            }
          />
          <Route
            path={paths.dietaDetail}
            element={
              <ProtectedRoutes>
                <DashboardLayout>
                  <DietDetail />
                </DashboardLayout>
              </ProtectedRoutes>
            }
          />
          <Route
            path={paths.financeiro}
            element={
              <AdminRoutes module="financial">
                <DashboardLayout>
                  <Financeiro />
                </DashboardLayout>
              </AdminRoutes>
            }
          />
          <Route
            path={paths.importTaco}
            element={
              <AdminRoutes>
                <DashboardLayout>
                  <ImportTacoFoods />
                </DashboardLayout>
              </AdminRoutes>
            }
          />
          <Route
            path={paths.appointmentRequests}
            element={
              <AdminRoutes>
                <DashboardLayout>
                  <AppointmentRequests />
                </DashboardLayout>
              </AdminRoutes>
            }
          />
          {/* Rotas para Clientes (role user) */}
          <Route
            path={paths.solicitarConsulta}
            element={
              <ProtectedRoutes>
                <DashboardLayout>
                  <RequestAppointment />
                </DashboardLayout>
              </ProtectedRoutes>
            }
          />
          <Route
            path={paths.minhasConsultas}
            element={
              <ProtectedRoutes>
                <DashboardLayout>
                  <MyAppointments />
                </DashboardLayout>
              </ProtectedRoutes>
            }
          />
          <Route
            path={paths.minhasDietas}
            element={
              <ProtectedRoutes>
                <DashboardLayout>
                  <MyDiets />
                </DashboardLayout>
              </ProtectedRoutes>
            }
          />
          <Route
            path={paths.minhaDietaDetail}
            element={
              <ProtectedRoutes>
                <DashboardLayout>
                  <MyDietDetail />
                </DashboardLayout>
              </ProtectedRoutes>
            }
          />
          <Route
            path={paths.solicitarSubstituicao}
            element={
              <ProtectedRoutes>
                <DashboardLayout>
                  <RequestSubstitution />
                </DashboardLayout>
              </ProtectedRoutes>
            }
          />
          <Route
            path={paths.minhasSubstituicoes}
            element={
              <ProtectedRoutes>
                <DashboardLayout>
                  <MySubstitutions />
                </DashboardLayout>
              </ProtectedRoutes>
            }
          />
          {/* Rotas apenas para Admin */}
          <Route
            path={paths.foodManagement}
            element={
              <AdminRoutes>
                <DashboardLayout>
                  <FoodManagement />
                </DashboardLayout>
              </AdminRoutes>
            }
          />
          {/* Rota para perfil do cliente */}
          <Route
            path={paths.clientePerfil}
            element={
              <ProtectedRoutes>
                <DashboardLayout>
                  <ClientSelfProfile />
                </DashboardLayout>
              </ProtectedRoutes>
            }
          />
          {/* Rota para perfil do usuário (admin/nutricionista) */}
          <Route
            path={paths.perfil}
            element={
              <ProtectedRoutes>
                <DashboardLayout>
                  <Profile />
                </DashboardLayout>
              </ProtectedRoutes>
            }
          />
          {/* Gerenciamento de secretária — apenas nutricionista/admin */}
          <Route
            path={paths.secretaryManagement}
            element={
              <AdminRoutes>
                <DashboardLayout>
                  <SecretaryManagement />
                </DashboardLayout>
              </AdminRoutes>
            }
          />
          {/* Rota de teste de notificações */}
          <Route
            path={paths.notificationTest}
            element={
              <ProtectedRoutes>
                <DashboardLayout>
                  <NotificationTest />
                </DashboardLayout>
              </ProtectedRoutes>
            }
          />
        </Routes>
        <ToastContainer />
      </NotificationProvider>
    </BrowserRouter>
  );
}
