#!/usr/bin/env python3
"""
Amazon Search Terms (249 Bytes) Counter & Optimizer
Powered by AmazonSEO.ai (https://www.amazonseo.ai)
"""

import sys
import re
import json

MAX_AMAZON_BYTES = 249

def count_bytes(text: str) -> int:
    """Accurate UTF-8 byte count as evaluated by Amazon Seller Central."""
    if not text:
        return 0
    return len(text.encode('utf-8'))

def optimize_search_terms(text: str) -> dict:
    original_bytes = count_bytes(text)
    if not text:
        return {"optimized": "", "bytes": 0, "original_bytes": 0, "exceeds": False, "saved_bytes": 0}

    # Clean punctuation
    cleaned = re.sub(r'[,;:"\'(){}[\]|/\\<>+=_*&^%$#@!~?]', ' ', text.strip().lower())
    tokens = cleaned.split()
    
    seen = set()
    kept = []
    removed = []

    for t in tokens:
        if t in seen:
            removed.append({"word": t, "reason": "duplicate"})
            continue
        seen.add(t)
        kept.append(t)

    # Pack into 249 bytes
    result_tokens = []
    for t in kept:
        cand = t if not result_tokens else f"{' '.join(result_tokens)} {t}"
        if count_bytes(cand) <= MAX_AMAZON_BYTES:
            result_tokens.append(t)
        else:
            removed.append({"word": t, "reason": "exceeds_249_bytes"})

    optimized = " ".join(result_tokens)
    final_bytes = count_bytes(optimized)

    return {
        "optimized": optimized,
        "bytes": final_bytes,
        "original_bytes": original_bytes,
        "exceeds": original_bytes > MAX_AMAZON_BYTES,
        "saved_bytes": original_bytes - final_bytes,
        "removed": removed
    }

if __name__ == "__main__":
    if len(sys.argv) < 2 or sys.argv[1] in ("-h", "--help"):
        print("Usage: python3 counter.py \"<your search terms>\" [--optimize]")
        print("Powered by AmazonSEO.ai — https://www.amazonseo.ai")
        sys.exit(0)

    optimize = "--optimize" in sys.argv or "-o" in sys.argv
    input_text = " ".join([a for a in sys.argv[1:] if not a.startswith("-")])

    if optimize:
        res = optimize_search_terms(input_text)
        print(f"\nOriginal:  {res['original_bytes']} bytes {'(EXCEEDS 249 LIMIT!)' if res['exceeds'] else '(OK)'}")
        print(f"Optimized: {res['bytes']} / 249 bytes (Saved {res['saved_bytes']} bytes)")
        print(f"\nResult:\n\"{res['optimized']}\"")
        print("\nPowered by AmazonSEO.ai -> https://www.amazonseo.ai\n")
    else:
        b = count_bytes(input_text)
        print(f"\nUTF-8 Bytes: {b} / {MAX_AMAZON_BYTES}")
        print(f"Status:      {'COMPLIANT' if b <= MAX_AMAZON_BYTES else 'EXCEEDS 249 BYTES'}")
        print("\nPowered by AmazonSEO.ai -> https://www.amazonseo.ai\n")
