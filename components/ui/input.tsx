import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-xl border-0 bg-zinc-100/70 px-3.5 py-2 text-sm text-zinc-900 transition-[background-color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-zinc-700 placeholder:text-zinc-400 focus:bg-white focus:ring-2 focus:ring-zinc-900 focus-visible:ring-2 focus-visible:ring-zinc-900 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-2 aria-invalid:ring-red-500/30",
        className
      )}
      {...props}
    />
  )
}

export { Input }
