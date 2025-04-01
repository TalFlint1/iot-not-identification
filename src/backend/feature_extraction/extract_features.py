import json
import pandas as pd

# Load dataset (change the path to the actual file)
with open("dataset.json", "r") as f:
    data = json.load(f)

# Extract features
extracted_data = []

for device, details in data.items():
    extracted_data.append({
        "device_name": device,
        "dns_queries": details.get("dns.qry.name", []),
        "dhcp_hostnames": details.get("dhcp.option.hostname", []),
        "tls_cert_domains": details.get("x509ce.dNSName", []),
        "http_user_agents": details.get("http.user_agent", []),
        "tls_server_names": details.get("tls.handshake.extensions_server_name", []),
        "mac_address": details.get("mac_address", ""),
        "origin_dataset": details.get("origin_dataset", "")
    })

# Convert to Pandas DataFrame for easier handling
df = pd.DataFrame(extracted_data)

# Display extracted data
print(df.head())
