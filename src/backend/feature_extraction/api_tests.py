import requests

TOKEN = "insert access token here"
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

    # Print full response
    # data = response.json()
    # print("Device:", data.get("device"))
    # print("Confidence:", data.get("confidence"))
    # print("Justification:", data.get("justification"))

def test_get_user_history():
    response = requests.get("http://localhost:5000/history/", headers=HEADERS)

    assert response.status_code == 200

    data = response.json()
    assert isinstance(data, dict)
    assert "history" in data
    assert isinstance(data["history"], list)

    # Print full response
    # for item in data["history"]:
    #     print(item)

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
    
    # Print full response
    # for item in recent_list:
    #     print(item)

def test_confidence_alerts():
    response = requests.get("http://localhost:5000/confidence-alerts/", headers=HEADERS)
    assert response.status_code == 200

    data = response.json()
    assert "confidence_alerts" in data
    for alert in data["confidence_alerts"]:
        if alert["timestamp"] == "":
            continue
        assert alert["confidence"] <= 75.0
        assert "vendor" in alert
        assert "function" in alert
        assert "raw_input_s3_path" in alert
    
    # Print full response
    # for alert in data["confidence_alerts"]:
    #     print(alert)

def run_test(fn, name):
    try:
        fn()
        print(f"✅ {name} passed")
    except AssertionError as e:
        print(f"❌ {name} failed: {e}")
        raise


if __name__ == "__main__":
    run_test(test_analyze_device, "test_analyze_device")
    run_test(test_get_user_history, "test_get_user_history")
    run_test(test_recent_identifications, "test_recent_identifications")
    run_test(test_confidence_alerts, "test_confidence_alerts")