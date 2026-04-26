# LangChain Python Starter (LM Studio)

## Setup

1. Install uv (one time):
   - `winget install -e --id astral-sh.uv`
   - Restart terminal after installation
2. Create and activate a virtual environment:
   - PowerShell:
     - `uv venv .venv`
     - `.venv\Scripts\Activate.ps1`
3. Install dependencies:
   - `uv sync`
   - Dependencies are managed in `pyproject.toml`
4. Start LM Studio local server:
   - Load your model (for example a Qwen instruct model)
   - Open **Developer** tab and start the server (default: `http://localhost:1234`)
5. Create `.env` from `.env.example`:
   - `copy .env.example .env`
   - Update `OPENAI_MODEL` if your loaded model name is different

## Run

`uv run main.py`
