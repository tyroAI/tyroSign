import { memo, useState, useMemo, useCallback } from 'react';
import { C } from '../constants/theme';
import { X, ChevronRight } from 'lucide-react';

/* ─── ICONS (inline) ─── */
const SearchIcon = ({ size = 16, color = C.textM }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const BookIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
);
const HelpCircleIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

/* ─── GUIDE STEPS ─── */
const GUIDE_STEPS = {
  tr: [
    { num: 1, title: 'Outlook Hazırlığı', icon: '⚙️', items: [
      'Outlook masaüstü uygulamasında sağ üstteki **"Try the new Outlook"** toggle\'ını açın.',
      'Yeni Outlook açıldığında imza ayarlarına tarayıcı üzerinden erişim sağlanır.',
      'Bu adım **yalnızca bir kere** yapılır — zaten yeni Outlook kullanıyorsanız atlayın.',
    ]},
    { num: 2, title: 'Siteye Giriş', icon: '🔐', items: [
      'Tarayıcınızdan **tyroai.github.io/tyroSign** adresine gidin.',
      'Giriş ekranının altından dil seçimi yapın: **TR / EN / RU / AR**',
      '**"Microsoft ile Giriş Yap"** butonuna tıklayın — şirket e-posta hesabınızla oturum açın.',
      'İlk girişinizde kısa bir **interaktif rehber** sizi karşılar.',
    ]},
    { num: 3, title: 'Bilgilerinizi Tamamlayın', icon: '✏️', items: [
      '**Ad, soyad** ve **profil fotoğrafınız** Microsoft hesabınızdan otomatik gelir.',
      '**Pozisyon adınızı** Türkçe ve İngilizce olarak girin.',
      '**Şirket** seçin (31 grup şirketi) → şirket logosu otomatik değişir.',
      '**Ofis** seçin (21 lokasyon) → adres ve sabit telefon otomatik dolar.',
      'Sağ paneldeki **canlı önizlemede** imzanız anlık güncellenir.',
    ]},
    { num: 4, title: 'Outlook\'a Aktarın', icon: '📧', items: [
      'Araç çubuğundan **"Outlook"** butonuna tıklayın — imza kopyalanır + ayarlar açılır.',
      'Açılan sayfada **"+ Yeni imza"** tıklayın → isim verin (ör: "Kurumsal İmza").',
      'İmza kutusuna tıklayıp **Ctrl+V** ile yapıştırın.',
      '**"Yeni iletiler için"** ve **"Yanıtlar/iletmeler için"** kutularından seçin → **Kaydet**.',
    ]},
    { num: 5, title: 'Ek Araçlar', icon: '🛠️', items: [
      '**QR Kod** — Telefonla okutunca rehbere kişi kaydı oluşturur. Kopyala veya İndir ile paylaşın.',
      '**Kartvizit** — Dijital kartvizit oluşturur. Profil fotoğrafınız Office\'ten gelir, üstüne tıklayıp değiştirebilirsiniz.',
      '**Yöneticime Bildir** — Pozisyon adı değişikliğinde yöneticinize imzanızı mail ile gönderin.',
      '**Promosyon Banner** — İmzanızın altına etkinlik/fuar görseli ekleyin.',
    ]},
  ],
  en: [
    { num: 1, title: 'Outlook Preparation', icon: '⚙️', items: [
      'In Outlook desktop, enable the **"Try the new Outlook"** toggle at the top right.',
      'New Outlook allows browser-based access to signature settings.',
      'This step is done **only once** — skip if already using new Outlook.',
    ]},
    { num: 2, title: 'Sign In', icon: '🔐', items: [
      'Go to **tyroai.github.io/tyroSign** in your browser.',
      'Select your language at the bottom: **TR / EN / RU / AR**',
      'Click **"Sign in with Microsoft"** — use your corporate email account.',
      'An **interactive guide** will greet you on first login.',
    ]},
    { num: 3, title: 'Complete Your Info', icon: '✏️', items: [
      '**Name** and **profile photo** are auto-filled from your Microsoft account.',
      'Enter your **title** in Turkish and English.',
      'Select **Company** (31 group companies) → logo updates automatically.',
      'Select **Office** (21 locations) → address and phone auto-fill.',
      'Your signature updates **in real-time** in the live preview panel.',
    ]},
    { num: 4, title: 'Apply to Outlook', icon: '📧', items: [
      'Click the **"Outlook"** button — signature is copied + settings page opens.',
      'Click **"+ New signature"** → give it a name (e.g. "Corporate Signature").',
      'Click the signature box and paste with **Ctrl+V**.',
      'Select your signature for **"New messages"** and **"Replies/forwards"** → **Save**.',
    ]},
    { num: 5, title: 'Additional Tools', icon: '🛠️', items: [
      '**QR Code** — Scan with phone to save contact to address book. Copy or Download to share.',
      '**Business Card** — Creates a digital card. Profile photo comes from Office, click to change.',
      '**Notify Manager** — Send your signature to your manager via email when title changes.',
      '**Promo Banner** — Add event/fair visuals below your signature.',
    ]},
  ],
  ru: [
    { num: 1, title: 'Подготовка Outlook', icon: '⚙️', items: [
      'В Outlook включите переключатель **"Try the new Outlook"** в правом верхнем углу.',
      'Новый Outlook обеспечивает доступ к настройкам подписи через браузер.',
      'Этот шаг выполняется **только один раз**.',
    ]},
    { num: 2, title: 'Вход в систему', icon: '🔐', items: [
      'Откройте **tyroai.github.io/tyroSign** в браузере.',
      'Выберите язык внизу: **TR / EN / RU / AR**',
      'Нажмите **«Войти через Microsoft»** — используйте корпоративную почту.',
      'При первом входе вас встретит **интерактивный гид**.',
    ]},
    { num: 3, title: 'Заполните данные', icon: '✏️', items: [
      '**Имя** и **фото профиля** заполняются автоматически из Microsoft.',
      'Введите **должность** на турецком и английском языках.',
      'Выберите **компанию** (31 компания) → логотип обновится автоматически.',
      'Выберите **офис** (21 локация) → адрес и телефон заполнятся.',
      'Подпись обновляется **в реальном времени** в панели предпросмотра.',
    ]},
    { num: 4, title: 'Применить в Outlook', icon: '📧', items: [
      'Нажмите кнопку **«Outlook»** — подпись копируется + откроются настройки.',
      'Нажмите **«+ Новая подпись»** → дайте имя (напр. «Корпоративная подпись»).',
      'Вставьте с помощью **Ctrl+V**.',
      'Выберите подпись для **новых сообщений** и **ответов** → **Сохранить**.',
    ]},
    { num: 5, title: 'Дополнительные инструменты', icon: '🛠️', items: [
      '**QR-код** — Сканируйте телефоном для сохранения контакта.',
      '**Визитка** — Создаёт цифровую визитку с фото профиля из Office.',
      '**Уведомить руководителя** — Отправьте подпись руководителю по почте.',
      '**Промо-баннер** — Добавьте визуал мероприятия под подпись.',
    ]},
  ],
  ar: [
    { num: 1, title: 'تحضير Outlook', icon: '⚙️', items: [
      'في Outlook، قم بتفعيل مفتاح **"Try the new Outlook"** في أعلى اليمين.',
      'يتيح Outlook الجديد الوصول إلى إعدادات التوقيع عبر المتصفح.',
      'هذه الخطوة تتم **مرة واحدة فقط**.',
    ]},
    { num: 2, title: 'تسجيل الدخول', icon: '🔐', items: [
      'انتقل إلى **tyroai.github.io/tyroSign** في المتصفح.',
      'اختر لغتك من الأسفل: **TR / EN / RU / AR**',
      'انقر على **"تسجيل الدخول عبر Microsoft"** — استخدم بريدك المؤسسي.',
      'سيرحب بك **دليل تفاعلي** عند أول تسجيل دخول.',
    ]},
    { num: 3, title: 'أكمل بياناتك', icon: '✏️', items: [
      '**الاسم** و**صورة الملف الشخصي** تُملأ تلقائيًا من حساب Microsoft.',
      'أدخل **المسمى الوظيفي** بالتركية والإنجليزية.',
      'اختر **الشركة** (31 شركة) → يتغير الشعار تلقائيًا.',
      'اختر **المكتب** (21 موقعًا) → يُملأ العنوان والهاتف تلقائيًا.',
      'يتم تحديث التوقيع **فورًا** في لوحة المعاينة.',
    ]},
    { num: 4, title: 'تطبيق في Outlook', icon: '📧', items: [
      'انقر على زر **"Outlook"** — يُنسخ التوقيع + تُفتح الإعدادات.',
      'انقر **"+ توقيع جديد"** → أعطه اسمًا (مثال: "التوقيع المؤسسي").',
      'الصق باستخدام **Ctrl+V**.',
      'اختر التوقيع لـ**الرسائل الجديدة** و**الردود** → **حفظ**.',
    ]},
    { num: 5, title: 'أدوات إضافية', icon: '🛠️', items: [
      '**رمز QR** — امسحه بالهاتف لحفظ جهة الاتصال.',
      '**بطاقة العمل** — تنشئ بطاقة رقمية مع صورة الملف من Office.',
      '**إبلاغ المدير** — أرسل توقيعك للمدير عبر البريد الإلكتروني.',
      '**بانر ترويجي** — أضف صور الفعاليات أسفل توقيعك.',
    ]},
  ],
};

