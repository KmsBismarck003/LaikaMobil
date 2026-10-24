import { ImageSourcePropType } from 'react-native';

/**
 * Retorna la fuente de imagen para React Native con codificación URI segura
 * y el encabezado 'bypass-tunnel-reminder' para permitir la carga transparente
 * a través de túneles como Localtunnel sin páginas de bloqueo intermedias.
 */
export const getSafeImageSource = (imageUrl?: string | null): ImageSourcePropType | undefined => {
  if (!imageUrl || typeof imageUrl !== 'string') {
    return undefined;
  }

  const trimmed = imageUrl.trim();
  if (!trimmed) {
    return undefined;
  }

  // Codificar caracteres especiales y espacios para evitar fallos de decodificación en Android/iOS
  let safeUri = trimmed;
  try {
    // Si ya tiene porcentaje de codificación, no re-codificar dos veces
    safeUri = encodeURI(decodeURI(trimmed));
  } catch {
    safeUri = encodeURI(trimmed);
  }

  return {
    uri: safeUri,
    headers: {
      'bypass-tunnel-reminder': 'true',
    },
  };
};
