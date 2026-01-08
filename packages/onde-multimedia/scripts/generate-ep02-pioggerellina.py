#!/usr/bin/env python3
"""
Generate audio for Pioggerellina di Marzo podcast episode using Edge TTS
Episodio 02 - A.S. Novaro
"""
import asyncio
import edge_tts

# Testo dell'episodio - Gianni Parola legge Pioggerellina di Marzo
TEXT = """
Ciao piccoli amici, bentornati su Onde Podcast!
Sono Gianni Parola.

Oggi ascoltiamo insieme una poesia che parla di primavera... o meglio, della pioggerellina di marzo che ci annuncia il suo arrivo.
L'ha scritta Angiolo Silvio Novaro, un poeta italiano che amava la natura.
Chiudete gli occhi... e sentite la pioggia che canta.

Che dice la pioggerellina
di marzo, che picchia argentina
sui tegoli vecchi
del tetto, sui bruscoli secchi
dell'orto, sul fico e sul moro
ornati di gemmule d'oro?

Passata è l'uggiosa invernata,
passata, passata!

Di fuor dalla nuvola nera
di fuor dalla nuvola bigia
che in cielo si pigia,
domani uscirà Primavera
con pieno il grembiale
di tiepido sole,
di fresche viole,
di primule rosse, di battiti d'ale,
di nidi,
di gridi
di rondini, ed anche
di stelle di mandorlo, bianche...

Ciò dice la pioggerellina
sui tegoli vecchi
del tetto, sui bruscoli secchi
dell'orto, sul fico e sul moro
ornati di gemmule d'oro.

Ciò canta, ciò dice;
e il cuor che l'ascolta è felice.

Avete sentito? La pioggia di marzo non è una pioggia triste.
È una pioggerellina allegra che ci porta un messaggio: l'inverno sta finendo!
Domani arriverà la primavera, con il sole caldo, i fiori colorati, gli uccellini che tornano.

Quando piove, provate ad ascoltare: cosa vi dice la pioggia?
Forse vi sta annunciando qualcosa di bello.

Grazie per aver ascoltato Onde Podcast.
Se vi è piaciuta questa poesia, condividetela con chi amate.
Alla prossima, piccoli amici.
E ricordate: anche dopo la pioggia, arriva sempre il sole.
"""

# Voce italiana maschile calda (stessa di Ep.01)
VOICE = "it-IT-DiegoNeural"

OUTPUT_FILE = "/Users/mattia/Downloads/onde-podcast-ep02-pioggerellina.mp3"

async def main():
    print(f"🎙️  Onde Podcast - Episodio 02: Pioggerellina di Marzo")
    print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print(f"Voce: {VOICE}")
    print(f"Output: {OUTPUT_FILE}")
    print()

    communicate = edge_tts.Communicate(TEXT, VOICE, rate="-10%", pitch="-5Hz")
    await communicate.save(OUTPUT_FILE)

    print(f"✅ Audio generato: {OUTPUT_FILE}")
    print(f"📊 Durata stimata: ~2-3 minuti")

if __name__ == "__main__":
    asyncio.run(main())
