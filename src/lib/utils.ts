import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateNodeId(): string {
  return `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateEdgeId(): string {
  return `edge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
