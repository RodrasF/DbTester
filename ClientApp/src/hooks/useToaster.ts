import { ToasterContext } from "@/context/ToasterContext";
import { useContext } from "react";

export function useToaster() {
  const context = useContext(ToasterContext);
  if (!context) {
    throw new Error("useToaster must be used within a ToasterProvider");
  }
  return context;
}
