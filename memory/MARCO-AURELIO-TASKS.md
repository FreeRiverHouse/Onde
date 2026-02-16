# 📋 MARCO AURELIO V2 — Task List Notturna

## REGOLE
- **Problema → chiedi a GROK subito** (mai tentare da solo)
- **Watchdog ogni 15 min** che controlla e rilancia
- **Zero iniziativa di testa mia** — Grok guida
- **Controlla ogni immagine** prima di mandarla a Mattia
- **WORKFLOW TASK:**
  1. Completa task
  2. Manda RECEIPTS a Grok (prove concrete del lavoro)
  3. Grok approva? → Chiudi task + chiedi 2 task MIGLIORATIVI
  4. Grok NON approva? → Rifai il task

---

## TASK

### T1: Fix Qwen 20B crash ✅ DONE
- Root cause: DISCO PIENO (3.4GB liberi), swap non si espandeva
- Fix: eliminato Qwen2.5-32B-Instruct-4bit (17GB) → 21GB liberi
- Test OK: 256x256, 1 step, peak 24.08GB, 55 sec
- Grok ha guidato: wired_limit → swap → disk space

### T2: Genera Cap 1 con prompt Grok-improved ✅ DONE
- V3 generata con Z-Image Turbo + prompt migliorato da Grok
- Output: /tmp/marco-aurelio-gen/v2/01-cap1-zimage-v3.png
- **TODO: Mandare a Grok per review**

### T3: Review V3 con Grok ✅ DONE
- Grok rating: **8.9/10** (up from 7.5!)
- Improvements OK: rubber arms fixed, fused fingers gone, pose realistic
- Remaining tweaks: grandfather expression, wrestling energy, watercolor texture
- Grok wrote V4 prompt with all fixes → saved to /tmp/marco-aurelio-gen/v4-prompt.txt

### T3.5: Generate & Review V4 ✅ DONE
- V4 generated with Grok's improved prompt
- Z-Image Turbo, 8-bit, 9 steps, seed 42, 2min 15sec
- Result: excellent — both boys visible, grandfather expressive, watercolor texture
- Sent to Mattia for approval on Telegram
- **AWAITING MATTIA'S OK to proceed with Cap 2-10**

### T4: Qwen 20B Cap 1 comparison ⏳ IN PROGRESS
- Qwen fixed (disk space was root cause)
- Generating Cap 1 with Qwen 20B (50 steps, 4-bit, 1024x1024) — session salty-gulf
- Step 3/50, ETA ~37 min
- Will compare vs Z-Image V4 when done

### T5: Batch generate all 10 chapters ⏳ BLOCKED (aspetta T4)
- All 10 Grok prompts saved: /tmp/marco-aurelio-gen/grok-prompts-all.sh
- Batch script ready for both models
- Pick winner from T4 comparison → launch full batch
- Target: all 10 done by morning

---

## WATCHDOG
Ogni 15 min controllare:
1. Processo image gen attivo?
2. Se crashato → rilanciare
3. Se completato → mandare a Grok per review
4. Se Grok ha risposto → applicare feedback

Ultimo check: [da aggiornare]
