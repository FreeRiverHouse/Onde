from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, PageBreak
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from reportlab.lib.colors import HexColor
import os

# Setup
book_dir = os.path.expanduser("~/Onde/books/marco-aurelio-bambini")
img_dir = os.path.join(book_dir, "images-grok")
pdf_path = os.path.join(book_dir, "Marco-Aurelio-Bambini.pdf")

# Styles
styles = getSampleStyleSheet()
title_style = ParagraphStyle(
    'Title',
    parent=styles['Title'],
    fontSize=36,
    textColor=HexColor('#8B4513'),
    alignment=TA_CENTER,
    spaceAfter=20
)
subtitle_style = ParagraphStyle(
    'Subtitle',
    parent=styles['Normal'],
    fontSize=18,
    textColor=HexColor('#666666'),
    alignment=TA_CENTER,
    fontName='Times-Italic'
)
chapter_style = ParagraphStyle(
    'Chapter',
    parent=styles['Heading1'],
    fontSize=24,
    textColor=HexColor('#8B4513'),
    alignment=TA_CENTER,
    spaceAfter=20
)
body_style = ParagraphStyle(
    'Body',
    parent=styles['Normal'],
    fontSize=12,
    alignment=TA_JUSTIFY,
    spaceAfter=12,
    leading=18
)

# Chapter data
chapters = [
    ("Capitolo 1: Il Piccolo Lottatore", "cap01-wrestling-villa.jpg", [
        "Tanto tempo fa, nella splendida Roma antica, viveva un bambino di nome Marco. Aveva i capelli ricci e gli occhi curiosi che brillavano sempre di domande.",
        "Marco amava lottare nel cortile della villa con il suo maestro greco. Non per vincere, ma per imparare. 'La disciplina,' diceva il maestro, 'è il primo passo verso la saggezza.'"
    ]),
    ("Capitolo 2: Una Nuova Famiglia", "cap02-adoption-left.png", [
        "Un giorno, l'imperatore Antonino Pio scelse Marco come suo figlio adottivo. Marco aveva solo 17 anni, ma già tutti vedevano in lui qualcosa di speciale.",
        "'Non è il potere che conta,' gli disse Antonino, 'ma come lo usi per aiutare gli altri.'"
    ]),
    ("Capitolo 3: Le Meditazioni all'Alba", "cap03-meditation-left.png", [
        "Ogni mattina, prima che il sole sorgesse, Marco si sedeva in silenzio a riflettere. Scriveva i suoi pensieri in un diario che chiamava 'A Se Stesso'.",
        "'Controlla i tuoi pensieri,' scriveva, 'e controllerai la tua vita.'"
    ]),
    ("Capitolo 4: La Grande Prova", "cap04-plague-left.png", [
        "Una terribile malattia colpì Roma. Marco non si nascose nel palazzo. Uscì tra la gente, aiutando i malati e confortando chi aveva perso i propri cari.",
        "'Le difficoltà,' diceva, 'sono opportunità per dimostrare chi siamo veramente.'"
    ]),
    ("Capitolo 5: Alla Frontiera", "cap05-frontier-camp.png", [
        "Marco dovette andare lontano, ai confini dell'impero, dove i soldati combattevano per proteggere Roma. Non amava la guerra, ma sapeva che a volte bisogna difendere chi si ama.",
        "Anche nelle notti fredde, continuava a scrivere i suoi pensieri alla luce delle candele."
    ]),
    ("Capitolo 6: Il Diario della Saggezza", "cap06-meditations-left.png", [
        "Le sue 'Meditazioni' parlavano di cose semplici ma importanti: essere gentili, accettare ciò che non possiamo cambiare, fare del nostro meglio ogni giorno.",
        "'Non perdere tempo a lamentarti,' scriveva. 'Usa quel tempo per migliorare.'"
    ]),
    ("Capitolo 7: L'Imperatore Umile", "cap07-emperor-senate.png", [
        "Anche quando divenne imperatore, Marco rimase umile. Ascoltava tutti, dai senatori più importanti ai cittadini più semplici.",
        "'Il vero potere,' diceva, 'sta nel servire gli altri, non nel comandarli.'"
    ]),
    ("Capitolo 8: Tra la Gente", "cap08-stoic-streets.png", [
        "Marco amava camminare per le strade di Roma vestito semplicemente, parlando con la gente comune. Voleva capire le loro vite, le loro gioie e i loro problemi.",
        "'Siamo tutti parte della stessa famiglia umana,' ripeteva sempre."
    ]),
    ("Capitolo 9: La Saggezza Continua", "cap09-legacy-grandson.png", [
        "Negli ultimi anni, Marco passava molto tempo con i giovani, raccontando storie e insegnando ciò che aveva imparato.",
        "'La cosa più importante,' diceva ai bambini, 'è essere buoni. Tutto il resto viene dopo.'"
    ]),
    ("Capitolo 10: Un Regalo per Tutti", "cap10-final-wisdom.png", [
        "Marco Aurelio ci ha lasciato un tesoro: i suoi scritti pieni di saggezza che ancora oggi aiutano le persone di tutto il mondo.",
        "E tu, piccolo lettore, cosa scriveresti nel tuo diario della saggezza?",
        "'La felicità della tua vita dipende dalla qualità dei tuoi pensieri.' — Marco Aurelio"
    ])
]

# Create PDF
doc = SimpleDocTemplate(pdf_path, pagesize=A4, 
                       leftMargin=2*cm, rightMargin=2*cm,
                       topMargin=2*cm, bottomMargin=2*cm)
story = []

# Cover
story.append(Spacer(1, 6*cm))
story.append(Paragraph("Marco Aurelio", title_style))
story.append(Paragraph("L'Imperatore Filosofo", subtitle_style))
story.append(Spacer(1, 3*cm))
story.append(Paragraph("Un libro per bambini sulla saggezza stoica", body_style))
story.append(Spacer(1, 4*cm))
story.append(Paragraph("Onde Editrice 🫧", body_style))
story.append(PageBreak())

# Chapters
for title, img_file, paragraphs in chapters:
    story.append(Paragraph(title, chapter_style))
    
    img_path = os.path.join(img_dir, img_file)
    if os.path.exists(img_path):
        img = Image(img_path, width=14*cm, height=10*cm)
        img.hAlign = 'CENTER'
        story.append(img)
    
    story.append(Spacer(1, 0.5*cm))
    
    for para in paragraphs:
        story.append(Paragraph(para, body_style))
    
    story.append(PageBreak())

doc.build(story)
print(f"PDF created: {pdf_path}")
