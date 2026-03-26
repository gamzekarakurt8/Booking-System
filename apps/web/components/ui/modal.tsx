"use client";

import type { PropsWithChildren } from "react";
import { Button } from "./button";

type ModalProps = PropsWithChildren<{
  title: string;
  isOpen: boolean;
  onClose: () => void;
}>;

export function Modal({ title, isOpen, onClose, children }: ModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#101524]/65 p-4">
      <div className="w-full max-w-md rounded-3xl bg-dawn p-6 text-ink shadow-card animate-fade-up">
        <div className="mb-4 flex items-start justify-between">
          <h3 className="font-serif text-2xl">{title}</h3>
          <Button variant="ghost" className="px-2 py-1" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="space-y-3 text-sm">{children}</div>
      </div>
    </div>
  );
}
