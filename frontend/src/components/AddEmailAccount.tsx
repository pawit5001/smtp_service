
import React, { useState } from 'react';


interface AddEmailAccountProps {
  onAdd: (acc: any) => void;
  accounts?: string[];
}

const AddEmailAccount: React.FC<AddEmailAccountProps> = ({ onAdd, accounts = [] }) => {
  const [cred, setCred] = useState('');
  const [error, setError] = useState<string | null>(null);

  function validate() {
    const sep = cred.includes('|') ? '|' : cred.includes(':') ? ':' : '|';
    const parts = cred.split(sep);
    if (parts.length < 4 || parts.length > 5) return 'รูปแบบต้องเป็น email|password|refresh_token|client_id หรือ email|password|refresh_token|client_id|client_secret (ใช้ | หรือ : ก็ได้)';
    if (!parts[0].match(/^\S+@\S+\.\S+$/)) return 'กรุณากรอกอีเมลให้ถูกต้อง';
    // Duplicate email validation
    if (accounts.some((a) => {
      const sep2 = a.includes('|') ? '|' : a.includes(':') ? ':' : '|';
      return a.split(sep2)[0] === parts[0];
    })) return 'บัญชีอีเมลนี้ถูกเพิ่มไว้แล้ว';
    return null;
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) return setError(err);
    setError(null);
    // Always store as string, let backend parse
    onAdd(cred);
    setCred('');
  }

  return (
    <form onSubmit={handleAdd} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6 max-w-xl mx-auto mb-6">
      <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">เพิ่มบัญชีอีเมล</h2>
      <div className="mb-4">
        <label className="block font-medium mb-1 text-gray-700 dark:text-gray-200">ข้อมูลบัญชี (email|password|refresh_token|client_id[|client_secret] หรือ email:password:refresh_token:client_id[:client_secret])</label>
        <input
          className="w-full border rounded px-3 py-2 font-mono bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 placeholder-gray-400 dark:placeholder-gray-500"
          value={cred}
          onChange={e => setCred(e.target.value)}
          placeholder="user@email.com|password|refresh_token|client_id  หรือ  user@email.com:password:refresh_token:client_id"
          required
        />
      </div>
      {error && <div className="text-red-500 dark:text-red-400 mb-2">{error}</div>}
      <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded shadow">เพิ่มบัญชี</button>
    </form>
  );
};


export default AddEmailAccount;
