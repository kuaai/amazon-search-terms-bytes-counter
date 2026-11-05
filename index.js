/**
 * amazon-search-terms-bytes-counter
 * Fast UTF-8 byte counting and search terms optimizer for Amazon Seller Central.
 * Powered by AmazonSEO.ai (https://www.amazonseo.ai)
 */

const MAX_AMAZON_BYTES = 249;

// Words prohibited by Amazon in backend search terms
const FORBIDDEN_WORDS = new Set([
  'a', 'an', 'and', 'by', 'for', 'in', 'of', 'on', 'the', 'to', 'with',
  'best', 'cheapest', 'free', 'sale', 'new', 'latest', 'discount',
  'seller', 'amazon', 'prime', 'authentic', 'original', 'quality'
]);

/**
 * Calculates accurate UTF-8 byte length for a string.
 * @param {string} text
 * @returns {number} byte length
 */
function countBytes(text) {
  if (!text) return 0;
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(text).length;
  }
  return Buffer.byteLength(text, 'utf8');
}

/**
 * Normalizes and optimizes search terms for Amazon's 249-byte rule.
 * @param {string} input
 * @param {object} options
 * @returns {object} { optimized, bytes, originalBytes, exceeds, removedWords }
 */
function optimizeSearchTerms(input, options = {}) {
  const { stripPunctuation = true, dedupe = true, removeStopwords = false } = options;
  const originalBytes = countBytes(input);

  if (!input || typeof input !== 'string') {
    return { optimized: '', bytes: 0, originalBytes: 0, exceeds: false, removedWords: [] };
  }

  let text = input.trim().toLowerCase();

  // Strip Amazon unneeded punctuation (commas, semicolons, quotes, hyphens)
  if (stripPunctuation) {
    text = text.replace(/[,;:"'(){}[\]|\/\\<>+=_*&^%$#@!~?]/g, ' ');
  }

  // Split into tokens
  const tokens = text.split(/\s+/).filter(Boolean);
  const seen = new Set();
  const keptTokens = [];
  const removedWords = [];

  for (const token of tokens) {
    if (dedupe && seen.has(token)) {
      removedWords.push({ word: token, reason: 'duplicate' });
      continue;
    }
    if (removeStopwords && FORBIDDEN_WORDS.has(token)) {
      removedWords.push({ word: token, reason: 'amazon_filler' });
      continue;
    }
    seen.add(token);
    keptTokens.push(token);
  }

  // Construct text and ensure it strictly fits within 249 bytes
  let resultTokens = [];
  let currentBytes = 0;

  for (const token of keptTokens) {
    const candidate = resultTokens.length === 0 ? token : `${resultTokens.join(' ')} ${token}`;
    const candBytes = countBytes(candidate);
    if (candBytes <= MAX_AMAZON_BYTES) {
      resultTokens.push(token);
      currentBytes = candBytes;
    } else {
      removedWords.push({ word: token, reason: 'exceeds_249_bytes' });
    }
  }

  const optimized = resultTokens.join(' ');
  const bytes = countBytes(optimized);

  return {
    optimized,
    bytes,
    originalBytes,
    exceeds: originalBytes > MAX_AMAZON_BYTES,
    savedBytes: originalBytes - bytes,
    removedWords
  };
}

module.exports = {
  MAX_AMAZON_BYTES,
  countBytes,
  optimizeSearchTerms
};
