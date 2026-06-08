// pages/api/quiz/[lessonId]/submit.js
import { requireAuth } from '../../../../lib/auth'
import { QUIZZES, USERS } from '../../../../lib/db'

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const lessonId = parseInt(req.query.lessonId)
  const quiz = QUIZZES[lessonId]

  if (!quiz) {
    return res.status(404).json({ error: 'كويز غير موجود' })
  }

  const { answers } = req.body

  if (!Array.isArray(answers) || answers.length !== quiz.questions.length) {
    return res.status(400).json({ error: 'إجابات غير مكتملة' })
  }

  // تصحيح الكويز
  let correct = 0
  const results = quiz.questions.map((q, i) => {
    const isCorrect = answers[i] === q.correct
    if (isCorrect) correct++
    return {
      question: q.q,
      yourAnswer: q.opts[answers[i]],
      correctAnswer: q.opts[q.correct],
      isCorrect
    }
  })

  const score = Math.round((correct / quiz.questions.length) * 100)

  // حفظ النتيجة
  const user = USERS[req.user.username]
  if (user) {
    if (!user.quizScores) user.quizScores = {}
    // احتفظ بأعلى نتيجة
    const prevScore = user.quizScores[lessonId] || 0
    user.quizScores[lessonId] = Math.max(prevScore, score)
  }

  return res.status(200).json({
    score,
    correct,
    total: quiz.questions.length,
    passed: score >= 60,
    results
  })
}

export default requireAuth(handler)
