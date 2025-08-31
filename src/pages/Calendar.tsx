import { useState } from 'react';
import { useEvents } from '@/hooks/useEvents';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { events } = useEvents();
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const hasEventOnDay = (date: Date) => {
    return events.some(event => isSameDay(new Date(event.date), date));
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Event Calendar</h1>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={previousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-semibold">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <Button variant="outline" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="text-center p-2 font-semibold text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => (
            <div
              key={day.toString()}
              className={`
                relative p-4 border rounded-lg min-h-[100px]
                ${!isSameMonth(day, currentDate) ? 'bg-muted/50' : 'bg-card'}
              `}
            >
              <span className="text-sm">{format(day, 'd')}</span>
              {hasEventOnDay(day) && (
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}