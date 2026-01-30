import React from 'react';
import AddEmailAccount from '../components/AddEmailAccount';
import { loadAccounts, saveAccounts } from '../utils/crypto';

const ManageAccounts: React.FC = () => {
  const [accounts, setAccounts] = React.useState<any[]>(() => loadAccounts());

  function handleAddAccount(acc: any) {
    // Prevent duplicate email accounts
    const sep = acc.includes('|') ? '|' : acc.includes(':') ? ':' : '|';
    const email = acc.split(sep)[0];
    if (accounts.some((a) => (a.split(a.includes('|') ? '|' : a.includes(':') ? ':' : '|')[0] === email))) {
      alert('บัญชีอีเมลนี้ถูกเพิ่มไว้แล้ว');
      return;
    }
    const newAccounts = [...accounts, acc];
    setAccounts(newAccounts);
    saveAccounts(newAccounts);
  }

  function handleDeleteAccount(idx: number) {
    const newAccounts = accounts.filter((_, i) => i !== idx);
    setAccounts(newAccounts);
    saveAccounts(newAccounts);
  }

  function handleClearLocalStorage() {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการล้างข้อมูลทั้งหมดใน localStorage? (รวมถึงบัญชีที่เลือก, ฟอร์ม, ฯลฯ)')) {
      localStorage.removeItem('messageform_selected_account_idx');
      localStorage.removeItem('readmail_selected_account_idx');
      localStorage.removeItem('message_form_cache');
      // ถ้าต้องการลบบัญชีที่บันทึกไว้ด้วย (reset ทั้งหมด):
      localStorage.removeItem('accounts');
      window.location.href = "/";
    }
  }
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-4xl px-4 py-6">
        <AddEmailAccount onAdd={handleAddAccount} accounts={accounts} />
        <div className="mb-4 flex justify-end max-w-xl mx-auto">
          <button
            onClick={handleClearLocalStorage}
            className="px-4 py-2 bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-200 rounded border border-yellow-300 dark:border-yellow-700 text-sm font-semibold hover:bg-yellow-200 dark:hover:bg-yellow-700 transition-colors"
          >
            ล้างข้อมูล LocalStorage ทั้งหมด
          </button>
        </div>
        <div className="mb-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6 max-w-xl mx-auto">
          <h3 className="font-bold mb-2 text-gray-900 dark:text-gray-100">บัญชีอีเมลที่เพิ่มไว้ <span className="font-normal text-sm text-gray-500 dark:text-gray-300">({accounts.length} บัญชี)</span></h3>
          {accounts.length === 0 ? (
            <div className="text-gray-500 dark:text-gray-300 text-sm">ยังไม่มีบัญชีอีเมล</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="py-2 px-3 font-semibold text-gray-700 dark:text-gray-200">อีเมล</th>
                    <th className="py-2 px-3 font-semibold text-gray-700 dark:text-gray-200">ลบ</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((acc, i) => {
                    const sep = acc.includes('|') ? '|' : acc.includes(':') ? ':' : '|';
                    const parts = acc.split(sep);
                    return (
                      <tr key={i} className="border-b border-gray-100 dark:border-gray-700">
                        <td className="py-2 px-3 text-gray-800 dark:text-gray-100">{parts[0]}</td>
                        <td className="py-2 px-3">
                          <button onClick={() => handleDeleteAccount(i)} className="px-2 py-0.5 text-xs bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-200 rounded hover:bg-red-200 dark:hover:bg-red-600 border border-red-200 dark:border-red-700 transition-colors">ลบ</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageAccounts;
