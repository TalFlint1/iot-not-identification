import requests

TOKEN = "access token here"
HEADERS = {"Authorization": f"Bearer {TOKEN}"}

def test_analyze_device():
    path = "data/test7_dataset.json"
    with open(path, 'rb') as f:
        files = {'file': ('test7_dataset.json', f, 'application/json')}
        response = requests.post(
            "http://localhost:5000/analyze_device/",
            files=files,
            headers=HEADERS
        )
    assert response.status_code == 200
    assert "device" in response.json()

def test_get_user_history():
    response = requests.get("http://localhost:5000/history/", headers=HEADERS)

    assert response.status_code == 200

    data = response.json()
    assert isinstance(data, dict)
    assert "history" in data
    assert isinstance(data["history"], list)


def test_recent_identifications():
    response = requests.get("http://localhost:5000/recent-identifications/", headers=HEADERS)
    assert response.status_code == 200

    data = response.json()
    assert "recent_identifications" in data
    recent_list = data["recent_identifications"]
    assert isinstance(recent_list, list)
    assert len(recent_list) <= 3

    for item in recent_list:
        assert "timestamp" in item
        assert "vendor" in item
        assert "function" in item
        assert "confidence" in item
        assert isinstance(item["confidence"], float)


def test_confidence_alerts():
    response = requests.get("http://localhost:5000/confidence-alerts/", headers=HEADERS)
    assert response.status_code == 200

    data = response.json()
    assert "confidence_alerts" in data
    for alert in data["confidence_alerts"]:
        if alert["timestamp"] == "":
            continue
        assert alert["confidence"] <= 60.0
        assert "vendor" in alert
        assert "function" in alert
        assert "raw_input_s3_path" in alert

if __name__ == "__main__":
    test_recent_identifications()
    print("passed recent test.")