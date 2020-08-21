import os
import hashlib
from github import Github


class Converter:
	def __init__(self):
		self.gh = Github(os.envion["GH_TOKEN"])
		self.src = "Quantumult/X/filter/bypass.list"
		self.tgt = "Quantumult/X/filter/bypass.yaml"
		self.tgt_hash = self.file_hash(self.tgt)

	def file_hash(self, file: str) -> str:
		with open(file, encoding='utf-8') as fp:
			hasher = hashlib.sha1(fp.read())
			return hasher.digest()

	def convert(self):
		print(f"current hash: {self.tgt_hash}")
		with open(self.src, encoding='utf-8') as fp, open(self.tgt, mode='w', encoding='utf-8') as tgt_fp:
			tgt_fp.write("rules:\n")
			for line in fp.readlines():
				line = line.strip()
				if line.startswith("#"):
					continue
				cols = line.split(",")
				if len(cols) != 3:
					continue
				if cols[2].lower() == "proxy":
					line = f"{cols[0]},{cols[1]},Proxy"
				tgt_fp.write(f"- {line}\n")
		new_hash = self.file_hash(self.tgt)
		print(f"new hash: {new_hash}")
		if new_hash != self.tgt_hash:
			print("update")
			repo = self.gh.get_repo("profiles")
			old_file = repo.get_contents(self.tgt)
			with open(self.tgt, encoding='utf-8') as fp:
				repo.update_file(self.tgt, "update bypass.yaml", fp.read(), old_file.sha)
				print("DONE")


if __name__ == '__main__':
	c = Converter()
	c.convert()
