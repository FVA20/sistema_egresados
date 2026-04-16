import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { AuthProvider } from './context/AuthContext'
import { StudentAuthProvider } from './portal/context/StudentAuthContext'
import MainLayout from './components/Layout/MainLayout'

// Admin pages — lazy loaded
const LoginPage                = lazy(() => import('./pages/Login/LoginPage'))
const DashboardPage            = lazy(() => import('./pages/Dashboard/DashboardPage'))
const GraduatesPage            = lazy(() => import('./pages/Graduates/GraduatesPage'))
const EmploymentPage           = lazy(() => import('./pages/Employment/EmploymentPage'))
const ProgramsPage             = lazy(() => import('./pages/Programs/ProgramsPage'))
const ReportsPage              = lazy(() => import('./pages/Reports/ReportsPage'))
const UsersPage                = lazy(() => import('./pages/Users/UsersPage'))
const WorkPlansPage            = lazy(() => import('./pages/WorkPlans/WorkPlansPage'))
const NewsPage                 = lazy(() => import('./pages/News/NewsPage'))
const ContactPage              = lazy(() => import('./pages/Contact/ContactPage'))
const PostulationsPage         = lazy(() => import('./pages/Postulations/PostulationsPage'))

// Portal pages — lazy loaded
const StudentLoginPage         = lazy(() => import('./portal/pages/StudentLoginPage'))
const StudentLayout            = lazy(() => import('./portal/layout/StudentLayout'))
const StudentHomePage          = lazy(() => import('./portal/pages/StudentHomePage'))
const StudentProgramsPage      = lazy(() => import('./portal/pages/StudentProgramsPage'))
const StudentProgramDetailPage = lazy(() => import('./portal/pages/StudentProgramDetailPage'))
const StudentContactPage       = lazy(() => import('./portal/pages/StudentContactPage'))
const SurveyPage               = lazy(() => import('./portal/pages/SurveyPage'))

const PageLoader = () => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    height: '100vh', background: '#f8fafc'
  }}>
    <div style={{
      width: 40, height: 40, border: '4px solid #e2e8f0',
      borderTop: '4px solid #2563eb', borderRadius: '50%',
      animation: 'spin 0.7s linear infinite'
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
)

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
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
            <Route path="/contact"       element={<ContactPage />} />
            <Route path="/postulations"  element={<PostulationsPage />} />
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
      </Suspense>
    </BrowserRouter>
  )
}
