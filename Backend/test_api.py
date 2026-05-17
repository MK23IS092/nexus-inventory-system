def test_collection_crud(api_client, collection_case):
    collection_name = collection_case["name"]
    key_field = collection_case["key_field"]
    base_url = api_client.base_url
    session = api_client.session
    test_key = api_client.unique_key(collection_name)

    payload = {
        key_field: test_key,
        "name": f"Test {collection_name} Item",
        "extra_field": "test_value",
    }

    response = session.post(f"{base_url}/add-{collection_name}", json=payload)
    assert response.status_code == 201, response.text

    response = session.get(f"{base_url}/get-{collection_name}")
    assert response.status_code == 200, response.text
    assert any(item.get(key_field) == test_key for item in response.json())

    response = session.put(
        f"{base_url}/update-{collection_name}/{test_key}",
        json={"extra_field": "updated_value"},
    )
    assert response.status_code == 200, response.text

    response = session.delete(f"{base_url}/delete-{collection_name}/{test_key}")
    assert response.status_code == 200, response.text