import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    const url = process.env.NEXT_PUBLIC_SITE_URL;
    // If it's a Vercel deployment/preview URL, ignore it because it will have Vercel Deployment Protection
    // and block social crawlers from fetching metadata/images.
    const isVercelPreview = url.includes("vercel.app") && !url.includes("sabika-gold.vercel.app");
    if (!isVercelPreview) {
      return url.startsWith("http") ? url : `https://${url}`;
    }
  }
  
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }
  
  // Return the public production domain to ensure social crawlers can bypass Vercel preview protection
  return "https://sabika-gold.vercel.app";
}
