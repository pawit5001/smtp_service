import React from 'react';
import { Link } from 'react-router-dom';
import MessageForm from '../components/MessageForm';

const Home: React.FC = () => {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">SMTP Email Sender</h1>
            {/* ปุ่มอ่านอีเมลและ PredefinedMessages ถูกนำออกตามคำขอ */}
            <MessageForm />
            <footer className="mt-12 text-center text-gray-400 text-xs">
                &copy; {new Date().getFullYear()} SnapTranslate | SMTP Email Tools
            </footer>
        </div>
    );
};

export default Home;