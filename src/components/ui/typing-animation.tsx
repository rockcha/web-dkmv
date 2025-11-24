// src/components/ui/typing-animation.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import type * as React from "react";
import { motion, useInView } from "framer-motion"; // ✅ framer-motion 사용

import { cn } from "@/lib/utils";

interface TypingAnimationProps
  extends React.ComponentProps<typeof motion.span> {
  children?: string;
  words?: string[];
  className?: string;
  duration?: number;
  typeSpeed?: number;
  deleteSpeed?: number;
  delay?: number;
  pauseDelay?: number;
  loop?: boolean;
  as?: React.ElementType;
  startOnView?: boolean;
  showCursor?: boolean;
  blinkCursor?: boolean;
  cursorStyle?: "line" | "block" | "underscore";
}

export function TypingAnimation({
  children,
  words,
  className,
  duration = 100,
  typeSpeed,
  deleteSpeed,
  delay = 0,
  pauseDelay = 1000,
  loop = false,
  as: Component = "span",
  startOnView = true,
  showCursor = true,
  blinkCursor = true,
  cursorStyle = "line",
  ...props
}: TypingAnimationProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [phase, setPhase] = useState<"typing" | "pause" | "deleting">("typing");

  const ref = useRef<HTMLElement | null>(null);
  const isInView = useInView(ref, { amount: 0.3, once: true });

  const wordsToAnimate = useMemo(
    () => words || (children ? [children] : []),
    [words, children]
  );

  const hasMultipleWords = wordsToAnimate.length > 1;

  const typingSpeed = typeSpeed || duration;
  const deletingSpeed = deleteSpeed || typingSpeed / 2;

  const shouldStart = startOnView ? isInView : true;

  useEffect(() => {
    if (!shouldStart || wordsToAnimate.length === 0) return;

    const currentWord = wordsToAnimate[currentWordIndex] || "";
    const graphemes = Array.from(currentWord);

    const timeoutDelay =
      delay > 0 && displayedText === ""
        ? delay
        : phase === "typing"
        ? typingSpeed
        : phase === "deleting"
        ? deletingSpeed
        : pauseDelay;

    const timeout = setTimeout(() => {
      if (phase === "typing") {
        if (currentCharIndex < graphemes.length) {
          setDisplayedText(graphemes.slice(0, currentCharIndex + 1).join(""));
          setCurrentCharIndex((prev) => prev + 1);
        } else {
          // 마지막 글자까지 다 쳤을 때
          if (hasMultipleWords || loop) {
            setPhase("pause");
          }
        }
      } else if (phase === "pause") {
        if (hasMultipleWords || loop) {
          setPhase("deleting");
        }
      } else if (phase === "deleting") {
        if (currentCharIndex > 0) {
          setDisplayedText(graphemes.slice(0, currentCharIndex - 1).join(""));
          setCurrentCharIndex((prev) => prev - 1);
        } else {
          const nextIndex = (currentWordIndex + 1) % wordsToAnimate.length;
          setCurrentWordIndex(nextIndex);
          setPhase("typing");
        }
      }
    }, timeoutDelay);

    return () => clearTimeout(timeout);
  }, [
    shouldStart,
    wordsToAnimate,
    currentWordIndex,
    currentCharIndex,
    displayedText,
    phase,
    hasMultipleWords,
    loop,
    typingSpeed,
    deletingSpeed,
    pauseDelay,
    delay,
  ]);

  // const currentWordGraphemes = Array.from(
  //   wordsToAnimate[currentWordIndex] || ""
  // );
  // const isComplete =
  //   !loop &&
  //   currentWordIndex === wordsToAnimate.length - 1 &&
  //   currentCharIndex >= currentWordGraphemes.length &&
  //   phase !== "deleting";

  const shouldShowCursor = showCursor;

  const getCursorChar = () => {
    switch (cursorStyle) {
      case "block":
        return "▌";
      case "underscore":
        return "_";
      case "line":
      default:
        return "|";
    }
  };

  const MotionComponent = motion(Component);

  return (
    <MotionComponent
      ref={ref as any}
      className={cn(
        "leading-[2rem] tracking-[-0.02em]", // 살짝 줄여서 더 자연스럽게
        className
      )}
      {...props}
    >
      {displayedText}
      {shouldShowCursor && (
        <span
          className={cn("inline-block", blinkCursor && "animate-blink-cursor")}
        >
          {getCursorChar()}
        </span>
      )}
    </MotionComponent>
  );
}
