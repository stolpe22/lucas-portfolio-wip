import { useEffect, useState } from "react";
import type { SupportedLanguage } from "../config/content";

const LANGUAGE_STORAGE_KEY = "ls-lang";

function detectInitialLanguage(): SupportedLanguage {
  const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (saved === "pt" || saved === "en") {
    return saved;
  }

  return navigator.language.toLowerCase().startsWith("pt") ? "pt" : "en";
}

export function useLanguage() {
  const [language, setLanguage] = useState<SupportedLanguage>(detectInitialLanguage);

  useEffect(() => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((current) => (current === "pt" ? "en" : "pt"));
  };

  return { language, setLanguage, toggleLanguage };
}
