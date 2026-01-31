#!/bin/bash
# Download DeepSeek-Coder-33B Q4_K_M (20GB) - più stabile di Q5
# Esegui in una finestra terminale separata

cd /Volumes/DATI-SSD/llm-models

# Rimuovi file incompleto
rm -f deepseek-coder-33b-instruct.Q5_K_M.gguf

# Scarica Q4_K_M (20GB, più stabile)
echo "Scaricando DeepSeek-Coder-33B Q4_K_M (20GB)..."
echo "Ci vorrà un po', lascia girare..."

aria2c -x 16 -s 16 -c \
  "https://huggingface.co/TheBloke/deepseek-coder-33B-instruct-GGUF/resolve/main/deepseek-coder-33b-instruct.Q4_K_M.gguf" \
  -o deepseek-coder-33b-instruct.Q4_K_M.gguf

# Se aria2c non è installato, usa wget
if [ $? -ne 0 ]; then
  echo "aria2c non trovato, uso wget..."
  wget -c "https://huggingface.co/TheBloke/deepseek-coder-33B-instruct-GGUF/resolve/main/deepseek-coder-33b-instruct.Q4_K_M.gguf"
fi

echo "Download completato!"
ls -lh /Volumes/DATI-SSD/llm-models/*.gguf
