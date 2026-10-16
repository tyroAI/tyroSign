import { useState, useEffect, useCallback, useRef } from 'react';
import { X, Mail, Send, User } from 'lucide-react';
import { C } from '../constants/theme';
import html2canvas from 'html2canvas';

const overlay = {
  position: 'fixed', inset: 0, zIndex: 1100,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'rgba(15,25,40,0.45)', backdropFilter: 'blur(8px)',
  animation: 'fadeIn 0.2s ease',
};

const modal = {
  width: '95vw', maxWidth: 640, maxHeight: '92vh',
  background: '#fff', borderRadius: 14,
  boxShadow: '0 24px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(255,255,255,0.12)',
  display: 'flex', flexDirection: 'column', overflow: 'hidden',
  animation: 'slideUp 0.25s cubic-bezier(0.22,1,0.36,1)',
};

const header = {
  display: 'flex', alignItems: 'center', gap: '0.5rem',
  padding: '0.75rem 1rem',
  background: C.primary, color: '#fff',
  fontFamily: 'Plus Jakarta Sans,Inter,sans-serif',
};

const fieldRow = {
  display: 'flex', alignItems: 'center', gap: '0.5rem',
  padding: '0.5rem 1rem',
  borderBottom: `1px solid ${C.borderSub}`,
  fontSize: '0.78rem', fontFamily: 'Inter,sans-serif',
};

const fieldLabel = {
  fontWeight: 700, color: C.text2, minWidth: 48,
  fontSize: '0.72rem',
};

const fieldInput = {
  flex: 1, border: 'none', outline: 'none',
  fontSize: '0.78rem', fontFamily: 'Inter,sans-serif',
  color: C.text1, background: 'transparent',
  padding: '0.25rem 0',
};

const bodyArea = {
  flex: 1, minHeight: 120, resize: 'vertical',
  border: 'none', outline: 'none',
  fontSize: '0.78rem', fontFamily: 'Inter,sans-serif',
  color: C.text1, lineHeight: 1.6, width: '100%',
  padding: '0.75rem 1rem',
};

const sigBox = {
  margin: '0 1rem 0.75rem',
  padding: '0.75rem',
  background: '#fafbfc',
  border: `1px solid ${C.borderSub}`,
  borderRadius: 8,
  overflowX: 'auto',
};

const footerBar = {
  display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem',
  padding: '0.65rem 1rem',
  borderTop: `1px solid ${C.borderSub}`,
  background: '#fafbfc',
};

const btnBase = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
  padding: '0.5rem 1.2rem', borderRadius: 8, border: 'none',
  fontSize: '0.75rem', fontWeight: 600, fontFamily: 'Inter,sans-serif',
  cursor: 'pointer', transition: 'all 0.15s ease',
};

