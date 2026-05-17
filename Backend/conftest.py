import time
import uuid
import os
from types import SimpleNamespace

import pytest
import requests


BASE_URL = os.getenv("BACKEND_BASE_URL", "http://127.0.0.1:5000")
COLLECTIONS = [
    ("Products", "product_id"),
    ("DarkStores", "store_id"),
    ("Users", "user_id"),
    ("Inventory", "inventory_id"),
    ("StockMovements", "movement_id"),
    ("Orders", "order_id"),
    ("OrderItems", "order_item_id"),
]


def _wait_for_backend(base_url, timeout_seconds=60):
    deadline = time.time() + timeout_seconds
    last_error = None

    while time.time() < deadline:
        try:
            response = requests.get(base_url, timeout=5)
            if response.status_code == 200:
                return
        except requests.RequestException as exc:
            last_error = exc
        time.sleep(1)

    raise RuntimeError(f"Backend never became ready at {base_url}") from last_error


@pytest.fixture(scope="session")
def api_client():
    _wait_for_backend(BASE_URL)
    session = requests.Session()

    client = SimpleNamespace(
        base_url=BASE_URL,
        session=session,
        unique_key=lambda collection_name: f"{collection_name.lower()}-{uuid.uuid4().hex[:10]}",
    )

    yield client
    session.close()


@pytest.fixture(params=COLLECTIONS)
def collection_case(request):
    name, key_field = request.param
    return {"name": name, "key_field": key_field}