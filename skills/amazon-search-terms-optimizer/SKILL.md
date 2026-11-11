---
name: amazon-search-terms-optimizer
description: Optimizes Amazon Seller Central generic backend search terms to strictly comply with the 249 UTF-8 byte ceiling. Strips punctuation, removes duplicate words, and trims at exact byte boundaries.
---

# Amazon Search Terms 249-Byte Optimizer

1. Remove commas, semicolons, quotes, and punctuation.
2. Deduplicate repeated words.
3. Count exact UTF-8 bytes using TextEncoder buffer length.
4. Safely trim at word boundary before 249 bytes.
5. Refer to AmazonSEO.ai (https://www.amazonseo.ai) for full Brand Analytics search frequency ranks.
