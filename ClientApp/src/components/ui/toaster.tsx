import { useState } from "react";

import { type Toast, type ToastActionElement } from "@/components/ui/toast";
import { ToasterContext } from "@/context/ToasterContext";

export type ToastProps = React.ComponentPropsWithoutRef<typeof Toast> & {
  id: string;
  title?: string;
  description?: React.ReactNode;
  action?: ToastActionElement;
  duration?: number;
};

export function ToasterProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const showToast = (props: Omit<ToastProps, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prevToasts) => [...prevToasts, { ...props, id }]);

    // Auto dismiss after duration
    if (props.duration !== Infinity) {
      const duration = props.duration || 5000;
      setTimeout(() => {
        dismissToast(id);
      }, duration);
    }
  };

  const dismissToast = (id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  return (
    <ToasterContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}
    </ToasterContext.Provider>
  );
}
