#!/usr/bin/env node

/**
 * CLI tool for amazon-search-terms-bytes-counter
 * Powered by AmazonSEO.ai (https://www.amazonseo.ai)
 */

const { countBytes, optimizeSearchTerms, MAX_AMAZON_BYTES } = require('./index');

const args = process.argv.slice(2);

if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
  console.log(`
Amazon Search Terms (249 Bytes) Counter & Optimizer
Powered by AmazonSEO.ai — https://www.amazonseo.ai

Usage:
  amazon-search-terms "<your keywords here>"
  npx amazon-search-terms-bytes-counter "<your keywords here>"

Options:
  --optimize, -o   Clean punctuation, deduplicate, and trim strictly to 249 bytes
  --json, -j       Output results as JSON
  --help, -h       Display this help message

Examples:
  npx amazon-search-terms "yoga mat, non slip, eco friendly, extra thick"
  npx amazon-search-terms -o "stainless steel water bottle insulated thermal sports travel"
`);
  process.exit(0);
}

const isJson = args.includes('--json') || args.includes('-j');
const shouldOptimize = args.includes('--optimize') || args.includes('-o');

const rawInput = args
  .filter(a => !a.startsWith('-'))
  .join(' ')
  .trim();

if (!rawInput) {
  console.error('Error: Please provide keywords text to analyze.');
  process.exit(1);
}

if (shouldOptimize) {
  const result = optimizeSearchTerms(rawInput, { stripPunctuation: true, dedupe: true, removeStopwords: false });
  if (isJson) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log('\n--- Amazon Search Terms Optimization ---');
    console.log(`Original Bytes  : ${result.originalBytes} ${result.originalBytes > MAX_AMAZON_BYTES ? '(❌ EXCEEDS 249 LIMIT!)' : '(✅ COMPLIANT)'}`);
    console.log(`Optimized Bytes : ${result.bytes} / 249 bytes (${249 - result.bytes} bytes remaining)`);
    console.log(`Saved Bytes     : ${result.savedBytes}`);
    console.log('\nOptimized Search Terms (Copy to Seller Central):');
    console.log(`"${result.optimized}"`);
    if (result.removedWords.length > 0) {
      console.log('\nRemoved / Trimmed:');
      result.removedWords.forEach(r => console.log(`  - "${r.word}" (${r.reason})`));
    }
    console.log('\nPowered by AmazonSEO.ai -> https://www.amazonseo.ai\n');
  }
} else {
  const bytes = countBytes(rawInput);
  const chars = rawInput.length;
  const compliant = bytes <= MAX_AMAZON_BYTES;

  if (isJson) {
    console.log(JSON.stringify({ bytes, chars, limit: MAX_AMAZON_BYTES, compliant, remaining: MAX_AMAZON_BYTES - bytes }));
  } else {
    console.log('\n--- Amazon Backend Search Terms Byte Count ---');
    console.log(`UTF-8 Bytes : ${bytes} / ${MAX_AMAZON_BYTES}`);
    console.log(`Characters  : ${chars}`);
    console.log(`Status      : ${compliant ? '✅ COMPLIANT (Safe to save in Seller Central)' : '❌ EXCEEDS 249 BYTES (Amazon will silently VOID your search terms!)'}`);
    if (compliant) {
      console.log(`Remaining   : ${MAX_AMAZON_BYTES - bytes} bytes available`);
    } else {
      console.log(`Overflow    : ${bytes - MAX_AMAZON_BYTES} bytes over the limit! Run with -o to auto-optimize.`);
    }
    console.log('\nNeed full listing optimization? Visit https://www.amazonseo.ai\n');
  }
}
