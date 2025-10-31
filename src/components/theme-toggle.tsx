"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("theme") === "dark") {
      document.documentElement.classList.add("dark");
      setDark(true);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = dark ? "light" : "dark";
    document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", newTheme);
    setDark(!dark);
  };

  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-6 right-6 bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 px-4 py-2 rounded-xl shadow-md transition-colors hover:opacity-80"
    >
      {dark ? "☀️ Light" : "🌙 Dark"}
    </button>
  );
}
