// src/App.tsx
import { Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor  } from './redux/store';  // Import the Redux store
import { ThemeProvider } from './components/theme-provider';
import { Toaster } from './components/ui/toaster';
import {Dashboard} from './components/dashboard';
import {ApplicationForm} from './components/application-form';
import ExamComponent from './components/examComponent';
import { LoginForm } from './components/LoginForm';
import { ProtectedRoute } from './auth/ProtectedRoute';
import Applications from './components/Applications';
import DraftApplications from './components/DraftApplications';
import { ApplicationDetailPage } from './components/ui/ApplicationDetailPage';
import { ThemeToggleDemo } from './components/ThemeToggleDemo';
import Settings from './components/settings';

function App() {



  return (
    <Provider store={store}> {/* Wrap the app with Redux provider */}
    <PersistGate loading={null} persistor={persistor}>
      <ThemeProvider defaultTheme="light" storageKey="dashboard-theme">
       
        <Routes>
          <Route path="/login" element={<LoginForm />} />
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
