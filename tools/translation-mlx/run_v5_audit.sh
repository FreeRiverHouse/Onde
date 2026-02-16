#!/bin/bash
source ~/mlx-env/bin/activate
cd /Users/mattiapetrucciani/Onde

echo "--- STARTING AUDIT V5 (JSON) AT $(date) ---"

python3 -u tools/translation-mlx/repair_v5_json.py

echo "--- V5 AUDIT FINISHED AT $(date) ---"
echo "--- STARTING DOCX CONVERSION ---"

python3 tools/translation-mlx/txt_to_docx.py

echo "--- ALL DONE AT $(date) ---"
