'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'

interface DatePickerProps {
  value: string
  onChange: (date: string) => void
  className?: string
}

interface PopupPosition {
  top: number
  left: number
}

export default function DatePicker({ value, onChange, className = '' }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(value ? new Date(value) : null)
  const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date())
  const [popupPos, setPopupPos] = useState<PopupPosition>({ top: 0, left: 0 })
  const [mounted, setMounted] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLButtonElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)

  // Ensure portal target exists (avoids SSR mismatch)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Compute position: vertically centred on the input, 10px to the right
  const computePosition = useCallback(() => {
    if (!inputRef.current) return
    const rect = inputRef.current.getBoundingClientRect()
    const scrollX = window.scrollX ?? window.pageXOffset
    const scrollY = window.scrollY ?? window.pageYOffset

    // Calendar popup is ~320px wide and ~420px tall (approx).
    const POPUP_HEIGHT = 420
    const GAP = 10 // horizontal gap between input right edge and popup left edge

    const idealTop = scrollY + rect.top + rect.height / 2 - POPUP_HEIGHT / 2
    const left = scrollX + rect.right + GAP

    // Clamp vertically so it never goes above the viewport top
    const clampedTop = Math.max(scrollY + 8, idealTop)

    setPopupPos({ top: clampedTop, left })
  }, [])

  // Reposition whenever the popup opens, or on scroll/resize while open
  useEffect(() => {
    if (!isOpen) return
    computePosition()

    const handleReposition = () => computePosition()
    window.addEventListener('scroll', handleReposition, true)
    window.addEventListener('resize', handleReposition)
    return () => {
      window.removeEventListener('scroll', handleReposition, true)
      window.removeEventListener('resize', handleReposition)
    }
  }, [isOpen, computePosition])

  // Close on outside click (covers both the trigger button and the portal popup)
  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      const clickedInsideTrigger = containerRef.current?.contains(target)
      const clickedInsidePopup = popupRef.current?.contains(target)
      if (!clickedInsideTrigger && !clickedInsidePopup) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // ── calendar helpers ──────────────────────────────────────────────────────

  const monthNames = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december',
  ]

  const daysInMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()

  const firstDayOfMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay()

  const handleDateClick = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day)
    setSelectedDate(newDate)
    onChange(newDate.toISOString().split('T')[0])
    setIsOpen(false)
  }

  const formatDisplayDate = (date: Date | null) => {
    if (!date) return 'select date'
    return `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
  }

  const renderCalendar = () => {
    const days = []
    const totalDays = daysInMonth(viewDate)
    const firstDay = firstDayOfMonth(viewDate)

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10" />)
    }

    for (let day = 1; day <= totalDays; day++) {
      const isSelected =
        selectedDate &&
        selectedDate.getDate() === day &&
        selectedDate.getMonth() === viewDate.getMonth() &&
        selectedDate.getFullYear() === viewDate.getFullYear()

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleDateClick(day)}
          className={`h-10 flex items-center justify-center text-base rounded-lg hover:bg-stone-200 transition-colors ${
            isSelected ? 'bg-stone-900 text-white hover:bg-stone-800' : 'text-stone-900'
          }`}
        >
          {day}
        </button>,
      )
    }
    return days
  }

  // ── portal markup ─────────────────────────────────────────────────────────

  const popup = (
    <div
      ref={popupRef}
      style={{
        position: 'absolute',
        top: popupPos.top,
        left: popupPos.left,
        zIndex: 9999,
      }}
      className="bg-white rounded-lg shadow-2xl border border-stone-200 p-5 w-80"
    >
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-5">
        <button
          type="button"
          onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1))}
          className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <span className="text-base lowercase text-stone-900 select-none">
          {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
        </span>

        <button
          type="button"
          onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1))}
          className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['su', 'mo', 'tu', 'we', 'th', 'fr', 'sa'].map((d) => (
          <div
            key={d}
            className="h-8 flex items-center justify-center text-xs lowercase text-stone-400 select-none"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
    </div>
  )

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={inputRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full text-left ${className}`}
      >
        {formatDisplayDate(selectedDate)}
      </button>

      {/* Portal: renders into <body>, escaping all ancestor stacking contexts */}
      {mounted && isOpen && createPortal(popup, document.body)}
    </div>
  )
}
