import type { ToastProps } from "@/components/ui/toaster";
import { createContext } from "react";

type ToasterContextValue = {
  toasts: ToastProps[];
  showToast: (props: Omit<ToastProps, "id">) => void;
  dismissToast: (id: string) => void;
};

export const ToasterContext = createContext<ToasterContextValue | undefined>(
  undefined
);
