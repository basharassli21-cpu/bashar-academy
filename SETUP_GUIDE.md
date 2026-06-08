# 🚀 دليل النشر الكامل — أكاديمية بشار

## ⚡ الخلاصة السريعة
> من الصفر للموقع الحقيقي في أقل من ساعة، مجاناً

---

## الخطوة 1 — تثبيت الأدوات (مرة واحدة فقط)

### تثبيت Node.js
- اذهب لـ https://nodejs.org
- حمّل النسخة LTS (الخضراء)
- ثبّتها عادي

### تثبيت Git
- اذهب لـ https://git-scm.com
- حمّل وثبّت

### تحقق من التثبيت
افتح Terminal أو Command Prompt واكتب:
```
node --version
git --version
```
يجب أن تظهر أرقام النسخ

---

## الخطوة 2 — تجهيز المشروع

### افتح Terminal في مجلد المشروع
```bash
cd bashar-academy
npm install
```
انتظر حتى ينتهي (دقيقتين تقريباً)

### إنشاء ملف الإعدادات
انسخ الملف:
```bash
cp .env.example .env.local
```

افتح `.env.local` وغيّر:
1. `JWT_SECRET` — اكتب أي كلام طويل عشوائي (30+ حرف)
2. روابط الفيديوهات — ضع روابطك الحقيقية

### تجربة محلية
```bash
npm run dev
```
افتح المتصفح على: http://localhost:3000

---

## الخطوة 3 — رفع الفيديوهات (مهم جداً)

### الخيار الأفضل: Bunny.net
1. اذهب لـ https://bunny.net
2. أنشئ حساب مجاني
3. أنشئ Storage Zone باسم "bashar-academy"
4. ارفع ملفات الفيديو
5. انسخ روابط CDN وضعها في `.env.local`

### لماذا Bunny.net؟
- CDN سريع جداً للشرق الأوسط ✅
- أرخص من AWS وGCP ✅
- سهل الاستخدام ✅
- يدعم video streaming ✅

---

## الخطوة 4 — النشر على Vercel (مجاناً)

### 1. أنشئ حساب GitHub
- اذهب لـ https://github.com
- سجّل مجاناً

### 2. ارفع الكود
```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/USERNAME/bashar-academy.git
git push -u origin main
```

### 3. أنشئ حساب Vercel
- اذهب لـ https://vercel.com
- سجّل بحساب GitHub

### 4. انشر المشروع
- اضغط "New Project"
- اختر مستودع bashar-academy
- اضغط "Deploy"

### 5. أضف متغيرات البيئة
في Vercel → Settings → Environment Variables:
```
JWT_SECRET     = [نفس القيمة في .env.local]
VIDEO_1_URL    = [رابط الفيديو 1]
VIDEO_2_URL    = [رابط الفيديو 2]
...
```

### 6. أعد النشر
Deployments → Redeploy

---

## الخطوة 5 — ربط دومين خاص (اختياري)

في Vercel → Settings → Domains:
- أضف دومينك مثل: academy.basharebay.com
- اتبع تعليمات DNS

---

## إضافة طلاب جديدين

### الطريقة السهلة (عبر لوحة الأدمن):
1. ادخل بحسابك الأدمن
2. اذهب لتبويب "طالب جديد"
3. أدخل البيانات واضغط إضافة

### الطريقة اليدوية (في lib/db.js):
```javascript
"اسم_المستخدم": {
  name: "الاسم الكامل",
  avatar: "حرفان",
  role: "student",
  // شغّل هذا في node للحصول على الهاش:
  // node -e "const b=require('bcryptjs');b.hash('الباسورد',10).then(console.log)"
  passwordHash: "HASH_HERE",
  progress: {},
  quizScores: {},
  joinedAt: "2024-01-01"
}
```

---

## إضافة دروس جديدة

في `lib/db.js` في مصفوفة LESSONS:
```javascript
{
  id: 6,
  title: "اسم الدرس",
  duration: "25 دقيقة",
  desc: "وصف الدرس",
  free: false,
  videoUrl: "/api/video/6",
  thumbnail: "/thumbnails/6.jpg"
}
```

وفي `.env.local`:
```
VIDEO_6_URL=https://رابط-الفيديو.mp4
```

---

## الترقية للقاعدة البيانات الحقيقية (مستقبلاً)

عندما يكبر عدد الطلاب (50+):
1. **Supabase** — PostgreSQL مجاني، واجهة عربية
   - https://supabase.com
   - يستبدل `lib/db.js` باستعلامات SQL حقيقية
   
2. **PlanetScale** — MySQL في الكلاود
   - أسرع وأكثر استقراراً

---

## 🔒 ملاحظات الأمان

| الحماية | كيف تعمل |
|---------|-----------|
| كلمات المرور | مشفرة bcrypt - حتى لو اخترق أحد السيرفر ما يقدر يقرأها |
| الجلسات | JWT في httpOnly cookie - JavaScript ما يقدر يسرقها |
| الفيديوهات | محمية بـ API - ما في رابط مباشر |
| الأدمن | صلاحيات منفصلة على مستوى السيرفر |
| Brute Force | حد أقصى 5 محاولات في الدقيقة |
| CSRF | sameSite:strict على الكوكيز |

---

## 💰 التكاليف

| الخدمة | السعر |
|--------|-------|
| Vercel (hosting) | مجاناً |
| GitHub | مجاناً |
| Bunny.net (فيديو) | ~1$ لكل 1TB تحميل |
| Domain | ~10$/سنة |
| **الإجمالي** | **تقريباً 10$/سنة** |

---

## 📞 مشاكل شائعة

**المشكلة: `npm install` يعطي خطأ**
→ تأكد Node.js v18+ مثبت

**المشكلة: الفيديو ما يشتغل**
→ تأكد من رابط الفيديو في .env.local وأن السيرفر يدعم range requests

**المشكلة: تسجيل الدخول يعطي خطأ بعد النشر**
→ تأكد JWT_SECRET مضاف في Vercel Environment Variables

**المشكلة: الموقع بطيء**
→ ارفع الفيديوهات على Bunny.net بدل رابط مباشر
