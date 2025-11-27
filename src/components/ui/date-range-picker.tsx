"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, X } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface DateRangePickerProps {
  date?: DateRange
  onDateChange?: (date: DateRange | undefined) => void
  className?: string
}

export function DateRangePicker({
  date,
  onDateChange,
  className,
}: DateRangePickerProps) {
  const [localDate, setLocalDate] = React.useState<DateRange | undefined>(date)
  const [startInput, setStartInput] = React.useState("")
  const [endInput, setEndInput] = React.useState("")
  const [open, setOpen] = React.useState(false)

  // Update local state when prop changes
  React.useEffect(() => {
    setLocalDate(date)
    if (date?.from) {
      setStartInput(format(date.from, "dd/MM/yyyy"))
    } else {
      setStartInput("")
    }
    if (date?.to) {
      setEndInput(format(date.to, "dd/MM/yyyy"))
    } else {
      setEndInput("")
    }
  }, [date])

  const handleDateSelect = (newDate: DateRange | undefined) => {
    setLocalDate(newDate)
    onDateChange?.(newDate)

    if (newDate?.from) {
      setStartInput(format(newDate.from, "dd/MM/yyyy"))
    }
    if (newDate?.to) {
      setEndInput(format(newDate.to, "dd/MM/yyyy"))
    }
  }

  const parseDate = (input: string): Date | null => {
    // Expected format: dd/MM/yyyy
    const parts = input.split("/")
    if (parts.length !== 3) return null

    const day = parseInt(parts[0], 10)
    const month = parseInt(parts[1], 10) - 1 // Month is 0-indexed
    const year = parseInt(parts[2], 10)

    if (isNaN(day) || isNaN(month) || isNaN(year)) return null
    if (day < 1 || day > 31 || month < 0 || month > 11 || year < 1900) return null

    const date = new Date(year, month, day)
    if (date.getDate() !== day || date.getMonth() !== month || date.getFullYear() !== year) {
      return null // Invalid date
    }

    return date
  }

  const handleStartInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setStartInput(value)

    if (value.length === 10) { // dd/MM/yyyy = 10 characters
      const parsedDate = parseDate(value)
      if (parsedDate) {
        const newRange = { from: parsedDate, to: localDate?.to }
        setLocalDate(newRange)
        onDateChange?.(newRange)
      }
    }
  }

  const handleEndInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEndInput(value)

    if (value.length === 10) {
      const parsedDate = parseDate(value)
      if (parsedDate) {
        const newRange = { from: localDate?.from, to: parsedDate }
        setLocalDate(newRange)
        onDateChange?.(newRange)
      }
    }
  }

  const clearDates = () => {
    setLocalDate(undefined)
    setStartInput("")
    setEndInput("")
    onDateChange?.(undefined)
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !localDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {localDate?.from ? (
              localDate.to ? (
                <>
                  {format(localDate.from, "dd/MM/yyyy")} -{" "}
                  {format(localDate.to, "dd/MM/yyyy")}
                </>
              ) : (
                format(localDate.from, "dd/MM/yyyy")
              )
            ) : (
              <span>Pick a date range</span>
            )}
            {localDate && (
              <X
                className="ml-auto h-4 w-4 opacity-50 hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation()
                  clearDates()
                }}
              />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3 space-y-3">
            {/* Manual date inputs */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="start-date" className="text-xs">
                  Start Date
                </Label>
                <Input
                  id="start-date"
                  placeholder="dd/mm/yyyy"
                  value={startInput}
                  onChange={handleStartInputChange}
                  maxLength={10}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="end-date" className="text-xs">
                  End Date
                </Label>
                <Input
                  id="end-date"
                  placeholder="dd/mm/yyyy"
                  value={endInput}
                  onChange={handleEndInputChange}
                  maxLength={10}
                  className="h-8 text-sm"
                />
              </div>
            </div>

            {/* Calendar */}
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={localDate?.from}
              selected={localDate}
              onSelect={handleDateSelect}
              numberOfMonths={2}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
