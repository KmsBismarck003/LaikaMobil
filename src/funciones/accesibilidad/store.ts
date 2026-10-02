import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AccessibilityPreferences {
  textScale: number;
  reduceMotion: boolean;
}

const STORAGE_KEY = '@laika_accessibility_prefs';

const DEFAULT_PREFS: AccessibilityPreferences = {
  textScale: 1.0,
  reduceMotion: false,
};

export const loadAccessibilityPrefs = async (): Promise<AccessibilityPreferences> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Error loading accessibility prefs', e);
  }
  return DEFAULT_PREFS;
};

export const saveAccessibilityPrefs = async (prefs: AccessibilityPreferences) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch (e) {
    console.error('Error saving accessibility prefs', e);
  }
};
