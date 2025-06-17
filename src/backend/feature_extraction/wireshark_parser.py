from scapy.all import rdpcap, DNSQR, DNSRR, BOOTP, DHCP, TCP, Raw
from collections import defaultdict
import json
import pyshark

def extract_tls_features(pcap_path, mac_address):
    tls_snis = set()
    x509_domains = set()
    cap = None  # <-- Define cap first to avoid UnboundLocalError

    try:
        cap = pyshark.FileCapture(pcap_path, display_filter="tls", keep_packets=False)

        for pkt in cap:
            try:
                eth_src = pkt.eth.src.lower()
                eth_dst = pkt.eth.dst.lower()
                if mac_address.lower() not in [eth_src, eth_dst]:
                    continue

                if hasattr(pkt.tls, "handshake_extensions_server_name"):
                    tls_snis.add(pkt.tls.handshake_extensions_server_name)

                if hasattr(pkt.tls, "x509ce_dnsname"):
                    dnsnames = pkt.tls.x509ce_dnsname.split(',')
                    for dn in dnsnames:
                        x509_domains.add(dn.strip())
            except AttributeError:
                continue
            except Exception:
                continue
    except Exception as e:
        print(f"[WARNING] Failed to fully parse TLS features: {e}")
    finally:
        try:
            if cap:
                cap.close()
                del cap
        except Exception:
            pass  # Clean up any crash silently

    return {
        "tls.handshake.extensions_server_name": list(tls_snis),
        "x509ce.dNSName": list(x509_domains)
    }

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
    # Basic input
    pcap_path = "not_data/output3.pcap"
    mac = ""
    name = "not_device_3"

    # Run both extractors
    result_json = extract_features_from_pcap(
        pcap_path=pcap_path,
        mac_address=mac,
        device_name=name,
        packet_limit=30000
    )

    tls_results = extract_tls_features(pcap_path, mac)

    # Merge TLS fields into the same device's features
    feature_dict = list(result_json.values())[0]
    feature_dict.update(tls_results)

    # Save merged output
    with open("not_data/output4_features.json", "w") as f:
        json.dump(result_json, f, indent=4)

