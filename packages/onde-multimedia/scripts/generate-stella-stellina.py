#!/usr/bin/env python3
"""
Generate audio for Stella Stellina podcast episode using Edge TTS
"""
import asyncio
import edge_tts

# Testo dell'episodio - Gianni Parola legge Stella Stellina
TEXT = """
Ciao piccoli amici, benvenuti su Onde Podcast!
Sono Gianni Parola, il vostro narratore.

Stasera vi porto una ninna nanna speciale, una poesia che le mamme e i nonni italiani cantano ai bambini da più di cento anni.
Si chiama "Stella Stellina", scritta da Lina Schwarz.
Preparatevi, mettetevi comodi... e ascoltiamo insieme.

Stella stellina,
la notte s'avvicina:
la fiamma traballa,
la mucca è nella stalla.

La mucca e il vitello,
la pecora e l'agnello,
la chioccia e il pulcino,
la mamma e il suo bambino.

Ognuno ha il suo piccino,
ognuno ha la sua mamma...
e tutti fan la nanna.

Avete notato? In questa poesia, ogni animale ha qualcuno che lo protegge.
La mucca ha il suo vitello, la pecora ha l'agnello, la chioccia ha il pulcino.
E voi? Chi vi tiene al sicuro stasera?

La notte non fa paura quando sappiamo che c'è qualcuno che ci vuole bene.
Come una stella che brilla nel cielo, anche lontana, ci ricorda che non siamo mai soli.

Grazie per aver ascoltato Onde Podcast.
Se vi è piaciuta Stella Stellina, fatela ascoltare anche ai vostri amici.
La prossima volta vi leggerò un'altra poesia della tradizione italiana.

Buona notte, piccoli amici. Sogni d'oro.
"""

# Voce italiana maschile calda
VOICE = "it-IT-DiegoNeural"  # Voce maschile italiana

OUTPUT_FILE = "/Users/mattia/Downloads/onde-podcast-ep01-stella-stellina.mp3"

async def main():
    print(f"Generando audio con voce: {VOICE}")
    print(f"Output: {OUTPUT_FILE}")

    communicate = edge_tts.Communicate(TEXT, VOICE, rate="-10%", pitch="-5Hz")
    await communicate.save(OUTPUT_FILE)

    print(f"\n✅ Audio generato: {OUTPUT_FILE}")
    print(f"Durata stimata: ~3-4 minuti")

if __name__ == "__main__":
    asyncio.run(main())
