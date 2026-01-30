import React, { Suspense, lazy } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
const Home = lazy(() => import('./pages/Home'));
const ReadMail = lazy(() => import('./pages/ReadMail'));
const ManageAccounts = lazy(() => import('./pages/ManageAccounts'));
import Navbar from './components/Navbar';
import Footer from './components/Footer';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1">
          <Suspense fallback={<div className="text-center py-12 text-gray-400">กำลังโหลด...</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/readmail" element={<ReadMail />} />
              <Route path="/manage-accounts" element={<ManageAccounts />} />
            </Routes>
          </Suspense>
        </div>
        <Footer />
        <ToastContainer position="top-center" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
      </div>
    </Router>
  );
};

export default App;