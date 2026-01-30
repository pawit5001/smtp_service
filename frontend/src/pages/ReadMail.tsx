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
  const [accounts, setAccounts] = useState<any[]>(() => {
    try {
      const { loadAccounts } = require('../utils/crypto');
      return loadAccounts();
    } catch {
      return [];
    }
  });
  const [selectedAccountIdx, setSelectedAccountIdx] = useState(0);
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
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
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

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto w-full px-4 pt-4 pb-0">
        <div className="mb-2 text-xs text-gray-600 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-3 py-2">
          <span className="font-semibold text-gray-800 dark:text-gray-100">บัญชีที่ใช้ในการอ่านเมล:</span> {activeEmail} {isDefaultEmail && <span className="text-gray-400">(ค่าเริ่มต้น)</span>}
          {accounts.length > 1 && (
            <div className="mt-2">
              <label className="mr-2 font-medium">เลือกบัญชี:</label>
              <select
                className="border rounded px-2 py-1 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-700"
                value={selectedAccountIdx}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { setSelectedAccountIdx(Number(e.target.value)); setSelectedIdx(null); setPage(1); }}
                title="เลือกบัญชีอีเมลที่ใช้ในการอ่าน"
                aria-label="เลือกบัญชีอีเมลที่ใช้ในการอ่าน"
              >
                {accounts.map((acc, i) => {
                  const sep = acc.includes('|') ? '|' : acc.includes(':') ? ':' : '|';
                  const email = acc.split(sep)[0];
                  return <option value={i} key={i}>{email}</option>;
                })}
              </select>
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 flex flex-col md:flex-row max-w-4xl mx-auto w-full px-4 py-6 gap-4">
        {/* Sidebar: Email List */}
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
          <div ref={loaderRef} style={{ height: 1 }} />
          {loading && <div className="text-center text-gray-400 text-xs mt-2">กำลังโหลดอีเมล...</div>}
          {!hasMore && !loading && (
            <div className="text-center text-gray-400 text-xs mt-2">ไม่มีอีเมลเพิ่มเติม</div>
          )}
          {error && !loading && <div className="text-red-500 text-xs mb-2">{error}</div>}
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
        {/* Main: Email Content */}
        <div className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6 ml-0 md:ml-4 min-h-[400px] flex flex-col">
          {loading ? (
            <div className="flex-1 flex flex-col justify-center items-center">
              <div className="text-gray-400 text-sm mb-4">กำลังโหลดเนื้อหาอีเมล...</div>
              <SkeletonEmailContent />
            </div>
          ) : error ? (
            <div className="text-red-500 text-center my-auto">{error}</div>
          ) : emails.length === 0 ? (
            <div className="text-center text-gray-400 my-auto">ไม่พบอีเมล</div>
          ) : selectedIdx === null ? (
            <div className="text-center text-gray-400 my-auto">เลือกอีเมลจากรายการทางซ้ายเพื่อดูเนื้อหา</div>
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
    </div>
  );
};

export default ReadMail;
