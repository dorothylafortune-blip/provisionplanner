// Merges Tailwind class names without conflicts.
// clsx handles conditional logic; twMerge resolves duplicate utilities
// (e.g. two padding classes — only the last one wins).

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
