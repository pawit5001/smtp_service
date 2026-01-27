import React, { useState } from 'react';

const MessageForm: React.FC = () => {
    const [recipient, setRecipient] = useState('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
        const [status, setStatus] = useState<string | null>(null);
        const [loading, setLoading] = useState(false);
        const [displayName, setDisplayName] = useState('admin_snaptranslate');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus(null);
        setLoading(true);
        try {
            const res = await fetch('http://localhost:8000/send-email/', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.REACT_APP_API_KEY}` // Use API key from .env
                },
                    body: JSON.stringify({ recipient, subject, body, display_name: displayName })
            });
            if (res.ok) {
                setStatus('Email sent successfully!');
                setRecipient('');
                setSubject('');
                setBody('');
            } else {
                const data = await res.json();
                setStatus('Failed: ' + (data.detail || 'Unknown error'));
            }
        } catch (err: any) {
            setStatus('Failed: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-lg mx-auto bg-white shadow-lg rounded-lg p-8 border border-gray-200">
            <h2 className="text-xl font-semibold mb-6 text-center text-gray-800">ส่งอีเมลอย่างเป็นทางการ</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-gray-700 font-medium mb-1" htmlFor="displayName">ชื่อผู้ส่ง (Sender Name)</label>
                    <input
                        id="displayName"
                        type="text"
                        placeholder="admin_snaptranslate"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
                <div>
                    <label className="block text-gray-700 font-medium mb-1" htmlFor="recipient">ส่งถึง (To)</label>
                    <input
                        id="recipient"
                        type="email"
                        placeholder="เช่น user@example.com"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        required
                    />
                </div>
                <div>
                    <label className="block text-gray-700 font-medium mb-1" htmlFor="subject">หัวข้อ (Subject)</label>
                    <input
                        id="subject"
                        type="text"
                        placeholder="หัวข้ออีเมล"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        required
                    />
                </div>
                <div>
                    <label className="block text-gray-700 font-medium mb-1" htmlFor="body">เนื้อหา (Message Body)</label>
                    <textarea
                        id="body"
                        placeholder="message body"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-400"
                        required
                    />
                    <div className="text-xs text-gray-400 mt-1">* สามารถแก้ไขเนื้อหาได้ตามต้องการ</div>
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded shadow"
                    disabled={loading}
                >
                    {loading ? 'กำลังส่ง...' : 'ส่งอีเมล'}
                </button>
                {status && (
                    <div className={status.startsWith('Failed') ? 'text-red-500 text-center' : 'text-green-600 text-center'}>{status}</div>
                )}
            </form>
        </div>
    );
};

export default MessageForm;