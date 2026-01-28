import React, { useEffect, useState } from 'react';

interface Email {
  subject: string;
  from: string;
  date: string;
  snippet?: string;
  body_text?: string;
  body_html?: string;
  headers?: Record<string, string>;
  attachments?: Array<{
    filename: string;
    content_type: string;
    size: number;
    content_id?: string;
    content_disposition?: string;
    content?: string;
  }>;
  [key: string]: any;
}

const ReadMail: React.FC = () => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const fetchEmails = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
        const res = await fetch(`${apiUrl}/read-emails`, {
          headers: {
            'Authorization': `Bearer ${process.env.REACT_APP_API_KEY}` // Use API key from .env
          }
        });
        if (res.ok) {
          const data = await res.json();
          setEmails(data.emails || []);
          setError(null);
        } else {
          const errorData = await res.json();
          setError(errorData.detail || 'Unknown error');
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchEmails();
  }, []); // Ensure this dependency array is empty to avoid duplicate requests

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">กล่องอีเมล</h2>
      {loading && <div>กำลังโหลด...</div>}
      {error && <div className="text-red-500">{error}</div>}
      <ul>
        {emails.map((email, idx) => (
          <li key={idx} className="mb-4 p-2 border rounded">
            <div className="font-semibold">{email.subject}</div>
            <div className="text-sm text-gray-600">จาก: {email.from}</div>
            <div className="text-xs text-gray-400">{email.date}</div>
            {email.body_text && (
              <div className="mt-2 whitespace-pre-line">{email.body_text}</div>
            )}
            <details className="mt-2">
              <summary className="cursor-pointer text-blue-600">ดูรายละเอียดทั้งหมด</summary>
              <pre className="overflow-x-auto bg-gray-100 p-2 mt-2 rounded text-xs max-h-96">{JSON.stringify(email, null, 2)}</pre>
            </details>
          </li>
        ))}
      </ul>
      {!loading && emails.length === 0 && <div>ไม่พบอีเมล</div>}
    </div>
  );
};

export default ReadMail;
