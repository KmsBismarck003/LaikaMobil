import { pilgrimApi } from '../api/config';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  category: string;
  imageUrl?: string;
  status?: string;
  minPrice?: number;
}

const fixMojibake = (str: string): string => {
  if (!str) return str;
  return str
    .replace(/M├®xico/g, 'México')
    .replace(/├®/g, 'é')
    .replace(/├í/g, 'á')
    .replace(/├¡/g, 'í')
    .replace(/├│/g, 'ó')
    .replace(/├║/g, 'ú')
    .replace(/├▒/g, 'ñ')
    .replace(/├ü/g, 'Á')
    .replace(/├Й/g, 'É')
    .replace(/├Н/g, 'Í')
    .replace(/├У/g, 'Ó')
    .replace(/├Ъ/g, 'Ú')
    .replace(/├С/g, 'Ñ');
};

export const EventService = {
  getEvents: async (): Promise<Event[]> => {
    try {
      const response = await pilgrimApi.get('/events/public', { params: { limit: 100 } });
      
      const baseUrl = process.env.EXPO_PUBLIC_PILGRIM_API_URL?.replace('/api', '') || 'http://172.27.254.222:8000';

      return response.data.map((item: any) => {
        let imgUrl = item.image_url || undefined;
        if (imgUrl && imgUrl.startsWith('/')) {
          imgUrl = `${baseUrl}${imgUrl}`;
        }

        return {
          id: item.id?.toString() || Math.random().toString(),
          title: item.name || item.title || 'Evento sin nombre',
          description: item.description || 'Sin descripción',
          date: item.event_date || item.date || '',
          location: fixMojibake((item.municipality_name && item.state_name) 
            ? `${item.municipality_name}, ${item.state_name}` 
            : (item.venue_name || item.location || 'Ubicación desconocida')),
          category: item.category || 'general',
          imageUrl: imgUrl,
          status: item.status || 'Activo',
          minPrice: item.min_price || item.price || 0,
        };
      });
    } catch (error) {
      console.error('Error fetching events from Pilgrim API:', error);
      throw error;
    }
  },

  getEventById: async (id: string): Promise<any> => {
    try {
      const response = await pilgrimApi.get(`/events/${id}`);
      const item = response.data;
      
      const baseUrl = process.env.EXPO_PUBLIC_PILGRIM_API_URL?.replace('/api', '') || 'http://172.27.254.222:8000';
      let imgUrl = item.image_url || undefined;
      if (imgUrl && imgUrl.startsWith('/')) {
        imgUrl = `${baseUrl}${imgUrl}`;
      }

      let galleryUrls: string[] = [];
      if (item.gallery_urls) {
        galleryUrls = item.gallery_urls.split(',').map((u: string) => {
          let gUrl = u.trim();
          if (gUrl.startsWith('/')) gUrl = `${baseUrl}${gUrl}`;
          return gUrl;
        });
      }

        const rawFunctions = item.functions || [];
        // Filtrar funciones mockeadas: solo mantener las que correspondan a la sede principal del evento
        const realFunctions = rawFunctions.filter((f: any) => 
          !item.venue_id || f.venue_id === item.venue_id
        );

        return {
          ...item,
          id: item.id?.toString(),
          title: item.name || item.title || 'Evento sin nombre',
          description: item.description || 'Sin descripción',
          date: item.event_date || item.date || '',
          location: fixMojibake((item.municipality_name && item.state_name) 
            ? `${item.municipality_name}, ${item.state_name}` 
            : (item.venue_name || item.location || 'Ubicación desconocida')),
          category: item.category || 'general',
          imageUrl: imgUrl,
          status: item.status || 'Activo',
          minPrice: item.min_price || item.price || 0,
          galleryUrls,
          functions: realFunctions.length > 0 ? realFunctions : (item.event_date || item.date ? [{
            id: 'single-function',
            date: item.event_date || item.date,
            time: item.event_time || '',
            room_name: item.room?.name || '',
          }] : []),
          sections: item.sections || [],
          room: item.room || null,
          useSeatingMap: item.use_seating_map === true || item.use_seating_map === 1,
        };
    } catch (error) {
      console.error(`Error fetching event ${id}:`, error);
      throw error;
    }
  },

  getBusySeats: async (eventId: string, functionId?: string): Promise<string[]> => {
    try {
      const url = functionId ? `/tickets/busy-seats/${eventId}?function_id=${functionId}` : `/tickets/busy-seats/${eventId}`;
      const response = await pilgrimApi.get(url);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error(`Error fetching busy seats for event ${eventId}:`, error);
      return [];
    }
  },
};
