import bcrypt from 'bcryptjs'

const CDN = 'https://coachbasharalasali.b-cdn.net'

export const COURSES = {
  comprehensive: {
    id: 'comprehensive',
    nameAr: 'الدورة الشاملة على eBay',
    nameEn: 'Comprehensive eBay Course',
    descAr: 'دورة متكاملة تغطي كل جوانب البيع والربح على eBay — 86 درساً',
    descEn: 'Complete course covering all aspects of eBay selling — 86 lessons',
    lessons: Array.from({ length: 86 }, (_, i) => i + 1),
    hours: 18,
    icon: '🏆'
  },
  intermediate: {
    id: 'intermediate',
    nameAr: 'الدورة المتوسطة على eBay',
    nameEn: 'Intermediate eBay Course',
    descAr: 'دورة متكاملة من الدرس الأول حتى الدرس 75 مع رسالة الختام — 76 درساً',
    descEn: 'Complete course from lesson 1 to 75 plus closing message — 76 lessons',
    lessons: [...Array.from({ length: 75 }, (_, i) => i + 1), 86],
    hours: 12,
    icon: '📈'
  },
  basic: {
    id: 'basic',
    nameAr: 'الدورة الأساسية على eBay',
    nameEn: 'Basic eBay Course',
    descAr: 'دورة متكاملة من الدرس الأول حتى الدرس 75 مع رسالة الختام — 76 درساً',
    descEn: 'Complete course from lesson 1 to 75 plus closing message — 76 lessons',
    lessons: [...Array.from({ length: 75 }, (_, i) => i + 1), 86],
    hours: 6,
    icon: '🌱'
  }
}

export const USERS = {
  "student1": {
    name: "أحمد الخالد",
    avatar: "أخ",
    role: "student",
    passwordHash: "$2a$10$dog035qIUMHO6IltcppIUOAW.EbpFLZ3rm.9aXgV/NQInfb8FXXU.",
    progress: {},
    quizScores: {},
    allowedCourse: "comprehensive",
    joinedAt: "2024-01-15"
  },
  "sarah": {
    name: "سارة المنصور",
    avatar: "سم",
    role: "student",
    passwordHash: "$2a$10$qx1i7.RvXrYNAdSQT8Z0MOT7qCUn9B2ZscPCTUw/ZBcnHWLRtwOXm",
    progress: {},
    quizScores: {},
    allowedCourse: "intermediate",
    joinedAt: "2024-01-20"
  },
  "bashar": {
    name: "بشار العسلي",
    avatar: "بع",
    role: "admin",
    passwordHash: "$2a$10$U67Nd/q42cpThMd/9pRtwuTr9UO5DpQ03euRCWyFbil7tanKX2DA6",
    progress: {},
    quizScores: {},
    joinedAt: "2024-01-01"
  }
}

