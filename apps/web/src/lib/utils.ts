import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// cn = class names
// Merges Tailwind classes without conflicts
// Example: cn("text-red-500", isActive && "text-blue-500")
// If isActive is true → only text-blue-500 applies

export function cn(...inputs: ClassValue[])
{
  return twMerge(clsx(inputs))
}