/* ─── FAQ ─── */
const FAQ = {
  tr: [
    { q: 'İmzam tüm e-postalarda otomatik görünecek mi?', a: 'Evet, Outlook imza ayarlarında "Yeni iletiler için" ve "Yanıtlar/iletmeler için" kutularından imzanızı seçtiğinizde tüm yeni gönderimlerinizde otomatik görünür.' },
    { q: 'Pozisyon adım değişti, ne yapmalıyım?', a: 'Siteye tekrar girip pozisyon adınızı güncelleyin, "Outlook" butonuyla yeni imzayı Outlook\'a aktarın. Ardından "Yöneticime Bildir" ile değişikliği bildirmenizi öneririz.' },
    { q: 'Profil fotoğrafımı nasıl değiştirebilirim?', a: 'Kartvizit ekranında profil fotoğrafınıza tıklayın ve yeni bir fotoğraf yükleyin. Fotoğraf yalnızca dijital kartvizitte görünür, e-posta imzasında yer almaz.' },
    { q: 'QR kodu ne işe yarar?', a: 'QR kod, telefon kamerasıyla okutulduğunda ad, pozisyon adı, telefon, e-posta ve adres bilgilerinizi karşı tarafın rehberine otomatik kaydeder (vCard formatı).' },
    { q: 'Birden fazla imza oluşturabilir miyim?', a: 'Evet, farklı pozisyon adı veya şirket bilgileriyle birden fazla imza oluşturup Outlook\'a ekleyebilirsiniz. Her seferinde farklı bir isimle kaydedin.' },
    { q: 'İmza tasarımını özelleştirebilir miyim?', a: 'İmza stilini, İmza sekmesindeki "Canlı Önizleme" başlığının yanındaki tasarım seçiciden değiştirebilirsiniz. Renkleri, sosyal medya bağlantılarını ve sağ blok görünümünü ise Ayarlar sekmesinden özelleştirebilirsiniz.' },
    { q: 'Telefonumda da çalışır mı?', a: 'Evet, uygulama mobil uyumludur. Ancak imzayı Outlook\'a aktarma işlemi masaüstü tarayıcıdan yapılmalıdır.' },
    { q: 'Promosyon banner nedir?', a: 'İmzanızın altına etkinlik, fuar veya kampanya görseli ekleyebilirsiniz. PNG/JPG/GIF formatında, max 2MB, önerilen genişlik 600px.' },
    { q: 'Verilerim güvende mi?', a: 'Evet, tüm işlemler tarayıcınızda gerçekleşir. Verileriniz sunucuya gönderilmez, yalnızca Microsoft oturum doğrulaması için Azure AD kullanılır.' },
    { q: 'LinkedIn banner nasıl oluşturulur?', a: 'LinkedIn sekmesinden şirket seçip başlık ve alt başlık girin. Oluşan banneri PNG olarak indirip LinkedIn profil arka planınıza yükleyin.' },
  ],
  en: [
    { q: 'Will my signature appear in all emails automatically?', a: 'Yes, once you select your signature for "New messages" and "Replies/forwards" in Outlook settings, it will appear automatically in all outgoing emails.' },
    { q: 'My title changed, what should I do?', a: 'Log in again, update your title, apply to Outlook with the "Outlook" button, and use "Notify Manager" to inform your supervisor.' },
    { q: 'How do I change my profile photo?', a: 'Click your profile photo in the Business Card screen to upload a new one. The photo appears only on the digital card, not in the email signature.' },
    { q: 'What does the QR code do?', a: 'When scanned with a phone camera, the QR code saves your name, title, phone, email, and address to the recipient\'s contacts (vCard format).' },
    { q: 'Can I create multiple signatures?', a: 'Yes, create multiple signatures with different titles or companies and save each with a unique name in Outlook.' },
    { q: 'Can I customize the signature design?', a: 'Pick the signature style from the design selector next to the "Live Preview" heading on the Signature tab. Colors, social media links and right block appearance are customized in the Settings tab.' },
    { q: 'Does it work on mobile?', a: 'Yes, the app is mobile-friendly. However, applying the signature to Outlook should be done from a desktop browser.' },
    { q: 'What is the promo banner?', a: 'You can add event, fair, or campaign visuals below your signature. Supported formats: PNG/JPG/GIF, max 2MB, recommended width 600px.' },
    { q: 'Is my data secure?', a: 'Yes, all operations happen in your browser. No data is sent to any server — only Azure AD is used for authentication.' },
    { q: 'How do I create a LinkedIn banner?', a: 'Go to the LinkedIn tab, select a company, enter title and subtitle. Download the banner as PNG and upload it to your LinkedIn profile background.' },
  ],
  ru: [
    { q: 'Подпись будет автоматически отображаться во всех письмах?', a: 'Да, после выбора подписи для «Новых сообщений» и «Ответов/пересылок» в настройках Outlook она будет автоматически добавляться ко всем исходящим письмам.' },
    { q: 'Моя должность изменилась, что делать?', a: 'Войдите снова, обновите должность, нажмите «Outlook» для применения и используйте «Уведомить руководителя».' },
    { q: 'Как изменить фото профиля?', a: 'Нажмите на фото в экране «Визитка» и загрузите новое. Фото отображается только на цифровой визитке.' },
    { q: 'Для чего нужен QR-код?', a: 'При сканировании камерой телефона QR-код сохраняет ваши контактные данные в адресной книге получателя (формат vCard).' },
    { q: 'Можно ли создать несколько подписей?', a: 'Да, создайте несколько подписей с разными данными и сохраните каждую под уникальным именем в Outlook.' },
    { q: 'Мои данные в безопасности?', a: 'Да, все операции происходят в вашем браузере. Данные не отправляются на сервер.' },
  ],
  ar: [
    { q: 'هل سيظهر توقيعي تلقائيًا في جميع الرسائل؟', a: 'نعم، بعد اختيار توقيعك لـ"الرسائل الجديدة" و"الردود/إعادة التوجيه" في إعدادات Outlook، سيظهر تلقائيًا في جميع الرسائل الصادرة.' },
    { q: 'تغير مسماي الوظيفي، ماذا أفعل؟', a: 'سجّل الدخول مجددًا، حدّث المسمى، انقر "Outlook" لتطبيقه، واستخدم "إبلاغ المدير".' },
    { q: 'كيف أغيّر صورة ملفي الشخصي؟', a: 'انقر على صورتك في شاشة "بطاقة العمل" وارفع صورة جديدة.' },
    { q: 'ما فائدة رمز QR؟', a: 'عند مسحه بكاميرا الهاتف، يحفظ رمز QR بيانات الاتصال في دفتر عناوين المستلم (صيغة vCard).' },
    { q: 'هل بياناتي آمنة؟', a: 'نعم، جميع العمليات تتم في متصفحك. لا تُرسل أي بيانات إلى خادم خارجي.' },
  ],
};

