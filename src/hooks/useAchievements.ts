import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { AchievementsService } from '../services/AchievementsService';

// Caché en memoria: evita repetir el skeleton al volver a la pantalla.
let cachedCoupons: any[] = [];
let cachedPoints = 0;
let achievementsLoaded = false;

export const TIER_DATA = [
  { tier: 1, label: 'Pasaporte Cósmico', icon: 'map', color: '#3b82f6', pts: 0, phase: 'GANCHO', reward: 'Sin cargos de servicio' },
  { tier: 2, label: 'Ignición: T-Minus 0', icon: 'zap', color: '#22c55e', pts: 100, phase: 'GANCHO', reward: '15% de Descuento' },
  { tier: 3, label: 'Órbita Baja', icon: 'wind', color: '#06b6d4', pts: 300, phase: 'GANCHO', reward: '25% de Descuento' },
  { tier: 4, label: 'Alunizaje VIP', icon: 'moon', color: '#8b5cf6', pts: 500, phase: 'RETENCIÓN', reward: 'Acceso Preferencial' },
  { tier: 5, label: 'Piloto Sputnik', icon: 'send', color: '#ec4899', pts: 1000, phase: 'RETENCIÓN', reward: 'Regalo Oficial' },
  { tier: 6, label: 'Viajero de Marte', icon: 'globe', color: '#f59e0b', pts: 2000, phase: 'RETENCIÓN', reward: 'Sorteo Conocer Artista' },
  { tier: 7, label: 'Comandante Interestelar', icon: 'shield', color: '#ef4444', pts: 5000, phase: 'FIDELIZACIÓN', reward: 'Preventa Exclusiva' },
  { tier: 8, label: 'Salto al Hiperespacio', icon: 'fast-forward', color: '#10b981', pts: 7500, phase: 'FIDELIZACIÓN', reward: 'Prueba de Sonido' },
  { tier: 9, label: 'Supernova', icon: 'sun', color: '#a855f7', pts: 9000, phase: 'FIDELIZACIÓN', reward: 'Paquete Hospitalidad' },
  { tier: 10, label: 'El Legado Laika', icon: 'award', color: '#eab308', pts: 10000, phase: 'LEYENDA', reward: 'MEMBRESÍA VITALICIA' },
];

export const getTier = (pts: number) => {
  let t = TIER_DATA[0];
  for (const td of TIER_DATA) {
    if (pts >= td.pts) t = td;
  }
  return t;
};

export const getNextTier = (pts: number) => {
  return TIER_DATA.find(td => td.pts > pts) || null;
};

export const useAchievements = () => {
  const user = useAuth();

  // Caché en memoria: evita repetir el skeleton al volver a la pantalla.
  const [coupons, setCoupons] = useState<any[]>(cachedCoupons);
  const [totalPoints, setTotalPoints] = useState(cachedPoints);
  const [loading, setLoading] = useState(!achievementsLoaded);
  const [error, setError] = useState<string | null>(null);

  const fetchAchievements = useCallback(async () => {
    if (!user) return;
    try {
      // Solo loader la primera vez; después se conservan los datos.
      if (!achievementsLoaded) {
        setLoading(true);
      }
      setError(null);

      const [achievementsData, couponsData] = await Promise.allSettled([
        AchievementsService.getAll(),
        AchievementsService.getCoupons(),
      ]);

      if (achievementsData.status === 'fulfilled') {
        const data = achievementsData.value;
        const pts = data?.total_points || 0;
        cachedPoints = pts;
        setTotalPoints(pts);
      } else {
        setError('No se pudieron cargar los logros');
      }

      if (couponsData.status === 'fulfilled') {
        const couponList = Array.isArray(couponsData.value)
          ? couponsData.value
          : couponsData.value?.coupons || [];
        cachedCoupons = couponList;
        setCoupons(couponList);
      }
      achievementsLoaded = true;
    } catch (err: any) {
      setError(err.message || 'Error al cargar logros');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  return {
    coupons,
    totalPoints,
    tier: getTier(totalPoints),
    nextTier: getNextTier(totalPoints),
    loading,
    error,
    refresh: fetchAchievements,
  };
};
