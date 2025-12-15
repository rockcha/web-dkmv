// src/components/ui/highlighter.tsx
import { useEffect, useRef } from "react";
import type React from "react";
import { useInView } from "motion/react";
import { annotate } from "rough-notation";
import { type RoughAnnotation } from "rough-notation/lib/model";

type AnnotationAction =
  | "highlight"
  | "underline"
  | "box"
  | "circle"
  | "strike-through"
  | "crossed-off"
  | "bracket";

interface HighlighterProps {
  children: React.ReactNode;
  action?: AnnotationAction;
  color?: string;
  strokeWidth?: number;
  animationDuration?: number;
  iterations?: number;
  padding?: number;
  multiline?: boolean;
  isView?: boolean;

  /** ✅ 추가: 켤지/말지 제어 */
  enabled?: boolean;
}

export function Highlighter({
  children,
  action = "highlight",
  color = "#ffd1dc",
  strokeWidth = 1.5,
  animationDuration = 600,
  iterations = 2,
  padding = 2,
  multiline = true,
  isView = false,
  enabled = true,
}: HighlighterProps) {
  const elementRef = useRef<HTMLSpanElement>(null);
  const annotationRef = useRef<RoughAnnotation | null>(null);

  const isInView = useInView(elementRef, { once: true, margin: "-10%" });

  // isView=false면 항상, isView=true면 inView일 때만. + enabled로 on/off
  const shouldShow = (!isView || isInView) && enabled;

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // enabled가 false면 기존 annotation 제거/숨김
    if (!shouldShow) {
      try {
        annotationRef.current?.hide();
        annotationRef.current?.remove();
      } catch {
        // ignore
      } finally {
        annotationRef.current = null;
      }
      return;
    }

    const annotationConfig = {
      type: action,
      color,
      strokeWidth,
      animationDuration,
      iterations,
      padding,
      multiline,
    };

    const annotation = annotate(element, annotationConfig);
    annotationRef.current = annotation;
    annotation.show();

    const resizeObserver = new ResizeObserver(() => {
      annotation.hide();
      annotation.show();
    });

    resizeObserver.observe(element);
    resizeObserver.observe(document.body);

    return () => {
      try {
        annotation.hide();
        annotation.remove();
      } catch {
        // ignore
      } finally {
        annotationRef.current = null;
        resizeObserver.disconnect();
      }
    };
  }, [
    shouldShow,
    action,
    color,
    strokeWidth,
    animationDuration,
    iterations,
    padding,
    multiline,
  ]);

  return (
    <span ref={elementRef} className="relative inline-block bg-transparent">
      {children}
    </span>
  );
}