export default function NotifyManagerModal({ open, onClose, form, sigHTML, toast, L, lang, fetchManager, sendMail }) {
  const [toEmail, setToEmail] = useState('');
  const [toName, setToName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const sigRef = useRef(null);

  const fullName = `${form.firstName} ${form.lastName}`.trim();

  // Fetch manager info on mount
  useEffect(() => {
    if (!open) return;
    setSubject(L.notifySubjectDef);
    setLoading(true);

    fetchManager().then(mgr => {
      if (mgr) {
        setToEmail(mgr.email);
        setToName(mgr.name);
        setBody(L.notifyBodyDef.replace('{manager}', mgr.name).replace('{name}', fullName));
      } else {
        setToEmail('');
        setToName('');
        setBody(L.notifyBodyDef.replace('{manager}', '').replace('{name}', fullName));
        toast(L.notifyNoMgr, 'warn');
      }
      setLoading(false);
    });
  }, [open]);

  const handleSend = useCallback(async () => {
    if (!toEmail.trim()) {
      toast({ tr: 'Alıcı e-posta adresi boş olamaz', en: 'Recipient email cannot be empty', ru: 'Адрес электронной почты получателя не может быть пустым', ar: 'لا يمكن أن يكون عنوان البريد الإلكتروني فارغًا' }[lang] || 'Recipient email cannot be empty', 'err');
      return;
    }
    setSending(true);

    try {
      // Capture signature preview as PNG
      let sigImgHtml = sigHTML;
      const attachments = [];

      if (sigRef.current) {
        const canvas = await html2canvas(sigRef.current, {
          scale: 2, backgroundColor: '#ffffff', useCORS: true,
        });
        const dataUrl = canvas.toDataURL('image/png');
        const base64Data = dataUrl.split(',')[1];
        attachments.push({
          '@odata.type': '#microsoft.graph.fileAttachment',
          name: 'signature.png',
          contentType: 'image/png',
          contentBytes: base64Data,
          contentId: 'sig-preview',
          isInline: true,
        });
        sigImgHtml = '<img src="cid:sig-preview" alt="Email Signature" style="display:block;max-width:680px;width:100%;height:auto;border:0;" />';
      }

      const textHtml = body.split('\n').map(line => `<p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:14px;color:#333;">${line || '&nbsp;'}</p>`).join('');
      const htmlBody = textHtml + '<br/>' + sigImgHtml;

      const ok = await sendMail({ to: toEmail.trim(), subject, htmlBody, attachments });
      setSending(false);
      if (ok) {
        toast(L.notifySent, 'ok');
        onClose();
      } else {
        toast(L.notifyFail, 'err');
      }
    } catch (err) {
      if (import.meta.env.DEV) console.error('Send error:', err);
      setSending(false);
      toast(L.notifyFail, 'err');
    }
  }, [toEmail, subject, body, sigHTML, sendMail, toast, L, onClose]);

  if (!open) return null;

  return (
    <div style={overlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }} role="dialog" aria-modal="true">
      <div style={modal}>
        {/* Header — Outlook-style title bar */}
        <div style={header}>
          <Mail size={16} />
          <span style={{ flex: 1, fontWeight: 700, fontSize: '0.85rem' }}>{L.notifyTitle}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 4, display: 'flex' }}>
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: C.textM, fontSize: '0.8rem' }}>
            <div style={{
              width: 28, height: 28, border: `3px solid ${C.borderSub}`, borderTopColor: C.divider,
              borderRadius: '50%', margin: '0 auto 0.75rem',
              animation: 'spin 0.8s linear infinite',
            }} />
            {L.notifyLoading}
          </div>
        ) : (
          <>
            {/* To field */}
            <div style={fieldRow}>
              <span style={fieldLabel}>{L.notifyTo}:</span>
              <User size={14} style={{ color: C.textM }} />
              {toName && (
                <span style={{
                  background: `${C.divider}15`, color: C.primary,
                  padding: '0.15rem 0.5rem', borderRadius: 12,
                  fontSize: '0.7rem', fontWeight: 600,
                }}>{toName}</span>
              )}
              <input
                type="email"
                value={toEmail}
                onChange={e => setToEmail(e.target.value)}
                placeholder={lang === 'tr' ? 'yonetici@tyrotech.demo' : 'manager@tyrotech.demo'}
                style={fieldInput}
              />
            </div>

            {/* Subject field */}
            <div style={fieldRow}>
              <span style={fieldLabel}>{L.notifySubjectL}:</span>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                style={fieldInput}
              />
            </div>

            {/* Body textarea */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                style={bodyArea}
                rows={6}
              />

              {/* Signature preview */}
              <div style={{ padding: '0 1rem 0.35rem' }}>
                <span style={{ fontSize: '0.6rem', fontWeight: 700, color: C.textM, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {L.notifySigPreview}
                </span>
              </div>
              <div style={sigBox}>
                <div ref={sigRef} dangerouslySetInnerHTML={{ __html: sigHTML }} />
              </div>
            </div>

            {/* Footer buttons */}
            <div style={footerBar}>
              <button onClick={onClose} style={{ ...btnBase, background: '#f1f3f5', color: C.text2 }}>
                {L.notifyCancel}
              </button>
              <button
                onClick={handleSend}
                disabled={sending}
                style={{
                  ...btnBase,
                  background: sending ? C.textM : C.divider,
                  color: '#fff',
                  opacity: sending ? 0.7 : 1,
                  cursor: sending ? 'not-allowed' : 'pointer',
                  boxShadow: sending ? 'none' : `0 2px 8px ${C.divider}40`,
                }}
              >
                <Send size={13} />
                {sending ? L.notifySending : L.notifySend}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
