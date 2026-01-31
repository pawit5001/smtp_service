import React, { useEffect, useState, useRef, useCallback } from 'react';
import SkeletonEmailList from '../components/SkeletonEmailList';
import SkeletonEmailContent from '../components/SkeletonEmailContent';

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
}

const ReadMail: React.FC = () => {
  // Multi-account selection
  // Preload default accounts (CREDS_SMTP, CREDS_GRAPH_API) if not present
  const DEFAULT_ACCOUNTS = [
    "scavelli20322@outlook.com:E9KFDQHK72:M.C525_BAY.0.U.-Cr2ahYnR0lKDamU!PsNLhZjitfSxG5nWVXX*e80FlN2v7ds8KjPnQJS49uWLNeSjm28StMZzxrMDkZcG!VCOEbLQPoAL47VUKF5LArrGFFumN1EEIdrJGgTsic31r3jgjWD9M6APy13ZA*Z!acADB0!UTuGWd9EDoX8fzHXz6pMRv7N25!UnxpP6xAVIkAiMO3Oc8y2qxUmXn*9H85yR6rzKHFxAfmJjVtR3QXkWrFo8svzckWd!1xEmQFuCpJf5yTqJT9HTPERq1WSTWSpuuKo4P*U9k3MMP5IbGbzf1q77GeNa3zEOBf0V6RBRH04N!JViKhoYPHg66SMg1pEcC35!ykJOdFDP5B87SRO3ue3JwMNC2BYvKSnvLzLvTOsdK140o8uwMKOTz01OGSHG7pnCKcQvWlyVw9RAFvdRkkcG2Utm9bL0JLMSZFZlpnKyo*Pm9EuZwpMI33ARhKQsYA4$:9e5f94bc-e8a4-4e73-b8be-63364c29d753",
    "xvrifkhiss3889@hotmail.com|btkulnpgqc6633|M.C514_BAY.0.U.-CtJ7GCOdTQTBpb9P4kmJIg21RM72jCtBfhs0UTewbfrvLjb5Qi63vsnpSQoMrDnZmQ1M7wBZS2JdvFMM5xFmj2xcqDA6adQ6Qj3voyxcA!m8OzrSYOO4gn0KQkfeaoBBTIDAJxtrDy3CZy99MaoXzOqud8Iw22Pivbe0!G1vUXlDtOouwHAkuHCk!ErR8i5JRWZgpjKlKyCl18uubG*4HMoRo2yEo1cSnkHjImCRNa2GQ5SaVrMLTK8OUZTdHxaSau8zaejKaDXIdMXvjpXSW6KZxY9tHfIG1ANpb0o!2SFSsYmPyZQ59E8gjxlJYFe564wXlobB00G6TUO9f9Qzys5NEOPl5zx28vGMgP6alrIcA1HrX!ZpQIu3NbfmzWvGk1izNpFWpdbZyP0Z4sSiJmf6NMaN1bog5E9zxdZI9Y5y|9e5f94bc-e8a4-4e73-b8be-63364c29d753"
  ];
  const [accounts, setAccounts] = useState<any[]>(() => {
    try {
      const { loadAccounts } = require('../utils/crypto');
      let loaded = loadAccounts();
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
  const ACCOUNT_IDX_KEY = 'readmail_selected_account_idx';
  const getDefaultAccountIdx = (accounts: string[]) => {
    const saved = localStorage.getItem(ACCOUNT_IDX_KEY);
    if (saved && !isNaN(Number(saved)) && accounts[Number(saved)]) return Number(saved);
    const idx = accounts.findIndex((acc: string) => acc.split(/[|:]/)[0] === "xvrifkhiss3889@hotmail.com");
    return idx !== -1 ? idx : 0;
  };
  const [selectedAccountIdx, setSelectedAccountIdx] = useState(() => {
    const accs = (() => {
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
    })();
    const saved = localStorage.getItem(ACCOUNT_IDX_KEY);
    if (saved && !isNaN(Number(saved)) && accs[Number(saved)]) return Number(saved);
    const idx = accs.findIndex((acc: string) => acc.split(/[|:]/)[0] === "xvrifkhiss3889@hotmail.com");
    return idx !== -1 ? idx : 0;
  });
  // Save to localStorage when changed
  React.useEffect(() => {
    localStorage.setItem(ACCOUNT_IDX_KEY, String(selectedAccountIdx));
  }, [selectedAccountIdx]);
  const [activeEmail, setActiveEmail] = useState<string | null>(null);
  const [isDefaultEmail, setIsDefaultEmail] = useState(true);
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [readMethod, setReadMethod] = useState<'imap' | 'graph'>('imap');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const [sort, setSort] = useState<'desc' | 'asc'>('desc');
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  // Filter emails by search
  const filteredEmails = emails.filter((email: Email) => {
    const q = search.toLowerCase();
    return (
      email.subject?.toLowerCase().includes(q) ||
      email.from?.toLowerCase().includes(q) ||
      email.body_text?.toLowerCase().includes(q)
    );
  });

  // Infinite scroll: reset emails on filter/search/account/sort change
  useEffect(() => {
    setEmails([]);
    setPage(1);
    setHasMore(true);
  }, [readMethod, pageSize, sort, accounts, selectedAccountIdx, search]);

  // Fetch emails when page changes or after reset
  useEffect(() => {
    let ignore = false;
    if (readMethod === 'graph') {
      setEmails([]);
      setError('ขออภัย ขณะนี้ยังไม่รองรับการอ่านอีเมลผ่าน Microsoft Graph API เนื่องจาก scope/สิทธิ์ของแอปพลิเคชันไม่ได้ตรงกับที่ Microsoft อนุญาต กรุณาใช้ IMAP/POP3 สำหรับการอ่านอีเมล');
      setLoading(false);
      setHasMore(false);
      return;
    }
    setLoading(true);
    let apiUrl = process.env.REACT_APP_API_URL || '';
    if (!apiUrl) {
      if (window.location.hostname === '127.0.0.1') {
        apiUrl = 'http://127.0.0.1:8000';
      } else {
        apiUrl = 'http://localhost:8000';
      }
    }
    const params = new URLSearchParams({
      sort,
      page: page.toString(),
      page_size: pageSize.toString(),
    });
    let userCred: string | null = null;
    let userEmail: string | null = null;
    let isDefault: boolean = true;
    if (accounts.length > 0 && accounts[selectedAccountIdx]) {
      userCred = accounts[selectedAccountIdx];
      if (userCred) {
        const sep = userCred.includes('|') ? '|' : userCred.includes(':') ? ':' : '|';
        userEmail = userCred.split(sep)[0];
        isDefault = false;
      } else {
        userEmail = 'xvrifkhiss3889@hotmail.com';
        isDefault = true;
      }
    } else {
      userEmail = 'xvrifkhiss3889@hotmail.com';
      isDefault = true;
    }
    setActiveEmail(userEmail);
    setIsDefaultEmail(isDefault);
    const cacheKey = `readmail_cache_${userEmail}_${sort}_${page}_${pageSize}_${readMethod}`;
    const cache = localStorage.getItem(cacheKey);
    if (cache) {
      try {
        const parsed = JSON.parse(cache);
        if (!ignore) {
          setEmails((prev: Email[]) => page === 1 ? (parsed.emails || []) : [...prev, ...(parsed.emails || [])]);
          setError(parsed.error || null);
          setHasMore(parsed.emails && parsed.emails.length === pageSize);
          setLoading(false);
        }
        return;
      } catch {}
    }
    const fetchEmails = async () => {
      try {
        let res;
        if (userCred) {
          res = await fetch(`${apiUrl}/read-emails?${params.toString()}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.REACT_APP_API_KEY}`
            },
            body: JSON.stringify({ credentials: userCred })
          });
        } else {
          res = await fetch(`${apiUrl}/read-emails?${params.toString()}`, {
            headers: {
              'Authorization': `Bearer ${process.env.REACT_APP_API_KEY}`
            }
          });
        }
        if (res.ok) {
          const data = await res.json();
          if (!ignore) {
            setEmails((prev: Email[]) => page === 1 ? (data.emails || []) : [...prev, ...(data.emails || [])]);
            setError(null);
            setHasMore(data.emails && data.emails.length === pageSize);
          }
          localStorage.setItem(cacheKey, JSON.stringify({ emails: data.emails || [] }));
        } else {
          const errorData = await res.json();
          if (!ignore) {
            setError(errorData.detail || 'Unknown error');
            setHasMore(false);
          }
          localStorage.setItem(cacheKey, JSON.stringify({ emails: [], error: errorData.detail || 'Unknown error' }));
        }
      } catch (err) {
        if (!ignore) {
          if (err instanceof Error) {
            setError(err.message);
            setHasMore(false);
            localStorage.setItem(cacheKey, JSON.stringify({ emails: [], error: err.message }));
          } else {
            setError('An unknown error occurred.');
            setHasMore(false);
            localStorage.setItem(cacheKey, JSON.stringify({ emails: [], error: 'An unknown error occurred.' }));
          }
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchEmails();
    return () => { ignore = true; };
  }, [readMethod, page, pageSize, sort, accounts, selectedAccountIdx]);

  // Infinite scroll observer
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting && hasMore && !loading) {
      setPage(p => p + 1);
    }
  }, [hasMore, loading]);

  useEffect(() => {
    const option = { root: null, rootMargin: '0px', threshold: 0.1 };
    const observer = new window.IntersectionObserver(handleObserver, option);
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [handleObserver]);

  // Responsive logic
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const showList = isMobile ? selectedIdx === null : true;
  const showContent = isMobile ? selectedIdx !== null : true;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Error message always visible on mobile, above card */}
      {error && (
        <div className="w-full px-2 sm:px-0 max-w-4xl mx-auto mt-4 z-30">
          <div className="text-red-500 text-center text-lg sm:text-base font-semibold break-words leading-relaxed mb-2 bg-white dark:bg-gray-900 rounded shadow py-3 px-2 border border-red-200 dark:border-red-700">
            {error.includes('400 Client Error: Bad Request for url: https://login.microsoftonline.com/common/oauth2/v2.0/token')
              ? (
                <>
                  <div>ไม่สามารถอ่านอีเมลผ่าน Microsoft OAuth ได้ (400 Bad Request)</div>
                  <div className="mt-2 text-gray-600 dark:text-gray-300 text-base sm:text-sm">บัญชีนี้อาจไม่ได้เชื่อมต่อหรือสิทธิ์ไม่ถูกต้อง กรุณาตรวจสอบข้อมูลบัญชีหรือเลือกบัญชีอื่น</div>
                </>
              )
              : error}
          </div>
        </div>
      )}
      <div className="max-w-4xl mx-auto w-full px-4 pt-4 pb-0">
        <div className="mb-2 text-xs text-gray-600 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-3 py-2 overflow-visible">
          <span className="font-semibold text-gray-800 dark:text-gray-100">บัญชีที่ใช้ในการอ่านเมล:</span> {activeEmail} {[
            "scavelli20322@outlook.com",
            "xvrifkhiss3889@hotmail.com"
          ].includes(activeEmail || "") && <span className="text-blue-500 font-normal text-xs ml-1">(ค่าเริ่มต้น)</span>}
          <div className="mt-2 relative overflow-visible">
            <label className="mr-2 font-medium">เลือกบัญชี:</label>
            <select
              className="border rounded px-2 py-1 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-700 w-full sm:w-auto z-20"
              value={selectedAccountIdx}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { setSelectedAccountIdx(Number(e.target.value)); setSelectedIdx(null); setPage(1); }}
              title="เลือกบัญชีอีเมลที่ใช้ในการอ่าน"
              aria-label="เลือกบัญชีอีเมลที่ใช้ในการอ่าน"
              /* removed inline style, w-full already applied */
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
      </div>
      <div className="flex-1 flex flex-col md:flex-row max-w-4xl mx-auto w-full px-4 py-6 gap-4">
        {/* Sidebar: Email List (mobile: full, desktop: left) */}
        {showList && (
          <div className="w-full md:w-1/3 md:max-w-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-4 flex flex-col">
            <h2 className="text-lg font-bold mb-2 text-gray-900 dark:text-gray-100">กล่องอีเมล</h2>
            {/* Search/filter box */}
            <div className="mb-2">
              <input
                type="text"
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700"
                placeholder="ค้นหาอีเมล (หัวข้อ, ผู้ส่ง, ข้อความ)"
                value={search}
                onChange={e => { setSearch(e.target.value); setSelectedIdx(null); }}
                aria-label="ค้นหาอีเมล"
              />
            </div>
            <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded text-blue-800 dark:text-blue-200 text-xs">
              ระบบนี้รองรับการอ่านอีเมลผ่าน IMAP/POP3 เท่านั้น (Microsoft Graph API ยังไม่รองรับการอ่านอีเมล เนื่องจาก scope/สิทธิ์ของแอปพลิเคชันไม่ตรงกับที่ Microsoft อนุญาต)
            </div>
            <div className="mb-2 flex flex-wrap gap-2 items-center">
              <label className="font-medium mr-2 dark:text-gray-200">เรียงลำดับ:</label>
              <div className="relative w-48">
                <select
                  className="w-full border rounded px-3 py-2 pr-8 appearance-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-700 shadow-sm hover:border-blue-400 transition"
                  value={sort}
                  onChange={e => { setSort(e.target.value as 'desc' | 'asc'); setPage(1); }}
                  aria-label="เรียงลำดับอีเมล"
                >
                  <option value="desc">ใหม่ → เก่า (ล่าสุดก่อน)</option>
                  <option value="asc">เก่า → ใหม่ (เก่าสุดก่อน)</option>
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </div>
            </div>
            {/* Infinite scroll loader */}
            <div ref={loaderRef} className="h-px" />
            {loading && <div className="text-center text-gray-400 text-xs mt-2">กำลังโหลดอีเมล...</div>}
            {!hasMore && !loading && (
              <div className="text-center text-gray-400 text-xs mt-2">ไม่มีอีเมลเพิ่มเติม</div>
            )}
            {/* Error is now shown only in main content area */}
            {loading ? (
              <div className="flex flex-col gap-2 mt-8">
                <SkeletonEmailList count={6} />
                <div className="text-center text-gray-400 text-xs mt-2">กำลังโหลดอีเมล...</div>
              </div>
            ) : filteredEmails.length === 0 ? (
              <div className="text-center text-gray-400 mt-8">ไม่พบอีเมล</div>
            ) : (
              <div className="flex flex-col gap-2 overflow-y-auto max-h-[60vh]">
                {filteredEmails.map((email, idx) => (
                  <button
                    key={idx}
                    className={`text-left transition-shadow bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md p-3 flex flex-col gap-1 ${selectedIdx === idx ? 'ring-2 ring-blue-400 border-blue-300' : ''}`}
                    onClick={() => setSelectedIdx(idx)}
                    tabIndex={0}
                    aria-label={`ดูอีเมลหัวข้อ ${email.subject || '(ไม่มีหัวเรื่อง)'}`}
                  >
                    <div className="font-semibold text-base truncate text-gray-900 dark:text-gray-100">{email.subject || <span className="italic text-gray-400 dark:text-gray-500">(ไม่มีหัวเรื่อง)</span>}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-300 truncate">จาก: {email.from || <span className="italic text-gray-400 dark:text-gray-500">(ไม่ระบุ)</span>}</div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">{email.date && new Date(email.date).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {/* Main: Email Content (mobile: full, desktop: right) */}
        {showContent && (
          <div className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6 ml-0 md:ml-4 min-h-[400px] flex flex-col relative">
            {/* Mobile: back button */}
            {isMobile && selectedIdx !== null && (
              <button
                className="absolute left-2 top-2 z-10 flex items-center gap-1 px-3 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-sm font-semibold shadow hover:bg-blue-200 dark:hover:bg-blue-800 transition"
                onClick={() => setSelectedIdx(null)}
                aria-label="ย้อนกลับไปยังรายการอีเมล"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                กลับ
              </button>
            )}
            <div className={isMobile ? 'pt-8' : ''}>
              {loading ? (
                <div className="flex-1 flex flex-col justify-center items-center">
                  <div className="text-gray-400 text-sm mb-4">กำลังโหลดเนื้อหาอีเมล...</div>
                  <SkeletonEmailContent />
                </div>
              ) : error ? (
                <div className="flex flex-1 items-center justify-center"></div>
              ) : emails.length === 0 ? (
                <div className="text-center text-gray-400 my-auto">ไม่พบอีเมล</div>
              ) : selectedIdx === null ? (
                <div className="text-center text-gray-400 my-auto">เลือกอีเมลจากรายการ{isMobile ? '' : 'ทางซ้าย'}เพื่อดูเนื้อหา</div>
              ) : (
                (() => {
                  const email = selectedIdx !== null ? emails[selectedIdx] : undefined;
                  if (!email) return null;
                  return (
                    <div className="flex flex-col gap-2">
                      <div className="mb-2">
                        <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{email.subject || <span className="italic text-gray-400 dark:text-gray-500">(ไม่มีหัวเรื่อง)</span>}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-300">จาก: {email.from || <span className="italic text-gray-400 dark:text-gray-500">(ไม่ระบุ)</span>}</div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">{email.date && new Date(email.date).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })}</div>
                      </div>
                      <div className="text-sm text-gray-700 dark:text-gray-100 whitespace-pre-line break-words overflow-x-auto min-h-[120px] rounded p-3 bg-gray-50 dark:bg-gray-900">
                        {email.body_text ? email.body_text : <span className="italic text-gray-400 dark:text-gray-500">(ไม่มีเนื้อหา)</span>}
                      </div>
                      {/* Attachments */}
                      {email.attachments && email.attachments.length > 0 ? (
                        <div className="mt-4">
                          <div className="font-medium text-gray-700 dark:text-gray-200 mb-1">ไฟล์แนบ:</div>
                          <ul className="list-disc list-inside text-xs text-gray-600 dark:text-gray-300">
                            {email.attachments.map((att: any, i: number) => (
                              <li key={i}>{att.filename} <span className="text-gray-400">({att.size} bytes)</span></li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  );
                })()
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReadMail;
