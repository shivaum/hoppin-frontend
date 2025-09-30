// src/screens/SearchRides/hooks/useDateNavigation.ts
import { useState, useCallback } from 'react';

/**
 * Get today's date in YYYY-MM-DD format
 */
function getTodayDate(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

interface UseDateNavigationReturn {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  navigateDate: (direction: 'prev' | 'next') => void;
  canNavigatePrev: () => boolean;
}

/**
 * Custom hook for managing date navigation
 */
export function useDateNavigation(): UseDateNavigationReturn {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDate());

  const navigateDate = useCallback(
    (direction: 'prev' | 'next') => {
      const currentDate = new Date(selectedDate + 'T00:00:00');
      const today = new Date(getTodayDate() + 'T00:00:00');

      if (direction === 'prev') {
        const prevDate = new Date(currentDate);
        prevDate.setDate(currentDate.getDate() - 1);

        if (prevDate >= today) {
          const year = prevDate.getFullYear();
          const month = String(prevDate.getMonth() + 1).padStart(2, '0');
          const day = String(prevDate.getDate()).padStart(2, '0');
          setSelectedDate(`${year}-${month}-${day}`);
        }
      } else {
        const nextDate = new Date(currentDate);
        nextDate.setDate(currentDate.getDate() + 1);

        const year = nextDate.getFullYear();
        const month = String(nextDate.getMonth() + 1).padStart(2, '0');
        const day = String(nextDate.getDate()).padStart(2, '0');
        setSelectedDate(`${year}-${month}-${day}`);
      }
    },
    [selectedDate]
  );

  const canNavigatePrev = useCallback(() => {
    const currentDate = new Date(selectedDate + 'T00:00:00');
    const today = new Date(getTodayDate() + 'T00:00:00');
    const prevDate = new Date(currentDate);
    prevDate.setDate(currentDate.getDate() - 1);
    return prevDate >= today;
  }, [selectedDate]);

  return {
    selectedDate,
    setSelectedDate,
    navigateDate,
    canNavigatePrev,
  };
}