import Head from 'next/head'
import { useRouter } from 'next/router'

const SECTIONS = [
  {
    icon: '📋',
    title: 'المعلومات التي نجمعها',
    body: [
      'الاسم الكامل وعنوان البريد الإلكتروني ورقم الهاتف عند التسجيل في المنصة.',
      'معلومات الدفع (تُعالَج عبر بوابات دفع آمنة ولا نحتفظ ببيانات بطاقتك).',
      'بيانات التقدم في الكورسات والدروس المكتملة ونتائج الاختبارات.',
      'معلومات الجهاز والمتصفح وعنوان IP لأغراض الأمان وتحسين الخدمة.',
    ],
  },
  {
    icon: '🎯',
    title: 'كيف نستخدم معلوماتك',
    body: [
      'توفير الوصول إلى الكورسات والمحتوى التعليمي الذي اشتركت فيه.',
      'إرسال تحديثات المنصة والإشعارات المتعلقة بتقدمك الدراسي.',
      'التواصل معك للرد على استفساراتك وتقديم الدعم الفني.',
      'تحسين جودة المحتوى والخدمات بناءً على أنماط الاستخدام.',
      'الامتثال للمتطلبات القانونية والتنظيمية المعمول بها.',
    ],
  },
  {
    icon: '🤝',
    title: 'مشاركة البيانات',
    body: [
      'لا نبيع معلوماتك الشخصية لأي طرف ثالث بأي شكل من الأشكال.',
      'قد نشارك بيانات محدودة مع مزودي الخدمات الموثوقين (الدفع، الاستضافة) الملزمين بالسرية.',
      'قد نُفصح عن المعلومات إذا طلب ذلك القانون أو السلطات المختصة.',
    ],
  },
  {
    icon: '🍪',
    title: 'ملفات الارتباط (Cookies)',
    body: [
      'نستخدم ملفات الارتباط الضرورية للحفاظ على جلسة تسجيل دخولك.',
      'لا نستخدم ملفات ارتباط الإعلانات أو التتبع من جهات خارجية.',
      'يمكنك ضبط متصفحك لرفض ملفات الارتباط، لكن ذلك قد يؤثر على وظائف المنصة.',
    ],
  },
  {
    icon: '🔒',
    title: 'أمان البيانات',
    body: [
      'نستخدم تشفير SSL/TLS لحماية جميع البيانات المنقولة بينك وبين المنصة.',
      'يتم تخزين كلمات المرور بشكل مشفر ولا يمكن الاطلاع عليها من قِبل أحد.',
      'نراجع إجراءات الأمان بانتظام لضمان حماية معلوماتك.',
    ],
  },
  {
    icon: '✅',
    title: 'حقوقك',
    body: [
      'الحق في الاطلاع على بياناتك الشخصية المحفوظة لدينا وطلب نسخة منها.',
      'الحق في تصحيح أي معلومات غير دقيقة أو غير مكتملة.',
      'الحق في طلب حذف حسابك وبياناتك الشخصية.',
      'الحق في الاعتراض على معالجة بياناتك لأغراض التسويق.',
      'لممارسة أي من هذه الحقوق تواصل معنا عبر البريد الإلكتروني أدناه.',
    ],
  },
  {
    icon: '👶',
    title: 'خصوصية الأطفال',
    body: [
      'خدماتنا موجهة للأفراد الذين تجاوزوا سن الثامنة عشرة.',
      'إذا علمنا أننا جمعنا بيانات من قاصر دون موافقة ولي الأمر، سنحذفها فوراً.',
    ],
  },
  {
    icon: '🔄',
    title: 'تحديثات هذه السياسة',
    body: [
      'قد نحدّث سياسة الخصوصية هذه من وقت لآخر.',
      'سنخطرك بأي تغييرات جوهرية عبر البريد الإلكتروني أو إشعار في المنصة.',
      'استمرارك في استخدام المنصة بعد التحديث يعني موافقتك على السياسة الجديدة.',
    ],
  },
]

