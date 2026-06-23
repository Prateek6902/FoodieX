import { useState } from 'react'
import { Calendar } from 'lucide-react'
import { Button } from './Button'
import { GlassCard } from './GlassCard'

interface DateRangePickerProps {
  onChange: (range: { start: string; end: string }) => void
}

export const DateRangePicker = ({ onChange }: DateRangePickerProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const handleApply = () => {
    onChange({ start: startDate, end: endDate })
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <Button variant="outline" size="sm" onClick={() => setIsOpen(!isOpen)}>
        <Calendar className="w-4 h-4 mr-2" />
        Select Date Range
      </Button>
      {isOpen && (
        <div className="absolute right-0 mt-2 z-50">
          <GlassCard className="p-4 w-80">
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <Button onClick={handleApply} fullWidth>
                Apply
              </Button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  )
}