export const LESSONS = [
  { id: 1, title: 'مقدمة عن الدورة', titleEn: 'Course Introduction', duration: '20 دقيقة', durationEn: '20 min', desc: 'نظرة عامة على ما ستتعلمه في هذه الدورة', descEn: 'Overview of what you will learn in this course', free: true, videoUrl: `${CDN}/1-%D9%85%D9%82%D8%AF%D9%85%D8%A9%20%D8%B9%D9%86%20%D8%A7%D9%84%D8%AF%D9%88%D8%B1%D8%A9.mp4` },
  { id: 2, title: 'قصتي وكيف بدأت على إيباي', titleEn: 'My Story & How I Started on eBay', duration: '35 دقيقة', durationEn: '35 min', desc: 'قصة الكوتش بشار وكيف بدأ رحلته على eBay', descEn: 'Coach Bashar\'s story and how he started on eBay', free: true, videoUrl: `${CDN}/2-%D9%82%D8%B5%D8%AA%D9%8A%20%D9%88%D9%83%D9%8A%D9%81%20%D8%A8%D8%AF%D8%A3%D8%AA%20%D8%B9%D9%84%D9%89%20%D8%A5%D9%8A%D8%A8%D8%A7%D9%8A%20.mp4` },
  { id: 3, title: 'إثبات النتائج صور وشواهد', titleEn: 'Proof of Results', duration: '19 دقيقة', durationEn: '19 min', desc: 'نتائج حقيقية وأرباح موثقة من eBay', descEn: 'Real results and documented profits from eBay', free: false, videoUrl: `${CDN}/3-%D8%A5%D8%AB%D8%A8%D8%A7%D8%AA%20%D8%A7%D9%84%D9%86%D8%AA%D8%A7%D8%A6%D8%AC%20%D8%B5%D9%88%D8%B1%20%D9%88%D8%B4%D9%88%D8%A7%D9%87%D8%AF.mp4` },
  { id: 4, title: 'ما الذي ستتعلمه في الدورة', titleEn: 'What You Will Learn', duration: '23 دقيقة', durationEn: '23 min', desc: 'خارطة طريق واضحة لكل ما ستتعلمه', descEn: 'A clear roadmap of everything you will learn', free: false, videoUrl: `${CDN}/4-%D9%85%D8%A7%20%D8%A7%D9%84%D8%B0%D9%8A%20%D8%B3%D8%AA%D8%AA%D8%B9%D9%84%D9%85%D9%87%20%D9%81%D9%8A%20%D8%A7%D9%84%D8%AF%D9%88%D8%B1%D8%A9.mp4` },
  { id: 5, title: 'خريطة الطريق الكاملة من مبتدئ إلى محترف', titleEn: 'Full Roadmap: Beginner to Pro', duration: '12 دقيقة', durationEn: '12 min', desc: 'الطريق الكامل من الصفر إلى الاحتراف', descEn: 'The full path from zero to professional', free: false, videoUrl: `${CDN}/5-%D8%AE%D8%B1%D9%8A%D8%B7%D8%A9%20%D8%A7%D9%84%D8%B7%D8%B1%D9%8A%D9%82%20%D8%A7%D9%84%D9%83%D8%A7%D9%85%D9%84%D8%A9%20%D9%85%D9%86%20%D9%85%D8%A8%D8%AA%D8%AF%D8%A6%20%D8%A5%D9%84%D9%89%20%D9%85%D8%AD%D8%AA%D8%B1%D9%81.mp4` },
  { id: 6, title: 'شو هو الدروبشيبينج', titleEn: 'What is Dropshipping', duration: '25 دقيقة', durationEn: '25 min', desc: 'مفهوم الدروبشيبينج وكيف يعمل على eBay', descEn: 'The dropshipping concept and how it works on eBay', free: false, videoUrl: `${CDN}/6-%D8%B4%D9%88%20%D9%87%D9%88%20%D8%A7%D9%84%D8%AF%D8%B1%D9%88%D8%A8%D8%B4%D9%8A%D8%A8%D9%8A%D9%86%D8%AC.mp4` },
  { id: 7, title: 'أهم النقاط للنجاح في هذا المجال', titleEn: 'Key Success Points', duration: '9 دقائق', durationEn: '9 min', desc: 'أهم عوامل النجاح في مجال eBay', descEn: 'The most important success factors in eBay', free: false, videoUrl: `${CDN}/7-%D8%A7%D9%87%D9%85%20%D8%A7%D9%84%D9%86%D9%82%D8%A7%D8%B7%20%D9%84%D9%84%D9%86%D8%AC%D8%A7%D8%AD%20%D8%A8%D9%87%D8%A7%D8%AF%20%D8%A7%D9%84%D9%85%D8%AC%D8%A7%D9%84.mp4` },
  { id: 8, title: 'قاموس الدروبشيبينج', titleEn: 'Dropshipping Glossary', duration: '6 دقائق', durationEn: '6 min', desc: 'المصطلحات الأساسية التي تحتاج معرفتها', descEn: 'Essential terms you need to know', free: false, videoUrl: `${CDN}/8-%D9%82%D8%A7%D9%85%D9%88%D8%B3%20%D8%A7%D9%84%D8%AF%D8%B1%D9%88%D8%A8%D8%B4%D9%8A%D8%A8%D9%8A%D9%86%D8%AC.mp4` },
  { id: 9, title: 'كيف ممكن نخسر مصاري في الدروبشيبينج', titleEn: 'How to Avoid Losing Money', duration: '18 دقيقة', durationEn: '18 min', desc: 'الأخطاء الشائعة التي تكلفك المال وكيف تتجنبها', descEn: 'Common mistakes that cost you money and how to avoid them', free: false, videoUrl: `${CDN}/9-%D9%83%D9%8A%D9%81%20%D9%85%D9%85%D9%83%D9%86%20%D9%86%D8%AE%D8%B3%D8%B1%20%D9%85%D8%B5%D8%A7%D8%B1%D9%8A%20%D9%81%D9%8A%20%D8%A7%D9%84%D8%AF%D8%B1%D9%88%D8%A8%D8%B4%D9%8A%D8%A8%D9%8A%D9%86%D8%AC.mp4` },
  { id: 10, title: 'شرح علي اكسبرس', titleEn: 'AliExpress Explained', duration: '17 دقيقة', durationEn: '17 min', desc: 'كيف تستخدم AliExpress كمورد للمنتجات', descEn: 'How to use AliExpress as a product supplier', free: false, videoUrl: `${CDN}/10-%D8%B4%D8%B1%D8%AD%20%D8%B9%D9%84%D9%8A%20%D8%A7%D9%83%D8%B3%D8%A8%D8%B1%D8%B3.mp4` },
  { id: 11, title: 'ضرائب ايباي', titleEn: 'eBay Taxes', duration: '8 دقائق', durationEn: '8 min', desc: 'فهم الضرائب على مبيعات eBay', descEn: 'Understanding taxes on eBay sales', free: false, videoUrl: `${CDN}/11-%D8%B6%D8%B1%D8%A7%D8%A6%D8%A8%20%D8%A7%D9%8A%D8%A8%D8%A7%D9%8A.mp4` },
  { id: 12, title: 'أنواع السسبيند', titleEn: 'Types of Suspension', duration: '5 دقائق', durationEn: '5 min', desc: 'أنواع تعليق الحساب على eBay وأسبابها', descEn: 'Types of eBay account suspension and their causes', free: false, videoUrl: `${CDN}/12-%D8%A7%D9%86%D9%88%D8%A7%D8%B9%20%D8%A7%D9%84%D8%B3%D8%B3%D8%A8%D9%8A%D9%86%D8%AF.mp4` },
  { id: 13, title: 'تجنب السسبيند', titleEn: 'Avoiding Suspension', duration: '21 دقيقة', durationEn: '21 min', desc: 'كيف تحمي حسابك من التعليق', descEn: 'How to protect your account from suspension', free: false, videoUrl: `${CDN}/13-%D8%AA%D8%AC%D9%86%D8%A8%20%D8%A7%D9%84%D8%B3%D8%B3%D8%A8%D9%8A%D9%86%D8%AF.mp4` },
  { id: 14, title: 'تواريخ مهمة', titleEn: 'Important Dates', duration: '5 دقائق', durationEn: '5 min', desc: 'المواسم والأوقات المهمة للبيع على eBay', descEn: 'Important seasons and selling times on eBay', free: false, videoUrl: `${CDN}/14-%D8%AA%D9%88%D8%A7%D8%B1%D9%8A%D8%AE%20%D9%85%D9%87%D9%85%D8%A9.mp4` },
  { id: 15, title: 'روابط ممنوع نستعملها', titleEn: 'Forbidden Links', duration: '22 دقيقة', durationEn: '22 min', desc: 'الروابط والمواقع التي قد تؤدي لتعليق حسابك', descEn: 'Links and sites that may get your account suspended', free: false, videoUrl: `${CDN}/15-%D8%B1%D9%88%D8%A7%D8%A8%D8%B7%20%D9%85%D9%85%D9%86%D9%88%D8%B9%20%D9%86%D8%B3%D8%AA%D8%B9%D9%85%D9%84%D9%87%D8%A7.mp4` },
  { id: 16, title: 'خطة العمل الاجبارية', titleEn: 'Mandatory Action Plan', duration: '26 دقيقة', durationEn: '26 min', desc: 'الخطوات الإلزامية للبدء بشكل صحيح', descEn: 'Mandatory steps to start correctly', free: false, videoUrl: `${CDN}/16-%D8%AE%D8%B7%D8%A9%20%D8%A7%D9%84%D8%B9%D9%85%D9%84%20%D8%A7%D9%84%D8%A7%D8%AC%D8%A8%D8%A7%D8%B1%D9%8A%D8%A9.mp4` },
  { id: 17, title: 'إنشاء حساب الجيميل خطوة بخطوة', titleEn: 'Create Gmail Account Step by Step', duration: '27 دقيقة', durationEn: '27 min', desc: 'إنشاء بريد إلكتروني جديد للبدء', descEn: 'Creating a new email account to get started', free: false, videoUrl: `${CDN}/17-%D8%A5%D9%86%D8%B4%D8%A7%D8%A1%20%D8%AD%D8%B3%D8%A7%D8%A8%20%D8%A7%D9%84%D8%AC%D9%8A%D9%85%D9%8A%D9%84%20%D8%AE%D8%B7%D9%88%D8%A9%20%D8%A8%D8%AE%D8%B7%D9%88%D8%A9.mp4` },
  { id: 18, title: 'فتح حساب ايباي خطوة بخطوة', titleEn: 'Open eBay Account Step by Step', duration: '16 دقيقة', durationEn: '16 min', desc: 'كيف تفتح حساب eBay بشكل صحيح', descEn: 'How to open an eBay account correctly', free: false, videoUrl: `${CDN}/18-%D9%81%D8%AA%D8%AD%20%D8%AD%D8%B3%D8%A7%D8%A8%20%D8%A7%D9%8A%D8%A8%D8%A7%D9%8A%20%D8%AE%D8%B7%D9%88%D8%A9%20%D8%A8%D8%AE%D8%B7%D9%88%D8%A9.mp4` },
  { id: 19, title: 'إعدادات الحساب الأساسية', titleEn: 'Basic Account Settings', duration: '37 دقيقة', durationEn: '37 min', desc: 'ضبط إعدادات الحساب بشكل احترافي', descEn: 'Setting up your account professionally', free: false, videoUrl: `${CDN}/19-%D8%A5%D8%B9%D8%AF%D8%A7%D8%AF%D8%A7%D8%AA%20%D8%A7%D9%84%D8%AD%D8%B3%D8%A7%D8%A8%20%D8%A7%D9%84%D8%A3%D8%B3%D8%A7%D8%B3%D9%8A%D8%A9.mp4` },
  { id: 20, title: 'شرح بايونير', titleEn: 'Payoneer Explained', duration: '27 دقيقة', durationEn: '27 min', desc: 'كيف يعمل بايونير وكيف تستخدمه', descEn: 'How Payoneer works and how to use it', free: false, videoUrl: `${CDN}/20-%D8%B4%D8%B1%D8%AD%20%D8%A8%D8%A7%D9%8A%D9%88%D9%86%D9%8A%D8%B1.mp4` },
  { id: 21, title: 'إنشاء حساب بايونير', titleEn: 'Create Payoneer Account', duration: '145 دقيقة', durationEn: '145 min', desc: 'فتح حساب بايونير خطوة بخطوة', descEn: 'Opening a Payoneer account step by step', free: false, videoUrl: `${CDN}/21-%D9%86%D8%B4%D8%A7%D8%A1%20%D8%AD%D8%B3%D8%A7%D8%A8%20%D8%A8%D8%A7%D9%8A%D9%88%D9%86%D9%8A%D8%B1.mp4` },
  { id: 22, title: 'تفعيل الحساب لاستلام المدفوعات', titleEn: 'Activate Account for Payments', duration: '19 دقيقة', durationEn: '19 min', desc: 'ربط الحساب لاستلام الأرباح', descEn: 'Linking account to receive profits', free: false, videoUrl: `${CDN}/22-%D8%AA%D9%81%D8%B9%D9%8A%D9%84%20%D8%A7%D9%84%D8%AD%D8%B3%D8%A7%D8%A8%20%D9%84%D8%A7%D8%B3%D8%AA%D9%84%D8%A7%D9%85%20%D8%A7%D9%84%D9%85%D8%AF%D9%81%D9%88%D8%B9%D8%A7%D8%AA.mp4` },
  { id: 23, title: 'رسوم موقع ايباي و بايونير', titleEn: 'eBay & Payoneer Fees', duration: '46 دقيقة', durationEn: '46 min', desc: 'فهم جميع الرسوم والعمولات', descEn: 'Understanding all fees and commissions', free: false, videoUrl: `${CDN}/23-%D8%B1%D8%B3%D9%88%D9%85%20%D9%85%D9%88%D9%82%D8%B9%20%D8%A7%D9%8A%D8%A8%D8%A7%D9%8A%20%D9%88%20%D8%A8%D8%A7%D9%8A%D9%88%D9%86%D9%8A%D8%B1.mp4` },
  { id: 24, title: 'الحصول على بطاقة بايونير', titleEn: 'Get Payoneer Card', duration: '29 دقيقة', durationEn: '29 min', desc: 'كيف تحصل على بطاقة بايونير المادية', descEn: 'How to get your physical Payoneer card', free: false, videoUrl: `${CDN}/24-%D8%A7%D9%84%D8%AD%D8%B5%D9%88%D9%84%20%D8%B9%D9%84%D9%89%20%D8%A8%D8%B7%D8%A7%D9%82%D8%A9%20%D8%A8%D8%A7%D9%8A%D9%88%D9%86%D9%8A%D8%B1.mp4` },
  { id: 25, title: 'كيف تحول أرباحك على البنك الخاص بك', titleEn: 'Transfer Profits to Your Bank', duration: '15 دقيقة', durationEn: '15 min', desc: 'تحويل الأرباح من بايونير إلى بنكك المحلي', descEn: 'Transferring profits from Payoneer to your local bank', free: false, videoUrl: `${CDN}/25-%D9%83%D9%8A%D9%81%20%D8%AA%D8%AD%D9%88%D9%84%20%D8%A7%D8%B1%D8%A8%D8%A7%D8%AD%D9%83%20%D8%B9%D9%84%D9%89%20%D8%A7%D9%84%D8%A8%D9%86%D9%83%20%D8%A7%D9%84%D8%AE%D8%A7%D8%B5%20%D8%A8%D9%83.mp4` },
  { id: 26, title: 'شرح الفيدباك', titleEn: 'Feedback Explained', duration: '37 دقيقة', durationEn: '37 min', desc: 'أهمية التقييمات وكيف تبنيها', descEn: 'The importance of feedback and how to build it', free: false, videoUrl: `${CDN}/26-%D8%B4%D8%B1%D8%AD%20%D8%A7%D9%84%D9%81%D9%8A%D8%AF%D8%A8%D8%A7%D9%83.mp4` },
  { id: 27, title: 'شراء الفيدباك', titleEn: 'Buying Feedback', duration: '75 دقيقة', durationEn: '75 min', desc: 'طرق الحصول على تقييمات لحسابك الجديد', descEn: 'Ways to get feedback for your new account', free: false, videoUrl: `${CDN}/27-%D8%B4%D8%B1%D8%A7%D8%A1%20%D8%A7%D9%84%D9%81%D9%8A%D8%AF%D8%A8%D8%A7%D9%83.mp4` },
  { id: 28, title: 'شرح السياسات', titleEn: 'Policies Explained', duration: '24 دقيقة', durationEn: '24 min', desc: 'فهم سياسات eBay البائع', descEn: 'Understanding eBay seller policies', free: false, videoUrl: `${CDN}/28-%D8%B4%D8%B1%D8%AD%20%D8%A7%D9%84%D8%B3%D9%8A%D8%A7%D8%B3%D8%A7%D8%AA.mp4` },
  { id: 29, title: 'فتح السياسات', titleEn: 'Opening Policies', duration: '14 دقيقة', durationEn: '14 min', desc: 'كيف تفعّل السياسات في حسابك', descEn: 'How to activate policies in your account', free: false, videoUrl: `${CDN}/29-%D9%81%D8%AA%D8%AD%20%D8%A7%D9%84%D8%B3%D9%8A%D8%A7%D8%B3%D8%A7%D8%AA.mp4` },
  { id: 30, title: 'عمل سياسة الدفع', titleEn: 'Payment Policy', duration: '15 دقيقة', durationEn: '15 min', desc: 'إعداد سياسة الدفع للمشترين', descEn: 'Setting up payment policy for buyers', free: false, videoUrl: `${CDN}/30-%D8%B9%D9%85%D9%84%20%D8%B3%D9%8A%D8%A7%D8%B3%D8%A9%20%D8%A7%D9%84%D8%AF%D9%81%D8%B9.mp4` },
  { id: 31, title: 'عمل سياسة الترجيع', titleEn: 'Return Policy', duration: '10 دقائق', durationEn: '10 min', desc: 'إعداد سياسة الاسترجاع', descEn: 'Setting up the return policy', free: false, videoUrl: `${CDN}/31-%D8%B9%D9%85%D9%84%20%D8%B3%D9%8A%D8%A7%D8%B3%D8%A9%20%D8%A7%D9%84%D8%AA%D8%B1%D8%AC%D9%8A%D8%B9.mp4` },
  { id: 32, title: 'سياسة الشحن من البيت', titleEn: 'Domestic Shipping Policy', duration: '43 دقيقة', durationEn: '43 min', desc: 'إعداد سياسة الشحن المحلي', descEn: 'Setting up domestic shipping policy', free: false, videoUrl: `${CDN}/32-%D8%B3%D9%8A%D8%A7%D8%B3%D8%A9%20%D8%A7%D9%84%D8%B4%D8%AD%D9%86%20%D9%85%D9%86%20%D8%A7%D9%84%D8%A8%D9%8A%D8%AA.mp4` },
  { id: 33, title: 'سياسة الشحن من الصين', titleEn: 'China Shipping Policy', duration: '36 دقيقة', durationEn: '36 min', desc: 'إعداد سياسة الشحن من الموردين الصينيين', descEn: 'Setting up shipping policy from Chinese suppliers', free: false, videoUrl: `${CDN}/33-%D8%B3%D9%8A%D8%A7%D8%B3%D8%A9%20%D8%A7%D9%84%D8%B4%D8%AD%D9%86%20%D9%85%D9%86%20%D8%A7%D9%84%D8%B5%D9%8A%D9%86.mp4` },
  { id: 34, title: 'بحث نتجات يدوي', titleEn: 'Manual Product Research', duration: '110 دقيقة', durationEn: '110 min', desc: 'طريقة البحث اليدوي عن المنتجات الرابحة', descEn: 'Manual method to find profitable products', free: false, videoUrl: `${CDN}/34-%D8%A8%D8%AD%D8%AB%20%D9%86%D8%AA%D8%AC%D8%A7%D8%AA%20%D9%8A%D8%AF%D9%88%D9%8A.mp4` },
  { id: 35, title: 'بحث منتجات موسمي', titleEn: 'Seasonal Product Research', duration: '87 دقيقة', durationEn: '87 min', desc: 'كيف تستفيد من المواسم في اختيار المنتجات', descEn: 'How to leverage seasons in product selection', free: false, videoUrl: `${CDN}/35-%D8%A8%D8%AD%D8%AB%20%D9%85%D9%86%D8%AA%D8%AC%D8%A7%D8%AA%20%D9%85%D9%88%D8%B3%D9%85%D9%8A.mp4` },
  { id: 36, title: 'بحث منتجات هاي تكت', titleEn: 'High Ticket Product Research', duration: '109 دقيقة', durationEn: '109 min', desc: 'البحث عن المنتجات عالية القيمة', descEn: 'Researching high-value products', free: false, videoUrl: `${CDN}/36-%D8%A8%D8%AD%D8%AB%20%D9%85%D9%86%D8%AA%D8%AC%D8%A7%D8%AA%20%D9%87%D8%A7%D9%8A%20%D8%AA%D9%83%D8%AA.mp4` },
  { id: 37, title: 'بحث منتجات Google Trend', titleEn: 'Google Trend Research', duration: '73 دقيقة', durationEn: '73 min', desc: 'استخدام Google Trends للعثور على منتجات رائجة', descEn: 'Using Google Trends to find trending products', free: false, videoUrl: `${CDN}/37-%D8%A8%D8%AD%D8%AB%20%D9%85%D9%86%D8%AA%D8%AC%D8%A7%D8%AA%20google%20trend.mp4` },
  { id: 38, title: 'بحث منتجات تنافسي', titleEn: 'Competitive Product Research', duration: '42 دقيقة', durationEn: '42 min', desc: 'تحليل منتجات المنافسين للعثور على فرص', descEn: 'Analyzing competitor products to find opportunities', free: false, videoUrl: `${CDN}/38-%D8%A8%D8%AD%D8%AB%20%D9%85%D9%86%D8%AA%D8%AC%D8%A7%D8%AA%20%D8%AA%D9%86%D8%A7%D9%81%D8%B3%D9%8A.mp4` },
  { id: 39, title: 'بحث منتجات الأعلى مبيعاً', titleEn: 'Best Sellers Research', duration: '59 دقيقة', durationEn: '59 min', desc: 'العثور على أكثر المنتجات مبيعاً على eBay', descEn: 'Finding the best-selling products on eBay', free: false, videoUrl: `${CDN}/39-%D8%A8%D8%AD%D8%AB%20%D9%85%D9%86%D8%AA%D8%AC%D8%A7%D8%AA%20%D8%A7%D9%84%D8%A7%D8%B9%D9%84%D9%89%20%D9%85%D8%A8%D9%8A%D8%B9%D8%A7.mp4` },
  { id: 40, title: 'بحث منتجات مختص في فئة معينة', titleEn: 'Niche Category Research', duration: '43 دقيقة', durationEn: '43 min', desc: 'التخصص في فئة معينة وإتقانها', descEn: 'Specializing in a specific category and mastering it', free: false, videoUrl: `${CDN}/40-%D8%A8%D8%AD%D8%AB%20%D9%85%D9%86%D8%AA%D8%AC%D8%A7%D8%AA%20%D9%85%D8%AE%D8%AA%D8%B5%20%D9%81%D9%8A%20%D9%81%D8%A6%D8%A9%20%D9%85%D8%B9%D9%8A%D9%86%D8%A9.mp4` },
  { id: 41, title: 'بحث منتجات من خلال ZIK Analytics', titleEn: 'ZIK Analytics Research', duration: '172 دقيقة', durationEn: '172 min', desc: 'استخدام ZIK Analytics للبحث المتقدم عن المنتجات', descEn: 'Using ZIK Analytics for advanced product research', free: false, videoUrl: `${CDN}/41-%D8%A8%D8%AD%D8%AB%20%D9%85%D9%86%D8%AA%D8%AC%D8%A7%D8%AA%20%D9%85%D9%86%20%D8%AE%D9%84%D8%A7%D9%84%20zikanalytics.mp4` },
  { id: 42, title: 'بحث منتجات Sell The Trend', titleEn: 'Sell The Trend Research', duration: '86 دقيقة', durationEn: '86 min', desc: 'استخدام Sell The Trend لاكتشاف المنتجات الرائجة', descEn: 'Using Sell The Trend to discover trending products', free: false, videoUrl: `${CDN}/42-%D8%A8%D8%AD%D8%AB%20%D9%85%D9%86%D8%AA%D8%AC%D8%A7%D8%AA%20sell%20the%20trend.mp4` },
  { id: 43, title: 'بحث منتجات بالذكاء الاصطناعي', titleEn: 'AI-Powered Product Research', duration: '115 دقيقة', durationEn: '115 min', desc: 'توظيف الذكاء الاصطناعي في البحث عن المنتجات', descEn: 'Using AI for product research', free: false, videoUrl: `${CDN}/43-%D8%A8%D8%AD%D8%AB%20%D9%85%D9%86%D8%AA%D8%AC%D8%A7%D8%AA%20%D8%A8%D8%A7%D9%84%D8%B0%D9%83%D8%A7%D8%A1%20%D8%A7%D9%84%D8%A7%D8%B5%D8%B7%D9%86%D8%A7%D8%B9%D9%8A.mp4` },
  { id: 44, title: 'بحث منتجات eBay Research', titleEn: 'eBay Research Tool', duration: '80 دقيقة', durationEn: '80 min', desc: 'استخدام أداة eBay Research المدمجة', descEn: 'Using eBay\'s built-in research tool', free: false, videoUrl: `${CDN}/44-%D8%A8%D8%AD%D8%AB%20%D9%85%D9%86%D8%AA%D8%AC%D8%A7%D8%AA%20ebay%20research.mp4` },
  { id: 45, title: 'منتجات غير قانونية', titleEn: 'Illegal Products', duration: '21 دقيقة', durationEn: '21 min', desc: 'المنتجات المحظورة التي يجب تجنبها تماماً', descEn: 'Prohibited products you must completely avoid', free: false, videoUrl: `${CDN}/45-%D9%85%D9%86%D8%AA%D8%AC%D8%A7%D8%AA%20%D8%BA%D9%8A%D8%B1%20%D9%82%D8%A7%D9%86%D9%88%D9%86%D9%8A%D8%A9.mp4` },
  { id: 46, title: 'شرح منتجات الفيرو', titleEn: 'VeRO Products Explained', duration: '39 دقيقة', durationEn: '39 min', desc: 'فهم منتجات VeRO وكيفية تجنبها', descEn: 'Understanding VeRO products and how to avoid them', free: false, videoUrl: `${CDN}/46-%D8%B4%D8%B1%D8%AD%20%D9%85%D9%86%D8%AA%D8%AC%D8%A7%D8%AA%20%D8%A7%D9%84%D9%81%D9%8A%D8%B1%D9%88.mp4` },
  { id: 47, title: 'ما هو المنتج الرابح', titleEn: 'What is a Profitable Product', duration: '8 دقائق', durationEn: '8 min', desc: 'معايير تحديد المنتج الرابح الحقيقي', descEn: 'Criteria for identifying a truly profitable product', free: false, videoUrl: `${CDN}/47-%D9%85%D8%A7%20%D9%87%D9%88%20%D8%A7%D9%84%D9%85%D9%86%D8%AA%D8%AC%20%D8%A7%D9%84%D8%B1%D8%A7%D8%A8%D8%AD.mp4` },
  { id: 48, title: 'اختيار المورد الناجح', titleEn: 'Choosing the Right Supplier', duration: '38 دقيقة', durationEn: '38 min', desc: 'كيف تختار المورد الموثوق والناجح', descEn: 'How to choose a reliable and successful supplier', free: false, videoUrl: `${CDN}/48-%D8%A7%D8%AE%D8%AA%D9%8A%D8%A7%D8%B1%20%D8%A7%D9%84%D9%85%D9%88%D8%B1%D8%AF%20%D8%A7%D9%84%D9%86%D8%A7%D8%AC%D8%AD.mp4` },
  { id: 49, title: 'شرح موقع CJ Dropshipping', titleEn: 'CJ Dropshipping Explained', duration: '87 دقيقة', durationEn: '87 min', desc: 'كيف تستخدم CJ Dropshipping كمورد', descEn: 'How to use CJ Dropshipping as a supplier', free: false, videoUrl: `${CDN}/49-%D8%B4%D8%B1%D8%AD%20%D9%85%D9%88%D9%82%D8%B9%20cj%20dropshipping.mp4` },
  { id: 50, title: 'فتح حساب علي اكسبرس', titleEn: 'Open AliExpress Account', duration: '35 دقيقة', durationEn: '35 min', desc: 'فتح وإعداد حساب AliExpress', descEn: 'Opening and setting up an AliExpress account', free: false, videoUrl: `${CDN}/50-%D9%81%D8%AA%D8%AD%20%D8%AD%D8%B3%D8%A7%D8%A8%20%D8%B9%D9%84%D9%8A%20%D8%A7%D9%83%D8%B3%D8%A8%D8%B1%D8%B3.mp4` },
  { id: 51, title: 'التواصل مع التجار', titleEn: 'Communicating with Suppliers', duration: '7 دقائق', durationEn: '7 min', desc: 'كيف تتواصل مع الموردين بشكل احترافي', descEn: 'How to communicate with suppliers professionally', free: false, videoUrl: `${CDN}/51-%D8%A7%D9%84%D8%AA%D9%88%D8%A7%D8%B5%D9%84%20%D9%85%D8%B9%20%D8%A7%D9%84%D8%AA%D8%AC%D8%A7%D8%B1.mp4` },
  { id: 52, title: 'أدوات مهمة لنا', titleEn: 'Essential Tools', duration: '35 دقيقة', durationEn: '35 min', desc: 'الأدوات الأساسية لنجاح عملك على eBay', descEn: 'Essential tools for eBay business success', free: false, videoUrl: `${CDN}/52-%D8%A7%D8%AF%D9%88%D8%A7%D8%AA%20%D9%85%D9%87%D9%85%D8%A9%20%D8%A7%D9%84%D9%86%D8%A7.mp4` },
  { id: 53, title: 'فتح السيلر هوب', titleEn: 'Open Seller Hub', duration: '16 دقيقة', durationEn: '16 min', desc: 'الوصول إلى مركز التحكم في eBay', descEn: 'Accessing eBay\'s control center', free: false, videoUrl: `${CDN}/53-%D9%81%D8%AA%D8%AD%20%D8%A7%D9%84%D8%B3%D9%8A%D9%84%D8%B1%20%D9%87%D9%88%D8%A8.mp4` },
  { id: 54, title: 'شرح سيلر هوب', titleEn: 'Seller Hub Explained', duration: '112 دقيقة', durationEn: '112 min', desc: 'الشرح الكامل لمركز البائع على eBay', descEn: 'Complete explanation of eBay Seller Hub', free: false, videoUrl: `${CDN}/54-%D8%B4%D8%B1%D8%AD%20%D8%B3%D9%8A%D9%84%D8%B1%20%D9%87%D9%88%D8%A8.mp4` },
  { id: 55, title: 'تنزيل أول منتج', titleEn: 'List Your First Product', duration: '48 دقيقة', durationEn: '48 min', desc: 'خطوات رفع أول منتج على eBay', descEn: 'Steps to upload your first product on eBay', free: false, videoUrl: `${CDN}/55-%D8%AA%D9%86%D8%B2%D9%8A%D9%84%20%D8%A7%D9%88%D9%84%20%D9%85%D9%86%D8%AA%D8%AC.mp4` },
  { id: 56, title: 'ربط ايباي مع بايونير', titleEn: 'Link eBay with Payoneer', duration: '47 دقيقة', durationEn: '47 min', desc: 'ربط حساب eBay مع بايونير لاستلام الأرباح', descEn: 'Linking eBay account with Payoneer to receive profits', free: false, videoUrl: `${CDN}/56-%D8%B1%D8%A8%D8%B7%20%D8%A7%D9%8A%D8%A8%D8%A7%D9%8A%20%D9%85%D8%B9%20%D8%A8%D8%A7%D9%8A%D9%88%D9%86%D9%8A%D8%B1.mp4` },
  { id: 57, title: 'كتابة عنوان جذاب', titleEn: 'Write a Compelling Title', duration: '37 دقيقة', durationEn: '37 min', desc: 'أسرار كتابة عناوين تجذب المشترين', descEn: 'Secrets to writing titles that attract buyers', free: false, videoUrl: `${CDN}/57-%D9%83%D8%AA%D8%A7%D8%A8%D8%A9%20%D8%B9%D9%86%D9%88%D8%A7%D9%86%20%D8%AC%D8%B0%D8%A7%D8%A8.mp4` },
  { id: 58, title: 'اختيار الصور المناسبة', titleEn: 'Choosing the Right Photos', duration: '49 دقيقة', durationEn: '49 min', desc: 'كيف تختار الصور التي تزيد من المبيعات', descEn: 'How to choose photos that boost sales', free: false, videoUrl: `${CDN}/58-%D8%A7%D8%AE%D8%AA%D9%8A%D8%A7%D8%B1%20%D8%A7%D9%84%D8%B5%D9%88%D8%B1%20%D8%A7%D9%84%D9%85%D9%86%D8%A7%D8%B3%D8%A8%D8%A9.mp4` },
  { id: 59, title: 'الأخطاء الشائعة عند كتابة الوصف', titleEn: 'Common Description Mistakes', duration: '42 دقيقة', durationEn: '42 min', desc: 'أخطاء كتابة الوصف التي تخسر بها المبيعات', descEn: 'Description writing mistakes that cost you sales', free: false, videoUrl: `${CDN}/59-%D8%A7%D9%84%D8%AE%D8%B7%D8%A7%D8%A1%20%D8%A7%D9%84%D8%B4%D8%A7%D8%A6%D8%B9%D8%A9%20%D8%B9%D9%86%D8%AF%20%D9%83%D8%AA%D8%A7%D8%A8%D8%A9%20%D8%A7%D9%84%D9%88%D8%B5%D9%81.mp4` },
  { id: 60, title: 'كتابة وصف جذاب', titleEn: 'Write a Compelling Description', duration: '62 دقيقة', durationEn: '62 min', desc: 'كيف تكتب وصفاً يقنع المشتري بالشراء', descEn: 'How to write a description that convinces buyers', free: false, videoUrl: `${CDN}/60-%D9%83%D8%AA%D8%A7%D8%A8%D8%A9%20%D9%88%D8%B5%D9%81%20%D8%AC%D8%B0%D8%A7%D8%A8.mp4` },
  { id: 61, title: 'تحليل المنافسين', titleEn: 'Competitor Analysis', duration: '49 دقيقة', durationEn: '49 min', desc: 'كيف تحلل منافسيك وتتفوق عليهم', descEn: 'How to analyze and outperform your competitors', free: false, videoUrl: `${CDN}/61-%D8%AA%D8%AD%D9%84%D9%8A%D9%84%20%D8%A7%D9%84%D9%85%D9%86%D8%A7%D9%81%D8%B3%D9%8A%D9%86.mp4` },
  { id: 62, title: 'طريقة تسعير المنتج', titleEn: 'Product Pricing Strategy', duration: '32 دقيقة', durationEn: '32 min', desc: 'كيف تسعر منتجاتك بشكل مربح وتنافسي', descEn: 'How to price your products profitably and competitively', free: false, videoUrl: `${CDN}/62-%D8%B7%D8%B1%D9%8A%D9%82%D8%A9%20%D8%AA%D8%B3%D8%B9%D9%8A%D8%B1%20%D8%A7%D9%84%D9%85%D9%86%D8%AA%D8%AC.mp4` },
  { id: 63, title: 'تسويق المنتجات', titleEn: 'Product Marketing', duration: '42 دقيقة', durationEn: '42 min', desc: 'استراتيجيات تسويق منتجاتك على eBay', descEn: 'Strategies for marketing your products on eBay', free: false, videoUrl: `${CDN}/63-%D8%AA%D8%B3%D9%88%D9%8A%D9%82%20%D8%A7%D9%84%D9%85%D9%86%D8%AA%D8%AC%D8%A7%D8%AA.mp4` },
  { id: 64, title: 'كم نعرض منتج', titleEn: 'How Many Products to List', duration: '32 دقيقة', durationEn: '32 min', desc: 'العدد المثالي للمنتجات المعروضة', descEn: 'The ideal number of products to list', free: false, videoUrl: `${CDN}/64-%D9%83%D9%85%20%D9%86%D8%B9%D8%B1%D8%B6%20%D9%85%D9%86%D8%AA%D8%AC.mp4` },
  { id: 65, title: 'متى نمسح منتج', titleEn: 'When to Delete a Product', duration: '29 دقيقة', durationEn: '29 min', desc: 'معرفة متى تحذف المنتج الفاشل', descEn: 'Knowing when to delete a failing product', free: false, videoUrl: `${CDN}/65-%D9%85%D8%AA%D9%89%20%D9%86%D9%85%D8%B3%D8%AD%20%D9%85%D9%86%D8%AA%D8%AC.mp4` },
  { id: 66, title: 'معرفة المنتجات الميتة', titleEn: 'Identifying Dead Products', duration: '35 دقيقة', durationEn: '35 min', desc: 'كيف تعرف المنتجات التي لم تعد تبيع', descEn: 'How to identify products that no longer sell', free: false, videoUrl: `${CDN}/66-%D9%85%D8%B9%D8%B1%D9%81%D8%A9%20%D8%A7%D9%84%D9%85%D9%86%D8%AA%D8%AC%D8%A7%D8%AA%20%D8%A7%D9%84%D9%85%D9%8A%D8%AA%D8%A9.mp4` },
  { id: 67, title: 'كيف نمسح منتج', titleEn: 'How to Delete a Product', duration: '16 دقيقة', durationEn: '16 min', desc: 'الطريقة الصحيحة لحذف المنتجات الفاشلة', descEn: 'The correct way to delete failing products', free: false, videoUrl: `${CDN}/67-%D9%83%D9%8A%D9%81%20%D9%86%D9%85%D8%B3%D8%AD%20%D9%85%D9%86%D8%AA%D8%AC.mp4` },
  { id: 68, title: 'مشاكل الشحن وتأثيرها', titleEn: 'Shipping Problems & Impact', duration: '28 دقيقة', durationEn: '28 min', desc: 'مشاكل الشحن الشائعة وكيف تتعامل معها', descEn: 'Common shipping problems and how to handle them', free: false, videoUrl: `${CDN}/68-%D9%85%D8%B4%D8%A7%D9%83%D9%84%20%D8%A7%D9%84%D8%B4%D8%AD%D9%86%20%D9%88%20%D8%AA%D8%A7%D8%AB%D9%8A%D8%B1%D9%87%D8%A7.mp4` },
  { id: 69, title: 'معرفة سرعة توصيل المنتج وجودته', titleEn: 'Delivery Speed & Product Quality', duration: '38 دقيقة', durationEn: '38 min', desc: 'كيف تتحقق من جودة المنتج وسرعة الشحن', descEn: 'How to verify product quality and shipping speed', free: false, videoUrl: `${CDN}/69-%D9%85%D8%B9%D8%B1%D9%81%D8%A9%20%D8%B3%D8%B1%D8%B9%D8%A9%20%D8%AA%D9%88%D8%B5%D9%8A%D9%84%20%D8%A7%D9%84%D9%85%D9%86%D8%AA%D8%AC%20%D9%88%20%D8%AC%D9%88%D8%AF%D8%A9%20%D8%A7%D9%84%D9%85%D9%86%D8%AA%D8%AC.mp4` },
  { id: 70, title: 'التحقق من المورد قبل الطلب', titleEn: 'Verify Supplier Before Ordering', duration: '22 دقيقة', durationEn: '22 min', desc: 'كيف تتحقق من موثوقية المورد', descEn: 'How to verify supplier reliability', free: false, videoUrl: `${CDN}/70-%D8%A7%D9%84%D8%AA%D8%AD%D9%82%D9%82%20%D9%85%D9%86%20%D8%A7%D9%84%D9%85%D9%88%D8%B1%D8%AF%20%D9%82%D8%A8%D9%84%20%D8%A7%D9%84%D8%B7%D9%84%D8%A8.mp4` },
  { id: 71, title: 'طريقة شحن المنتج للعميل', titleEn: 'Shipping Product to Customer', duration: '128 دقيقة', durationEn: '128 min', desc: 'الطريقة الصحيحة لتنفيذ الطلبات وشحنها', descEn: 'The correct way to fulfill and ship orders', free: false, videoUrl: `${CDN}/71-%D8%B7%D8%B1%D9%8A%D9%82%D8%A9%20%D8%B4%D8%AD%D9%86%20%D8%A7%D9%84%D9%85%D9%86%D8%AA%D8%AC%20%D9%84%D9%84%D8%B9%D9%85%D9%8A%D9%84.mp4` },
  { id: 72, title: 'إضافة رقم تتبع', titleEn: 'Adding Tracking Number', duration: '14 دقيقة', durationEn: '14 min', desc: 'كيف تضيف رقم التتبع للطلب', descEn: 'How to add a tracking number to an order', free: false, videoUrl: `${CDN}/72-%D8%A7%D8%B6%D8%A7%D9%81%D8%A9%20%D8%B1%D9%82%D9%85%20%D8%AA%D8%AA%D8%A8%D8%B9.mp4` },
  { id: 73, title: 'شرح المتجر', titleEn: 'eBay Store Explained', duration: '24 دقيقة', durationEn: '24 min', desc: 'فهم متجر eBay ومميزاته', descEn: 'Understanding eBay store and its advantages', free: false, videoUrl: `${CDN}/73-%D8%B4%D8%B1%D8%AD%20%D8%A7%D9%84%D9%85%D8%AA%D8%AC%D8%B1.mp4` },
  { id: 74, title: 'اختيار اسم المتجر', titleEn: 'Choosing Store Name', duration: '38 دقيقة', durationEn: '38 min', desc: 'كيف تختار اسم متجر احترافي ومميز', descEn: 'How to choose a professional and distinctive store name', free: false, videoUrl: `${CDN}/74-%D8%A7%D8%AE%D8%AA%D9%8A%D8%A7%D8%B1%20%D8%A7%D8%B3%D9%85%20%D8%A7%D9%84%D9%85%D8%AA%D8%AC%D8%B1.mp4` },
  { id: 75, title: 'تصميم اللوجو الخاص في المتجر', titleEn: 'Design Store Logo', duration: '70 دقيقة', durationEn: '70 min', desc: 'تصميم شعار احترافي لمتجرك', descEn: 'Designing a professional logo for your store', free: false, videoUrl: `${CDN}/75-%D8%AA%D8%B5%D9%85%D9%8A%D9%85%20%D8%A7%D9%84%D9%84%D9%88%D8%AC%D9%88%20%D8%A7%D9%84%D8%AE%D8%A7%D8%B5%20%D9%81%D9%8A%20%D8%A7%D9%84%D9%85%D8%AA%D8%AC%D8%B1.mp4` },
  { id: 76, title: 'كتابة وصف خاص في المتجر', titleEn: 'Write Store Description', duration: '21 دقيقة', durationEn: '21 min', desc: 'كتابة وصف جذاب ومميز لمتجرك', descEn: 'Writing an attractive and distinctive store description', free: false, videoUrl: `${CDN}/76-%D9%83%D8%AA%D8%A7%D8%A8%D8%A9%20%D9%88%D8%B5%D9%81%20%D8%AE%D8%A7%D8%B5%20%D9%81%D9%8A%20%D8%A7%D9%84%D9%85%D8%AA%D8%AC%D8%B1.mp4` },
  { id: 77, title: 'عمل لوحة إعلانات على المتجر', titleEn: 'Store Promotions Board', duration: '139 دقيقة', durationEn: '139 min', desc: 'إنشاء إعلانات ترويجية داخل متجرك', descEn: 'Creating promotional ads within your store', free: false, videoUrl: `${CDN}/77-%D8%B9%D9%85%D9%84%20%D9%84%D9%88%D8%AD%D8%A9%20%D8%A7%D8%B9%D9%84%D8%A7%D9%86%D8%A7%D8%AA%20%D8%B9%D9%84%D9%89%20%D8%A7%D9%84%D9%85%D8%AA%D8%AC%D8%B1.mp4` },
  { id: 78, title: 'تخصيص منتجات المتجر', titleEn: 'Customize Store Products', duration: '23 دقيقة', durationEn: '23 min', desc: 'تخصيص وترتيب منتجات متجرك', descEn: 'Customizing and organizing your store products', free: false, videoUrl: `${CDN}/78-%D8%AA%D8%AE%D8%B5%D9%8A%D8%B5%20%D9%85%D9%86%D8%AA%D8%AC%D8%A7%D8%AA%20%D8%A7%D9%84%D9%85%D8%AA%D8%AC%D8%B1.mp4` },
  { id: 79, title: 'تسويق المتجر', titleEn: 'Store Marketing', duration: '117 دقيقة', durationEn: '117 min', desc: 'استراتيجيات التسويق لزيادة مبيعات متجرك', descEn: 'Marketing strategies to boost your store sales', free: false, videoUrl: `${CDN}/79-%D8%AA%D8%B3%D9%88%D9%8A%D9%82%20%D8%A7%D9%84%D9%85%D8%AA%D8%AC%D8%B1.mp4` },
  { id: 80, title: 'عمل خصومات المتجر', titleEn: 'Store Discounts', duration: '30 دقيقة', durationEn: '30 min', desc: 'كيف تنشئ عروض وخصومات جذابة', descEn: 'How to create attractive offers and discounts', free: false, videoUrl: `${CDN}/80-%D8%B9%D9%85%D9%84%20%D8%AE%D8%B5%D9%88%D9%85%D8%A7%D8%AA%20%D8%A7%D9%84%D9%85%D8%AA%D8%AC%D8%B1.mp4` },
  { id: 81, title: 'نصائح عن الذكاء الاصطناعي AI', titleEn: 'AI Tips', duration: '30 دقيقة', durationEn: '30 min', desc: 'كيف توظف الذكاء الاصطناعي لتطوير عملك', descEn: 'How to use AI to grow your business', free: false, videoUrl: `${CDN}/81-%D9%86%D8%B5%D8%A7%D8%A6%D8%AD%20%D8%B9%D9%86%20%D8%A7%D9%84%20AI.mp4` },
  { id: 82, title: 'نصائح للتعامل مع الطلبات', titleEn: 'Order Management Tips', duration: '32 دقيقة', durationEn: '32 min', desc: 'كيف تدير الطلبات بكفاءة واحترافية', descEn: 'How to manage orders efficiently and professionally', free: false, videoUrl: `${CDN}/82-%D9%86%D8%B5%D8%A7%D8%A6%D8%AD%20%D9%84%D9%84%D8%AA%D8%B9%D8%A7%D9%85%D9%84%20%D9%85%D8%B9%20%D8%A7%D9%84%D8%B7%D9%84%D8%A8%D8%A7%D8%AA.mp4` },
  { id: 83, title: 'الأخطاء الشائعة', titleEn: 'Common Mistakes', duration: '13 دقيقة', durationEn: '13 min', desc: 'الأخطاء الأكثر شيوعاً وكيف تتجنبها', descEn: 'The most common mistakes and how to avoid them', free: false, videoUrl: `${CDN}/83-%D8%A7%D9%84%D8%A7%D8%AE%D8%B7%D8%A7%D8%A1%20%D8%A7%D9%84%D8%B4%D8%A7%D8%A6%D8%B9%D8%A9.mp4` },
  { id: 84, title: 'التواصل مع العميل', titleEn: 'Customer Communication', duration: '25 دقيقة', durationEn: '25 min', desc: 'كيف تتواصل مع العملاء بشكل احترافي', descEn: 'How to communicate with customers professionally', free: false, videoUrl: `${CDN}/84-%D8%A7%D9%84%D8%AA%D9%88%D8%A7%D8%B5%D9%84%20%D9%85%D8%B9%20%D8%A7%D9%84%D8%B9%D9%85%D9%8A%D9%84.mp4` },
  { id: 85, title: 'كيف نتواصل مع ايباي', titleEn: 'How to Contact eBay', duration: '13 دقيقة', durationEn: '13 min', desc: 'طرق التواصل مع دعم eBay', descEn: 'Ways to contact eBay support', free: false, videoUrl: `${CDN}/85-%D9%83%D9%8A%D9%81%20%D9%86%D8%AA%D9%88%D8%A7%D8%B5%D9%84%20%D9%85%D8%B9%20%D8%A7%D9%8A%D8%A8%D8%A7%D9%8A.mp4` },
  { id: 86, title: 'رسالة شكر', titleEn: 'Thank You Message', duration: '4 دقائق', durationEn: '4 min', desc: 'رسالة شكر واختتام من الكوتش بشار', descEn: 'Thank you and closing message from Coach Bashar', free: false, videoUrl: `${CDN}/86-%D8%B1%D8%B3%D8%A7%D9%84%D8%A9%20%D8%B4%D9%83%D8%B1.mp4` }
]

