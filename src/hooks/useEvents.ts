import { useState, useEffect, useCallback } from 'react';
import { Event, EventService } from '../services/EventService';

// Caché en memoria: evita repetir el skeleton al volver a la pantalla.
let cachedEvents: Event[] | null = null;
let cachedLocations: string[] = [];

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>(cachedEvents ?? []);
  const [loading, setLoading] = useState<boolean>(cachedEvents === null);
  const [error, setError] = useState<string | null>(null);

  const [category, setCategory] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [query, setQuery] = useState<string>('');
  const [availableLocations, setAvailableLocations] = useState<string[]>(cachedLocations);

  const fetchEvents = useCallback(async (isInitial = false) => {
    try {
      // Solo muestra loader/skeleton en la primera carga; después se
      // conservan los datos en pantalla mientras se refresca.
      if (isInitial && cachedEvents === null) {
        setLoading(true);
      }
      setError(null);
      let raw = cachedEvents;
      if (!raw) {
        raw = await EventService.getEvents();
        cachedEvents = raw;
      }

      // Extract unique locations before filtering
      const uniqueLocs = Array.from(new Set(raw.map(e => e.location))).filter(Boolean);
      cachedLocations = uniqueLocs;
      setAvailableLocations(uniqueLocs);

      // Filtros locales
      let data = raw;
      if (category) {
        data = data.filter(e => e.category.toLowerCase() === category.toLowerCase());
      }
      if (date) {
        data = data.filter(e => e.date === date);
      }
      if (location) {
        data = data.filter(e => e.location.toLowerCase().includes(location.toLowerCase()));
      }
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        data = data.filter(e =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q)
        );
      }

      setEvents(data);
    } catch (err: any) {
      setError(err.message || 'Error al conectar con Pilgrim API');
    } finally {
      setLoading(false);
    }
  }, [category, date, location, query]);

  useEffect(() => {
    fetchEvents(true);
  }, [fetchEvents]);

  const refetch = useCallback(async () => {
    cachedEvents = null; // fuerza recarga real del API
    await fetchEvents(true);
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
    query,
    setQuery,
    availableLocations,
    refetch
  };
};
