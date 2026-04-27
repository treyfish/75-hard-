import type { Quote } from '../types';

export default function QuoteCard({ quote }: { quote: Quote }) {
  return (
    <figure className="card relative overflow-hidden p-5 sm:p-6">
      <div className="absolute inset-y-0 left-0 w-1 bg-gold-500/70" aria-hidden />
      <blockquote className="font-serif italic text-lg sm:text-xl leading-snug text-parchment">
        “{quote.text}”
      </blockquote>
      <figcaption className="mt-3 text-xs uppercase tracking-[0.18em] text-gold-300/90">
        — {quote.author}
      </figcaption>
    </figure>
  );
}
