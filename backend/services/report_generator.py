import os
import re
from fpdf import FPDF

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

class NeuroHRReport(FPDF):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.add_font("ArialRus", "", os.path.join(BASE_DIR, "arial.ttf"), uni=True)
        self.add_font("ArialRus", "B", os.path.join(BASE_DIR, "arialbd.ttf"), uni=True)

    def header(self):
        logo_path = os.path.join(BASE_DIR, "logo.png")
        if os.path.exists(logo_path):
            self.image(logo_path, x=75, y=10, w=60)
            self.ln(45)
        self.set_font("ArialRus", "B", 12)
        self.cell(0, 6, "МБОО САГ «Братские сердца» | Дмитрий Кравченко", ln=True, align="C")
        self.set_font("ArialRus", "", 9)
        title_text = "Создание нейро-HR для интеллектуального подбора и распределения обязанностей сотрудников на основе акмеолого-компетентностного подхода."
        self.multi_cell(0, 5, title_text, align="C")
        self.ln(5)
        self.line(20, self.get_y(), 190, self.get_y())
        self.ln(10)

    def draw_bar(self, label, value, dominant_letter=""):
        start_x = 20
        bar_x = 95 
        self.set_font("ArialRus", "", 9)
        self.set_xy(start_x, self.get_y())
        self.cell(70, 8, label)
        curr_y = self.get_y() + 2
        self.set_fill_color(240, 240, 240)
        self.rect(bar_x, curr_y, 70, 4, 'F') 
        self.set_fill_color(0, 51, 102)
        safe_value = max(0, min(value, 100))
        self.rect(bar_x, curr_y, (safe_value / 100) * 70, 4, 'F')
        self.set_xy(bar_x + 75, curr_y - 2)
        self.set_font("ArialRus", "B", 9)
        display_text = f"{int(safe_value)}%"
        if dominant_letter: display_text += f" ({dominant_letter})"
        self.cell(0, 8, display_text, ln=True)

def create_pdf_report(data: dict, file_path: str):
    pdf = NeuroHRReport()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()

    def safe_text(text):
        if not text: return ""
        return re.sub(r'[^\w\s\d\.,!\?\-:"\(\)А-яёЁ]', '', str(text))

    # 1. ЗАГОЛОВОК
    pdf.set_font("ArialRus", "B", 16)
    name = safe_text(data.get('name', 'Кандидат'))
    pdf.cell(0, 10, f"Психологический профиль: {name}", ln=True, align="C")
    pdf.ln(5)

    # 2. ШКАЛЫ (БЕЗ ИЗМЕНЕНИЙ)
    pdf.set_font("ArialRus", "B", 12)
    pdf.cell(0, 10, "Результаты верификационного теста (самодиагностика):", ln=True)
    s1 = data.get('stage_1_static') or {}
    def get_bar_data(l_k, r_k):
        try:
            l_v, r_v = float(s1.get(l_k, 0)), float(s1.get(r_k, 0))
            total = l_v + r_v
            if total == 0: return 50, ""
            return (int((l_v/total)*100), l_k) if l_v >= r_v else (int((r_v/total)*100), r_k)
        except: return 50, ""

    for l_k, r_k, lbl in [("E","I","Экстраверсия / Интроверсия (E/I)"), ("S","N","Сенсорика / Интуиция (S/N)"), ("T","F","Логика / Этика (T/F)"), ("J","P","Организованность / Планирование (J/P)")]:
        v, let = get_bar_data(l_k, r_k)
        pdf.draw_bar(lbl, v, let)
    pdf.ln(5)

   # --- ОБЪЕДИНЕННАЯ СЕКЦИЯ: ЭКСПЕРТИЗА + ЛОГИ ---
    pdf.add_page()
    pdf.set_font("ArialRus", "B", 14)
    pdf.set_text_color(0, 0, 0)
    pdf.cell(0, 10, "Независимая экспертная оценка (анализ ИИ) и протоколы интервью", ln=True)
    pdf.ln(5)

    # Берем историю сообщений
    # Мы берем её из stage_2_chat, так как там лежит полная стенограмма
    history = data.get('stage_2_chat', {}).get('chat_history', [])
    
    if history:
        for m in history:
            content = m.get('content', '')
            
            # Мы НИЧЕГО не удаляем (даже технические MARIN_REPORT), 
            # чтобы данные точно не пропали
            txt = safe_text(str(content))
            
            if not txt.strip():
                continue
                
            role = "Кандидат: " if m.get('role') == 'user' else "Система: "
            
            # Оформляем красиво
            pdf.set_font("ArialRus", "B", 9)
            pdf.write(5, role)
            
            pdf.set_font("ArialRus", "", 9)
            pdf.write(5, txt + "\n\n")

    pdf.output(file_path)