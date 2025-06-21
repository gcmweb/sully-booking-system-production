'use client';

import { Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface OpeningHours {
  [key: string]: {
    open: string;
    close: string;
    closed: boolean;
  };
}

interface OpeningHoursDisplayProps {
  openingHours: OpeningHours;
  className?: string;
}

const DAYS = [
  { key: 'monday', label: 'Monday', short: 'Mon' },
  { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { key: 'thursday', label: 'Thursday', short: 'Thu' },
  { key: 'friday', label: 'Friday', short: 'Fri' },
  { key: 'saturday', label: 'Saturday', short: 'Sat' },
  { key: 'sunday', label: 'Sunday', short: 'Sun' },
];

export function OpeningHoursDisplay({ openingHours, className = '' }: OpeningHoursDisplayProps) {
  const getCurrentDayStatus = () => {
    const now = new Date();
    const currentDay = DAYS[now.getDay() === 0 ? 6 : now.getDay() - 1]; // Adjust for Sunday = 0
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const dayHours = openingHours[currentDay.key];
    if (!dayHours || dayHours.closed) {
      return { status: 'closed', message: 'Closed today' };
    }
    
    const [openHour, openMin] = dayHours.open.split(':').map(Number);
    const [closeHour, closeMin] = dayHours.close.split(':').map(Number);
    const openTime = openHour * 60 + openMin;
    const closeTime = closeHour * 60 + closeMin;
    
    if (currentTime >= openTime && currentTime <= closeTime) {
      const closeTimeFormatted = formatTime(dayHours.close);
      return { status: 'open', message: `Open until ${closeTimeFormatted}` };
    } else if (currentTime < openTime) {
      const openTimeFormatted = formatTime(dayHours.open);
      return { status: 'closed', message: `Opens at ${openTimeFormatted}` };
    } else {
      // Find next opening day
      const nextDay = getNextOpenDay(currentDay.key);
      if (nextDay) {
        const nextOpenTime = formatTime(openingHours[nextDay].open);
        const nextDayLabel = DAYS.find(d => d.key === nextDay)?.label;
        return { status: 'closed', message: `Opens ${nextDayLabel} at ${nextOpenTime}` };
      }
      return { status: 'closed', message: 'Closed' };
    }
  };
  
  const getNextOpenDay = (currentDayKey: string) => {
    const currentIndex = DAYS.findIndex(d => d.key === currentDayKey);
    for (let i = 1; i <= 7; i++) {
      const nextIndex = (currentIndex + i) % 7;
      const nextDay = DAYS[nextIndex];
      const nextDayHours = openingHours[nextDay.key];
      if (nextDayHours && !nextDayHours.closed) {
        return nextDay.key;
      }
    }
    return null;
  };
  
  const formatTime = (time: string) => {
    const [hour, minute] = time.split(':').map(Number);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
  };
  
  const currentStatus = getCurrentDayStatus();
  
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-lg">
          <Clock className="h-5 w-5 text-orange-600" />
          <span>Opening Hours</span>
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Badge 
            variant={currentStatus.status === 'open' ? 'default' : 'secondary'}
            className={currentStatus.status === 'open' ? 'bg-green-600' : 'bg-gray-500'}
          >
            {currentStatus.status === 'open' ? 'Open Now' : 'Closed'}
          </Badge>
          <span className="text-sm text-gray-600">{currentStatus.message}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {DAYS.map((day) => {
            const dayHours = openingHours[day.key];
            const isToday = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1].key === day.key;
            
            return (
              <div 
                key={day.key} 
                className={`flex justify-between items-center py-2 px-3 rounded-lg transition-colors ${
                  isToday ? 'bg-orange-50 border border-orange-200' : 'hover:bg-gray-50'
                }`}
              >
                <span className={`font-medium ${
                  isToday ? 'text-orange-900' : 'text-gray-900'
                }`}>
                  {day.label}
                  {isToday && (
                    <Badge variant="outline" className="ml-2 text-xs border-orange-300 text-orange-700">
                      Today
                    </Badge>
                  )}
                </span>
                <span className={`text-sm ${
                  isToday ? 'text-orange-700 font-medium' : 'text-gray-600'
                }`}>
                  {dayHours && !dayHours.closed ? (
                    `${formatTime(dayHours.open)} - ${formatTime(dayHours.close)}`
                  ) : (
                    <span className="text-gray-400">Closed</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
        
        {/* Additional Info */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Hours may vary on holidays. Please contact the venue to confirm availability.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}