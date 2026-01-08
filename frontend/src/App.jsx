import { useState, useEffect } from 'react'
import WelcomeScreen from './components/WelcomeScreen'
import QuizScreen from './components/QuizScreen'
import ResultScreen from './components/ResultScreen'
import AdminPanel from './components/AdminPanel'
import ChatScreen from './components/ChatScreen'
// Импортируем наш будущий голосовой экран
import VoiceChatScreen from './components/VoiceChatScreen'
import { API_BASE_URL } from './config';

function App() {
  const [screen, setScreen] = useState('welcome')
  const [user, setUser] = useState(null)
  const [result, setResult] = useState(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const userId = params.get('id')

    if (userId) {
      fetchUser(userId)
    }
  }, [])

  const fetchUser = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`)
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        setScreen('welcome')
      } else {
        console.error('User not found')
      }
    } catch (error) {
      console.error('Error fetching user:', error)
    }
  }

  const handleFinish = (resultData) => {
    setResult(resultData)
    setScreen('result')
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* ГЛАВНЫЙ ЭКРАН С ВЫБОРОМ ТРЕХ ЭТАПОВ */}
      {screen === 'welcome' && (
        <WelcomeScreen
          user={user}
          // Теперь type может быть 'quiz', 'chat' или 'voice'
          onStart={(type) => setScreen(type)}
          onAdmin={() => setScreen('admin')}
        />
      )}

      {/* ЭТАП 1: ТЕСТ */}
      {screen === 'quiz' && user && (
        <QuizScreen user={user} onFinish={handleFinish} />
      )}

      {/* ЭТАП 2: ТЕКСТОВЫЙ ЧАТ */}
      {screen === 'chat' && user && (
        <ChatScreen user={user} onBack={() => setScreen('welcome')} />
      )}

      {/* ЭТАП 3: ГОЛОСОВОЙ РЕАЛТАЙМ ЧАТ (НОВЫЙ) */}
      {screen === 'voice' && user && (
        <VoiceChatScreen user={user} onBack={() => setScreen('welcome')} />
      )}

      {/* РЕЗУЛЬТАТЫ */}
      {screen === 'result' && result && (
        <ResultScreen result={result} user={user} />
      )}

      {/* АДМИНКА */}
      {screen === 'admin' && (
        <AdminPanel onBack={() => setScreen('welcome')} />
      )}
    </div>
  )
}

export default App