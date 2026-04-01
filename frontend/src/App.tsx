import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { StudentAuthProvider } from './portal/context/StudentAuthContext'
import MainLayout from './components/Layout/MainLayout'
import LoginPage from './pages/Login/LoginPage'
import DashboardPage from './pages/Dashboard/DashboardPage'
import GraduatesPage from './pages/Graduates/GraduatesPage'
import EmploymentPage from './pages/Employment/EmploymentPage'
import ProgramsPage from './pages/Programs/ProgramsPage'
import ReportsPage from './pages/Reports/ReportsPage'
import UsersPage from './pages/Users/UsersPage'
import WorkPlansPage from './pages/WorkPlans/WorkPlansPage'
import NewsPage from './pages/News/NewsPage'
import ContactPage from './pages/Contact/ContactPage'
import StudentLoginPage from './portal/pages/StudentLoginPage'
import StudentLayout from './portal/layout/StudentLayout'
import StudentHomePage from './portal/pages/StudentHomePage'
import StudentProgramsPage from './portal/pages/StudentProgramsPage'
import StudentProgramDetailPage from './portal/pages/StudentProgramDetailPage'
import StudentContactPage from './portal/pages/StudentContactPage'
import SurveyPage from './portal/pages/SurveyPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Admin ── */}
        <Route path="/login" element={
          <AuthProvider><LoginPage /></AuthProvider>
        } />
        <Route element={<AuthProvider><MainLayout /></AuthProvider>}>
          <Route path="/dashboard"  element={<DashboardPage />} />
          <Route path="/graduates"  element={<GraduatesPage />} />
          <Route path="/employment" element={<EmploymentPage />} />
          <Route path="/programs"   element={<ProgramsPage />} />
          <Route path="/reports"    element={<ReportsPage />} />
          <Route path="/workplans"  element={<WorkPlansPage />} />
          <Route path="/users"      element={<UsersPage />} />
          <Route path="/news"       element={<NewsPage />} />
          <Route path="/contact"    element={<ContactPage />} />
        </Route>

        {/* ── Portal Egresados ── */}
        <Route path="/portal/login" element={
          <StudentAuthProvider><StudentLoginPage /></StudentAuthProvider>
        } />
        <Route path="/portal/*" element={
          <StudentAuthProvider>
            <Routes>
              <Route element={<StudentLayout />}>
                <Route path="inicio"          element={<StudentHomePage />} />
                <Route path="programas"       element={<StudentProgramsPage />} />
                <Route path="programas/:id"   element={<StudentProgramDetailPage />} />
                <Route path="contacto"        element={<StudentContactPage />} />
                <Route index element={<Navigate to="inicio" replace />} />
              </Route>
            </Routes>
          </StudentAuthProvider>
        } />

        {/* Encuesta pública — sin autenticación */}
        <Route path="/encuesta/:token" element={<SurveyPage />} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
