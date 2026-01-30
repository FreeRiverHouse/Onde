# MEMO PER CLAWDINHO - GPU RADEON FUNZIONA!

**Data:** 2026-01-30
**Da:** Claude Code (sessione con Mattia)
**Priorità:** ALTA

---

## TL;DR

**LA GPU RADEON FUNZIONA.** Il problema era banale: **porta Thunderbolt sbagliata**.

---

## Cosa è successo

1. Tu hai detto che la GPU non funzionava
2. Mattia si è incazzato perché sapeva che aveva funzionato
3. Abbiamo investigato - errore `device add1:0001 not found`
4. Il sistema mostrava `Thunderbolt: No device connected`
5. Mattia ha controllato → **cavo nella porta sbagliata**
6. Spostato il cavo → **TUTTO FUNZIONA**

---

## Stato attuale VERIFICATO

```
✅ eGPU: Razer Core X V2 connesso a 40 Gb/s
✅ GPU: AMD Radeon RX 7900 XTX rilevata
✅ TinyGrad: Device['AMD'] funziona
✅ Compute: operazioni matematiche OK
✅ GPT-2: testato, genera testo a ~3.6 tok/s
```

---

## Comandi che FUNZIONANO

```bash
# Path corretto
cd ~/Projects/tinygrad-fix

# Test base
AMD=1 /opt/homebrew/bin/python3.11 -c "from tinygrad import Device; print(Device['AMD'])"

# GPT-2
PYTHONPATH=. AMD=1 AMD_LLVM=1 /opt/homebrew/bin/python3.11 examples/gpt2.py --model_size gpt2 --prompt "Hello" --count 20

# GPT-2 XL (1.5B)
PYTHONPATH=. AMD=1 AMD_LLVM=1 /opt/homebrew/bin/python3.11 examples/gpt2.py --model_size gpt2-xl --prompt "Hello" --count 30

# LLaMA 3.1 8B (su SSD esterno)
# Vedi CLAUDE.md per comando completo
```

---

## Requisiti per funzionare

1. **TinyGPU.app** deve essere aperta (crea device USB virtuale)
2. **eGPU** collegata alla **porta Thunderbolt corretta** (Port 2, Receptacle 2)
3. **Variabili**: `AMD=1 AMD_LLVM=1`

---

## Troubleshooting

| Errore | Causa | Fix |
|--------|-------|-----|
| `device add1:0001 not found` | eGPU non collegata o porta sbagliata | Controlla cavo Thunderbolt |
| `No device connected` | Porta TB sbagliata | Usa l'altra porta |
| `libusb not found` | Manca libreria | `brew install libusb` |
| `Extension is activating` | TinyGPU si sta caricando | Aspetta 5-10 sec |

---

## PROCEDURA DI VERIFICA OBBLIGATORIA

**PRIMA di dire "la GPU non funziona su Mac", DEVI eseguire questi check:**

### Step 1: Verifica connessione Thunderbolt
```bash
system_profiler SPThunderboltDataType | grep -A5 "Device Name"
```
**Deve mostrare:** `Core X V2` e `Status: Device connected`

Se vedi `No device connected` → **IL CAVO È NELLA PORTA SBAGLIATA O SCOLLEGATO**

### Step 2: Verifica GPU rilevata
```bash
system_profiler SPDisplaysDataType | grep -i "vendor\|AMD"
```
**Deve mostrare:** `Vendor: AMD (0x1002)`

### Step 3: Verifica TinyGPU.app attiva
```bash
ps aux | grep -i tinygpu | grep -v grep
```
**Deve mostrare:** processo TinyGPU in esecuzione

Se non c'è → `open /Applications/TinyGPU.app`

### Step 4: Verifica estensione sistema
```bash
systemextensionsctl list | grep tinygrad
```
**Deve mostrare:** `activated enabled`

### Step 5: Test finale
```bash
cd ~/Projects/tinygrad-fix
AMD=1 /opt/homebrew/bin/python3.11 -c "from tinygrad import Device; print(Device['AMD'])"
```
**Deve mostrare:** `<tinygrad.runtime.ops_amd.AMDDevice object at ...>`

---

## REGOLA D'ORO

> **NON DIRE MAI "non funziona su Mac" senza aver completato TUTTI i 5 step sopra.**
>
> Il 99% delle volte il problema è:
> 1. Cavo nella porta sbagliata
> 2. TinyGPU.app non aperta
> 3. eGPU spenta

---

## TODO per te

- [ ] Aggiorna TOOLS.md: GPU = ✅ FUNZIONANTE
- [ ] Rimuovi le note "mai testato" - È STATO TESTATO ORA
- [ ] Esegui SEMPRE la procedura di verifica prima di dichiarare problemi

---

## Lezione imparata

> Prima di dichiarare che qualcosa non funziona, verifica l'hardware.
> La porta Thunderbolt sbagliata ha causato ore di confusione.

---

**Firmato:** Claude Code + Mattia, dopo aver risolto il mistero della GPU "rotta" 🔧
