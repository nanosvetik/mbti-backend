import { useState } from 'react'

const WelcomeScreen = ({ user, onStart, onAdmin }) => {
    const userName = user?.name || 'Гость';

    // Проверяем, прошел ли пользователь все 56 вопросов теста
    const isQuizFinished = user?.current_static_step >= 56;

    // Для Этапа 3: можно завязать на наличие отчета или флага в БД
    // Пока оставим проверку, что тест пройден, чтобы кнопка была активна для теста
    const isVoiceReady = isQuizFinished;

    return (
        <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-6 font-sans text-gray-900">
            <div className="w-full max-w-6xl bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] p-10 md:p-16 border border-gray-50 text-center">

                {/* Заголовок */}
                <div className="mb-14">
                    <span className="text-[#4CAF50] font-bold uppercase tracking-[0.3em] text-xs">AI-платформа</span>
                    <h1 className="text-4xl md:text-5xl font-black mt-4 leading-tight text-gray-900">
                        Добро пожаловать, <span className="text-[#4CAF50]">{userName}</span>!<br />
                        Ваш персональный Акмеолог
                    </h1>
                </div>

                {/* Сетка сценариев */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">

                    {/* Сценарий 1: Тест (Блокируется, если пройден) */}
                    <button
                        onClick={() => !isQuizFinished && onStart('quiz')}
                        disabled={isQuizFinished}
                        className={`group p-10 rounded-[2.5rem] border-2 transition-all duration-500 text-left relative overflow-hidden flex flex-col h-full ${isQuizFinished
                            ? 'bg-gray-50 border-gray-100 cursor-not-allowed opacity-60'
                            : 'bg-white border-gray-100 hover:border-[#4CAF50] hover:shadow-2xl hover:shadow-green-100'
                            }`}
                    >
                        <div className="text-5xl mb-6 grayscale-[0.5]">📝</div>
                        <div className={`text-[11px] uppercase font-black mb-2 tracking-widest ${isQuizFinished ? 'text-gray-400' : 'text-[#4CAF50]'}`}>
                            Этап 1 {isQuizFinished && '✓'}
                        </div>
                        <div className="text-2xl font-bold text-gray-800 mb-3 leading-tight">MBTI Тест</div>
                        <p className="text-sm text-gray-500 leading-relaxed font-medium flex-grow">
                            {isQuizFinished ? 'Ваш базовый профиль успешно определен.' : '56 ситуаций для определения вашего профиля.'}
                        </p>
                        {isQuizFinished && (
                            <div className="mt-6 text-gray-400 font-bold text-sm italic">Пройдено</div>
                        )}
                    </button>

                    {/* Сценарий 2: Чат (Текстовое интервью) */}
                    <button
                        onClick={() => isQuizFinished ? onStart('chat') : alert('Сначала необходимо пройти Этап 1')}
                        className={`group p-10 rounded-[2.5rem] border-2 transition-all duration-500 text-left relative flex flex-col h-full ${isQuizFinished
                            ? 'bg-white border-gray-100 hover:border-[#4CAF50] hover:shadow-2xl hover:shadow-green-100'
                            : 'bg-gray-50 border-transparent opacity-50 cursor-not-allowed'
                            }`}
                    >
                        <div className="text-5xl mb-6">💬</div>
                        <div className={`text-[11px] uppercase font-black mb-2 tracking-widest ${isQuizFinished ? 'text-[#4CAF50]' : 'text-gray-400'}`}>Этап 2</div>
                        <div className="text-2xl font-bold text-gray-800 mb-3 leading-tight">AI Интервью</div>
                        <p className="text-sm text-gray-500 leading-relaxed font-medium flex-grow">Текстовое глубокое общение с ИИ для расшифровки ваших талантов.</p>
                    </button>

                    {/* Сценарий 3: REALTIME VOICE (Голосовой чат) */}
                    <button
                        onClick={() => isVoiceReady ? onStart('voice') : alert('Доступно после завершения базового интервью')}
                        className={`group p-10 rounded-[2.5rem] border-2 transition-all duration-500 text-left relative flex flex-col h-full ${isVoiceReady
                            ? 'bg-[#111827] border-transparent hover:shadow-2xl hover:shadow-blue-900/20 text-white'
                            : 'bg-gray-50 border-transparent opacity-50 cursor-not-allowed'
                            }`}
                    >
                        <div className="text-5xl mb-6">🎙️</div>
                        <div className={`text-[11px] uppercase font-black mb-2 tracking-widest ${isVoiceReady ? 'text-[#4CAF50]' : 'text-gray-400'}`}>Этап 3</div>
                        <div className={`text-2xl font-bold mb-3 leading-tight ${isVoiceReady ? 'text-white' : 'text-gray-800'}`}>Realtime Voice</div>
                        <p className={`text-sm leading-relaxed font-medium flex-grow ${isVoiceReady ? 'text-gray-400' : 'text-gray-500'}`}>
                            Живой голосовой диалог с Мариной через высокоскоростной протокол GPT-Realtime.
                        </p>
                        {isVoiceReady && (
                            <div className="mt-6 flex items-center gap-2">
                                <span className="flex h-2 w-2 rounded-full bg-[#4CAF50] animate-pulse"></span>
                                <span className="text-[10px] font-bold text-[#4CAF50] uppercase tracking-tighter">Система готова</span>
                            </div>
                        )}
                    </button>
                </div>

                {/* Вход для экспертов */}
                <div className="mt-8 pt-10 border-t border-gray-100/80">
                    <button
                        onClick={onAdmin}
                        className="inline-flex items-center px-6 py-2.5 bg-gray-50 text-gray-500 hover:text-[#4CAF50] hover:bg-green-50 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-300 border border-transparent hover:border-green-100"
                    >
                        Вход для экспертов
                    </button>
                </div>
            </div>
        </div>
    )
}

export default WelcomeScreen