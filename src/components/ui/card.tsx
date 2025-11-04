import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-gray-700/30 bg-white/90 text-gray-900 shadow-sm " +
          "dark:bg-gray-800/70 dark:text-gray-100 dark:border-gray-700 transition-colors duration-200",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "px-4 py-3 border-b border-gray-200 dark:border-gray-700/60",
        className
      )}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn(
        "text-lg font-semibold leading-tight tracking-wide",
        "dark:text-gray-50 text-gray-900",
        className
      )}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "p-4 text-sm text-gray-800 dark:text-gray-200 grid gap-2",
        className
      )}
      {...props}
    />
  );
}
  