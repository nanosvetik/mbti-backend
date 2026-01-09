const ResultScreen = ({ result, user }) => {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg overflow-hidden p-8 text-center animate-fade-in">
                <h2 className="text-2xl font-bold text-gray-700 mb-4">Поздравляем, {user.name}!</h2>
                <p className="text-gray-600 mb-8">Ваш первичный тип личности:</p>

                <div className="inline-block p-8 bg-green-500 text-white rounded-full shadow-lg mb-8 transform transition hover:scale-105">
                    <span className="text-6xl font-extrabold tracking-widest">{result.type}</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="p-3 bg-gray-100 rounded-lg">
                        <div className="font-bold text-gray-700">Экстраверсия (E)</div>
                        <div className="text-xl text-green-600">{result.E}</div>
                    </div>
                    <div className="p-3 bg-gray-100 rounded-lg">
                        <div className="font-bold text-gray-700">Интроверсия (I)</div>
                        <div className="text-xl text-green-600">{result.I}</div>
                    </div>

                    <div className="p-3 bg-gray-100 rounded-lg">
                        <div className="font-bold text-gray-700">Сенсорика (S)</div>
                        <div className="text-xl text-green-600">{result.S}</div>
                    </div>
                    <div className="p-3 bg-gray-100 rounded-lg">
                        <div className="font-bold text-gray-700">Интуиция (N)</div>
                        <div className="text-xl text-green-600">{result.N}</div>
                    </div>

                    <div className="p-3 bg-gray-100 rounded-lg">
                        <div className="font-bold text-gray-700">Мышление (T)</div>
                        <div className="text-xl text-green-600">{result.T}</div>
                    </div>
                    <div className="p-3 bg-gray-100 rounded-lg">
                        <div className="font-bold text-gray-700">Чувство (F)</div>
                        <div className="text-xl text-green-600">{result.F}</div>
                    </div>

                    <div className="p-3 bg-gray-100 rounded-lg">
                        <div className="font-bold text-gray-700">Суждение (J)</div>
                        <div className="text-xl text-green-600">{result.J}</div>
                    </div>
                    <div className="p-3 bg-gray-100 rounded-lg">
                        <div className="font-bold text-gray-700">Восприятие (P)</div>
                        <div className="text-xl text-green-600">{result.P}</div>
                    </div>
                </div>

                <button
                    onClick={() => window.location.reload()}
                    className="mt-8 text-green-600 hover:text-green-800 font-medium hover:underline"
                >
                    На главную
                </button>
            </div>
        </div>
    )
}

export default ResultScreen
