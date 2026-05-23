#!/usr/bin/env python3
"""Fill locale translations in localization/strings-{locale}.json using Google Translate."""
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
LOCALE = (sys.argv[1] if len(sys.argv) > 1 else "it").strip().lower()
TARGET_LANG = {"it": "it", "fr": "fr"}
if LOCALE not in TARGET_LANG:
    print(f"Unsupported locale: {LOCALE}. Use it or fr.", file=sys.stderr)
    sys.exit(1)

SRC = ROOT / "localization" / ("strings.json" if LOCALE == "it" else f"strings-{LOCALE}.json")
OUT = ROOT / "localization" / f"strings-{LOCALE}.json"

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
    "ui.langSwitcher.fr",
}


def needs_translation(row: dict) -> bool:
    if row.get("id") in SKIP_IDS:
        return False
    tr = (row.get(LOCALE) or "").strip()
    en = (row.get("en") or "").strip()
    if not en:
        return False
    if len(en) <= 3 and en.isupper():
        return False
    if not tr or tr == en:
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
    translator = GoogleTranslator(source="en", target=TARGET_LANG[LOCALE])

    total = sum(1 for s in strings if needs_translation(s))
    done = 0
    errors = 0

    print(f"Translating {total} strings to {LOCALE}…", flush=True)

    for row in strings:
        if not needs_translation(row):
            continue
        en = row["en"]
        try:
            if KEEP_PATTERN.match(en.strip()):
                row[LOCALE] = en
            else:
                row[LOCALE] = translate_text(translator, en)
            done += 1
            if done % 25 == 0:
                print(f"Translated {done}/{total}…", flush=True)
                OUT.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            time.sleep(0.12)
        except Exception as exc:
            errors += 1
            print(f"FAIL {row['id']}: {exc}", file=sys.stderr)
            row[LOCALE] = row.get(LOCALE) or en

    out = {**data, "translatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ"), "strings": strings}
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {OUT} ({done} translated, {errors} errors)")


if __name__ == "__main__":
    main()
