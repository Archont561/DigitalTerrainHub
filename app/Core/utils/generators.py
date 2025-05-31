import random
from pathlib import Path
from collections import namedtuple

ADJECTIVES = [
    "affectionate", "aggressive", "alert", "amusing", "ancient", "awkward", "boring", "brave", "cheerful", 
    "clear", "clever", "confused", "content", "cool", "curious", "determined", "dizzy", "eager", "energetic", 
    "enthusiastic", "exhausted", "fierce", "focused", "funny", "gentle", "happy", "healthy", "jolly", "joyful", 
    "lazy", "modest", "nervous", "optimistic", "paranoid", "quiet", "random", "shy", "sleepy", "serious", "smart", 
    "social", "spicy", "strict", "subtle", "successful", "silly", "strong", "tough", "victorious", "vivid"
]

SURNAMES = [
    "abramov", "ada", "adams", "agnew", "alan", "alvarez", "andrews", "austen", "babbage", "baker", "barnes", 
    "barrett", "berners-lee", "blackwell", "boole", "born", "brooks", "brunel", "carson", "cern", "cerf", "darwin", 
    "dewey", "dijkstra", "einstein", "engelbart", "franklin", "galileo", "gerrard", "godel", "godfrey", "goss", "gray", 
    "hopcroft", "hopper", "hughes", "knuth", "kubrick", "lamport", "leibniz", "lovelace", "mccarthy", "mendeleev", 
    "newton", "nobel", "pearlman", "perlis", "ritchie", "shaw", "shockley", "smith", "turing", "vannevar", 
    "von-neumann", "wozniak", "zeldovich"
]


def generate_docker_container_style_name() -> str:
    """Generates a random Docker container style name: adjective_surname"""
    adjective = random.choice(ADJECTIVES)
    surname = random.choice(SURNAMES)
    return f"{adjective} {surname}"


def generate_templates_namespaces(templates_dir: Path) -> namedtuple:
    def inner(folder: Path):
        children = []
        values = []
        for path in folder.iterdir():
            name = path.stem
            if name[0].isdigit(): name = f'HTTP_{name}'
            children.append(name)
            if path.is_dir(): 
                values.append(inner(path))
            else:
                values.append(str(path))
        namespace = namedtuple(folder.stem, children)
        return namespace(*values)
    return inner(templates_dir)