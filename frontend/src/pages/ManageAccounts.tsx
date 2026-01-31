
import React, { useState } from "react";
import AddEmailAccount from "../components/AddEmailAccount";
import { saveAccounts, loadAccounts } from "../utils/crypto";

const getAccountsFromStorage = () => loadAccounts();

const ManageAccounts: React.FC = () => {
  const [accounts, setAccounts] = useState(getAccountsFromStorage());



  const [showModal, setShowModal] = useState(false);

  // Actually clear all localStorage
  const confirmClearLocalStorage = () => {
    localStorage.clear();
    saveAccounts([]);
    setAccounts([]);
    setShowModal(false);
  };

  const handleClearLocalStorage = () => {
    setShowModal(true);
  };

  // Modal for deleting a single account
  const [deleteIdx, setDeleteIdx] = useState<number|null>(null);
  const handleDeleteAccount = (idx: number) => {
    setDeleteIdx(idx);
  };
  const confirmDeleteAccount = () => {
    if (deleteIdx === null) return;
    const newAccounts = accounts.filter((_: any, i: number) => i !== deleteIdx);
    saveAccounts(newAccounts);
    setAccounts(newAccounts);
    setDeleteIdx(null);
  };
  const cancelDeleteAccount = () => setDeleteIdx(null);

  const handleAccountAdded = () => {
    setAccounts(getAccountsFromStorage());
  };

  return (
    <main className="min-h-screen flex flex-col items-center bg-gray-50 dark:bg-gray-900 py-8 px-2 w-full overflow-x-hidden">
      <section className="w-full max-w-md mx-auto flex flex-col gap-6">
        <div className="w-full max-w-full box-border rounded-xl shadow border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 sm:px-4 py-6 flex flex-col gap-4">
          <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-2">จัดการบัญชีอีเมล</h1>
          <div className="w-full max-w-full box-border break-words">
            <AddEmailAccount onAdd={handleAccountAdded} accounts={accounts} />
          </div>
        </div>
        <div className="w-full rounded-xl shadow border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-5 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-3">
            <span className="text-base font-semibold text-gray-700 dark:text-gray-200">บัญชีที่บันทึกไว้</span>
            <button
              className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 transition text-sm w-full sm:w-auto"
              onClick={handleClearLocalStorage}
              aria-label="ลบข้อมูลบัญชีทั้งหมดในเครื่อง"
            >
              <span className="inline-flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M6.293 6.293a1 1 0 011.414 0L10 8.586l2.293-2.293a1 1 0 111.414 1.414L11.414 10l2.293 2.293a1 1 0 01-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 01-1.414-1.414L8.586 10 6.293 7.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                ลบข้อมูลบัญชีทั้งหมดในเครื่อง
              </span>
            </button>
                {showModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 w-full max-w-xs mx-auto flex flex-col items-center">
                      <div className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 text-center">คุณต้องการลบข้อมูลทุกอย่างในเครื่องนี้หรือไม่?</div>
                      <div className="flex gap-4 w-full mt-2">
                        <button
                          className="flex-1 px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                          onClick={() => setShowModal(false)}
                        >ยกเลิก</button>
                        <button
                          className="flex-1 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition"
                          onClick={confirmClearLocalStorage}
                        >ตกลง</button>
                      </div>
                    </div>
                  </div>
                )}
          </div>
          <div className="border-t border-gray-100 dark:border-gray-800 my-2" />
          {accounts.length === 0 ? (
            <div className="text-center text-gray-400 dark:text-gray-500 mt-4 text-sm">ยังไม่มีบัญชีที่บันทึกไว้</div>
          ) : (
            <div className="flex flex-col gap-3 mt-2">
              {accounts.map((acc: any, idx: number) => {
                // Parse account string for display
                let email = "", name = "";
                if (typeof acc === "string") {
                  const sep = acc.includes("|") ? "|" : acc.includes(":") ? ":" : "|";
                  const parts = acc.split(sep);
                  email = parts[0] || "";
                  name = email.split("@")[0] || email;
                }
                return (
                  <div
                    key={idx}
                    className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-4 flex items-center gap-3 transition hover:shadow focus-within:ring-2 focus-within:ring-blue-400"
                    tabIndex={0}
                    aria-label={`บัญชี ${name} (${email})`}
                  >
                    <div className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-lg font-bold">
                      {name?.[0]?.toUpperCase() || email?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate max-w-[8rem]" title={name}>{name || "-"}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-300 truncate max-w-[10rem]" title={email}>{email || "-"}</span>
                    </div>
                    <button
                      className="ml-2 px-2 py-1 rounded bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-200 text-xs font-semibold hover:bg-red-200 dark:hover:bg-red-700 transition"
                      onClick={() => handleDeleteAccount(idx)}
                      aria-label="ลบบัญชีนี้"
                    >ลบ</button>
                        {deleteIdx !== null && (
                          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 w-full max-w-xs mx-auto flex flex-col items-center">
                              <div className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 text-center">คุณต้องการลบบัญชีนี้หรือไม่?</div>
                              <div className="flex gap-4 w-full mt-2">
                                <button
                                  className="flex-1 px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                                  onClick={cancelDeleteAccount}
                                >ยกเลิก</button>
                                <button
                                  className="flex-1 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition"
                                  onClick={confirmDeleteAccount}
                                >ตกลง</button>
                              </div>
                            </div>
                          </div>
                        )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default ManageAccounts;
