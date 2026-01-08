import { useState, useEffect, useRef } from 'react'
import { API_BASE_URL } from '../config';

// Функция для перевода аудио-буфера браузера в формат, который понимает OpenAI
const floatTo16BitPCM = (float32Array) => {
    const buffer = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
        const s = Math.max(-1, Math.min(1, float32Array[i]));
        buffer[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return buffer.buffer;
};

// --- ВСПОМОГАТЕЛЬНЫЙ КОМПОНЕНТ ДЛЯ ГРАФИКОВ ---
const AnalysisResult = ({ report, onBack }) => {
    const RenderScale = ({ label, left, right, value }) => (
        <div style={{ marginBottom: '25px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '900', marginBottom: '8px', color: '#374151' }}>
                <span>{left}</span>
                <span>{right}</span>
            </div>
            <div style={{ height: '8px', backgroundColor: '#E5E7EB', borderRadius: '10px', position: 'relative' }}>
                <div style={{
                    position: 'absolute',
                    left: `${value}%`,
                    width: '16px',
                    height: '16px',
                    backgroundColor: '#4CAF50',
                    borderRadius: '50%',
                    top: '-4px',
                    transform: 'translateX(-50%)',
                    boxShadow: '0 0 10px rgba(76, 175, 80, 0.4)',
                    border: '2px solid white'
                }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '6px' }}>
                <span style={{ fontSize: '10px', color: '#4CAF50', fontWeight: 'bold' }}>{value}% к {value > 50 ? right[0] : left[0]}</span>
            </div>
        </div>
    );

    return (
        <div style={{ padding: '40px', maxWidth: '900px', margin: '0 auto', backgroundColor: 'white', minHeight: '100vh', fontFamily: 'sans-serif' }}>
            <button onClick={onBack} style={{ marginBottom: '30px', color: '#4CAF50', border: '1px solid #4CAF50', padding: '8px 16px', borderRadius: '6px', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                ← На главную
            </button>

            <header style={{ marginBottom: '40px', borderBottom: '4px solid #111827', paddingBottom: '20px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: '900', margin: 0, color: '#111827' }}>ПРОФИЛЬ КОМПЕТЕНЦИЙ: {report.mbti_type}</h1>
                <p style={{ color: '#6B7280', marginTop: '5px', fontWeight: 'bold' }}>ЗАКЛЮЧЕНИЕ АКМЕОЛОГИЧЕСКОЙ ЭКСПЕРТИЗЫ</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '50px' }}>
                <div>
                    <h3 style={{ fontSize: '14px', fontWeight: '900', marginBottom: '25px', textTransform: 'uppercase', letterSpacing: '1px' }}>Психологические оси</h3>
                    <RenderScale left="Экстраверсия (E)" right="Интроверсия (I)" value={report.metrics.E_I} />
                    <RenderScale left="Сенсорика (S)" right="Интуиция (N)" value={report.metrics.S_N} />
                    <RenderScale left="Логика (T)" right="Этика (F)" value={report.metrics.T_F} />
                    <RenderScale left="Рациональность (J)" right="Иррациональность (P)" value={report.metrics.J_P} />
                </div>

                <div style={{ backgroundColor: '#F3F4F6', padding: '30px', borderRadius: '16px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '900', marginBottom: '15px', color: '#111827' }}>АНАЛИЗ ЛИЧНОСТИ</h3>
                    <p style={{ fontSize: '15px', lineHeight: '1.7', color: '#374151', whiteSpace: 'pre-wrap' }}>{report.summary}</p>
                </div>
            </div>

            <div style={{ marginTop: '50px', backgroundColor: '#111827', padding: '30px', borderRadius: '16px', color: 'white' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '900', marginBottom: '20px', color: '#4CAF50', textTransform: 'uppercase' }}>Рекомендации по развитию (Skill Gaps)</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    {report.skill_gaps.map((gap, i) => (
                        <div key={i} style={{ padding: '15px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '13px', borderLeft: '3px solid #4CAF50' }}>
                            {gap}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- ОСНОВНОЙ ЭКРАН ЧАТА ---
const ChatScreen = ({ user, onBack }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [totalStats, setTotalStats] = useState({ input: 0, output: 0, cached: 0, cost: 0 });
    const [currentDiagnostic, setCurrentDiagnostic] = useState(null);
    const [finalReport, setFinalReport] = useState(null);
    const messagesEndRef = useRef(null);
    const isStarted = useRef(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    useEffect(() => {
        const initChat = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/chat/history/${user.id}`);
                const historyData = await response.json();
                if (historyData && historyData.length > 0) {
                    // Очищаем историю от технических тегов при загрузке
                    const cleanedHistory = historyData.map(m => ({
                        text: m.content.replace(/\[\[LOG:.*?\]\]/g, '').replace(/<REPORT>[\s\S]*?<\/REPORT>/g, '').trim(),
                        sender: m.role === 'user' ? 'user' : 'bot'
                    })).filter(m => m.text !== "");

                    setMessages(cleanedHistory);
                    isStarted.current = true;
                } else if (!isStarted.current) {
                    isStarted.current = true;
                    handleSendMessage("Начни диалог", true);
                }
            } catch (error) { console.error(error); }
        };
        initChat();
    }, [user.id]);

    const handleSendMessage = async (text, isInternal = false) => {
        if (!isInternal) {
            setMessages(prev => [...prev, { text, sender: 'user' }]);
            setInput('');
        }
        setIsTyping(true);
        try {
            const response = await fetch(`${API_BASE_URL}/chat?user_id=${user.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });
            const data = await response.json();

            // ПРОВЕРКА: Если сервер прислал ошибку, не идем дальше
            if (data.detail) {
                console.error("Ошибка сервера:", data.detail);
                setIsTyping(false);
                return;
            }

            // --- ДОБАВЛЯЕМ ЛОГИКУ ЗАВЕРШЕНИЯ ТУТ ---

            // 1. Проверяем, пришел ли отчет или флаг финала
            if (data.report || data.is_final) {
                console.log("🏁 Диалог завершен, готовим отчет...");

                // Если отчет пришел, сохраняем его и переключаем экран через 2 секунды
                // (даем время прочитать прощальную фразу бота)
                setTimeout(() => {
                    if (data.report) {
                        setFinalReport(data.report);
                    } else {
                        // На случай, если флаг есть, а отчет потерялся —
                        // можно либо выкинуть на начало, либо показать ошибку
                        console.warn("Флаг финала есть, но данных отчета нет");
                    }
                }, 2000);
            }
            // ---------------------------------------

            // 1. Обработка логов диагностики
            const logRegex = /\[\[LOG: (.*?)\]\]/g;
            const logMatches = [...data.text.matchAll(logRegex)];
            if (logMatches.length > 0) {
                setCurrentDiagnostic(logMatches[logMatches.length - 1][1]);
            }

            // 2. Обработка финального отчета
            let reportObj = data.report;
            if (!reportObj) {
                const reportMatch = data.text.match(/<REPORT>([\s\S]*?)<\/REPORT>/);
                if (reportMatch) {
                    try { reportObj = JSON.parse(reportMatch[1]); } catch (e) { console.error("JSON Parse error", e); }
                }
            }

            // 3. Очистка текста от ЛОГОВ и РЕПОРТОВ для отображения в пузырьке
            const cleanText = data.text
                .replace(/\[\[LOG:.*?\]\]/g, '')
                .replace(/<REPORT>[\s\S]*?<\/REPORT>/g, '')
                .trim();

            if (cleanText) setMessages(prev => [...prev, { text: cleanText, sender: 'bot' }]);

            // Если отчет найден — переключаем экран через 1.5 секунды (чтобы успели прочитать последнее сообщение)
            if (reportObj) {
                setTimeout(() => {
                    setFinalReport(reportObj);
                }, 1500);
            }

            // Обновляем статы
            setTotalStats(prev => ({
                input: prev.input + (data.usage?.input || 0),
                output: prev.output + (data.usage?.output || 0),
                cached: prev.cached + (data.usage?.cached || 0),
                cost: prev.cost + (data.cost || 0)
            }));
        } catch (error) {
            console.error(error);
        } finally {
            setIsTyping(false);
        }
    };

    if (finalReport) {
        return <AnalysisResult report={finalReport} onBack={onBack} />;
    }

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: '#F9FAFB' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', borderRight: '1px solid #E5E7EB', backgroundColor: 'white' }}>
                <div style={{ padding: '16px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', backgroundColor: '#4CAF50', color: 'white', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>💬</div>
                        <span style={{ fontWeight: '900', fontSize: '14px', color: '#111827' }}>АКМЕОЛОГ</span>
                    </div>
                    <button onClick={onBack} style={{ color: '#9CA3AF', fontSize: '20px', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#F9FAFB' }}>
                    {messages.map((m, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: m.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                            <div style={{ maxWidth: '80%', padding: '16px', borderRadius: '12px', fontSize: '14px', backgroundColor: m.sender === 'user' ? '#4CAF50' : 'white', color: m.sender === 'user' ? 'white' : '#374151', border: m.sender === 'user' ? 'none' : '1px solid #E5E7EB' }}>
                                {m.text}
                            </div>
                        </div>
                    ))}
                    {isTyping && <div style={{ fontSize: '12px', color: '#9CA3AF', fontStyle: 'italic' }}>анализирует...</div>}
                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={(e) => { e.preventDefault(); if (input.trim()) handleSendMessage(input); }} style={{ padding: '16px', borderTop: '1px solid #E5E7EB', display: 'flex', gap: '12px' }}>
                    <input value={input} onChange={(e) => setInput(e.target.value)} style={{ flex: 1, padding: '12px', backgroundColor: '#F3F4F6', borderRadius: '8px', border: 'none', outline: 'none' }} placeholder="Напишите сообщение..." />
                    <button type="submit" style={{ padding: '0 20px', backgroundColor: '#111827', color: 'white', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>↑</button>
                </form>
            </div>

            <div style={{ width: '220px', backgroundColor: '#2D3139', display: 'flex', flexDirection: 'column', color: 'white' }}>
                <div style={{ flex: 1 }}></div>
                <div style={{ padding: '16px' }}>
                    <p style={{ fontSize: '9px', color: '#4CAF50', fontWeight: '900', marginBottom: '8px' }}>DIAGNOSTIC LOG</p>
                    <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '4px' }}>
                        <p style={{ fontSize: '11px', color: 'black', fontWeight: 'bold', lineHeight: '1.4' }}>{currentDiagnostic || "SYSTEM_OK"}</p>
                    </div>
                </div>
                <div style={{ padding: '16px', borderTop: '1px solid #3d424d' }}>
                    <p style={{ fontSize: '9px', color: '#4CAF50', fontWeight: '900', marginBottom: '12px' }}>STATS</p>
                    <div style={{ fontSize: '11px', display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ color: '#9CA3AF' }}>INPUT</span><span style={{ color: '#4CAF50', fontWeight: 'bold' }}>{totalStats.input}</span>
                    </div>

                    <div style={{ fontSize: '11px', display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ color: '#9CA3AF' }}>CACHE</span>
                        <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>{totalStats.cached}</span>
                    </div>

                    <div style={{ fontSize: '11px', display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ color: '#9CA3AF' }}>OUTPUT</span><span style={{ color: '#4CAF50', fontWeight: 'bold' }}>{totalStats.output}</span>
                    </div>
                </div>
                <div style={{ padding: '16px', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                    <p style={{ fontSize: '9px', color: '#9CA3AF', textAlign: 'center', marginBottom: '4px' }}>COST</p>
                    <div style={{ textAlign: 'center', fontSize: '18px', fontWeight: '900', color: '#4CAF50' }}>${totalStats.cost.toFixed(5)}</div>
                </div>
            </div>
        </div>
    )
}

export default ChatScreen;