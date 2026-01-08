import { useState, useEffect } from 'react'
import { API_BASE_URL } from '../config';

const QuizScreen = ({ user, onFinish }) => {
    const [questions, setQuestions] = useState([])
    const [currentIndex, setCurrentIndex] = useState(user?.current_static_step || 0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchQuestions()
    }, [])

    const fetchQuestions = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/questions`)
            const data = await response.json()
            setQuestions(data)
            setLoading(false)
        } catch (error) {
            console.error('Error fetching questions:', error)
            setLoading(false)
        }
    }

    const handleAnswer = async (selectedKey) => {
        const question = questions[currentIndex]
        try {
            await fetch(`${API_BASE_URL}/answers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id,
                    question_id: question.id,
                    selected_key: selectedKey
                })
            })

            if (currentIndex < questions.length - 1) {
                setCurrentIndex(currentIndex + 1)
            } else {
                finishQuiz()
            }
        } catch (error) {
            console.error('Error submitting answer:', error)
        }
    }

    const finishQuiz = async () => {
        setLoading(true)
        try {
            const response = await fetch(`${API_BASE_URL}/users/${user.id}/result`)
            const data = await response.json()
            onFinish(data)
        } catch (error) {
            console.error('Error calculating result:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400 italic">Алекс подготавливает вопросы...</div>

    const currentQuestion = questions[currentIndex]
    const progress = ((currentIndex + 1) / questions.length) * 100

    const getMotivationalText = (progress) => {
        if (progress <= 20) return "Начинаем погружение... 🌱"
        if (progress <= 50) return "Отлично идете, вы очень искренни! ✨"
        if (progress <= 85) return "Большая часть пути пройдена! 🔥"
        return "Почти у цели, последние штрихи! 🏁"
    }

    return (
        <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-6">
            {/* Мощный Прогресс-бар */}
            <div className="fixed top-0 left-0 w-full h-3 bg-gray-200 z-50">
                <div
                    className="h-full bg-[#4CAF50] transition-all duration-1000 ease-out shadow-[0_2px_10px_rgba(76,175,80,0.3)]"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            <div className="w-full max-w-2xl">
                {/* Эмоциональный заголовок */}
                <div className="text-center mb-10">
                    <span className="text-[#4CAF50] font-bold uppercase tracking-[0.2em] text-xs">Процесс тестирования</span>
                    <h1 className="text-2xl font-medium text-gray-800 mt-2 italic">
                        «{getMotivationalText(progress)}»
                    </h1>
                </div>

                {/* Карточка вопроса */}
                <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-10 md:p-14 border border-gray-50">

                    <div className="inline-block bg-green-50 text-[#4CAF50] px-4 py-1 rounded-full text-sm font-bold mb-6">
                        Ситуация {currentIndex + 1}
                    </div>

                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-12 leading-[1.4]">
                        {currentQuestion.text}
                    </h2>

                    <div className="space-y-5">
                        {[
                            { key: currentQuestion.key_a, text: currentQuestion.option_a, label: 'A' },
                            { key: currentQuestion.key_b, text: currentQuestion.option_b, label: 'B' }
                        ].map((opt) => (
                            <button
                                key={opt.key}
                                onClick={() => handleAnswer(opt.key)}
                                className="w-full group flex items-center p-6 text-left border-2 border-gray-100 rounded-2xl transition-all duration-300 hover:bg-[#4CAF50] hover:border-[#4CAF50] hover:shadow-xl hover:shadow-green-100 active:scale-[0.98]"
                            >
                                <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 font-bold group-hover:bg-white/20 group-hover:text-white transition-colors mr-6 text-xl">
                                    {opt.label}
                                </div>
                                <span className="text-lg md:text-xl text-gray-700 group-hover:text-white font-medium transition-colors">
                                    {opt.text}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <p className="text-center mt-10 text-gray-400 text-sm font-light">
                    Шаг {currentIndex + 1} из {questions.length} • Ваши ответы сохраняются автоматически
                </p>
            </div>
        </div>
    )
}

export default QuizScreen