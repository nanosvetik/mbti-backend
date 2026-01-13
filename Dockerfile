# 1. Берем готовый образ с Python
FROM python:3.11-slim

# 2. Внутри контейнера переходим в папку /app
WORKDIR /app

# 3. Настройки, чтобы логи сразу выводились в терминал
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# 4. Сначала копируем только список библиотек
COPY requirements.txt .

# 5. Устанавливаем их (теперь Docker будет использовать ваши зеркала)
RUN pip install --no-cache-dir -r requirements.txt

# 6. Копируем всё остальное (код, вопросы, шрифты)
COPY . .

# 7. Открываем порт для приложения
EXPOSE 8000

# 8. Команда старта
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]