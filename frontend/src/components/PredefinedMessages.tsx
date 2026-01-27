import React from 'react';

const predefinedMessages = [
    {
        id: 1,
        subject: 'Account Verification',
        body: 'Please verify your account by clicking the link below: [verification_link]'
    },
    {
        id: 2,
        subject: 'Password Reset',
        body: 'You can reset your password using the following link: [reset_link]'
    },
    {
        id: 3,
        subject: 'Welcome to Our Service',
        body: 'Thank you for signing up! We are excited to have you on board.'
    }
];

const PredefinedMessages: React.FC<{ onSelect: (message: { subject: string; body: string }) => void }> = ({ onSelect }) => {
    return (
        <div className="p-4">
            <h2 className="text-lg font-semibold">Predefined Messages</h2>
            <ul className="mt-2">
                {predefinedMessages.map((message) => (
                    <li key={message.id} className="border p-2 my-2 rounded cursor-pointer hover:bg-gray-100" onClick={() => onSelect(message)}>
                        <h3 className="font-medium">{message.subject}</h3>
                        <p>{message.body}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PredefinedMessages;