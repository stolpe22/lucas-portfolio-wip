import { useEffect, useState } from "react";

export function useTheme(defaultTheme: "dark" | "light") {
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const saved = localStorage.getItem("ls-theme");
    return saved === "dark" || saved === "light" ? saved : defaultTheme;
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("ls-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  };

  return { theme, toggleTheme };
}
