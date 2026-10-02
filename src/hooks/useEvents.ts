import { useState, useEffect, useCallback } from 'react';
import { Event, EventService } from '../services/EventService';

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [category, setCategory] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      let data = await EventService.getEvents();
      
      // Extract unique locations before filtering
      const uniqueLocs = Array.from(new Set(data.map(e => e.location))).filter(Boolean);
      setAvailableLocations(uniqueLocs);
      
      // Filtros locales
      if (category) {
        data = data.filter(e => e.category.toLowerCase() === category.toLowerCase());
      }
      if (date) {
        data = data.filter(e => e.date === date);
      }
      if (location) {
        data = data.filter(e => e.location.toLowerCase().includes(location.toLowerCase()));
      }

      setEvents(data);
    } catch (err: any) {
      setError(err.message || 'Error al conectar con Pilgrim API');
    } finally {
      setLoading(false);
    }
  }, [category, date, location]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    loading,
    error,
    category,
    setCategory,
    date,
    setDate,
    location,
    setLocation,
    availableLocations,
    refetch: fetchEvents
  };
};
