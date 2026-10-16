import { Component } from 'react';
import { C } from '../constants/theme';

const TEXTS = {
  tr: { title: 'Bir hata oluştu', body: 'Uygulama beklenmedik bir hatayla karşılaştı. Lütfen sayfayı yenileyin.', btn: 'Sayfayı Yenile' },
  en: { title: 'Something went wrong', body: 'The application encountered an unexpected error. Please refresh the page.', btn: 'Refresh Page' },
  ru: { title: 'Произошла ошибка', body: 'Приложение столкнулось с непредвиденной ошибкой. Пожалуйста, обновите страницу.', btn: 'Обновить страницу' },
  ar: { title: 'حدث خطأ', body: 'واجه التطبيق خطأً غير متوقع. يرجى تحديث الصفحة.', btn: 'تحديث الصفحة' },
};

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      let lang = 'tr';
      try { lang = localStorage.getItem('tyro-lang') || 'tr'; } catch (e) { /* private mode */ }
      const t = TEXTS[lang] || TEXTS.tr;
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Inter,sans-serif', background: '#f5f5f7',
          padding: '2rem',
        }}>
          <div style={{
            textAlign: 'center', padding: '2.5rem',
            background: 'rgba(255,255,255,0.8)',
            borderRadius: 20, maxWidth: 420, width: '100%',
            boxShadow: '0 8px 32px rgba(30,58,95,0.1)',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚠</div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: C.primary, marginBottom: '0.5rem' }}>
              {t.title}
            </h2>
            <p style={{ fontSize: '0.8rem', color: C.text2, marginBottom: '1.5rem', lineHeight: 1.5 }}>
              {t.body}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '0.7rem 2rem', borderRadius: 12, border: 'none',
                background: `linear-gradient(135deg, ${C.primary}, ${C.primarySoft})`,
                color: '#fff', fontSize: '0.85rem', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'Inter,sans-serif',
              }}
            >
              {t.btn}
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
