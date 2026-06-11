"use client";

import { create } from "zustand";

interface SettingsState {
  locale: "ar" | "en";
  currency: string;
  country: string;
  setLocale: (locale: "ar" | "en") => void;
  setCurrency: (currency: string) => void;
  setCountry: (country: string) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  locale: "ar",
  currency: "EGP",
  country: "EG",
  setLocale: (locale) => set({ locale }),
  setCurrency: (currency) => set({ currency }),
  setCountry: (country) => set({ country }),
}));
