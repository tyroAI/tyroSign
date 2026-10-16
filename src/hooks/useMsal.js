import { useState, useCallback } from 'react';

// DEMO SÜRÜMÜ — gerçek Azure AD / Microsoft Graph bağlantısı YOK.
// "Giriş Yap" butonu sahte bir hesapla doğrudan uygulamaya sokar; profil, yönetici
// ve e-posta gönderimi tamamen dummy veriyle simüle edilir. Arayüz kurumsal sürümle
// aynı kalsın diye hook'un dönüş imzası birebir korunmuştur.
const MSAL_ENABLED = true;
const SESSION_KEY = 'tyro-demo-session';

const DEMO_ACCOUNT = { name: 'Deniz Aydın', username: 'deniz.aydin@tyrotech.demo' };

const DEMO_PROFILE = {
  firstName: 'Deniz',
  lastName: 'Aydın',
  titleTR: 'Dijital Dönüşüm Uzmanı',
  titleEN: 'Digital Transformation Specialist',
  companyId: 'tyro-tech',
  officeId: 'ist-merkez',
  gsm: '+90 500 000 00 00',
  email: 'deniz.aydin@tyrotech.demo',
  linkedinPersonal: 'linkedin.com/in/deniz-aydin-demo',
};

const DEMO_MANAGER = { name: 'Ayşe Kaya', email: 'ayse.kaya@tyrotech.demo' };

const wait = (ms) => new Promise(r => setTimeout(r, ms));

const hasSession = () => {
  try { return sessionStorage.getItem(SESSION_KEY) === '1'; } catch { return false; }
};

export function useMsal({ toast, lang, setForm }) {
  const [msalAccount, setMsalAccount] = useState(() => {
    if (!hasSession()) return null;
    // Yenilemede oturum korunur; form da dummy profille dolu gelsin.
    setTimeout(() => setForm(prev => ({ ...prev, ...DEMO_PROFILE })), 0);
    return DEMO_ACCOUNT;
  });
  const [authLoading, setAuthLoading] = useState(false);

  const handleLogin = useCallback(async () => {
    setAuthLoading(true);
    await wait(700);
    try { sessionStorage.setItem(SESSION_KEY, '1'); } catch { /* private mode */ }
    setForm(prev => ({ ...prev, ...DEMO_PROFILE }));
    setMsalAccount(DEMO_ACCOUNT);
    setAuthLoading(false);
  }, [setForm]);

  const handleLogout = useCallback(async () => {
    try { sessionStorage.removeItem(SESSION_KEY); } catch { /* private mode */ }
    setMsalAccount(null);
  }, []);

  const fetchManager = useCallback(async () => {
    await wait(400);
    return DEMO_MANAGER;
  }, []);

  const sendMail = useCallback(async () => {
    await wait(1200);
    toast(lang === 'tr' ? 'Demo: e-posta gönderimi simüle edildi' : 'Demo: email sending simulated', 'info');
    return true;
  }, [toast, lang]);

  return { MSAL_ENABLED, msalReady: true, msalAccount, authLoading, handleLogin, handleLogout, fetchManager, sendMail, profilePhoto: null };
}
