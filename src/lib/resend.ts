import "server-only";
import { Resend } from "resend";

const FROM_EMAIL = "Bashar Academy <noreply@bashar-academy.com>";

let _resend: Resend | null = null;

function getResend(): Resend | null {
  if (_resend) return _resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  _resend = new Resend(key);
  return _resend;
}

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}) {
  const resend = getResend();
  if (!resend) return null;
  return resend.emails.send({
    from: FROM_EMAIL,
    to: params.to,
    subject: params.subject,
    html: params.html,
  });
}

export const emailTemplates = {
  welcome: (name: string) => ({
    subject: "مرحباً بك في أكاديمية بشار",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>مرحباً ${name} 👋</h1>
        <p>شكراً لانضمامك إلى أكاديمية بشار للتدريب على تجارة eBay.</p>
        <p>أنت الآن جاهز لبدء رحلة التعلم وتحقيق أول عملية بيع.</p>
        <a href="${process.env.NEXT_PUBLIC_URL}/academy" style="display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 8px; margin-top: 16px;">
          ابدأ التعلم الآن
        </a>
      </div>
    `,
  }),

  purchaseConfirmation: (name: string, courseName: string) => ({
    subject: "تم تأكيد عملية الشراء",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>تمت عملية الشراء بنجاح ✅</h1>
        <p>مرحباً ${name}،</p>
        <p>لقد تم تفعيل اشتراكك في دورة <strong>${courseName}</strong>.</p>
        <p>يمكنك الآن الوصول إلى المحتوى الكامل للدورة.</p>
        <a href="${process.env.NEXT_PUBLIC_URL}/academy/my-courses" style="display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 8px; margin-top: 16px;">
          ابدأ الدورة
        </a>
      </div>
    `,
  }),

  bookingConfirmation: (name: string, date: string, time: string) => ({
    subject: "تم تأكيد حجز الاستشارة",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>تم تأكيد حجزك 📅</h1>
        <p>مرحباً ${name}،</p>
        <p>تم حجز استشارتك مع الكوتش بشار بنجاح.</p>
        <p><strong>التاريخ:</strong> ${date}</p>
        <p><strong>الوقت:</strong> ${time}</p>
        <p>سيتم إرسال رابط اللقاء قبل الموعد بوقت كافٍ.</p>
      </div>
    `,
  }),

  courseCompletion: (name: string, courseName: string) => ({
    subject: "مبروك إتمام الدورة 🎉",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>مبروك! 🎉</h1>
        <p>أحسنت ${name}،</p>
        <p>لقد أكملت بنجاح دورة <strong>${courseName}</strong>.</p>
        <p>شهادتك جاهزة للتحميل من لوحة التحكم.</p>
        <a href="${process.env.NEXT_PUBLIC_URL}/academy/certificates" style="display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 8px; margin-top: 16px;">
          عرض الشهادة
        </a>
      </div>
    `,
  }),

  bookingReminder: (name: string, date: string, time: string, meetLink?: string) => ({
    subject: "تذكير: استشارتك غداً",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>تذكير بالاستشارة ⏰</h1>
        <p>مرحباً ${name}،</p>
        <p>نذكرك باستشارتك المقررة غداً:</p>
        <p><strong>التاريخ:</strong> ${date}</p>
        <p><strong>الوقت:</strong> ${time}</p>
        ${meetLink ? `<p><strong>رابط اللقاء:</strong> <a href="${meetLink}">${meetLink}</a></p>` : ""}
        <p>نتطلع للقائك!</p>
      </div>
    `,
  }),
};
