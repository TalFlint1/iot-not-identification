import pandas as pd
import ast

def count_serpapi_queries_from_enriched_csv(file_path):
    df = pd.read_csv(file_path)

    search_fields = [
        'dns_queries',
        'reverse_dns',
        'dhcp_hostnames',
        'tls_cert_domains',
        'tls_server_names',
        'user_agents',
    ]

    total_searches = 0

    for _, row in df.iterrows():
        for field in search_fields:
            if pd.notna(row[field]) and row[field].strip() != '':
                try:
                    values = ast.literal_eval(row[field])
                    total_searches += len(values)
                except Exception:
                    print(f"Error parsing field {field} with value: {row[field]}")
                    pass

    return total_searches

# 👇 Replace this with your actual enriched CSV path
if __name__ == "__main__":
    file_path = "test_file.csv"  # since it's in the same folder
    total = count_serpapi_queries_from_enriched_csv(file_path)
    print(f"Total SerpAPI searches used in this file: {total}")
