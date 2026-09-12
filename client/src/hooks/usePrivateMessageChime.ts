import { useCallback, useEffect, useRef } from "react";

export function usePrivateMessageChime(enabled: boolean) {
  const contextRef = useRef<AudioContext | null>(null);

  const prime = useCallback(async () => {
    if (!enabled || typeof window === "undefined") return;
    const AudioContextConstructor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextConstructor) return;
    const context = contextRef.current || new AudioContextConstructor();
    contextRef.current = context;
    if (context.state === "suspended") await context.resume();
  }, [enabled]);

  const play = useCallback(() => {
    if (!enabled || typeof document === "undefined" || document.visibilityState !== "visible") return;
    const context = contextRef.current;
    if (!context || context.state !== "running") return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(660, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(880, context.currentTime + 0.11);
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.05, context.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.2);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.21);
  }, [enabled]);

  useEffect(() => () => { void contextRef.current?.close(); }, []);
  return { prime, play };
}
