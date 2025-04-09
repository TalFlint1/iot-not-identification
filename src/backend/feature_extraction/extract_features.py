# import json
# import pandas as pd

# # Load dataset (change the path to the actual file)
# with open("dataset.json", "r") as f:
#     data = json.load(f)

# # Extract features
# extracted_data = []

# for device, details in data.items():
#     extracted_data.append({
#         "device_name": device,
#         "dns_queries": details.get("dns.qry.name", []),
#         "dhcp_hostnames": details.get("dhcp.option.hostname", []),
#         "tls_cert_domains": details.get("x509ce.dNSName", []),
#         "http_user_agents": details.get("http.user_agent", []),
#         "tls_server_names": details.get("tls.handshake.extensions_server_name", []),
#         "mac_address": details.get("mac_address", ""),
#         "origin_dataset": details.get("origin_dataset", "")
#     })

# # Convert to Pandas DataFrame for easier handling
# df = pd.DataFrame(extracted_data)

# # Display extracted data
# print(df.head())

#################
#   Test Code   #
#################

import json
import os
import pandas as pd
from serpapi import GoogleSearch

# Load API key from .env
SERPAPI_KEY = os.getenv("SERPAPI_KEY")

def search_google(query):
    """Search Google using SerpAPI and return title + snippet."""
    params = {
        "q": query,
        "api_key": SERPAPI_KEY,
        "num": 3  # Get top 3 results
    }
    search = GoogleSearch(params)
    results = search.get_dict()
    
    enriched_data = []
    for result in results.get("organic_results", []):
        title = result.get("title", "")
        snippet = result.get("snippet", "")
        enriched_data.append(f"{title}: {snippet}")
    
    return enriched_data if enriched_data else None

# Load dataset
with open("data/test2_dataset.json", "r") as f:
    data = json.load(f)

# Extract and enrich features
extracted_data = []

for device, details in data.items():
    mac_address = details.get("mac_address", "")
    oui = mac_address[:8] if mac_address else ""
    
    # Extract fields
    dns_queries = details.get("dns.qry.name", [])
    reverse_dns = details.get("dns.ptr.domain_name", [])
    dhcp_hostnames = details.get("dhcp.option.hostname", [])
    tls_cert_domains = details.get("x509ce.dNSName", [])
    tls_server_names = details.get("tls.handshake.extensions_server_name", [])
    user_agents = details.get("http.user_agent", [])
    
    # Enrich relevant fields
    enriched_dns_queries = [search_google(q) for q in dns_queries] if dns_queries else print("hi")
    enriched_reverse_dns = [search_google(ptr) for ptr in reverse_dns] if reverse_dns else None
    enriched_hostnames = [search_google(host) for host in dhcp_hostnames] if dhcp_hostnames else None
    enriched_tls_domains = [search_google(domain) for domain in tls_cert_domains] if tls_cert_domains else None
    enriched_tls_server_names = [search_google(name) for name in tls_server_names] if tls_server_names else None
    enriched_user_agents = [search_google(agent) for agent in user_agents] if user_agents else None
    
    extracted_data.append({
        "device_name": device,
        "dns_queries": dns_queries,
        "enriched_dns_queries": enriched_dns_queries,
        "reverse_dns": reverse_dns,
        "enriched_reverse_dns": enriched_reverse_dns,
        "dhcp_hostnames": dhcp_hostnames,
        "enriched_hostnames": enriched_hostnames,
        "tls_cert_domains": tls_cert_domains,
        "enriched_tls_cert_domains": enriched_tls_domains,
        "tls_server_names": tls_server_names,
        "enriched_tls_server_names": enriched_tls_server_names,
        "user_agents": user_agents,
        "enriched_user_agents": enriched_user_agents,
        "mac_address": mac_address,
        "oui": oui,  # Extracted but NOT enriched
        "origin_dataset": details.get("origin_dataset", "")
    })

# Convert to DataFrame
df = pd.DataFrame(extracted_data)

# Save enriched dataset
df.to_csv("data/enriched_dataset2.csv", index=False)

print("Data extraction and enrichment completed! Saved as 'data/enriched_dataset2.csv'")

