from scapy.all import rdpcap, DNSQR, DNSRR, BOOTP, DHCP, TCP, Raw
from collections import defaultdict
import json

def extract_features_from_pcap(pcap_path, mac_address, device_name, origin_dataset="sentinel", packet_limit=None):
    packets = rdpcap(pcap_path)
    if packet_limit:
        packets = packets[:packet_limit]

    features = defaultdict(list)
    features["mac_address"] = mac_address
    features["origin_dataset"] = origin_dataset

    for pkt in packets:
        # Filter by MAC
        eth = pkt.getlayer("Ether")
        if eth and mac_address.lower() not in [eth.src.lower(), eth.dst.lower()]:
            continue

        # DNS Queries
        if pkt.haslayer(DNSQR):
            qname = pkt[DNSQR].qname.decode(errors="ignore")
            if qname not in features["dns.qry.name"]:
                features["dns.qry.name"].append(qname)

        # PTR Records
        if pkt.haslayer(DNSRR) and pkt[DNSRR].type == 12:  # type 12 = PTR
            ptr_name = pkt[DNSRR].rrname.decode(errors="ignore")
            if ptr_name not in features["dns.ptr.domain_name"]:
                features["dns.ptr.domain_name"].append(ptr_name)

        # DHCP Hostname
        if pkt.haslayer(DHCP):
            for opt in pkt[DHCP].options:
                if isinstance(opt, tuple) and opt[0] == 'hostname':
                    hostname = opt[1].decode(errors="ignore")
                    if hostname not in features["dhcp.option.hostname"]:
                        features["dhcp.option.hostname"].append(hostname)

        # HTTP User-Agent (from Raw payload if HTTP)
        if pkt.haslayer(Raw):
            payload = pkt[Raw].load.decode(errors="ignore")
            if "User-Agent:" in payload:
                for line in payload.split("\r\n"):
                    if line.startswith("User-Agent:"):
                        ua = line.split("User-Agent:")[1].strip()
                        if ua not in features["http.user_agent"]:
                            features["http.user_agent"].append(ua)

    # Output wrapped as {filename: features}
    result = {f"{device_name}.csv": features}
    return result

if __name__ == "__main__":
    result_json = extract_features_from_pcap(
        pcap_path="not_data/output3.pcap",   # <--- your file location
        mac_address="fill in mac address",                         # <--- change to actual target MAC if needed
        device_name="not_device_1",                  # <--- or whatever name you want
        packet_limit=3000
    )

    # Save result
    with open("not_data/output2_features.json", "w") as f:
        json.dump(result_json, f, indent=4)
