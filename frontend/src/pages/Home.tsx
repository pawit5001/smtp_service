import React from 'react';
import { Link } from 'react-router-dom';
import MessageForm from '../components/MessageForm';

const Home: React.FC = () => {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="w-full max-w-4xl px-4 py-6">
                <MessageForm />
            </div>
        </div>
    );
};

export default Home;