/* ─── TEXT LABELS ─── */
const LABELS = {
  tr: { title: 'Yardım Merkezi', guide: 'Başlangıç Rehberi', faq: 'Sık Sorulan Sorular', search: 'Yardım konusu ara...', noResult: 'Sonuç bulunamadı', back: 'Geri Dön', tip: 'Ctrl+C kısayolu ile imzanızı hızlıca kopyalayabilirsiniz.' },
  en: { title: 'Help Center', guide: 'Getting Started', faq: 'Frequently Asked Questions', search: 'Search help topics...', noResult: 'No results found', back: 'Go Back', tip: 'You can quickly copy your signature with Ctrl+C shortcut.' },
  ru: { title: 'Центр помощи', guide: 'Начало работы', faq: 'Часто задаваемые вопросы', search: 'Поиск по темам помощи...', noResult: 'Результатов не найдено', back: 'Назад', tip: 'Используйте Ctrl+C для быстрого копирования подписи.' },
  ar: { title: 'مركز المساعدة', guide: 'دليل البدء', faq: 'الأسئلة الشائعة', search: 'ابحث في مواضيع المساعدة...', noResult: 'لم يتم العثور على نتائج', back: 'الرجوع', tip: 'يمكنك نسخ توقيعك بسرعة باستخدام Ctrl+C.' },
};

