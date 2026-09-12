import { useCallback, useEffect, useRef } from "react";

type PrivateConversationViewportOptions = {
  conversationId: number;
  latestMessageId: number | null;
  onLatestMessageVisible: (conversationId: number) => void;
};

export function usePrivateConversationViewport({ conversationId, latestMessageId, onLatestMessageVisible }: PrivateConversationViewportOptions) {
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const lastMarkedMessageIdRef = useRef<number | null>(null);

  const scrollToLatest = useCallback(() => {
    const viewport = scrollAreaRef.current?.querySelector("[data-radix-scroll-area-viewport]") as HTMLDivElement | null;
    if (!viewport) return;
    requestAnimationFrame(() => viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" }));
  }, []);

  useEffect(() => {
    if (latestMessageId === null) return;
    scrollToLatest();
  }, [latestMessageId, scrollToLatest]);

  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector("[data-radix-scroll-area-viewport]") as HTMLDivElement | null;
    const sentinel = bottomRef.current;
    if (!viewport || !sentinel || latestMessageId === null) return;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting) || lastMarkedMessageIdRef.current === latestMessageId) return;
      lastMarkedMessageIdRef.current = latestMessageId;
      onLatestMessageVisible(conversationId);
    }, { root: viewport, threshold: 0.95 });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [conversationId, latestMessageId, onLatestMessageVisible]);

  return { scrollAreaRef, bottomRef, scrollToLatest };
}
