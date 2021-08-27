import os
import hashlib
from github import Github


class AdguardConverter:
    def __init__(self):
        self.gh = Github(os.environ["GH_TOKEN"])
        self.src = "Quantumult/X/filter/bypass.list"
        self.tgt = "Quantumult/X/filter/adguard.txt"
        self.tgt_hash = self.file_hash(self.tgt)

    def file_hash(self, file: str) -> str:
        if not os.path.exists(file):
            return '0'
        with open(file, encoding='utf-8') as fp:
            hasher = hashlib.sha1(fp.read().encode('utf-8'))
            return hasher.hexdigest()

    def write_file(self, file: str, data: list):
        with open(file, mode='w', encoding='utf-8') as fp:
            for line in data:
                fp.write(f"{line}\n")

    def update_gh_file(self, repo, file: str, old_hash: str):
        if old_hash != self.file_hash(file):
            print(f"updating {file}")
            old_file = repo.get_contents(file)
            with open(file, encoding='utf-8') as fp:
                repo.update_file(file, f"update {file}", fp.read(), old_file.sha)
                print(f"DONE - {file}")
        else:
            print(f"skipping {file}")

    def convert_surge(self):
        reject = "Surge/Ruleset/reject.list"
        proxy = "Surge/Ruleset/proxy.list"
        direct = "Surge/Ruleset/direct.list"
        reject_hash = self.file_hash(reject)
        proxy_hash = self.file_hash(proxy)
        direct_hash = self.file_hash(direct)

        reject_data = []
        proxy_data = []
        direct_data = []

        with open(self.src, encoding='utf-8') as fp:
            for line in fp.readlines():
                line = line.strip()
                if line.startswith("#"):
                    continue
                cols = line.split(",")
                if len(cols) != 3:
                    continue
                strategy = cols[2].lower()
                line = f"{cols[0]},{cols[1]}"
                if strategy == 'direct':
                    direct_data.append(line)
                elif strategy == 'proxy':
                    proxy_data.append(line)
                elif strategy == 'reject':
                    reject_data.append(line)

        self.write_file(reject, reject_data)
        self.write_file(proxy, proxy_data)
        self.write_file(direct, direct_data)

        repo = self.gh.get_repo("irenemsIrenes/profiles")
        self.update_gh_file(repo, reject, reject_hash)
        self.update_gh_file(repo, proxy, proxy_hash)
        self.update_gh_file(repo, direct, direct_hash)

    def convert_adguard(self):
        print(f"current hash: {self.tgt_hash}")
        with open(self.src, encoding='utf-8') as fp, open(self.tgt, mode='w', encoding='utf-8') as tgt_fp:
            for line in fp.readlines():
                line = line.strip()
                if line.startswith("#"):
                    continue
                cols = line.split(",")
                if len(cols) != 3:
                    continue
                if cols[2].lower() != "reject":
                    continue

                rule_type = cols[0].lower()
                domain = cols[1].strip()
                if rule_type in ['domain', 'host']:
                    line = f'0.0.0.0 {domain}'
                elif rule_type in ['domain-suffix', 'host-suffix']:
                    line = f'||{domain}^'
                elif rule_type in ['domain-keyword', 'host-keyword']:
                    line = f'/{domain}/'
                else:
                    continue

                tgt_fp.write(line)
                tgt_fp.write('\n')
        new_hash = self.file_hash(self.tgt)
        print(f"new hash: {new_hash}")
        if new_hash != self.tgt_hash:
            print("update")
            repo = self.gh.get_repo("irenemsIrenes/profiles")
            old_file = repo.get_contents(self.tgt)
            with open(self.tgt, encoding='utf-8') as fp:
                repo.update_file(self.tgt, "update adguard.txt", fp.read(), old_file.sha)
                print("DONE")

    def convert(self):
        self.convert_surge()
        self.convert_adguard()


if __name__ == '__main__':
    if not os.environ.get("GH_TOKEN"):
        print("Not valid")
        exit(0)
    c = AdguardConverter()
    c.convert()
