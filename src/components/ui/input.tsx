
import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, value, onChange, ...props }, ref) => {
    // Para campos numéricos, não exibir 0 como valor padrão
    const displayValue = React.useMemo(() => {
      if (type === "number" && (value === 0 || value === "0")) {
        return "";
      }
      return value;
    }, [type, value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (type === "number" && onChange) {
        // Se o campo estiver vazio, tratar como 0 para campos numéricos
        const numericValue = e.target.value === "" ? "" : e.target.value;
        const syntheticEvent = {
          ...e,
          target: {
            ...e.target,
            value: numericValue
          }
        };
        onChange(syntheticEvent);
      } else if (onChange) {
        onChange(e);
      }
    };

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        value={displayValue}
        onChange={handleChange}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
