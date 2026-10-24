import { pilgrimApi, PILGRIM_API_URL } from '../api/config';

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

/**
 * Obtiene la URL base activa de Pilgrim eliminando el sufijo /api
 */
const getBaseUrl = (): string => {
  const current = (pilgrimApi.defaults.baseURL || PILGRIM_API_URL || '').trim().replace(/\/+$/, '');
  return current.replace(/\/api(\/v1)?$/, '');
};

/**
 * Normaliza cualquier URL de imagen asegurando que apunte al host activo (túnel o LAN)
 */
const normalizeImageUrl = (rawUrl?: string): string | undefined => {
  if (!rawUrl || typeof rawUrl !== 'string') return undefined;
  const baseUrl = getBaseUrl();
  let imgUrl = rawUrl.trim().normalize('NFC');

  // Si es ruta relativa (/uploads/...)
  if (imgUrl.startsWith('/')) {
    return `${baseUrl}${imgUrl}`;
  }

  // Si apunta a localhost o a una IP local (ej. 192.168.x.x o 127.0.0.1) que no corresponde al túnel activo
  if (baseUrl.startsWith('https://') && (imgUrl.includes('localhost') || imgUrl.includes('127.0.0.1') || imgUrl.includes('192.168.'))) {
    return imgUrl.replace(/^https?:\/\/[^\/]+/, baseUrl);
  }

  return imgUrl;
};

export const EventService = {
  getEvents: async (): Promise<Event[]> => {
    try {
      const response = await pilgrimApi.get('/events/public', { params: { limit: 100 } });

      return response.data.map((item: any) => {
        const imgUrl = normalizeImageUrl(item.image_url);

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
      
      const imgUrl = normalizeImageUrl(item.image_url);

      let galleryUrls: string[] = [];
      if (item.gallery_urls) {
        galleryUrls = item.gallery_urls.split(',').map((u: string) => {
          return normalizeImageUrl(u) || u.trim();
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
