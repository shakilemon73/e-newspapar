"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      /* Luke Wroblewski: Minimum 44px touch targets */
      "min-h-[44px] py-3",
      className
    )}
    {...props}
  >
    {/* Don Norman: Clear visual affordances and mapping */}
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-800 dark:to-gray-700 shadow-inner">
      {/* Aarron Walter: Emotional design with gradients */}
      <SliderPrimitive.Range className="absolute h-full bg-gradient-to-r from-primary to-primary/80 rounded-full shadow-sm transition-all duration-300 ease-out" />
    </SliderPrimitive.Track>
    
    {/* Jonathan Ive: Attention to detail in interactive elements */}
    <SliderPrimitive.Thumb className="
      block h-6 w-6 rounded-full 
      bg-white dark:bg-gray-100
      border-2 border-primary/70 dark:border-primary/90
      shadow-lg hover:shadow-xl
      transition-all duration-200 ease-out
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background
      hover:scale-110 hover:border-primary
      disabled:pointer-events-none disabled:opacity-50
      cursor-pointer
      ring-0 hover:ring-4 hover:ring-primary/20
      /* Steve Krug: Clear interaction states */
      active:scale-95
      /* Farai Madzima: High contrast for accessibility */
      contrast-more:border-black contrast-more:dark:border-white
    " />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }