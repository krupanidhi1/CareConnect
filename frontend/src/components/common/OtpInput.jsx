import React, { useEffect, useRef } from "react";

/**
 * Six-digit OTP entry with auto-advance, backspace, arrow keys and paste.
 * The value is only ever held in component state — never persisted.
 */
export default function OtpInput({ value = "", onChange, disabled, length = 6 }) {
  const refs = useRef([]);
  const digits = value.padEnd(length, " ").slice(0, length).split("");

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  const commit = (next) => onChange(next.replace(/\s/g, "").slice(0, length));

  const handleChange = (index, raw) => {
    const cleaned = raw.replace(/\D/g, "");
    if (!cleaned) return;
    const chars = value.padEnd(length, " ").split("");
    cleaned.split("").forEach((digit, offset) => {
      if (index + offset < length) chars[index + offset] = digit;
    });
    commit(chars.join(""));
    const nextIndex = Math.min(index + cleaned.length, length - 1);
    refs.current[nextIndex]?.focus();
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      const chars = value.padEnd(length, " ").split("");
      if (chars[index] && chars[index] !== " ") {
        chars[index] = " ";
      } else if (index > 0) {
        chars[index - 1] = " ";
        refs.current[index - 1]?.focus();
      }
      commit(chars.join(""));
    }
    if (event.key === "ArrowLeft" && index > 0) refs.current[index - 1]?.focus();
    if (event.key === "ArrowRight" && index < length - 1) refs.current[index + 1]?.focus();
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    commit(pasted);
    refs.current[Math.min(pasted.length, length) - 1]?.focus();
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(node) => {
            refs.current[index] = node;
          }}
          value={digits[index] === " " ? "" : digits[index]}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onFocus={(event) => event.target.select()}
          disabled={disabled}
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          aria-label={`Digit ${index + 1} of ${length}`}
          maxLength={1}
          className="h-14 w-11 rounded-xl border border-input bg-card text-center font-heading text-xl text-foreground shadow-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25 disabled:opacity-60 sm:w-12"
        />
      ))}
    </div>
  );
}