export default function PrivacyPage() {
  const router = useRouter()
  const lastUpdated = 'يوليو 2026'

  return (
    <>
      <Head>
        <title>سياسة الخصوصية — أكاديمية بشار العسلي</title>
        <meta name="description" content="سياسة الخصوصية لأكاديمية بشار العسلي" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet" />
      </Head>

      <div dir="rtl" style={{ minHeight: '100vh', background: '#080D08', fontFamily: "'Tajawal', sans-serif", color: '#E8F0E8' }}>

        {/* Header */}
        <div style={{ background: 'rgba(13,26,13,0.95)', borderBottom: '1px solid rgba(74,222,128,0.12)', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
          <button onClick={() => router.back()} style={{ background: 'none', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 8, padding: '6px 14px', color: '#8AAB8A', fontSize: 13, cursor: 'pointer' }}>
            → رجوع
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid #4ADE80', background: 'radial-gradient(circle at 30% 30%, rgba(74,222,128,0.2), transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#4ADE80', fontWeight: 700, fontSize: 16 }}>ب</span>
            </div>
            <span style={{ color: '#4ADE80', fontWeight: 800, fontSize: 14 }}>أكاديمية بشار العسلي</span>
          </div>
        </div>

        {/* Hero */}
        <div style={{ textAlign: 'center', padding: '60px 24px 40px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔐</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#E8F0E8', margin: '0 0 12px' }}>سياسة الخصوصية</h1>
          <p style={{ fontSize: 15, color: '#8AAB8A', margin: 0 }}>آخر تحديث: {lastUpdated}</p>
          <div style={{ maxWidth: 600, margin: '24px auto 0', padding: '16px 20px', background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.14)', borderRadius: 12, fontSize: 14, color: '#8AAB8A', lineHeight: 1.7 }}>
            نلتزم في أكاديمية بشار العسلي بحماية خصوصيتك وبياناتك الشخصية. توضح هذه السياسة كيف نجمع معلوماتك ونستخدمها ونحمايها.
          </div>
        </div>

        {/* Sections */}
        <div style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 80px' }}>
          {SECTIONS.map((s, i) => (
            <div key={i} style={{ background: '#0C150C', border: '1px solid rgba(74,222,128,0.10)', borderRadius: 16, padding: '24px 28px', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <span style={{ fontSize: 24 }}>{s.icon}</span>
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#E8F0E8' }}>{s.title}</h2>
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {s.body.map((item, j) => (
                  <li key={j} style={{ display: 'flex', gap: 10, fontSize: 14, color: '#8AAB8A', lineHeight: 1.7 }}>
                    <span style={{ color: '#4ADE80', flexShrink: 0, marginTop: 2 }}>✦</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div style={{ background: 'linear-gradient(135deg, rgba(74,222,128,0.08), rgba(74,222,128,0.03))', border: '1px solid rgba(74,222,128,0.20)', borderRadius: 16, padding: '28px', textAlign: 'center', marginTop: 8 }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>📬</div>
            <h3 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 800, color: '#E8F0E8' }}>تواصل معنا</h3>
            <p style={{ margin: '0 0 16px', fontSize: 14, color: '#8AAB8A' }}>لأي استفسار يتعلق بخصوصيتك أو بياناتك الشخصية</p>
            <a href="mailto:basharalasali17@gmail.com" style={{ display: 'inline-block', padding: '10px 24px', background: '#4ADE80', color: '#0A150D', borderRadius: 10, fontSize: 14, fontWeight: 800, textDecoration: 'none' }}>
              basharalasali17@gmail.com
            </a>
          </div>
        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px solid rgba(74,222,128,0.10)', padding: '20px 24px', textAlign: 'center', fontSize: 12, color: '#5C6E5C' }}>
          © {new Date().getFullYear()} أكاديمية بشار العسلي — جميع الحقوق محفوظة
        </div>
      </div>
    </>
  )
}
