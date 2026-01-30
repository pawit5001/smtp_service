import React, { useState } from 'react';
import { toast } from 'react-toastify';


const MessageForm: React.FC = () => {
        // Multi-account selection (load from local storage or crypto utils)
        const [accounts, setAccounts] = useState<any[]>(() => {
            try {
                const { loadAccounts } = require('../utils/crypto');
                return loadAccounts();
            } catch {
                return [];
            }
        });
        const [selectedAccountIdx, setSelectedAccountIdx] = useState(0);
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
        <form className="max-w-xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">ส่งจากบัญชี</label>
                <div className="flex items-center gap-2">
                    <span className="text-gray-800 dark:text-gray-100 font-semibold">{activeEmail}</span>
                    {isDefault && <span className="text-gray-400 text-xs">(ค่าเริ่มต้น)</span>}
                    {accounts.length > 1 && (
                        <select
                            className="ml-2 border rounded px-2 py-1 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-700"
                            value={selectedAccountIdx}
                            onChange={e => setSelectedAccountIdx(Number(e.target.value))}
                            title="เลือกบัญชีอีเมลที่ต้องการส่ง"
                        >
                            {accounts.map((acc, i) => {
                                const sep = acc.includes('|') ? '|' : acc.includes(':') ? ':' : '|';
                                const email = acc.split(sep)[0];
                                return <option value={i} key={i}>{email}</option>;
                            })}
                        </select>
                    )}
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
    );
}

export default MessageForm;