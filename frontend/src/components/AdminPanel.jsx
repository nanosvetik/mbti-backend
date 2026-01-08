import { useState, useEffect } from 'react'
import { API_BASE_URL } from '../config';

const AdminPanel = ({ onBack }) => {
    const [name, setName] = useState('')
    const [gender, setGender] = useState('male')
    const [users, setUsers] = useState([])
    const [createdUserLink, setCreatedUserLink] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/users`)
            const data = await response.json()
            setUsers(data)
        } catch (error) {
            console.error('Error fetching users:', error)
        }
    }

    const handleCreate = async (e) => {
        e.preventDefault()
        if (!name.trim()) return

        setLoading(true)
        try {
            const response = await fetch(`${API_BASE_URL}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, gender })
            })

            const newUser = await response.json()

            const link = `${window.location.origin}/?id=${newUser.id}`
            setCreatedUserLink(link)
            fetchUsers()
            setName('')
        } catch (error) {
            console.error('Error creating user:', error)
            alert('Ошибка при создании пользователя')
        } finally {
            setLoading(false)
        }
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(createdUserLink)
        alert('Ссылка скопирована!')
    }

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Админ-панель NeuroHR</h1>
                    <button onClick={onBack} className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 transition">
                        ← Назад
                    </button>
                </div>

                {/* Форма создания */}
                <div className="bg-white p-6 rounded-xl shadow-sm mb-8 border border-gray-100">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">Регистрация нового кандидата</h2>
                    <form onSubmit={handleCreate} className="flex flex-wrap gap-4 items-end">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-medium text-gray-600 mb-1">Имя / Псевдоним</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Иван"
                                required
                            />
                        </div>
                        <div className="w-40">
                            <label className="block text-sm font-medium text-gray-600 mb-1">Пол</label>
                            <select
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                                className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="male">Мужской</option>
                                <option value="female">Женский</option>
                            </select>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-[#003366] text-white px-6 py-2.5 rounded-lg hover:bg-blue-900 transition disabled:opacity-50 font-medium"
                        >
                            {loading ? 'Создание...' : 'Сгенерировать ссылку'}
                        </button>
                    </form>

                    {createdUserLink && (
                        <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between">
                            <div>
                                <p className="text-blue-800 text-sm font-bold">Ссылка для кандидата готова:</p>
                                <p className="text-blue-600 text-xs font-mono break-all">{createdUserLink}</p>
                            </div>
                            <button
                                onClick={copyToClipboard}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm shrink-0 ml-4"
                            >
                                Копировать
                            </button>
                        </div>
                    )}
                </div>

                {/* Таблица пользователей */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-xl font-semibold text-gray-700">База верификации сотрудников</h2>
                    </div>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Кандидат</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Пол</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Методы верификации</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">ID</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">Результат</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {users.map((u) => {
                                // ПРОВЕРКИ СТАТУСОВ
                                const isTestDone = u.current_static_step >= 56;
                                // Если есть сообщения в чате, Нейро-текст пройден
                                const isChatDone = u.has_chat === true;
                                // Если есть запись голоса, Профайлинг пройден
                                const isVoiceDone = u.has_voice === true;

                                return (
                                    <tr key={u.id} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-[#003366]">{u.name}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {u.gender === 'male' ? 'Муж' : 'Жен'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1.5">
                                                {/* Психометрия */}
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${isTestDone ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Психометрия:</span>
                                                    <span className={`text-[9px] font-bold ${isTestDone ? 'text-green-600' : 'text-gray-400'}`}>
                                                        {isTestDone ? 'ГОТОВО' : 'ОЖИДАНИЕ'}
                                                    </span>
                                                </div>
                                                {/* Нейро-текст */}
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${isChatDone ? 'bg-green-500' : 'bg-blue-400'}`}></div>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Нейро-текст:</span>
                                                    <span className={`text-[9px] font-bold ${isChatDone ? 'text-green-600' : 'text-blue-500'}`}>
                                                        {isChatDone ? 'ГОТОВО' : 'АКТИВНО'}
                                                    </span>
                                                </div>
                                                {/* Профайлинг */}
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${isVoiceDone ? 'bg-green-500' : 'bg-blue-400'}`}></div>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Профайлинг:</span>
                                                    <span className={`text-[9px] font-bold ${isVoiceDone ? 'text-green-600' : 'text-blue-500'}`}>
                                                        {isVoiceDone ? 'ГОТОВО' : 'АКТИВНО'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <code className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                                                {u.id.substring(0, 8)}
                                            </code>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => window.open(`${API_BASE_URL}/api/v1/user-report/${u.id}/pdf`, '_blank')}
                                                className="bg-[#003366] text-white px-4 py-2 rounded-lg hover:bg-blue-900 transition text-[10px] font-bold uppercase tracking-widest shadow-sm"
                                            >
                                                PDF Отчет
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-gray-400 italic">
                                        Список кандидатов пока пуст...
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default AdminPanel