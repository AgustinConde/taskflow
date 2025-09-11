import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppContent from './components/app/AppContent';
import ConfirmEmailPage from './pages/ConfirmEmailPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

const Router: React.FC = () => (
    <BrowserRouter>
        <Routes>
            <Route path="/confirm-email" element={<ConfirmEmailPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/*" element={<AppContent />} />
        </Routes>
    </BrowserRouter>
);

export default Router;
