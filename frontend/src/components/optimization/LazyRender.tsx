import { useRef, useEffect, useState, ReactNode, useMemo } from 'react';

interface IntersectionObserverProps {
  children: ReactNode;
  threshold?: number;
  rootMargin?: string;
  placeholder?: ReactNode;
}

export function LazyRender({
  children,
  threshold = 0.1,
  rootMargin = '200px',
  placeholder = null,
}: IntersectionObserverProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || isVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, isVisible]);

  return (
    <div ref={ref}>
      {isVisible ? children : placeholder}
    </div>
  );
}

export function useMemoizedCallback<T extends (...args: any[]) => any>(
  fn: T,
  deps: React.DependencyList
): T {
  return useMemo(() => fn, deps) as T;
}
