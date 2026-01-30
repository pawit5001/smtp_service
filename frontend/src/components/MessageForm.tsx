import React, { useState } from 'react';
import { toast } from 'react-toastify';


const MessageForm: React.FC = () => {
    function handleClearLocalStorage() {
        if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการล้างข้อมูลทั้งหมดใน localStorage? (รวมถึงบัญชีที่เลือก, ฟอร์ม, ฯลฯ)')) {
            localStorage.removeItem('messageform_selected_account_idx');
            localStorage.removeItem('readmail_selected_account_idx');
            localStorage.removeItem('message_form_cache');
            localStorage.removeItem('accounts');
            window.location.href = "/";
        }
    }
        // Multi-account selection (load from local storage or crypto utils)
        // Preload default accounts (CREDS_SMTP, CREDS_GRAPH_API) if not present
        const DEFAULT_ACCOUNTS = [
            // Format: email|password|refresh_token|client_id|client_secret (or : as separator)
            // These should match the backend hardcoded credentials
            "scavelli20322@outlook.com:E9KFDQHK72:M.C525_BAY.0.U.-Cr2ahYnR0lKDamU!PsNLhZjitfSxG5nWVXX*e80FlN2v7ds8KjPnQJS49uWLNeSjm28StMZzxrMDkZcG!VCOEbLQPoAL47VUKF5LArrGFFumN1EEIdrJGgTsic31r3jgjWD9M6APy13ZA*Z!acADB0!UTuGWd9EDoX8fzHXz6pMRv7N25!UnxpP6xAVIkAiMO3Oc8y2qxUmXn*9H85yR6rzKHFxAfmJjVtR3QXkWrFo8svzckWd!1xEmQFuCpJf5yTqJT9HTPERq1WSTWSpuuKo4P*U9k3MMP5IbGbzf1q77GeNa3zEOBf0V6RBRH04N!JViKhoYPHg66SMg1pEcC35!ykJOdFDP5B87SRO3ue3JwMNC2BYvKSnvLzLvTOsdK140o8uwMKOTz01OGSHG7pnCKcQvWlyVw9RAFvdRkkcG2Utm9bL0JLMSZFZlpnKyo*Pm9EuZwpMI33ARhKQsYA4$:9e5f94bc-e8a4-4e73-b8be-63364c29d753",
            "xvrifkhiss3889@hotmail.com|btkulnpgqc6633|M.C514_BAY.0.U.-CtJ7GCOdTQTBpb9P4kmJIg21RM72jCtBfhs0UTewbfrvLjb5Qi63vsnpSQoMrDnZmQ1M7wBZS2JdvFMM5xFmj2xcqDA6adQ6Qj3voyxcA!m8OzrSYOO4gn0KQkfeaoBBTIDAJxtrDy3CZy99MaoXzOqud8Iw22Pivbe0!G1vUXlDtOouwHAkuHCk!ErR8i5JRWZgpjKlKyCl18uubG*4HMoRo2yEo1cSnkHjImCRNa2GQ5SaVrMLTK8OUZTdHxaSau8zaejKaDXIdMXvjpXSW6KZxY9tHfIG1ANpb0o!2SFSsYmPyZQ59E8gjxlJYFe564wXlobB00G6TUO9f9Qzys5NEOPl5zx28vGMgP6alrIcA1HrX!ZpQIu3NbfmzWvGk1izNpFWpdbZyP0Z4sSiJmf6NMaN1bog5E9zxdZI9Y5y|9e5f94bc-e8a4-4e73-b8be-63364c29d753"
        ];
        const [accounts, setAccounts] = useState<any[]>(() => {
            try {
                const { loadAccounts } = require('../utils/crypto');
                let loaded = loadAccounts();
                // Add default accounts if not present
                DEFAULT_ACCOUNTS.forEach(def => {
                    const defEmail = def.split(/[|:]/)[0];
                    if (!loaded.some((acc: string) => acc.split(/[|:]/)[0] === defEmail)) {
                        loaded.push(def);
                    }
                });
                // Sort: default accounts (alphabetically) on top, then others alphabetically
                loaded.sort((a: string, b: string) => {
                    const emailA = a.split(/[|:]/)[0];
                    const emailB = b.split(/[|:]/)[0];
                    const isDefA = ["scavelli20322@outlook.com", "xvrifkhiss3889@hotmail.com"].includes(emailA);
                    const isDefB = ["scavelli20322@outlook.com", "xvrifkhiss3889@hotmail.com"].includes(emailB);
                    if (isDefA && isDefB) return emailA.localeCompare(emailB);
                    if (isDefA && !isDefB) return -1;
                    if (!isDefA && isDefB) return 1;
                    return emailA.localeCompare(emailB);
                });
                return loaded;
            } catch {
                return [...DEFAULT_ACCOUNTS].sort((a: string, b: string) => {
                    const emailA = a.split(/[|:]/)[0];
                    const emailB = b.split(/[|:]/)[0];
                    const isDefA = ["scavelli20322@outlook.com", "xvrifkhiss3889@hotmail.com"].includes(emailA);
                    const isDefB = ["scavelli20322@outlook.com", "xvrifkhiss3889@hotmail.com"].includes(emailB);
                    if (isDefA && isDefB) return emailA.localeCompare(emailB);
                    if (isDefA && !isDefB) return -1;
                    if (!isDefA && isDefB) return 1;
                    return emailA.localeCompare(emailB);
                });
            }
        });
        // Persist selected account index in localStorage
        const ACCOUNT_IDX_KEY = 'messageform_selected_account_idx';
        const getDefaultAccountIdx = (accounts: string[]) => {
            const saved = localStorage.getItem(ACCOUNT_IDX_KEY);
            if (saved && !isNaN(Number(saved)) && accounts[Number(saved)]) return Number(saved);
            return Math.max(0, accounts.findIndex((acc: string) => acc.split(/[|:]/)[0] === "scavelli20322@outlook.com"));
        };
        const [selectedAccountIdx, setSelectedAccountIdx] = useState(() => getDefaultAccountIdx(
            (() => {
                try {
                    const { loadAccounts } = require('../utils/crypto');
                    let loaded = loadAccounts();
                    DEFAULT_ACCOUNTS.forEach(def => {
                        const defEmail = def.split(/[|:]/)[0];
                        if (!loaded.some((acc: string) => acc.split(/[|:]/)[0] === defEmail)) {
                            loaded.push(def);
                        }
                    });
                    return loaded;
                } catch {
                    return [...DEFAULT_ACCOUNTS];
                }
            })()
        ));
        // Save to localStorage when changed
        React.useEffect(() => {
            localStorage.setItem(ACCOUNT_IDX_KEY, String(selectedAccountIdx));
        }, [selectedAccountIdx]);
        let activeEmail = 'xvrifkhiss3889@hotmail.com';
        let isDefault = true;
        if (accounts.length > 0 && accounts[selectedAccountIdx]) {
            const sep = accounts[selectedAccountIdx].includes('|') ? '|' : accounts[selectedAccountIdx].includes(':') ? ':' : '|';
            activeEmail = accounts[selectedAccountIdx].split(sep)[0];
            isDefault = false;
        }
    // Cache/load form values from localStorage
    const LS_KEY = 'message_form_cache';
    const getCache = () => {
        try {
            return JSON.parse(localStorage.getItem(LS_KEY) || '{}');
        } catch { return {}; }
    };
    const cache = getCache();
    const [recipient, setRecipient] = useState(cache.recipient || '');
    const [cc, setCc] = useState(cache.cc || '');
    const [subject, setSubject] = useState(cache.subject || '');
    const [body, setBody] = useState(cache.body || '');
    const [loading, setLoading] = useState(false);
    const [displayName, setDisplayName] = useState(cache.displayName || 'admin_snaptranslate');
    const [sendMethod, setSendMethod] = useState<'graphapi' | 'smtp'>(cache.sendMethod || 'graphapi');
    const [files, setFiles] = useState<FileList | null>(null);
    // Update localStorage every time form changes
    React.useEffect(() => {
        localStorage.setItem(LS_KEY, JSON.stringify({ recipient, cc, subject, body, displayName, sendMethod }));
    }, [recipient, cc, subject, body, displayName, sendMethod]);
    // Show warning if Graph API is selected
    const isGraphApi = sendMethod === 'graphapi';

    // Email validation and splitting helpers
    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };
    const getRecipientList = (): string[] => recipient.split(',').map((e: string) => e.trim()).filter(Boolean);
    const getCcList = (): string[] => cc.split(',').map((e: string) => e.trim()).filter(Boolean);

    // Handle form submit: validate, build FormData, send to backend
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const recipients = getRecipientList();
        const ccList = getCcList();
        if (recipients.length === 0) {
            toast.error('กรุณากรอกอีเมลผู้รับอย่างน้อย 1 คน');
            return;
        }
        const invalids = recipients.filter((r: string) => !validateEmail(r)).concat(ccList.filter((r: string) => !validateEmail(r)));
        if (invalids.length > 0) {
            toast.error('อีเมลไม่ถูกต้อง: ' + invalids.join(', '));
            return;
        }
        setLoading(true);
        try {
            // Support both .env, localhost, and 127.0.0.1 for API URL
            let apiUrl = process.env.REACT_APP_API_URL || '';
            if (!apiUrl) {
                if (window.location.hostname === '127.0.0.1') {
                    apiUrl = 'http://127.0.0.1:8000';
                } else {
                    apiUrl = 'http://localhost:8000';
                }
            }
            const userCred = accounts.length > 0 && accounts[selectedAccountIdx] ? accounts[selectedAccountIdx] : null;
            let res, data;
            // Always send as FormData for file/multi-value support
            const formData = new FormData();
            recipients.forEach((r: string) => formData.append('recipient', r));
            ccList.forEach((r: string) => formData.append('cc', r));
            formData.append('subject', subject);
            formData.append('body', body);
            formData.append('display_name', displayName);
            formData.append('send_method', sendMethod);
            if (userCred) formData.append('credentials', userCred);
            if (files && files.length > 0) {
                for (let i = 0; i < files.length; i++) {
                    formData.append('attachments', files[i]);
                }
            }
            res = await fetch(`${apiUrl}/send-email/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.REACT_APP_API_KEY || 'pawit_snaptranslate'}`
                },
                body: formData
            });
            data = await res.json();
            if (res.ok && data.results) {
                let successCount = 0;
                let failCount = 0;
                let failList: string[] = [];
                data.results.forEach((r: any) => {
                    if (r.success) {
                        successCount++;
                    } else {
                        failCount++;
                        failList.push(r.recipient);
                    }
                });
                if (successCount > 0) {
                    toast.success(`ส่งอีเมลสำเร็จ ${successCount} รายการ`);
                    setRecipient('');
                    setCc('');
                    setSubject('');
                    setBody('');
                    setFiles(null);
                    // Clear form cache after success
                    localStorage.removeItem(LS_KEY);
                }
                if (failCount > 0) {
                    toast.error(`ส่งอีเมลไม่สำเร็จ ${failCount} รายการ: ${failList.join(', ')}`);
                }
            } else {
                // Special handling for Microsoft OAuth2/Graph API invalid_grant error
                if (data && data.detail && typeof data.detail === 'string' && data.detail.includes('invalid_grant')) {
                    toast.error('Token หมดอายุหรือสิทธิ์ไม่ถูกต้อง กรุณาเพิ่มบัญชีใหม่หรือ authorize ใหม่ใน Microsoft Azure Portal');
                } else if (data && data.detail && typeof data.detail === 'string' && data.detail.includes('AADSTS70000')) {
                    toast.error('Microsoft OAuth2: สิทธิ์ (scope) ไม่ถูกต้องหรือหมดอายุ กรุณา authorize ใหม่ใน Microsoft Azure Portal');
                } else {
                    toast.error(data.detail || 'เกิดข้อผิดพลาดในการส่งอีเมล');
                }
            }
        } catch (err) {
            toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
        }
        setLoading(false);
    };

    return (
        <>
        <div className="mb-4 flex justify-end max-w-xl mx-auto">
            <button
                onClick={handleClearLocalStorage}
                className="px-4 py-2 bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-200 rounded border border-yellow-300 dark:border-yellow-700 text-sm font-semibold hover:bg-yellow-200 dark:hover:bg-yellow-700 transition-colors"
            >
                ล้างข้อมูล LocalStorage ทั้งหมด
            </button>
        </div>
        <form className="max-w-xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">ส่งจากบัญชี</label>
                <div className="flex items-center gap-2">
                    <span className="text-gray-800 dark:text-gray-100 font-semibold">
                        {activeEmail}
                        {["scavelli20322@outlook.com", "xvrifkhiss3889@hotmail.com"].includes(activeEmail) && (
                            <span className="text-blue-500 font-normal text-xs ml-1">(ค่าเริ่มต้น)</span>
                        )}
                    </span>
                    <select
                        className="ml-2 border rounded px-2 py-1 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-700"
                        value={selectedAccountIdx}
                        onChange={e => setSelectedAccountIdx(Number(e.target.value))}
                        title="เลือกบัญชีอีเมลที่ต้องการส่ง"
                    >
                        {accounts.map((acc, i) => {
                            const sep = acc.includes('|') ? '|' : acc.includes(':') ? ':' : '|';
                            const email = acc.split(sep)[0];
                            const isDef = ["scavelli20322@outlook.com", "xvrifkhiss3889@hotmail.com"].includes(email);
                            return <option value={i} key={i}>{email}{isDef ? ' (ค่าเริ่มต้น)' : ''}</option>;
                        })}
                    </select>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">ชื่อผู้ส่ง (Display Name) <span className="text-gray-400 dark:text-gray-500">(ไม่บังคับ)</span></label>
                <input
                    type="text"
                    className="w-full border rounded px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-700"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="ชื่อที่จะแสดงในอีเมลผู้รับ"
                    title="ชื่อที่จะแสดงในอีเมลผู้รับ"
                    disabled={isGraphApi}
                />
                {isGraphApi && (
                    <div className="text-xs text-yellow-600 mt-1">* Microsoft Graph API ไม่รองรับการเปลี่ยน Display Name (จะใช้ชื่อบัญชี Microsoft เท่านั้น)</div>
                )}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">อีเมลผู้รับ <span className="text-red-500">*</span></label>
                <input
                    type="text"
                    className="w-full border rounded px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-700"
                    value={recipient}
                    onChange={e => setRecipient(e.target.value)}
                    placeholder="ex: a@email.com, b@email.com, c@email.com"
                    title="กรอกอีเมลผู้รับหลายคนคั่นด้วย , (comma)"
                    required
                />
                <div className="text-xs text-gray-500 mt-1">
                    * ส่งอีเมลถึงผู้รับหลายคนคั่นด้วย , (comma)
                    <div className="mt-1 px-2 py-1 bg-yellow-50 border border-yellow-300 rounded text-yellow-700">
                        <span className="font-semibold">ตัวอย่าง:</span> a@email.com, b@email.com, c@email.com
                    </div>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">CC (สำเนาถึง) <span className="text-gray-400 dark:text-gray-500">(ไม่บังคับ)</span></label>
                <input
                    type="text"
                    className="w-full border rounded px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-700"
                    value={cc}
                    onChange={e => setCc(e.target.value)}
                    placeholder="ex: cc1@email.com, cc2@email.com"
                    title="กรอกอีเมล CC หลายคนคั่นด้วย , (comma)"
                />
                <div className="text-xs text-gray-500 mt-1">
                    * ส่งสำเนาถึงหลายคนคั่นด้วย , (comma)
                    <div className="mt-1 px-2 py-1 bg-yellow-50 border border-yellow-300 rounded text-yellow-700">
                        <span className="font-semibold">ตัวอย่าง:</span> cc1@email.com, cc2@email.com
                    </div>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">หัวข้อ <span className="text-red-500">*</span></label>
                <input
                    type="text"
                    className="w-full border rounded px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-700"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="หัวข้ออีเมล"
                    title="หัวข้ออีเมล"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">เนื้อหา <span className="text-red-500">*</span></label>
                <textarea
                    className="w-full border rounded px-3 py-2 text-sm min-h-[120px] bg-white dark:bg-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-700"
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    placeholder="พิมพ์ข้อความ..."
                    title="เนื้อหาอีเมล"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">แนบไฟล์ (ถ้ามี) <span className="text-gray-400 dark:text-gray-500">(ไม่บังคับ)</span></label>
                <input
                    type="file"
                    className="w-full border rounded px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-700"
                    multiple
                    onChange={e => setFiles(e.target.files)}
                    title="เลือกไฟล์แนบ"
                />
            </div>
            <div className="flex items-center gap-4">
                <label className="font-medium dark:text-gray-200" htmlFor="send-method-select">วิธีส่ง:</label>
                <select
                    id="send-method-select"
                    className="border rounded px-2 py-1 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-700"
                    value={sendMethod}
                    onChange={e => setSendMethod(e.target.value as 'graphapi' | 'smtp')}
                    title="เลือกวิธีการส่งอีเมล"
                >
                    <option value="graphapi">Microsoft Graph API</option>
                    <option value="smtp">SMTP</option>
                </select>
            </div>
            <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded shadow disabled:opacity-50 flex items-center justify-center gap-2"
                disabled={loading}
            >
                {loading && (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                )}
                {loading ? 'กำลังส่ง...' : 'ส่งอีเมล'}
            </button>
        </form>
        </form>
        </>
}

export default MessageForm;