import os
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
        bar_x = 95 # Чуть сдвинул вправо, чтобы длинные названия влезали
        
        self.set_font("ArialRus", "", 9)
        self.set_xy(start_x, self.get_y())
        self.cell(70, 8, label)
        
        curr_y = self.get_y() + 2
        # Рамка (фон)
        self.set_fill_color(240, 240, 240)
        self.rect(bar_x, curr_y, 70, 4, 'F') # Ширина 70
        
        # Заполнение (Синий БС)
        self.set_fill_color(0, 51, 102)
        safe_value = max(0, min(value, 100))
        # Масштабируем 100% в ширину 70
        self.rect(bar_x, curr_y, (safe_value / 100) * 70, 4, 'F')
        
        # Текст процента и буквы
        self.set_xy(bar_x + 75, curr_y - 2)
        self.set_font("ArialRus", "B", 9)
        display_text = f"{int(safe_value)}%"
        if dominant_letter:
            display_text += f" ({dominant_letter})"
        self.cell(0, 8, display_text, ln=True)

def create_pdf_report(data: dict, output_path: str):
    pdf = NeuroHRReport()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()

    # Заголовок
    pdf.set_font("ArialRus", "B", 16)
    pdf.cell(0, 10, f"Психологический профиль: {data.get('name', 'Кандидат')}", ln=True, align="C")
    
    pdf.ln(5)
    # ИСПРАВЛЕНО: Четкое название блока шкал
    pdf.set_font("ArialRus", "B", 12)
    pdf.cell(0, 10, "Результаты верификационного теста (самодиагностика):", ln=True)

    s1 = data.get('stage_1_static') or {}
    
    def get_bar_data(left_k, right_k):
        l_v, r_v = s1.get(left_k, 0), s1.get(right_k, 0)
        total = l_v + r_v
        if total == 0: return 50, ""
        if l_v >= r_v:
            return int((l_v/total)*100), left_k
        return int((r_v/total)*100), right_k

    # Отрисовка шкал
    val, let = get_bar_data("E", "I")
    pdf.draw_bar("Экстраверсия / Интроверсия (E/I)", val, let)
    
    val, let = get_bar_data("S", "N")
    pdf.draw_bar("Сенсорное восприятие / Интуиция (S/N)", val, let)
    
    val, let = get_bar_data("T", "F")
    pdf.draw_bar("Логика / Аналитика (T/F)", val, let)
    
    val, let = get_bar_data("J", "P")
    pdf.draw_bar("Организованность / Планирование (J/P)", val, let)

    # --- 2. НЕЗАВИСИМАЯ ЭКСПЕРТНАЯ ОЦЕНКА (БЛОК ИИ) ---
    reports = data.get('full_history', [])
    if not reports:
        single = data.get('stage_3_voice') or data.get('stage_2_chat')
        if single: reports = [single]
            
        # Проверяем, есть ли отчет из голоса, и добавляем его тоже
        v_rep = data.get('stage_3_voice')
        if isinstance(v_rep, dict) and v_rep.get('mbti_type'):
            reports.append(v_rep)

    if reports:
        pdf.ln(10)
        pdf.set_font("ArialRus", "B", 13)
        pdf.set_text_color(0, 51, 102)
        # Печатаем основной заголовок
        pdf.cell(0, 10, "Независимая экспертная оценка личностных характеристик (анализ ИИ):", ln=True)
        pdf.set_text_color(0, 0, 0)

        for idx, rep in enumerate(reports, 1):
            mbti = rep.get('mbti_type', '???')
            summary = str(rep.get('summary', ''))
            gaps = rep.get('skill_gaps', [])

            # Чтобы не было ошибки места, объединяем всё в один блок текста
            full_text = f"Вариант анализа №{idx} (Тип: {mbti})\n"
            full_text += f"Заключение: {summary}\n"
            
            if gaps:
                full_text += "Зоны развития: " + "; ".join(str(g) for g in gaps)

            pdf.set_font("ArialRus", "", 10)
            # Печатаем всё через multi_cell - это самый безопасный метод, он не дает ошибки места
            pdf.multi_cell(0, 6, full_text)
            pdf.ln(5)

    # Страница 2: Логи
    pdf.add_page()
    pdf.set_font("ArialRus", "B", 14)
    pdf.cell(0, 10, "Приложение №1: Протоколы интервью", ln=True)
    
    chat_logs = data.get('stage_2_chat', {}).get('chat_history', [])
    if chat_logs:
        pdf.set_font("ArialRus", "B", 11)
        pdf.cell(0, 10, "Текстовое интервью (Логи):", ln=True)
        for msg in chat_logs:
            role = "Кандидат: " if msg.get('role') == 'user' else "Система: "
            pdf.set_font("ArialRus", "B", 9); pdf.write(5, role)
            pdf.set_font("ArialRus", "", 9); pdf.write(5, str(msg.get('content', '')) + "\n\n")

    pdf.output(output_path)