"use client";

import React, { useState } from "react";

interface FloatingLabelInputProps {
  label: string;
  type?: string;
  name?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

export default function FloatingLabelInput({
  label,
  type = "text",
  name,
  value,
  onChange,
  required,
}: FloatingLabelInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const labelActive = isFocused || (value && value.length > 0);

  return (
    <div className="relative w-full">
      <input
        type={type}
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder=" "
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="peer w-full rounded-lg border border-gray-300 bg-transparent px-3 pt-3 pb-2 text-sm text-gray-900
          focus:border-gray-800 focus:ring-0 focus:outline-none"
      />
      <label
        htmlFor={name}
        className={`absolute left-3 bg-white px-1 transition-all duration-200 ease-in-out
          ${labelActive ? "-top-2 text-xs text-gray-800" : "top-1/2 -translate-y-1/2 text-sm text-gray-400"}
        `}
      >
        {label}
      </label>
    </div>
  );
}
