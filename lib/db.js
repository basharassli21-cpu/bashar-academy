import bcrypt from 'bcryptjs'

export const COURSES = {
  comprehensive: {
    id: 'comprehensive',
    nameAr: 'الدورة الشاملة على eBay',
    nameEn: 'Comprehensive eBay Course',
    descAr: 'دورة متكاملة تغطي كل جوانب البيع والربح على eBay',
    descEn: 'Complete course covering all aspects of eBay selling',
    lessons: [1, 2, 3, 4, 5],
    hours: 18,
    icon: '🏆'
  },
  intermediate: {
    id: 'intermediate',
    nameAr: 'الدورة المتوسطة على eBay',
    nameEn: 'Intermediate eBay Course',
    descAr: 'ارتقِ بمهاراتك واكتشف أسرار التسعير والتوسع',
    descEn: 'Elevate your skills and discover pricing secrets',
    lessons: [1, 2, 3],
    hours: 12,
    icon: '📈'
  },
  basic: {
    id: 'basic',
    nameAr: 'الدورة الأساسية على eBay',
    nameEn: 'Basic eBay Course',
    descAr: 'ابدأ رحلتك واكتسب الأساسيات لأول مبيعاتك',
    descEn: 'Start your journey and master the basics',
    lessons: [1, 2],
    hours: 6,
    icon: '🌱'
  }
}

export const USERS = {
  "student1": {
    name: "أحمد الخالد",
    avatar: "أخ",
    role: "student",
    // باسورد: demo123
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
    // باسورد: pass456
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
    // باسورد: Admin@2024!
    passwordHash: "$2a$10$U67Nd/q42cpThMd/9pRtwuTr9UO5DpQ03euRCWyFbil7tanKX2DA6",
    progress: {},
    quizScores: {},
    joinedAt: "2024-01-01"
  }
}

export const LESSONS = [
  {
    id: 1,
    title: "مقدمة في eBay",
    titleEn: "Introduction to eBay",
    duration: "18 دقيقة",
    durationEn: "18 min",
    desc: "أسرار البداية الصحيحة التي لم يخبرك أحد عنها",
    descEn: "The right start secrets nobody told you about",
    free: true,
    videoUrl: "/api/video/1",
    thumbnail: "/thumbnails/1.jpg"
  },
  {
    id: 2,
    title: "اختيار المنتج المربح",
    titleEn: "Choosing Profitable Products",
    duration: "24 دقيقة",
    durationEn: "24 min",
    desc: "معادلة اختيار المنتجات التي تبيع فعلاً",
    descEn: "The formula for choosing products that actually sell",
    free: false,
    videoUrl: "/api/video/2",
    thumbnail: "/thumbnails/2.jpg"
  },
  {
    id: 3,
    title: "إعداد الحساب واللستينق",
    titleEn: "Account Setup & Listing",
    duration: "31 دقيقة",
    durationEn: "31 min",
    desc: "الإعداد الاحترافي من اليوم الأول",
    descEn: "Professional setup from day one",
    free: false,
    videoUrl: "/api/video/3",
    thumbnail: "/thumbnails/3.jpg"
  },
  {
    id: 4,
    title: "التسعير والمنافسة",
    titleEn: "Pricing & Competition",
    duration: "22 دقيقة",
    durationEn: "22 min",
    desc: "كيف تضرب المنافسة بدون خفض السعر",
    descEn: "How to beat competition without lowering price",
    free: false,
    videoUrl: "/api/video/4",
    thumbnail: "/thumbnails/4.jpg"
  },
  {
    id: 5,
    title: "أول طلب وكيف تتعامل معه",
    titleEn: "Your First Order",
    duration: "19 دقيقة",
    durationEn: "19 min",
    desc: "الطلب الأول أصعب خطوة — سنعبرها سوياً",
    descEn: "The first order is the hardest step — we'll get through it together",
    free: false,
    videoUrl: "/api/video/5",
    thumbnail: "/thumbnails/5.jpg"
  }
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
        q: "ما الفرق الرئيسي بين eBay والأسواق الأخرى؟",
        qEn: "What's the main difference between eBay and other markets?",
        opts: ["أرخص دائماً", "يتيح المزاد العلني", "أسرع شحناً", "يبيع محلياً فقط"],
        optsEn: ["Always cheaper", "Allows auction bidding", "Faster shipping", "Local sales only"],
        correct: 1
      }
    ]
  },
  2: {
    questions: [
      {
        q: "ما أهم معيار لاختيار المنتج؟",
        qEn: "What is the most important product selection criterion?",
        opts: ["شكله الجميل", "هامش الربح", "حجمه الصغير", "لونه"],
        optsEn: ["Nice appearance", "Profit margin", "Small size", "Color"],
        correct: 1
      },
      {
        q: "الـ sell-through rate يعني؟",
        qEn: "Sell-through rate means?",
        opts: ["سعر البيع", "نسبة المنتجات المباعة من المعروضة", "ضريبة المبيعات", "تكلفة الشحن"],
        optsEn: ["Selling price", "Ratio of sold to listed items", "Sales tax", "Shipping cost"],
        correct: 1
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
