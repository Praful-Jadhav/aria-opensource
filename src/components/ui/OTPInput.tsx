'use client';

import React, { useState, useRef, KeyboardEvent, ClipboardEvent } from 'react';

interface OTPInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  disabled?: boolean;
}

export function OTPInput({ length = 6, onComplete, disabled }: OTPInputProps) {
  const [digits, setDigits] = useState<string[]>(Array(length).fill(''));
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (disabled) return;
    const cleanValue = value.replace(/[^0-9]/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = cleanValue;
    setDigits(newDigits);

    if (cleanValue && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }

    if (newDigits.every((d) => d !== '')) {
      onComplete(newDigits.join(''));
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/[^0-9]/g, '').slice(0, length);
    if (!pastedData) return;

    const newDigits = [...digits];
    pastedData.split('').forEach((char, i) => {
      newDigits[i] = char;
    });
    setDigits(newDigits);

    const nextIndex = Math.min(pastedData.length, length - 1);
    inputsRef.current[nextIndex]?.focus();

    if (newDigits.every((d) => d !== '')) {
      onComplete(newDigits.join(''));
    }
  };

  return (
    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => { inputsRef.current[index] = el; }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          style={{
            width: '2.5rem',
            height: '3rem',
            textAlign: 'center',
            fontSize: 'var(--size-lg, 20px)',
            fontWeight: 600,
            borderRadius: 'var(--radius-md, 8px)',
            border: '1px solid var(--border, #E5E7EB)',
            background: 'var(--surface, #FFFFFF)',
            color: 'var(--text, #111827)',
            outline: 'none',
            fontFamily: 'monospace',
            transition: 'border-color 0.15s ease',
            opacity: disabled ? 0.6 : 1,
            cursor: disabled ? 'not-allowed' : 'text',
          }}
          onFocus={(e) => {
            if (!disabled) e.target.style.borderColor = 'var(--border-focus, #6B7280)';
            e.target.select();
          }}
          onBlur={(e) => {
            if (!disabled) e.target.style.borderColor = 'var(--border, #E5E7EB)';
          }}
        />
      ))}
    </div>
  );
}
