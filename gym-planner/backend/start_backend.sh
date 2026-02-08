#!/bin/bash
cd "$(dirname "$0")"
export PYTHONPATH=$(pwd)
./venv/bin/uvicorn main:app --reload --host 0.0.0.0 --port 8000
