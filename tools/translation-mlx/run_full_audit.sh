#!/bin/bash
source ~/mlx-env/bin/activate
cd /Users/mattiapetrucciani/Onde

echo "--- STARTING AUDIT AT $(date) ---"

python3 -u tools/translation-mlx/repair_audit_qwen.py

echo "--- AUDIT FINISHED AT $(date) ---"
echo "--- STARTING DOCX CONVERSION ---"

python3 tools/translation-mlx/txt_to_docx.py

echo "--- ALL DONE AT $(date) ---"
