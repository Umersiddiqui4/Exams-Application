// src/App.tsx
import { Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from './redux/store';  // Import the Redux store
import { ThemeProvider } from './components/theme/theme-provider';
import { Toaster } from './components/ui/toaster';
import { Dashboard } from './components/features/dashboard/dashboard';
import { ApplicationForm } from './components/features/applications/application-form';
import ExamComponent from './components/features/exams/examComponent';
import { LoginForm } from './components/features/auth/LoginForm';
import { SignupForm } from './components/features/auth/SignupForm';
import { EmailVerification } from './components/features/auth/EmailVerification';
import { EmailVerificationTest } from './components/features/auth/EmailVerificationTest';
import { PhoneInputTest } from './components/common/PhoneInputTest';
import { ProtectedRoute } from './auth/ProtectedRoute';
import Applications from './components/features/applications/Applications';
import DraftApplications from './components/features/applications/DraftApplications';
import { ApplicationDetailPage } from './components/features/applications/ApplicationDetailPage';
import { ThemeToggleDemo } from './components/theme/ThemeToggleDemo';
import Settings from './components/features/settings/settings';
import ResetPassword from './components/features/auth/ResetPassword';

function App() {



  return (
    <Provider store={store}> {/* Wrap the app with Redux provider */}
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider defaultTheme="light" storageKey="dashboard-theme">

          <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/signup" element={<SignupForm />} />
            <Route path="/auth/password-reset" element={<ResetPassword />} />
            <Route path="/auth/confirm-email" element={<EmailVerification />} />
            <Route path="/test-email-verification" element={<EmailVerificationTest />} />
            <Route path="/test-phone-input" element={<PhoneInputTest />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/application/:examId"
              element={
                <ApplicationForm />
              }
            />
            <Route
              path="/applications"
              element={
                <ProtectedRoute>
                  <Applications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/draft-applications"
              element={
                <ProtectedRoute>
                  <DraftApplications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/applications/:id/details"
              element={
                <ProtectedRoute>
                  <ApplicationDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/exam"
              element={
                <ProtectedRoute>
                  <ExamComponent />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route path="/theme-demo" element={<ThemeToggleDemo />} />
          </Routes>
          <Toaster />
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}

export default App;
