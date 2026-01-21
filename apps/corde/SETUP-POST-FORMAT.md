# Setup Corde Post-Formattazione Mac

## Quick Setup (5 minuti)

### 1. Monta SSD Esterno
Collega l'SSD "DATI-SSD" - contiene già i modelli (~6GB) in:
```
/Volumes/DATI-SSD/onde-ai/corde/cache/
```

### 2. Installa Miniforge
```bash
# Scarica installer
curl -L -O "https://github.com/conda-forge/miniforge/releases/latest/download/Miniforge3-MacOSX-arm64.sh"

# Installa
bash Miniforge3-MacOSX-arm64.sh -b -p $HOME/miniforge3

# Aggiungi al PATH
echo 'export PATH="$HOME/miniforge3/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### 3. Crea Environment Corde
```bash
conda create -n corde python=3.10 -y
conda activate corde

# Installa dipendenze
cd ~/Projects/Onde/apps/corde/engine
pip install -r requirements.txt
```

### 4. Test Generazione
```bash
conda activate corde
cd ~/Projects/Onde/apps/corde/engine

# Test singola immagine (veloce)
python generate_book.py --book marco-aurelio-bambini --test --steps 15
```

## Verifica Setup

```bash
# Check Python
python -c "import torch; print('MPS:', torch.backends.mps.is_available())"

# Check modelli
ls /Volumes/DATI-SSD/onde-ai/corde/cache/

# Check diffusers
python -c "from diffusers import StableDiffusionXLPipeline; print('OK')"
```

## Troubleshooting

### MPS non disponibile
```bash
pip install --upgrade torch torchvision
```

### Modelli non trovati
Verifica che l'SSD sia montato:
```bash
ls /Volumes/DATI-SSD/
```

### Out of memory
Usa meno steps o risoluzione più bassa:
```bash
python generate_book.py --book marco-aurelio-bambini --test --steps 10 --resolution 768
```
