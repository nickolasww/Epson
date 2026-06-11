#!/bin/bash
# Start the Epson Smart Helpdesk backend
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Ensure MariaDB is running
echo "[1/3] Ensuring MariaDB is running..."
if ! mysql -u epson_user -pepson_pass2026 -e "SELECT 1;" > /dev/null 2>&1; then
  echo "     MariaDB not running. Starting..."
  echo "amongus" | sudo -S /etc/init.d/mariadb start 2>&1 || true
  sleep 2
fi
echo "     MariaDB OK"

# Check if FAISS index exists
if [ ! -f "data/faiss_index/faq.index" ]; then
  echo ""
  echo "⚠  FAISS index not found. Chatbot will use fallback responses."
  echo "   To build it (takes ~10 min), run in a separate terminal:"
  echo "     cd $SCRIPT_DIR && venv/bin/python3 scripts/build_index.py"
  echo ""
fi

# Start FastAPI
echo "[2/3] Starting FastAPI server..."
echo "      API docs: http://localhost:8000/docs"
echo "      Frontend: update VITE_API_BASE_URL=http://localhost:8000/api/v1 in .env"
echo ""
venv/bin/python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
