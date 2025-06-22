
'use client';

import { useEffect, useState } from 'react';
import { OpeningHoursDisplay } from "../../components/opening-hours-display";

interface OpeningHour {
  id?: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  name?: string;
  isActive: boolean;
}

export default function TestOpeningHoursPage() {
  const [openingHours, setOpeningHours] = useState<OpeningHour[]>([]);

  useEffect(() => {
    // Fetch opening hours for test venue
    fetch('/api/venues/cmbywrh5a0009m3fxje02m2nn/opening-hours')
      .then(res => res.json())
      .then(data => {
        setOpeningHours(data.openingHours || []);
      })
      .catch(err => console.error('Failed to fetch opening hours:', err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Opening Hours Test</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Full Display</h2>
            <OpeningHoursDisplay openingHours={openingHours} />
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Compact Display</h2>
            <OpeningHoursDisplay openingHours={openingHours} compact={true} />
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Raw Data</h2>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
            {JSON.stringify(openingHours, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
