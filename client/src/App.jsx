import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DemoRoleBar } from './components/DemoRoleBar';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { HomePage } from './pages/HomePage';
import { SearchBloodPage } from './pages/SearchBloodPage';
import { FreeClaimPage } from './pages/FreeClaimPage';
import { DonorDashboard } from './pages/DonorDashboard';
import { BloodBankDashboard } from './pages/BloodBankDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { MyClaimsPage } from './pages/MyClaimsPage';
import { UrgentDemandsPage } from './pages/UrgentDemandsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-rose-500 selection:text-white">
          {/* Quick Demo Switcher Sticky Bar for Contest Evaluators */}
          <DemoRoleBar />

          {/* Navigation Bar */}
          <Navbar />

          {/* Main App Content Viewport */}
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchBloodPage />} />
              <Route path="/free-blood" element={<FreeClaimPage />} />
              <Route path="/donor/dashboard" element={<DonorDashboard />} />
              <Route path="/bank/dashboard" element={<BloodBankDashboard />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/my-claims" element={<MyClaimsPage />} />
              <Route path="/urgent-requests" element={<UrgentDemandsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Footer with Medical & Sindh Disclaimers */}
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
