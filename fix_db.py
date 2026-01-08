import os
import sys
import json

# Добавляем текущую директорию в пути поиска
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from backend.database import SessionLocal
    from backend import models
    print("✅ Связь с backend установлена")
except ImportError as e:
    print(f"❌ Ошибка импорта: {e}")
    sys.exit(1)

def seed_from_json():
    db = SessionLocal()
    
    # Проверяем два возможных пути к файлу
    possible_paths = [
        os.path.join(os.path.dirname(__file__), 'questions.json'),         # в корне
        os.path.join(os.path.dirname(__file__), 'backend', 'questions.json') # в папке backend
    ]
    
    json_path = None
    for path in possible_paths:
        if os.path.exists(path):
            json_path = path
            break

    if not json_path:
        print("❌ Файл questions.json не найден ни в корне, ни в папке backend!")
        return

    print(f"📂 Использую файл: {json_path}")

    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        # Очищаем таблицу перед загрузкой
        db.query(models.StaticQuestion).delete()

        count = 0
        for block in data:
            situation = block['situation']
            for q_data in block['questions']:
                question = models.StaticQuestion(
                    situation=situation,
                    text=q_data['q'],
                    option_a=q_data['a'],
                    key_a=q_data['ka'],
                    option_b=q_data['b'],
                    key_b=q_data['kb'],
                    axis=q_data['axis']
                )
                db.add(question)
                count += 1
        
        db.commit()
        print(f"🚀 Успех! В базу загружено {count} вопросов.")
    
    except Exception as e:
        print(f"💥 Ошибка при чтению или записи: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_from_json()