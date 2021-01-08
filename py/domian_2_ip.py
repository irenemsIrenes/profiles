import sys
import os
import requests

PACKAGE_PARENT = '..'
SCRIPT_DIR = os.path.dirname(os.path.realpath(os.path.join(os.getcwd(), os.path.expanduser(__file__))))
print(SCRIPT_DIR)
sys.path.append(os.path.normpath(os.path.join(SCRIPT_DIR, PACKAGE_PARENT)))

from py import common_github

DOH_SERVER = 'doh.pub'
SRC_FILE = 'Quantumult/X/filter/black_domain.list'
TGT_FILE = 'Quantumult/X/filter/black_domain_ip.list'


def query(name: str, type: str = 'A', sever: str = DOH_SERVER, path: str = 'dns-query') -> dict:
    resp = requests.get(f"https://{sever}/{path}?name={name}&type={type}", verify=False)
    resp.raise_for_status()
    data = resp.json()
    ip_list = {
        "v4": []
    }
    if 'Status' in data and data["Status"] == 0:
        answer = data["Answer"]
        ips = [a["data"] for a in answer if a["type"] == 1]
        print(ips)
        ip_list["v4"] = ips
    return ip_list


def convert(src: str = SRC_FILE, tgt: str = TGT_FILE):
    pre_hash = common_github.file_hash(tgt)
    domains = common_github.read_file_lines(src)
    domains = [d.strip() for d in domains if not d.strip().startswith('#') and d.strip()]

    with open(tgt, mode='w', encoding='utf-8') as fp:
        for domain in domains:
            ips = query(domain)["v4"]
            fp.write(f"# {domain}\n")
            for ip in ips:
                fp.write(f"IP-CIDR,{ip}/32,REJECT\n")
    common_github.update_file_2_gh(tgt, pre_hash, os.environ['GH_TOKEN'])


if __name__ == '__main__':
    if not os.environ.get("GH_TOKEN"):
        print("Not valid")
        exit(0)
    convert()
