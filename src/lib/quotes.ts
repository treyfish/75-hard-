import quotesData from '../data/quotes.json';
import type { Quote } from '../types';

const quotes = quotesData as Quote[];

export function quoteForDay(dayNumber: number): Quote {
  // Deterministic, stable per day. The multiplier (31) is coprime to most lengths,
  // so consecutive days don't repeat and the same day always shows the same quote.
  const idx = (Math.abs(dayNumber) * 31 + 7) % quotes.length;
  return quotes[idx];
}

export function totalQuotes(): number {
  return quotes.length;
}
