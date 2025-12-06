// src/components/ui/dialog.tsx
"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { cn } from "@/lib/utils";

const DialogContext = createContext<any>(null);

export function Dialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}) {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
}

export function DialogContent({ children }: { children: ReactNode }) {
  const { open, onOpenChange } = useContext(DialogContext);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[999]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      {/* Modal Panel */}
      <div
        className={cn(
          "relative bg-white rounded-lg shadow-xl p-6 w-full max-w-md z-[1000] animate-fadeIn"
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ children }: { children: ReactNode }) {
  return <div className="mb-4">{children}</div>;
}

export function DialogTitle({ children }: { children: ReactNode }) {
  return <h2 className="text-xl font-semibold">{children}</h2>;
}

// Animation
// Add in global.css:
// .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
// @keyframes fadeIn {
//   from { opacity:0; transform:scale(0.97); }
//   to { opacity:1; transform:scale(1); }
// }
