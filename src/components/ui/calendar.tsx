"use client"

import * as React from "react"
import { DayPicker, useDayPicker } from "react-day-picker"
import type { DateLibOptions } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const navButton = cn(
    buttonVariants({ variant: "outline" }),
    "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
  )

  const MonthCaption = ({
    calendarMonth,
    className: captionClassName,
    ...captionProps
  }: {
    calendarMonth: { date: Date }
    displayIndex: number
  } & React.HTMLAttributes<HTMLDivElement>) => {
    const { goToMonth, nextMonth, previousMonth, labels, formatters, dayPickerProps } =
      useDayPicker()

    const dateLibOptions: DateLibOptions = {
      locale: dayPickerProps.locale as DateLibOptions["locale"],
      timeZone: dayPickerProps.timeZone,
      numerals: dayPickerProps.numerals,
    }

    const caption = formatters.formatCaption(calendarMonth.date, dateLibOptions)

    return (
      <div
        className={cn("flex justify-center pt-1 relative items-center", captionClassName)}
        {...captionProps}
      >
        <div className="text-sm font-medium" aria-live="polite" role="presentation">
          {caption}
        </div>
        <div className="space-x-1 flex items-center">
          <button
            name="previous-month"
            aria-label={labels.labelPrevious(previousMonth)}
            className={cn(navButton, "absolute left-1 top-0")}
            type="button"
            disabled={!previousMonth}
            onClick={() => {
              if (previousMonth) goToMonth(previousMonth)
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            name="next-month"
            aria-label={labels.labelNext(nextMonth, dateLibOptions)}
            className={cn(navButton, "absolute right-1 top-0")}
            type="button"
            disabled={!nextMonth}
            onClick={() => {
              if (nextMonth) goToMonth(nextMonth)
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      hideNavigation
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        month_caption: "space-y-4",
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex",
        weekday: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
        week: "flex w-full mt-2",
        day: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
          "[&:has([aria-selected])]:bg-accent",
          "[&.day-outside:has([aria-selected])]:bg-accent/50",
          "[&.day-range-end]:rounded-r-md",
          props.mode === "range"
            ? "[&.day-range-end]:rounded-r-md [&.day-range-start]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-md"
        ),
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 p-0 font-normal aria-selected:opacity-100"
        ),
        range_start:
          "day-range-start [&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary [&>button]:hover:text-primary-foreground [&>button]:focus:bg-primary [&>button]:focus:text-primary-foreground",
        range_end:
          "day-range-end [&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary [&>button]:hover:text-primary-foreground [&>button]:focus:bg-primary [&>button]:focus:text-primary-foreground",
        selected:
          "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary [&>button]:hover:text-primary-foreground [&>button]:focus:bg-primary [&>button]:focus:text-primary-foreground",
        today: "[&>button]:bg-accent [&>button]:text-accent-foreground",
        outside:
          "day-outside [&>button]:text-muted-foreground [&>button]:aria-selected:bg-accent/50 [&>button]:aria-selected:text-muted-foreground",
        disabled: "[&>button]:text-muted-foreground [&>button]:opacity-50",
        range_middle:
          "[&>button]:aria-selected:bg-accent [&>button]:aria-selected:text-accent-foreground",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        MonthCaption,
        // react-day-picker v9 uses a single Chevron component with `orientation`
        Chevron: ({ orientation, className, ...chevronProps }) => {
          const iconClassName = cn("h-4 w-4", className)
          const size =
            typeof chevronProps.size === "number" ? chevronProps.size : undefined

          switch (orientation) {
            case "right":
              return <ChevronRight className={iconClassName} size={size} />
            case "up":
              return <ChevronUp className={iconClassName} size={size} />
            case "down":
              return <ChevronDown className={iconClassName} size={size} />
            case "left":
            default:
              return <ChevronLeft className={iconClassName} size={size} />
          }
        },
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
