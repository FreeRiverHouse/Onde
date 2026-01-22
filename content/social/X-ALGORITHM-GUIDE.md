# X (Twitter) Algorithm Guide
## Analisi completa per @FreeRiverHouse, @Onde_FRH, @magmatic__

*Basato sull'analisi del codice open source di Twitter/X (the-algorithm)*

---

## 1. Architettura del Feed "For You"

### Come funziona il processo di raccomandazione

Il feed "For You" passa attraverso queste fasi principali:

1. **Candidate Generation** (~1500 tweet candidati)
   - ~50% In-Network (persone che segui)
   - ~50% Out-of-Network (raccomandazioni algoritmiche)

2. **Feature Hydration** (~6000 features per tweet)

3. **Scoring e Ranking** (modelli ML)
   - Light Ranker (logistic regression)
   - Heavy Ranker (neural network)

4. **Filtering e Diversificazione**
   - Filtri spam/NSFW/qualita
   - Author diversity (max tweet per autore)
   - Content balance

5. **Mixing** (inserimento ads, Who-to-follow)

---

## 2. Fattori Chiave dell'Algoritmo

### 2.1 Engagement Signals (Peso ALTO)

| Segnale | Peso Relativo | Note |
|---------|---------------|------|
| **Replies** | MOLTO ALTO | Specialmente replies che generano conversazioni |
| **Retweets** | ALTO | Amplificazione virale |
| **Likes** | ALTO | Segnale di qualita base |
| **Quote Tweets** | MOLTO ALTO | Indica contenuto discussione-worthy |
| **Bookmarks** | ALTO | Segnale di valore duraturo |
| **Clicks sul tweet** | MEDIO | Interesse implicito |
| **Video watch time** | ALTO | Per video, % completamento conta |
| **Profile visits** | MEDIO | Indica interesse nell'autore |
| **Dwell time** | ALTO | Tempo speso a leggere (1-10+ secondi) |
| **Share via DM** | ALTO | Segnale di contenuto condivisibile |

**Insight dal codice:**
```scala
// Dal RecapFeatures.scala - Dwell time e varie soglie
IS_DWELLED_1S, IS_DWELLED_2S, ... IS_DWELLED_10S
IS_TWEET_DETAIL_DWELLED_8_SEC, IS_TWEET_DETAIL_DWELLED_15_SEC, IS_TWEET_DETAIL_DWELLED_25_SEC
```
Il dwell time (tempo di permanenza sul tweet) e misurato in soglie multiple - piu lungo = meglio.

### 2.2 Content Signals

| Contenuto | Effetto | Strategia |
|-----------|---------|-----------|
| **Immagini native** | BOOST | Sempre preferibili a link esterni |
| **Video nativi** | BOOST FORTE | Specialmente se guardati >50% |
| **Link esterni** | NEUTRO/PENALITA | Riduce reach (spinge fuori dalla piattaforma) |
| **Hashtag** | LIMITATO | 1-2 max, troppi = spam signal |
| **Mentions** | NEUTRO | Troppe = spam signal |
| **Thread (self-reply)** | BOOST | Favorisce contenuto lungo-formato |
| **Cards** | NEUTRO | Poll, articoli |

**Dal codice HomeFeatures.scala:**
```scala
HasImageFeature, HasVideoFeature, HasMultipleMedia
TweetUrlsFeature // Link esterni tracciati
NumHashtags, NumMentions // Conteggi monitorati
```

### 2.3 User/Author Signals

| Segnale Autore | Effetto | Note |
|----------------|---------|------|
| **Verifica Blue** | BOOST LEGGERO | AuthorIsBlueVerifiedFeature |
| **Verifica Gold** | BOOST | AuthorIsGoldVerifiedFeature |
| **Legacy Verified** | BOOST | AuthorIsLegacyVerifiedFeature |
| **Follower count** | INDIRETTO | Usato per calcoli di credibilita |
| **Account age** | POSITIVO | Account piu vecchi = piu trusted |
| **TweepCred** | IMPORTANTE | Score PageRank della reputazione |

**TweepCred (Reputation Score):**
```
Il TweepCred e un punteggio 0-100 basato su PageRank che misura
l'influenza di un utente nella rete. Considera:
- Chi ti segue (qualita dei follower)
- Rapporto followers/following
- Interazioni con account di alta reputazione
```

### 2.4 Real Graph (Relationship Score)

Uno dei segnali piu importanti. Predice la probabilita che tu interagisca con un altro utente.

**Componenti:**
- Numero di interazioni passate (fav, RT, reply)
- Profile visits
- Conversazioni DM
- Address book (se condiviso)
- Frequenza di interazione

**Dal codice:**
```scala
RealGraphInNetworkScoresFeature // Score per ogni relazione
REAL_GRAPH_WEIGHT // Peso nelle feature di ranking
```

### 2.5 Timing Signals