/* ─── Bold text renderer ─── */
const RichText = ({ text }) => {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1
      ? <strong key={i} style={{ color: C.primary, fontWeight: 700 }}>{part}</strong>
      : <span key={i}>{part}</span>
  );
};

/* ─── FAQ Item ─── */
const FaqItem = memo(({ q, a, open, onToggle }) => (
  <div style={{
    borderRadius: 10, border: `1px solid ${open ? C.accent + '40' : C.borderSub}`,
    background: open ? `${C.accent}05` : '#fff',
    transition: 'all 0.2s ease', marginBottom: '0.45rem',
    overflow: 'hidden',
  }}>
    <button onClick={onToggle} style={{
      width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem',
      padding: '0.6rem 0.75rem', border: 'none', background: 'transparent',
      cursor: 'pointer', textAlign: 'left', fontFamily: 'Inter,sans-serif',
    }}>
      <ChevronRight size={13} style={{
        color: open ? C.accent : C.textM, flexShrink: 0,
        transition: 'transform 0.2s ease',
        transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
      }} />
      <span style={{ fontSize: '0.74rem', fontWeight: 600, color: open ? C.primary : C.text1, flex: 1 }}>{q}</span>
    </button>
    {open && (
      <div style={{
        padding: '0 0.75rem 0.65rem 2rem',
        fontSize: '0.7rem', color: C.text2, lineHeight: 1.65,
        animation: 'fadeIn 0.2s ease',
      }}>
        {a}
      </div>
    )}
  </div>
));

