import hashlib
from github import Github


def file_hash(file: str) -> str:
    with open(file, encoding='utf-8') as fp:
        harsher = hashlib.sha1(fp.read().encode('utf-8'))
        return harsher.hexdigest()


def update_file_2_gh(file: str, pre_hash: str, gh_token: str) -> None:
    new_hash = file_hash(file)
    if new_hash == pre_hash:
        print(f"file {file} no changes")
    else:
        print(f"updating file {file}")
        gh = Github(gh_token)
        repo = gh.get_repo("irenemsIrenes/profiles")
        old_file = repo.get_contents(file)
        with open(file, encoding='utf-8') as fp:
            repo.update_file(file, f"update {file}", fp.read(), old_file.sha)
            print("DONE")


def read_file_lines(file: str) -> str:
    with open(file, encoding='utf-8') as fp:
        return fp.readlines()
