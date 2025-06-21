
'use client';

import { useState } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Switch } from "./ui/switch";
import { Badge } from "./ui/badge";
import { Plus, Trash2, Clock, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface OpeningHour {
  id?: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  name?: string;
  isActive: boolean;
}

interface OpeningHoursManagerProps {
  openingHours: OpeningHour[];
  onChange: (openingHours: OpeningHour[]) => void;
  disabled?: boolean;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday', short: 'Sun' },
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' },
];

export default function OpeningHoursManager({ 
  openingHours, 
  onChange, 
  disabled = false 
}: OpeningHoursManagerProps) {
  const [selectedDay, setSelectedDay] = useState<number>(1); // Default to Monday

  const addTimeSlot = () => {
    const newSlot: OpeningHour = {
      dayOfWeek: selectedDay,
      openTime: '09:00',
      closeTime: '17:00',
      name: '',
      isActive: true,
    };
    onChange([...openingHours, newSlot]);
  };

  const updateTimeSlot = (index: number, field: keyof OpeningHour, value: any) => {
    const updated = [...openingHours];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeTimeSlot = (index: number) => {
    const updated = openingHours.filter((_, i) => i !== index);
    onChange(updated);
  };

  const copyToAllDays = (sourceIndex: number) => {
    const sourceSlot = openingHours[sourceIndex];
    const newSlots: OpeningHour[] = [];
    
    DAYS_OF_WEEK.forEach(day => {
      if (day.value !== sourceSlot.dayOfWeek) {
        newSlots.push({
          dayOfWeek: day.value,
          openTime: sourceSlot.openTime,
          closeTime: sourceSlot.closeTime,
          name: sourceSlot.name,
          isActive: sourceSlot.isActive,
        });
      }
    });
    
    onChange([...openingHours, ...newSlots]);
  };

  const getTimeSlotsForDay = (dayOfWeek: number) => {
    return openingHours
      .map((slot, index) => ({ ...slot, originalIndex: index }))
      .filter(slot => slot.dayOfWeek === dayOfWeek)
      .sort((a, b) => a.openTime.localeCompare(b.openTime));
  };

  const formatTimeRange = (openTime: string, closeTime: string) => {
    return `${openTime} - ${closeTime}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>Opening Hours</span>
        </CardTitle>
        <CardDescription>
          Set multiple time slots for each day of the week. Perfect for lunch and dinner services.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Day Selection */}
        <div className="space-y-3">
          <Label>Select Day to Manage</Label>
          <div className="grid grid-cols-7 gap-2">
            {DAYS_OF_WEEK.map((day) => (
              <Button
                key={day.value}
                variant={selectedDay === day.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedDay(day.value)}
                disabled={disabled}
                className="text-xs"
              >
                {day.short}
              </Button>
            ))}
          </div>
        </div>

        {/* Current Day Time Slots */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>{DAYS_OF_WEEK.find(d => d.value === selectedDay)?.label}</span>
            </h3>
            <Button
              onClick={addTimeSlot}
              size="sm"
              disabled={disabled}
              className="flex items-center space-x-1"
            >
              <Plus className="h-4 w-4" />
              <span>Add Time Slot</span>
            </Button>
          </div>

          <AnimatePresence>
            {getTimeSlotsForDay(selectedDay).map((slot, index) => (
              <motion.div
                key={`${slot.dayOfWeek}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={slot.isActive}
                          onCheckedChange={(checked) => 
                            updateTimeSlot(slot.originalIndex, 'isActive', checked)
                          }
                          disabled={disabled}
                        />
                        <Label className="text-sm">Active</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToAllDays(slot.originalIndex)}
                          disabled={disabled}
                        >
                          Copy to All Days
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeTimeSlot(slot.originalIndex)}
                          disabled={disabled}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`name-${slot.originalIndex}`}>
                          Service Name (Optional)
                        </Label>
                        <Input
                          id={`name-${slot.originalIndex}`}
                          placeholder="e.g., Lunch, Dinner"
                          value={slot.name || ''}
                          onChange={(e) => 
                            updateTimeSlot(slot.originalIndex, 'name', e.target.value)
                          }
                          disabled={disabled}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`open-${slot.originalIndex}`}>Open Time</Label>
                        <Input
                          id={`open-${slot.originalIndex}`}
                          type="time"
                          value={slot.openTime}
                          onChange={(e) => 
                            updateTimeSlot(slot.originalIndex, 'openTime', e.target.value)
                          }
                          disabled={disabled}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`close-${slot.originalIndex}`}>Close Time</Label>
                        <Input
                          id={`close-${slot.originalIndex}`}
                          type="time"
                          value={slot.closeTime}
                          onChange={(e) => 
                            updateTimeSlot(slot.originalIndex, 'closeTime', e.target.value)
                          }
                          disabled={disabled}
                        />
                      </div>
                    </div>

                    {slot.name && (
                      <Badge variant="secondary" className="w-fit">
                        {slot.name}: {formatTimeRange(slot.openTime, slot.closeTime)}
                      </Badge>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {getTimeSlotsForDay(selectedDay).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No opening hours set for {DAYS_OF_WEEK.find(d => d.value === selectedDay)?.label}</p>
              <p className="text-sm">Click "Add Time Slot" to get started</p>
            </div>
          )}
        </div>

        {/* Weekly Overview */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium">Weekly Overview</h3>
          <div className="grid gap-2">
            {DAYS_OF_WEEK.map((day) => {
              const daySlots = getTimeSlotsForDay(day.value);
              return (
                <div
                  key={day.value}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <span className="font-medium text-sm">{day.label}</span>
                  <div className="flex flex-wrap gap-1">
                    {daySlots.length > 0 ? (
                      daySlots
                        .filter(slot => slot.isActive)
                        .map((slot, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {slot.name ? `${slot.name}: ` : ''}
                            {formatTimeRange(slot.openTime, slot.closeTime)}
                          </Badge>
                        ))
                    ) : (
                      <span className="text-sm text-gray-500">Closed</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