| Fattore Tempo | Effetto |
|---------------|---------|
| **Freschezza** | Tweet recenti favoriti |
| **Decay** | Score decade nel tempo |
| **Peak hours** | Maggiore competizione ma piu reach potenziale |
| **Costanza** | Pubblicare regolarmente mantiene il "momentum" |

---

## 3. Cosa PENALIZZA i Tweet

### 3.1 Filtri Attivi nel Codice

```scala
// Filtri identificati in home-mixer/filter/
GrokSpamFilter       // Contenuto spam
GrokNsfwFilter       // Contenuto NSFW
GrokGoreFilter       // Contenuto violento
GrokViolentFilter    // Violenza
FeedbackFatigueFilter // Troppo contenuto dallo stesso autore/topic
AuthorDedupFilter    // Limita tweet multipli stesso autore
```

### 3.2 Trust & Safety Models

| Modello | Cosa Rileva |
|---------|-------------|
| pNSFWMedia | Immagini adult/porn |
| pNSFWText | Testo sessuale/adult |
| pToxicity | Insulti, harassment marginale |
| pAbuse | Hate speech, violazioni TOS |

### 3.3 Negative Engagement Signals

```scala
// Dal RecapFeatures.scala
IS_DONT_LIKE           // "Non mi interessa"
IS_BLOCK_CLICKED       // Click su blocca
IS_MUTE_CLICKED        // Click su silenzia
IS_REPORT_TWEET_CLICKED // Segnalazione tweet
IS_NEGATIVE_FEEDBACK   // Feedback negativo generico
IS_SEE_FEWER          // "Mostra meno"
IS_NOT_INTERESTED_IN  // "Non mi interessa"
```

### 3.4 Fattori di Penalizzazione

| Comportamento | Penalita |
|---------------|----------|
| Troppi hashtag (>3) | Spam signal |
| Troppi @ mentions | Spam signal |
| Link shorteners sospetti | Spam/phishing signal |
| Engagement baiting esplicito | Penalizzato |
| Account con basso TweepCred | Reach ridotto |
| Contenuto ripetitivo | FeedbackFatigue |
| Alto ratio following/followers | Penalita TweepCred |

---

## 4. Cosa BOOOSTA i Tweet

### 4.1 Score Multipliers Identificati

**Out-of-Network Scaling:**
```scala
// OONTweetScalingScorer.scala
private val ScaleFactor = 0.75
// I tweet OON hanno uno scaling 0.75x - favorisce In-Network
```

**Author Diversity Discount:**
```scala
// DiversityDiscountProvider.scala
private val Decay = 0.5
private val Floor = 0.25
// Dopo il primo tweet, i successivi dello stesso autore
// vengono penalizzati esponenzialmente
```

### 4.2 Positive Engagement Cascade

Il sistema traccia engagement "a cascata":
```scala
IS_REPLIED_REPLY_ENGAGED_BY_AUTHOR  // Reply che riceve engagement dall'autore
IS_FAVORITED_FAV_ENGAGED_BY_AUTHOR  // Like che genera engagement reciproco
IS_PROFILE_CLICKED_AND_PROFILE_ENGAGED // Visita profilo + engagement
```

**Implicazione:** Rispondere ai reply sui propri tweet crea un loop positivo.

### 4.3 Content Quality Signals

```scala
// Text quality score include:
- Content entropy (varieta lessicale)
- Readability score
- Length appropriata
- Assenza di "shout" score (TUTTO MAIUSCOLO)
- Assenza di offensiveness
```

---

## 5. Raccomandazioni Specifiche

### Per @FreeRiverHouse (Account Principale Progetto)

**Obiettivo:** Massimizzare authority e reach nel settore real estate/community

1. **Contenuto Prioritario:**
   - Thread dettagliati sul progetto (self-reply = boost)
   - Video tour delle proprieta (native video = boost forte)
   - Behind-the-scenes con immagini multiple
   - Update milestone con dati concreti

2. **Strategia Engagement:**
   - Rispondere SEMPRE ai reply entro le prime ore
   - Quote-tweet contenuti dei partner con commento sostanzioso
   - Creare poll per decisioni community (engagement facile)

3. **Timing:**
   - Postare negli orari di picco Italia/Europa: 12-14, 18-21
   - Consistenza: 1-2 post/giorno minimo
   - Thread lunghi: pubblicare al mattino per massimo dwell time

4. **Evitare:**
   - Link esterni nel tweet principale (metterli in reply)
   - Piu di 2 hashtag
   - Engagement baiting esplicito ("RT se...")

### Per @Onde_FRH (Account Onde/Eventi)

**Obiettivo:** Engagement community, viralita locale

1. **Contenuto Prioritario:**
   - Video eventi in diretta
   - Foto before/after degli spazi
   - Stories della community (user-generated content)
   - Annunci eventi con visual accattivante

2. **Strategia Engagement:**
   - Tag partecipanti negli eventi (non troppi per tweet)
   - Creare momenti condivisibili durante eventi
   - Retweet/quote strategici da @FreeRiverHouse

