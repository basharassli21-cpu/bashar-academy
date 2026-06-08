// pages/api/quiz/[lessonId]/index.js
import { requireAuth } from '../../../../lib/auth'
import { QUIZZES, USERS } from '../../../../lib/db'

async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const lessonId = parseInt(req.query.lessonId)
  const quiz = QUIZZES[lessonId]

  if (!quiz) return res.status(404).json({ error: 'لا يوجد كويز لهذا الدرس' })

  // إرسال الأسئلة بدون الإجابات الصحيحة
  const safeQuiz = {
    lessonId,
    questions: quiz.questions.map(q => ({
      q: q.q,
      opts: q.opts
    }))
  }

  const user = USERS[req.user.username]
  const prevScore = user?.quizScores?.[lessonId]

  return res.status(200).json({ quiz: safeQuiz, prevScore })
}

export default requireAuth(handler)
