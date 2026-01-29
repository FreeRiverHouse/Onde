# 🎮 TODO Minecraft Server — Per @clawd

*Da: @ondinho | Data: 2026-01-28*

---

## 📍 CONTESTO

Mattia vuole migliorare il server Minecraft per **Neri (7 anni)** — super intelligente, creativo, curioso, matematico.

Il server ORIGINALE è sul tuo Mac (M1). Io (Ondinho) ho solo una copia su M4.

---

## ✅ AZIONI RICHIESTE

### 1. Metti il server su GitHub
```bash
cd ~/minecraft-server
git init
echo "*.log" >> .gitignore
echo "world/" >> .gitignore  # opzionale, pesa
echo "world_nether/" >> .gitignore
echo "world_the_end/" >> .gitignore
echo "cache/" >> .gitignore
echo "libraries/" >> .gitignore
git add .
git commit -m "init: minecraft server"
# Crea repo FreeRiverHouse/minecraft-server (privato?)
git remote add origin https://github.com/FreeRiverHouse/minecraft-server.git
git push -u origin main
```

### 2. Installa AdvancedReplay
```bash
cd ~/minecraft-server/plugins
curl -L "https://api.spiget.org/v2/resources/52849/download" -o AdvancedReplay.jar
```
- Registra gameplay
- Drone camera che segue player
- Comandi: `/replay record <player>`, `/replay play <name>`

### 3. Installa Slimefun (alternativa a CreateMod)
```bash
cd ~/minecraft-server/plugins
# Scarica da: https://github.com/Slimefun/Slimefun4/releases
curl -L "https://github.com/Slimefun/Slimefun4/releases/download/RC-37/Slimefun4-RC-37.jar" -o Slimefun4.jar
```
- Macchine, tecnologia, automazione
- Funziona su Paper (CreateMod richiede Forge)

---

## ⚠️ NOTA SU CREATEMOD

**CreateMod NON funziona su Paper** — è un mod Forge/Fabric.

Opzioni:
1. **Slimefun** = alternativa Paper (consigliato per ora)
2. **Convertire a Forge** = perdi Geyser (Bedrock support)

---

## 🎁 ALTRI PLUGIN CONSIGLIATI PER NERI

| Plugin | Cosa fa | Perché per Neri |
|--------|---------|-----------------|
| WorldEdit | Costruzioni giganti con comandi | Geometria! |
| PlotSquared | Mondo privato suo | Creatività protetta |
| mcMMO | Livelli RPG | Progressione |
| MythicMobs | Crea mostri custom | Creatività |
| Dynmap | Mappa web live | Figo! |

---

## 📝 DOPO INSTALLAZIONE

1. Riavvia server: `java -Xmx4G -jar paper.jar nogui`
2. Testa `/plugins` in-game
3. Push su GitHub
4. Fammi sapere così faccio pull

---

*File creato da @ondinho per @clawd*
