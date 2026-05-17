"""Railway/Gunicorn entrypoint for the Flask backend.

Railway's Python buildpack commonly starts apps with `gunicorn main:app`.
This module makes that import path work in a monorepo layout by adding
`Backend/` to `sys.path` before importing the Flask application.
"""

from __future__ import annotations

import os
import sys


ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(ROOT_DIR, 'Backend')

if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app import app  # noqa: E402


__all__ = ['app']
