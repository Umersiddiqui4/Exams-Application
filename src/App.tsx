// src/App.tsx
import { Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor  } from './redux/store';  // Import the Redux store
import { ThemeProvider } from './components/theme-provider';
import { Toaster } from './components/ui/toaster';
import {Dashboard} from './components/dashboard';
import {ApplicationForm} from './components/application-form';
import { SimpleAnimatedThemeToggle } from './components/SimpleAnimatedThemeToggle';
import ExamComponent from './components/examComponent';
import { LoginForm } from './components/LoginForm';
import { ProtectedRoute } from './auth/ProtectedRoute';
import Applications from './components/Applications';
import { ThemeToggleDemo } from './components/ThemeToggleDemo';

function App() {
  const [isAtTop, setIsAtTop] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsAtTop(window.scrollY <= 10);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <Provider store={store}> {/* Wrap the app with Redux provider */}
    <PersistGate loading={null} persistor={persistor}>
      <ThemeProvider defaultTheme="light" storageKey="dashboard-theme">
        <div className={`fixed top-3 right-3 z-50 transition-all duration-300 ${isAtTop ? 'opacity-100 translate-y-0' : 'opacity-0 pointer-events-none -translate-y-2'}`}>
          <SimpleAnimatedThemeToggle />
        </div>
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
            path="/exam"
            element={
              <ProtectedRoute>
                <ExamComponent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/theme-demo"
            element={<ThemeToggleDemo />}
          />
        </Routes>
        <Toaster />
      </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}

export default App;