3. **Cross-promotion:**
   - Interazioni reciproche con @FreeRiverHouse aumentano Real Graph
   - Menzionare @magmatic__ per contenuti tecnici/artistici

### Per @magmatic__ (Account Personale/Tecnico)

**Obiettivo:** Thought leadership, networking professionale

1. **Contenuto Prioritario:**
   - Thread tecnici/educativi
   - Hot takes sul settore (genera discussione)
   - Progetti side con visual
   - Opinioni su trend tech/crypto/AI

2. **Strategia Engagement:**
   - Partecipare a conversazioni con account di alta authority
   - Quote tweet con analisi (non semplici RT)
   - Rispondere a thread virali con insight originali

3. **Network Building:**
   - Interagire costantemente con 20-30 account target
   - Il Real Graph si costruisce con interazioni ripetute
   - Conversazioni > broadcast

---

## 6. Best Practices Universali

### 6.1 Formato Ottimale dei Tweet

```
[Hook forte - prima riga cattura attenzione]

[Corpo del messaggio - 2-3 punti chiave]

[Media nativo - immagine/video]

[Call-to-action soft o domanda]
```

### 6.2 Checklist Pre-Pubblicazione

- [ ] Il tweet ha un hook nei primi 50 caratteri?
- [ ] C'e un media nativo (non link esterno)?
- [ ] Hashtag <= 2?
- [ ] Nessun engagement baiting esplicito?
- [ ] E un buon orario per il mio audience?
- [ ] Ho tempo per rispondere ai reply nelle prossime 2 ore?

### 6.3 Metriche da Monitorare

| Metrica | Target | Perche |
|---------|--------|--------|
| Reply rate | >2% | Indica contenuto discussione-worthy |
| Bookmark rate | >0.5% | Indica valore duraturo |
| Profile visits | Crescita costante | Real Graph building |
| Dwell time (se disponibile) | >5 sec media | Contenuto engaging |

### 6.4 Pattern Settimanale Consigliato

| Giorno | Tipo Contenuto | Note |
|--------|----------------|------|
| Lunedi | Thread educativo/update | Inizio settimana, alta attenzione |
| Martedi | Behind-the-scenes | Contenuto visual |
| Mercoledi | Engagement post (poll/domanda) | Meta settimana |
| Giovedi | News/annunci | Pre-weekend |
| Venerdi | Contenuto leggero/community | Mood weekend |
| Weekend | User-generated, repost | Minore effort, mantenere presenza |

---

## 7. Errori Comuni da Evitare

1. **Linkare subito a siti esterni**
   - Soluzione: Link in primo reply, non nel tweet principale

2. **Hashtag stuffing**
   - Mai piu di 2 hashtag per tweet

3. **Pubblicare e sparire**
   - Le prime 2 ore sono critiche per l'engagement

4. **Contenuto solo broadcast**
   - Bilanciare con conversazioni e reply

5. **Engagement pods/gruppi**
   - L'algoritmo rileva pattern artificiali

6. **Troppi tweet in poco tempo**
   - AuthorDiversityDiscount penalizza

7. **Ignorare i reply**
   - Il Real Graph si costruisce con reciprocita

8. **Screenshot di testo**
   - Preferire testo nativo (indicizzabile, accessibile)

---

## 8. Note Tecniche sull'Algoritmo

### SimClusters
Il sistema crea "comunita" di utenti con interessi simili. I tweet vengono embedati in queste comunita per trovare match.

**Implicazione:** Essere consistenti nei topic aiuta l'algoritmo a categorizzare e raccomandare.

### Tweet Embeddings
Ogni tweet ha un embedding che si aggiorna con ogni like ricevuto. L'InterestedIn vector dell'utente che mette like viene sommato all'embedding del tweet.

**Implicazione:** I primi like da utenti influenti "orientano" il tweet verso audience simili.

### Heavy Ranker
Il modello di ranking finale e una neural network multi-task che predice simultaneamente:
- Probabilita di like
- Probabilita di retweet
- Probabilita di reply
- Probabilita di click
- Probabilita di negative feedback

**Implicazione:** Ottimizzare per un solo tipo di engagement non e sufficiente.

---

## Conclusioni

L'algoritmo di X/Twitter favorisce:
1. **Contenuto nativo** (media uploadati direttamente)
2. **Conversazioni genuine** (reply, quote con valore)
3. **Consistenza** (pubblicazione regolare)
4. **Qualita delle relazioni** (Real Graph)
5. **Dwell time** (contenuto che fa fermare a leggere)

Penalizza:
1. **Spam signals** (hashtag, link sospetti, baiting)
2. **Contenuto ripetitivo** (stesso autore/topic troppo frequente)
3. **Negative feedback** (don't like, block, mute, report)
4. **Engagement artificiale** (pattern non naturali)

---

*Documento generato dall'analisi del repository github.com/twitter/the-algorithm*
*Ultimo aggiornamento: Gennaio 2026*