export const QUIZZES = {
  1: {
    questions: [
      {
        q: "ما هو eBay؟",
        qEn: "What is eBay?",
        opts: ["سوق إلكتروني عالمي", "شركة تأمين", "منصة تواصل", "بنك رقمي"],
        optsEn: ["Global online marketplace", "Insurance company", "Social platform", "Digital bank"],
        correct: 0
      },
      {
        q: "متى تأسس eBay؟",
        qEn: "When was eBay founded?",
        opts: ["1990", "1995", "2000", "2005"],
        optsEn: ["1990", "1995", "2000", "2005"],
        correct: 1
      },
      {
        q: "ما معنى الدروبشيبينج؟",
        qEn: "What does dropshipping mean?",
        opts: ["البيع بدون امتلاك المخزون", "الشحن من الجمارك", "البيع المحلي فقط", "طريقة دفع إلكترونية"],
        optsEn: ["Selling without owning inventory", "Shipping from customs", "Local selling only", "Electronic payment method"],
        correct: 0
      }
    ]
  },
  10: {
    questions: [
      {
        q: "ما هو AliExpress؟",
        qEn: "What is AliExpress?",
        opts: ["موقع تسوق صيني", "شبكة اجتماعية", "بنك إلكتروني", "متجر محلي"],
        optsEn: ["Chinese shopping site", "Social network", "E-bank", "Local store"],
        correct: 0
      },
      {
        q: "ما أهم شيء عند اختيار مورد من AliExpress؟",
        qEn: "What is most important when choosing an AliExpress supplier?",
        opts: ["عدد المراجعات والتقييم", "لون الموقع", "اسم المورد", "موقع المخزن"],
        optsEn: ["Number of reviews and rating", "Website color", "Supplier name", "Warehouse location"],
        correct: 0
      }
    ]
  },
  25: {
    questions: [
      {
        q: "ما هو Payoneer؟",
        qEn: "What is Payoneer?",
        opts: ["منصة دفع دولية", "متجر إلكتروني", "بنك محلي", "شركة شحن"],
        optsEn: ["International payment platform", "Online store", "Local bank", "Shipping company"],
        correct: 0
      },
      {
        q: "كيف تحول أرباحك من Payoneer لبنكك؟",
        qEn: "How do you transfer your profits from Payoneer to your bank?",
        opts: ["تحويل بنكي مباشر", "نقداً من صراف", "بريد عادي", "لا يمكن التحويل"],
        optsEn: ["Direct bank transfer", "Cash from ATM", "Regular mail", "Cannot transfer"],
        correct: 0
      }
    ]
  },
  50: {
    questions: [
      {
        q: "ما هو Seller Hub؟",
        qEn: "What is Seller Hub?",
        opts: ["مركز تحكم البائع على eBay", "موقع لشراء المنتجات", "خدمة شحن", "تطبيق موبايل"],
        optsEn: ["eBay seller control center", "Product buying site", "Shipping service", "Mobile app"],
        correct: 0
      },
      {
        q: "ما أهم عامل في كتابة عنوان المنتج؟",
        qEn: "What is the most important factor in writing a product title?",
        opts: ["الكلمات المفتاحية", "طول العنوان", "اللغة المستخدمة", "ترتيب الحروف"],
        optsEn: ["Keywords", "Title length", "Language used", "Letter arrangement"],
        correct: 0
      }
    ]
  },
  86: {
    questions: [
      {
        q: "ما أهم نصيحة لنجاح رحلتك على eBay؟",
        qEn: "What is the most important tip for your eBay journey?",
        opts: ["الاستمرارية والتعلم المستمر", "البيع بأقل سعر دائماً", "بيع أي منتج تجده", "الانتظار فقط"],
        optsEn: ["Consistency and continuous learning", "Always sell at lowest price", "Sell any product you find", "Just wait"],
        correct: 0
      },
      {
        q: "كيف تتعامل مع المشكلات في eBay؟",
        qEn: "How do you handle problems on eBay?",
        opts: ["التواصل مع الدعم فوراً", "تجاهل المشكلة", "إغلاق الحساب", "تخفيض الأسعار"],
        optsEn: ["Contact support immediately", "Ignore the problem", "Close the account", "Lower prices"],
        correct: 0
      }
    ]
  }
}

export async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash)
}

export async function hashPassword(plain) {
  return bcrypt.hash(plain, 10)
}

export function getPublicUser(username) {
  const user = USERS[username]
  if (!user) return null
  const { passwordHash, ...safe } = user
  return { ...safe, username }
}
