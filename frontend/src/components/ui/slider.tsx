import * as React from "react"

import { cn } from "@/lib/utils"

interface SliderProps extends Omit<React.ComponentProps<"input">, 'value' | 'defaultValue' | 'onChange'> {
  defaultValue?: number[]
  value?: number[]
  onValueChange?: (value: number[]) => void
}

function Slider({
  className,
  defaultValue,
  value,
  onValueChange,
  ...props
}: SliderProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue || [0])

  const currentValue = value !== undefined ? value : internalValue

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value)
    const newValueArray = [newValue]

    if (value === undefined) {
      setInternalValue(newValueArray)
    }

    onValueChange?.(newValueArray)
  }

  return (
    <input
      type="range"
      data-slot="slider"
      value={currentValue[0]}
      onChange={handleChange}
      className={cn(
        "flex h-2 w-full cursor-pointer appearance-none rounded-full bg-secondary",
        "[&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-secondary",
        "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:pointer-events-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-[inset_0_0_0_1px_rgba(0,0,0,0.3)]",
        "[&::-moz-slider-runnable-track]:rounded-full [&::-moz-slider-runnable-track]:bg-secondary",
        "[&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:pointer-events-none [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:shadow-[inset_0_0_0_1px_rgba(0,0,0,0.3)]",
        "disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Slider }
