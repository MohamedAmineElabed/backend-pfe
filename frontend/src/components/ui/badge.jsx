// components/Badge.jsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

// Tailwind styles for Badge
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors whitespace-nowrap select-none",
  {
    variants: {
      variant: {
        default: "border-transparent bg-blue-500 text-white hover:bg-blue-600",
        secondary: "border-transparent bg-gray-200 text-gray-800 hover:bg-gray-300",
        destructive: "border-transparent bg-red-500 text-white hover:bg-red-600",
        success: "border-transparent bg-green-500 text-white hover:bg-green-600",
        warning: "border-transparent bg-yellow-400 text-black hover:bg-yellow-500",
        outline: "border border-gray-300 text-gray-800 bg-transparent hover:bg-gray-100",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-3 py-1 text-sm",
        lg: "px-4 py-1.5 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
    },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export default function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <div className={badgeVariants({ variant, size }) + (className ? ` ${className}` : "")} {...props} />;
}