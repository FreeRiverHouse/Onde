# PROCEDURA INVIO SU TELEGRAM

## CREDENZIALI TELEGRAM
- **BOT TOKEN**: `8272332520:AAF7zrKpqOCnFMqOlF1GJCLycJFk3IPO6ps`
- **CHAT ID**: `7505631979`

## COMANDI BASE

### 1. Inviare Messaggio di Testo
```bash
curl -s -X POST "https://api.telegram.org/bot8272332520:AAF7zrKpqOCnFMqOlF1GJCLycJFk3IPO6ps/sendMessage" \
  -d "chat_id=7505631979" \
  -d "text=Tuo messaggio qui" \
  -d "parse_mode=Markdown"
```

### 2. Inviare Documento (PDF, PPTX, etc.)
```bash
curl -s "https://api.telegram.org/bot8272332520:AAF7zrKpqOCnFMqOlF1GJCLycJFk3IPO6ps/sendDocument?chat_id=7505631979" \
  -F "document=@/percorso/del/file.pdf" \
  -F "caption=📄 *Titolo Documento* 

Descrizione del documento con formattazione Markdown.

📁 File: nome-file.pdf
🌊 ONDE - Where Stories Flow..."
```

### 3. Inviare Immagine
```bash
curl -s "https://api.telegram.org/bot8272332520:AAF7zrKpqOCnFMqOlF1GJCLycJFk3IPO6ps/sendPhoto?chat_id=7505631979" \
  -F "photo=@/percorso/dell/immagine.jpg" \
  -F "caption=🖼️ *Didascalia immagine* 

Testo descrittivo dell'immagine."
```

### 4. Inviare Messaggio con Formattazione
```bash
curl -s -X POST "https://api.telegram.org/bot8272332520:AAF7zrKpqOCnFMqOlF1GJCLycJFk3IPO6ps/sendMessage" \
  -d "chat_id=7505631979" \
  -d "text=*Testo grassetto*
_Testo corsivo_
`Testo monospazio`
📊 Emoji e simboli" \
  -d "parse_mode=Markdown"
```

## ESEMPI PRATICI USATI IN PROGETTO

### PowerPoint Launch Strategy
```bash
curl -s "https://api.telegram.org/bot8272332520:AAF7zrKpqOCnFMqOlF1GJCLycJFk3IPO6ps/sendDocument?chat_id=7505631979" \
  -F "document=@/Users/mattia/Projects/Onde/ONDE-LAUNCH-STRATEGY-V2.pptx" \
  -F "caption=📊 *ONDE Launch Strategy V2 - PowerPoint* 

☕ Pronto per il caffè! Presentazione completa con 14 slide professionali.

Contiene:
• Vision & Mission
• Launch Portfolio (Psalm 23 + Meditations)  
• Brand Identity & Visual Language
• Social Media Strategy
• Launch Posts (5 giorni)
• Engagement Tactics
• Success Metrics
• Budget Allocation
• Next Steps

📁 File: ONDE-LAUNCH-STRATEGY-V2.pptx
🌊 ONDE - Where Stories Flow..."
```

### Notifica Deploy Completato
```bash
curl -s -X POST "https://api.telegram.org/bot8272332520:AAF7zrKpqOCnFMqOlF1GJCLycJFk3IPO6ps/sendMessage" \
  -d "chat_id=7505631979" \
  -d "text=✅ *Deploy Completato*

Sito: onde.la
Ambiente: PROD
Timestamp: $(date)
🌊 ONDE - Where Stories Flow..." \
  -d "parse_mode=Markdown"
```

## NOTE IMPORTANTI
1. **Token corretto**: `JFk3` (non `JfK3`)
2. **Parse mode**: Usare `Markdown` per formattazione testo
3. **File path**: Usare path assoluti o relativi dal punto di esecuzione
4. **Caption**: Supporta Markdown e emoji
5. **Risposta**: Controllare sempre il JSON di risposta per verificare `{"ok":true}`

## TROUBLESHOOTING
- **Unauthorized**: Verificare token (probabile errore di battitura)
- **Bad Request**: Controllare formato file o path
- **Chat not found**: Verificare chat_id
- **File too large**: Telegram limite 50MB per documenti

## RIFERIMENTI
- Bot username: `@OndePR_bot`
- Chat type: private
- API Base URL: `https://api.telegram.org/bot[TOKEN]/`
