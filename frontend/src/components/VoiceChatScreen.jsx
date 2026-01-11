import { useState, useEffect, useRef } from 'react'
import { WS_BASE_URL } from '../config';

const floatTo16BitPCM = (float32Array) => {
    const buffer = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
        const s = Math.max(-1, Math.min(1, float32Array[i]));
        buffer[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return buffer.buffer;
};

const VoiceChatScreen = ({ user, onBack }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [status, setStatus] = useState('Подключение к Марине...');
    const [totalStats, setTotalStats] = useState({ input: 0, output: 0, cached: 0, cost: 0 });
    const [hasPermission, setHasPermission] = useState(false);

    const socket = useRef(null);
    const audioContext = useRef(null);
    const processor = useRef(null);
    const stream = useRef(null);
    const audioQueue = useRef([]);
    const isPlaying = useRef(false);

    // Функция запроса доступа
    const requestPermission = async () => {
        try {
            const s = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.current = s;
            setHasPermission(true);
            setStatus('Марина готова слушать');
        } catch (err) {
            console.error("Микрофон отклонен:", err);
            setStatus('Ошибка: нужен доступ к микрофону');
        }
    };

    // Проверяем доступ при входе
    useEffect(() => {
        requestPermission();
        return () => {
            if (stream.current) {
                stream.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const playNextInQueue = async () => {
        if (audioQueue.current.length === 0 || isPlaying.current) return;
        isPlaying.current = true;
        const base64Audio = audioQueue.current.shift();

        try {
            const binaryString = atob(base64Audio);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            const audioData = new Int16Array(bytes.buffer);
            const float32Data = new Float32Array(audioData.length);
            for (let i = 0; i < audioData.length; i++) {
                float32Data[i] = audioData[i] / 32768.0;
            }
            if (!audioContext.current) {
                audioContext.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
            }
            const buffer = audioContext.current.createBuffer(1, float32Data.length, 24000);
            buffer.getChannelData(0).set(float32Data);
            const source = audioContext.current.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContext.current.destination);
            source.onended = () => {
                isPlaying.current = false;
                playNextInQueue();
            };
            source.start();
        } catch (e) {
            console.error("Playback error:", e);
            isPlaying.current = false;
            playNextInQueue();
        }
    };

    useEffect(() => {
        socket.current = new WebSocket(`${WS_BASE_URL}/ws/chat/${user.id}`);
        socket.current.onopen = () => setStatus('Марина на связи');
        socket.current.onclose = () => setStatus('Связь разорвана');
        socket.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'audio_delta' && data.audio) {
                audioQueue.current.push(data.audio);
                playNextInQueue();
            }
            if (data.usage) {
                setTotalStats(prev => ({
                    input: prev.input + (data.usage.input || 0),
                    output: prev.output + (data.usage.output || 0),
                    cached: prev.cached + (data.usage.cached || 0),
                    cost: prev.cost + (data.cost || 0)
                }));
            }
        };
        return () => {
            socket.current?.close();
        };
    }, [user.id]);

    const startRecording = async () => {
        if (!hasPermission) return;
        try {
            setStatus('Вы говорите...');
            if (!stream.current || !stream.current.active) {
                stream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
            }
            if (!audioContext.current) {
                audioContext.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
            }
            const source = audioContext.current.createMediaStreamSource(stream.current);
            processor.current = audioContext.current.createScriptProcessor(4096, 1, 1);
            source.connect(processor.current);
            processor.current.connect(audioContext.current.destination);

            processor.current.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                const pcmBuffer = floatTo16BitPCM(inputData);
                if (socket.current?.readyState === WebSocket.OPEN) {
                    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(pcmBuffer)));
                    socket.current.send(JSON.stringify({ type: "audio_data", audio: base64Audio }));
                }
            };
            setIsRecording(true);
        } catch (err) {
            setStatus('Ошибка микрофона');
        }
    };

    const stopRecording = () => {
        if (processor.current) {
            processor.current.disconnect();
            processor.current = null;
        }
        setIsRecording(false);
        setStatus('Марина думает...');
        if (socket.current?.readyState === WebSocket.OPEN) {
            socket.current.send(JSON.stringify({ type: "commit" }));
        }
    };

    return (
        <div className="flex h-screen w-screen bg-[#111827] text-white font-sans overflow-hidden">
            <main className="flex-1 flex flex-col items-center justify-center relative">
                <button onClick={onBack} className="absolute top-8 left-8 px-5 py-2 border border-white/10 rounded-full text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm">
                    ← Завершить
                </button>

                {/* Если нет разрешения - показываем только вашу карточку */}
                {!hasPermission ? (
                    <div className="bg-black/40 p-10 rounded-3xl border border-white/10 text-center max-w-sm">
                        <p className="text-green-500 text-xs font-black tracking-widest mb-4">ACCESS REQUIRED</p>
                        <p className="text-gray-300 text-sm mb-6">Чтобы Марина могла вас слышать, нужно разрешить доступ к микрофону в браузере.</p>
                        <button
                            onClick={requestPermission}
                            className="w-full py-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-500 font-bold hover:bg-green-500 hover:text-white transition-all"
                        >
                            Разрешить микрофон
                        </button>
                    </div>
                ) : (
                    <>
                        <div
                            onMouseDown={startRecording}
                            onMouseUp={stopRecording}
                            className={`w-56 h-56 rounded-full flex items-center justify-center cursor-pointer transition-all duration-500 shadow-2xl ${isRecording ? 'bg-red-500 shadow-red-500/40 scale-110' : 'bg-green-600 shadow-green-500/20 hover:scale-105'}`}
                        >
                            <span className="text-6xl">{isRecording ? '●' : '🎤'}</span>
                        </div>
                        <div className="mt-12 text-center">
                            <h2 className="text-3xl font-black tracking-tight mb-2 uppercase">{status}</h2>
                            <p className="text-gray-500 text-xs uppercase tracking-[0.3em] font-bold">
                                {isRecording ? "Отпустите для отправки" : "Удерживайте для записи"}
                            </p>
                        </div>
                    </>
                )}
            </main>

            <aside className="w-80 bg-[#0f172a] border-l border-white/5 p-8 flex flex-col">
                <div className="flex-1">
                    <p className="text-[10px] font-black text-green-500 tracking-[0.2em] mb-4">SYSTEM LOG</p>
                    <div className="bg-black/40 rounded-2xl p-5 border border-white/5 text-[11px] font-mono text-gray-400">
                        <div>{isRecording ? "> AUDIO_UPLINK_ACTIVE" : "> STANDBY_MODE"}</div>
                        <div className="mt-2 opacity-50"># MODEL: MARINA-RT-V1</div>
                    </div>
                </div>

                <section className="space-y-4 pt-8 border-t border-white/5">
                    <p className="text-[10px] font-black text-green-500 tracking-[0.2em]">SESSION METRICS</p>

                    <div className="flex justify-between text-xs">
                        <span className="text-gray-500 uppercase tracking-tighter">Input Tokens</span>
                        <span className="font-bold text-white">{totalStats.input}</span>
                    </div>

                    <div className="flex justify-between text-xs">
                        <span className="text-gray-500 uppercase tracking-tighter">Cached (Saving)</span>
                        <span className="font-bold text-blue-400">{totalStats.cached}</span>
                    </div>

                    <div className="flex justify-between text-xs">
                        <span className="text-gray-500 uppercase tracking-tighter">Output Tokens</span>
                        <span className="font-bold text-white">{totalStats.output}</span>
                    </div>

                    <div className="bg-green-500/5 border border-green-500/10 p-5 rounded-2xl text-center">
                        <p className="text-[9px] text-gray-400 uppercase mb-1">Session Cost</p>
                        <p className="text-2xl font-black text-green-500">${totalStats.cost.toFixed(4)}</p>
                    </div>
                </section>
            </aside>
        </div>
    );
};

export default VoiceChatScreen;