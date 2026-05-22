#!/usr/bin/env python3
"""Fill Italian translations for localization/strings.json using Google Translate."""
import json
import re
import sys
import time
from pathlib import Path

try:
    from deep_translator import GoogleTranslator
except ImportError:
    print("Install: pip install deep-translator", file=sys.stderr)
    sys.exit(1)

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "localization" / "strings.json"
OUT = ROOT / "localization" / "strings-it.json"

# Keep brand / product tokens
KEEP_PATTERN = re.compile(
    r"^(AtomOS|Electros|Atomosphere|Elemento|GitHub|LinkedIn|Kubernetes|"
    r"VMware|AWS|Azure|GCP|API|CLI|GPU|KVM|ZFS|GlusterFS|Terraform|DevOps|"
    r"SOC 2|GDPR|RHEL|AlmaLinux|Rocky|Ubuntu|Windows|Linux|macOS|npm|pip)$",
    re.I,
)

MAX_CHUNK = 4500


SKIP_IDS = {
    "ui.langSwitcher.en",
    "ui.langSwitcher.it",
}

def needs_translation(row: dict) -> bool:
    if row.get("id") in SKIP_IDS:
        return False
    it = (row.get("it") or "").strip()
    en = (row.get("en") or "").strip()
    if not en:
        return False
    if len(en) <= 3 and en.isupper():
        return False
    if not it or it == en:
        return True
    return False


def translate_text(translator: GoogleTranslator, text: str) -> str:
    if not text.strip():
        return text
    if len(text) <= MAX_CHUNK:
        return translator.translate(text)

    parts = []
    start = 0
    while start < len(text):
        chunk = text[start : start + MAX_CHUNK]
        parts.append(translator.translate(chunk))
        start += MAX_CHUNK
        time.sleep(0.15)
    return "".join(parts)


def main() -> None:
    data = json.loads(SRC.read_text(encoding="utf-8"))
    strings = data["strings"]
    translator = GoogleTranslator(source="en", target="it")

    total = sum(1 for s in strings if needs_translation(s))
    done = 0
    errors = 0

    for row in strings:
        if not needs_translation(row):
            continue
        en = row["en"]
        try:
            if KEEP_PATTERN.match(en.strip()):
                row["it"] = en
            else:
                row["it"] = translate_text(translator, en)
            done += 1
            if done % 25 == 0:
                print(f"Translated {done}/{total}…", flush=True)
            time.sleep(0.12)
        except Exception as exc:
            errors += 1
            print(f"FAIL {row['id']}: {exc}", file=sys.stderr)
            row["it"] = row.get("it") or en

    out = {**data, "translatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ"), "strings": strings}
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {OUT} ({done} translated, {errors} errors)")


if __name__ == "__main__":
    main()
