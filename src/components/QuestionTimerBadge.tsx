import { useSyncExternalStore } from 'react';

/**
 * Geri sayım değerini React state'i dışında tutan minik store.
 * Böylece her saniye sadece <QuestionTimerBadge /> yeniden çizilir,
 * 13.000 satırlık App bileşeni tekrar tekrar render edilmez.
 */
export interface TimerStore {
  get: () => number;
  set: (value: number) => void;
  subscribe: (listener: () => void) => () => void;
}

export function createTimerStore(initial: number): TimerStore {
  let value = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => value,
    set: (next: number) => {
      if (next === value) return;
      value = next;
      listeners.forEach((l) => l());
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

interface QuestionTimerBadgeProps {
  store: TimerStore;
  title?: string;
}

export function QuestionTimerBadge({ store, title }: QuestionTimerBadgeProps) {
  const timeLeft = useSyncExternalStore(store.subscribe, store.get, store.get);

  const tone =
    timeLeft <= 5
      ? 'bg-rose-950/90 border-rose-500 text-rose-300 ring-2 ring-rose-500/60 animate-pulse'
      : timeLeft <= 15
      ? 'bg-amber-950/80 border-amber-500 text-amber-300 ring-1 ring-amber-500/40'
      : 'bg-[#080e1d] border-slate-700 text-slate-200';

  return (
    <div
      title={title}
      className={`h-full border rounded-xl px-2 py-0.5 flex items-center gap-1 font-mono font-black text-xs shrink-0 transition-all ${tone}`}
    >
      <span className="text-xs">⏱️</span>
      <span>{timeLeft}s</span>
    </div>
  );
}