/* ═══════════════════════════════════════════════════
   HELP PAGE
   ═══════════════════════════════════════════════════ */
const HelpPage = memo(({ lang, onBack }) => {
  const [search, setSearch] = useState('');
  const [openFaq, setOpenFaq] = useState(-1);

  const labels = LABELS[lang] || LABELS.en;
  const steps = GUIDE_STEPS[lang] || GUIDE_STEPS.en;
  const faqs = FAQ[lang] || FAQ.en;

  const q = search.trim().toLowerCase();

  const filteredSteps = useMemo(() => {
    if (!q) return steps;
    return steps.filter(s =>
      s.title.toLowerCase().includes(q) ||
      s.items.some(item => item.replace(/\*\*/g, '').toLowerCase().includes(q))
    );
  }, [steps, q]);

  const filteredFaqs = useMemo(() => {
    if (!q) return faqs;
    return faqs.filter(f =>
      f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q)
    );
  }, [faqs, q]);

  const hasResults = filteredSteps.length > 0 || filteredFaqs.length > 0;

  const toggleFaq = useCallback((i) => setOpenFaq(prev => prev === i ? -1 : i), []);

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out', maxWidth: 720, margin: '0 auto', padding: '0.5rem 0' }}>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.2rem',
      }}>
        <button onClick={onBack} style={{
          display: 'flex', alignItems: 'center', gap: '0.3rem',
          background: 'none', border: `1.5px solid ${C.borderSub}`, borderRadius: 10,
          padding: '0.4rem 0.7rem', cursor: 'pointer',
          fontSize: '0.68rem', fontWeight: 600, color: C.text2,
          fontFamily: 'Inter,sans-serif', transition: 'all 0.15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.color = C.accent; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = C.borderSub; e.currentTarget.style.color = C.text2; }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>
          </svg>
          {labels.back}
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{
            fontSize: '1.15rem', fontWeight: 800, color: C.primary,
            fontFamily: "'Plus Jakarta Sans',sans-serif", margin: 0, letterSpacing: '-0.02em',
          }}>
            {labels.title}
          </h1>
        </div>
      </div>

      {/* Search */}
      <div style={{
        position: 'relative', marginBottom: '1.2rem',
      }}>
        <div style={{
          position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
          pointerEvents: 'none', display: 'flex',
        }}>
          <SearchIcon size={15} color={search ? C.accent : C.textM} />
        </div>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={labels.search}
          style={{
            width: '100%', padding: '0.6rem 0.65rem 0.6rem 2.2rem',
            borderRadius: 12, border: `1.5px solid ${search ? C.accent + '60' : C.borderSub}`,
            background: '#fff', fontSize: '0.78rem', color: C.text1,
            fontFamily: 'Inter,sans-serif', outline: 'none',
            transition: 'border-color 0.2s', boxSizing: 'border-box',
          }}
          onFocus={e => e.target.style.borderColor = C.accent + '60'}
          onBlur={e => { if (!search) e.target.style.borderColor = C.borderSub; }}
        />
        {search && (
          <button onClick={() => setSearch('')} style={{
            position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
            background: `${C.primary}10`, border: 'none', borderRadius: '50%',
            width: 20, height: 20, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <X size={11} color={C.textM} />
          </button>
        )}
      </div>

      {!hasResults && (
        <div style={{
          textAlign: 'center', padding: '2rem', color: C.textM, fontSize: '0.8rem',
          fontFamily: 'Inter,sans-serif',
        }}>
          <HelpCircleIcon size={32} />
          <div style={{ marginTop: 8 }}>{labels.noResult}</div>
        </div>
      )}

      {/* ── GUIDE SECTION ── */}
      {filteredSteps.length > 0 && (
        <>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.65rem',
          }}>
            <BookIcon size={15} />
            <span style={{
              fontSize: '0.82rem', fontWeight: 700, color: C.primary,
              fontFamily: "'Plus Jakarta Sans',sans-serif",
            }}>
              {labels.guide}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', marginBottom: '1.4rem' }}>
            {filteredSteps.map(step => (
              <div key={step.num} style={{
                display: 'flex', gap: '0.65rem',
                background: '#fff', borderRadius: 12,
                border: `1px solid ${C.borderSub}`,
                padding: '0.7rem 0.8rem',
                transition: 'box-shadow 0.2s',
              }}>
                {/* Number badge */}
                <div style={{
                  width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                  background: `linear-gradient(135deg, ${C.primary}, ${C.primarySoft || '#2a5f9e'})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: '0.72rem', fontWeight: 800,
                  fontFamily: "'Plus Jakarta Sans',sans-serif",
                  boxShadow: `0 2px 6px ${C.primary}25`,
                }}>
                  {step.num}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '0.76rem', fontWeight: 700, color: C.primary,
                    fontFamily: "'Plus Jakarta Sans',sans-serif", marginBottom: '0.3rem',
                    display: 'flex', alignItems: 'center', gap: '0.35rem',
                  }}>
                    <span>{step.icon}</span> {step.title}
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '1rem', listStyle: 'none' }}>
                    {step.items.map((item, i) => (
                      <li key={i} style={{
                        fontSize: '0.68rem', color: C.text2, lineHeight: 1.65,
                        marginBottom: '0.15rem', position: 'relative', paddingLeft: '0.6rem',
                      }}>
                        <span style={{
                          position: 'absolute', left: 0, top: '0.45em',
                          width: 4, height: 4, borderRadius: '50%',
                          background: C.accent, display: 'inline-block',
                        }} />
                        <RichText text={item} />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── FAQ SECTION ── */}
      {filteredFaqs.length > 0 && (
        <>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.65rem',
          }}>
            <HelpCircleIcon size={15} />
            <span style={{
              fontSize: '0.82rem', fontWeight: 700, color: C.primary,
              fontFamily: "'Plus Jakarta Sans',sans-serif",
            }}>
              {labels.faq}
            </span>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            {filteredFaqs.map((f, i) => (
              <FaqItem
                key={i}
                q={f.q}
                a={f.a}
                open={openFaq === i}
                onToggle={() => toggleFaq(i)}
              />
            ))}
          </div>
        </>
      )}

      {/* ── TIP BOX ── */}
      <div style={{
        background: `${C.divider || C.accent}08`,
        border: `1px solid ${C.divider || C.accent}20`,
        borderLeft: `3px solid ${C.divider || C.accent}`,
        borderRadius: '0 10px 10px 0',
        padding: '0.55rem 0.75rem',
        marginBottom: '0.5rem',
      }}>
        <span style={{ fontSize: '0.68rem', color: C.text2, lineHeight: 1.6 }}>
          <strong style={{ color: C.divider || C.accent }}>💡 </strong>
          {labels.tip}
        </span>
      </div>
    </div>
  );
});

export default HelpPage;
