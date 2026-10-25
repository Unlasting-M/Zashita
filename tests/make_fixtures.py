from pathlib import Path
from zipfile import ZipFile
from reportlab.pdfgen.canvas import Canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
out=Path('output/fixtures')
out.mkdir(parents=True,exist_ok=True)
text='Трансмиссионный механизм денежно-кредитной политики включает процентный канал и кредитный канал.'
(out/'paper.txt').write_text(text+' 货币政策利率渠道和信贷渠道。',encoding='utf-8')
pdfmetrics.registerFont(TTFont('Arial','C:/Windows/Fonts/arial.ttf'))
c=Canvas(str(out/'sample.pdf'))
c.setFont('Arial',12)
c.drawString(40,760,text[:62])
c.drawString(40,740,text[62:])
c.save()
with ZipFile(out/'sample.docx','w') as archive:
    archive.writestr('word/document.xml','<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>'+text+'</w:t></w:r></w:p></w:body></w:document>')
print('Isolated PDF/DOCX/TXT fixtures generated')
