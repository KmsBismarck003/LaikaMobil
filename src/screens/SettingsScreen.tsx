import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Linking, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../styles/ThemeProvider';
import { Typography } from '../components/ui/Typography';
import { useStyles } from '../styles/useStyles';
import { NotificationPreferencesView } from '../funciones/notificaciones';
import { pilgrimApi, checkApiHealth, setCustomApiUrl, resetToDefaultApiUrl, PILGRIM_API_URL } from '../api/config';

export const SettingsScreen: React.FC = () => {
  const styles = useStyles(createStyles);
  const { theme, themeType, setThemeType } = useAppTheme();
  const insets = useSafeAreaInsets();

  const [currentUrl, setCurrentUrl] = useState<string>(pilgrimApi.defaults.baseURL || PILGRIM_API_URL);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [inputUrl, setInputUrl] = useState<string>('');
  const [testingHealth, setTestingHealth] = useState<boolean>(false);
  const [healthResult, setHealthResult] = useState<{ ok: boolean; latencyMs?: number; message?: string } | null>(null);

  const themes = [
    { id: 'light', label: 'Claro', icon: 'sun' },
    { id: 'dark', label: 'Oscuro', icon: 'moon' },
    { id: 'auto', label: 'Sistema', icon: 'smartphone' },
  ];

  useEffect(() => {
    setCurrentUrl(pilgrimApi.defaults.baseURL || PILGRIM_API_URL);
  }, []);

  const handleTestConnection = async (urlToTest?: string) => {
    setTestingHealth(true);
    setHealthResult(null);
    try {
      const result = await checkApiHealth(urlToTest || currentUrl);
      setHealthResult(result);
    } catch (e: any) {
      setHealthResult({ ok: false, message: e.message || 'Error desconocido' });
    } finally {
      setTestingHealth(false);
    }
  };

  const handleSaveCustomUrl = async () => {
    if (!inputUrl.trim()) {
      Alert.alert('URL requerida', 'Por favor ingresa una URL válida para el servidor de Pilgrim.');
      return;
    }
    try {
      await setCustomApiUrl(inputUrl);
      const updated = pilgrimApi.defaults.baseURL || inputUrl;
      setCurrentUrl(updated);
      setIsEditing(false);
      handleTestConnection(updated);
    } catch {
      Alert.alert('Error', 'No se pudo guardar la nueva URL.');
    }
  };

  const handleResetUrl = async () => {
    try {
      await resetToDefaultApiUrl();
      const updated = pilgrimApi.defaults.baseURL || PILGRIM_API_URL;
      setCurrentUrl(updated);
      setIsEditing(false);
      handleTestConnection(updated);
    } catch {
      Alert.alert('Error', 'No se pudo restaurar la URL por defecto.');
    }
  };

  const isTunnel = currentUrl.startsWith('https://');

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Sección: Servidor y Conexión de API (Nueva) */}
        <View style={styles.section}>
          <Typography variant="overline" color={theme.colors.textSecondary} style={styles.sectionTitle}>
            SERVIDOR API (PILGRIM GATEWAY)
          </Typography>
          <View style={styles.card}>
            <View style={styles.serverCardHeader}>
              <View style={[styles.iconBox, { backgroundColor: theme.colors.surfaceHighlight }]}>
                <Feather name={isTunnel ? 'globe' : 'wifi'} size={18} color={theme.colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Typography variant="subheadline" color={theme.colors.text} style={{ fontWeight: '600' }}>
                    {isTunnel ? 'Túnel Global / Nube' : 'Red Local Wi-Fi'}
                  </Typography>
                  <View style={[styles.badge, { backgroundColor: isTunnel ? '#10b98120' : '#3b82f620' }]}>
                    <Typography variant="caption" color={isTunnel ? '#10b981' : '#3b82f6'} style={{ fontWeight: '700', fontSize: 10 }}>
                      {isTunnel ? 'HTTPS' : 'LAN'}
                    </Typography>
                  </View>
                </View>
                <Typography variant="caption" color={theme.colors.textSecondary} numberOfLines={1} style={{ marginTop: 2 }}>
                  {currentUrl}
                </Typography>
              </View>
            </View>

            {/* Resultado de prueba de salud si existe */}
            {healthResult && (
              <View style={[
                styles.healthBanner, 
                { backgroundColor: healthResult.ok ? '#10b98115' : '#ef444415', borderColor: healthResult.ok ? '#10b98140' : '#ef444440' }
              ]}>
                <Feather name={healthResult.ok ? 'check-circle' : 'alert-circle'} size={16} color={healthResult.ok ? '#10b981' : '#ef4444'} />
                <Typography variant="caption" color={healthResult.ok ? '#10b981' : '#ef4444'} style={{ flex: 1, fontWeight: '500' }}>
                  {healthResult.ok 
                    ? `En línea (${healthResult.latencyMs}ms) - Gateway conectado con éxito` 
                    : `Sin respuesta: ${healthResult.message || 'Verifica que Pilgrim esté corriendo'}`}
                </Typography>
              </View>
            )}

            {/* Formulario de edición rápida de URL */}
            {isEditing ? (
              <View style={styles.editContainer}>
                <Typography variant="caption" color={theme.colors.textSecondary} style={{ marginBottom: 6 }}>
                  Ingresa la URL del túnel (ej. https://laika-pilgrim-dev.loca.lt/api) o tu IP local:
                </Typography>
                <TextInput
                  style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.borderFaint, backgroundColor: theme.colors.surfaceHighlight }]}
                  placeholder="https://..."
                  placeholderTextColor={theme.colors.textTertiary}
                  value={inputUrl}
                  onChangeText={setInputUrl}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <View style={styles.editButtonsRow}>
                  <TouchableOpacity 
                    style={[styles.btnOutline, { borderColor: theme.colors.borderFaint }]}
                    onPress={() => setIsEditing(false)}
                  >
                    <Typography variant="caption" color={theme.colors.textSecondary}>Cancelar</Typography>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.btnOutline, { borderColor: theme.colors.borderFaint }]}
                    onPress={handleResetUrl}
                  >
                    <Typography variant="caption" color={theme.colors.primary}>Auto-Detectar</Typography>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.btnSolid, { backgroundColor: theme.colors.primary }]}
                    onPress={handleSaveCustomUrl}
                  >
                    <Typography variant="caption" color="#fff" style={{ fontWeight: '600' }}>Guardar</Typography>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.serverActionsRow}>
                <TouchableOpacity 
                  style={[styles.actionButton, { borderColor: theme.colors.borderFaint }]} 
                  onPress={() => handleTestConnection()}
                  disabled={testingHealth}
                  activeOpacity={0.7}
                >
                  {testingHealth ? (
                    <ActivityIndicator size="small" color={theme.colors.primary} />
                  ) : (
                    <>
                      <Feather name="activity" size={14} color={theme.colors.primary} />
                      <Typography variant="caption" color={theme.colors.primary} style={{ fontWeight: '600' }}>
                        Probar Conexión
                      </Typography>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.actionButton, { borderColor: theme.colors.borderFaint }]} 
                  onPress={() => {
                    setInputUrl(currentUrl);
                    setIsEditing(true);
                  }}
                  activeOpacity={0.7}
                >
                  <Feather name="edit-2" size={14} color={theme.colors.textSecondary} />
                  <Typography variant="caption" color={theme.colors.textSecondary}>
                    Cambiar URL
                  </Typography>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Sección: Tema */}
        <View style={styles.section}>
          <Typography variant="overline" color={theme.colors.textSecondary} style={styles.sectionTitle}>
            APARIENCIA
          </Typography>
          <View style={styles.card}>
            {themes.map((t, index) => (
              <TouchableOpacity
                key={t.id}
                style={[
                  styles.row,
                  index !== themes.length - 1 && styles.rowDivider
                ]}
                onPress={() => setThemeType(t.id as any)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconBox, { backgroundColor: themeType === t.id ? theme.colors.primaryFaint : theme.colors.surfaceHighlight }]}>
                  <Feather name={t.icon as any} size={18} color={themeType === t.id ? theme.colors.primary : theme.colors.textTertiary} />
                </View>
                <Typography variant="subheadline" color={theme.colors.text} style={{ flex: 1 }}>
                  {t.label}
                </Typography>
                {themeType === t.id && (
                  <Feather name="check" size={20} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sección: Permisos */}
        <View style={styles.section}>
          <Typography variant="overline" color={theme.colors.textSecondary} style={styles.sectionTitle}>
            PERMISOS Y PRIVACIDAD
          </Typography>
          <View style={styles.card}>
            <TouchableOpacity 
              style={styles.row} 
              activeOpacity={0.7}
              onPress={() => Linking.openSettings()}
            >
              <View style={[styles.iconBox, { backgroundColor: theme.colors.surfaceHighlight }]}>
                <Feather name="bell" size={18} color={theme.colors.textTertiary} />
              </View>
              <Typography variant="subheadline" color={theme.colors.text} style={{ flex: 1 }}>
                Notificaciones Push
              </Typography>
              <Feather name="chevron-right" size={20} color={theme.colors.textTertiary} />
            </TouchableOpacity>
            <View style={styles.rowDivider} />
            <TouchableOpacity style={styles.row} activeOpacity={0.7}>
              <View style={[styles.iconBox, { backgroundColor: theme.colors.surfaceHighlight }]}>
                <Feather name="map-pin" size={18} color={theme.colors.textTertiary} />
              </View>
              <Typography variant="subheadline" color={theme.colors.text} style={{ flex: 1 }}>
                Ubicación
              </Typography>
              <Feather name="chevron-right" size={20} color={theme.colors.textTertiary} />
            </TouchableOpacity>
            <View style={styles.rowDivider} />
            <TouchableOpacity style={styles.row} activeOpacity={0.7}>
              <View style={[styles.iconBox, { backgroundColor: theme.colors.surfaceHighlight }]}>
                <Feather name="camera" size={18} color={theme.colors.textTertiary} />
              </View>
              <Typography variant="subheadline" color={theme.colors.text} style={{ flex: 1 }}>
                Cámara (Escáner QR)
              </Typography>
              <Feather name="chevron-right" size={20} color={theme.colors.textTertiary} />
            </TouchableOpacity>
            <View style={styles.rowDivider} />
            <TouchableOpacity 
              style={styles.row} 
              activeOpacity={0.7}
              onPress={() => Linking.openURL('https://laikaclub.com/privacidad')}
            >
              <View style={[styles.iconBox, { backgroundColor: theme.colors.surfaceHighlight }]}>
                <Feather name="shield" size={18} color={theme.colors.textTertiary} />
              </View>
              <Typography variant="subheadline" color={theme.colors.text} style={{ flex: 1 }}>
                Política de Privacidad
              </Typography>
              <Feather name="external-link" size={20} color={theme.colors.textTertiary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sección: Notificaciones */}
        <View style={styles.section}>
          <Typography variant="overline" color={theme.colors.textSecondary} style={styles.sectionTitle}>
            PREFERENCIAS DE NOTIFICACIONES
          </Typography>
          <NotificationPreferencesView />
        </View>

      </ScrollView>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingVertical: theme.spacing.l,
  },
  section: {
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.l,
  },
  sectionTitle: {
    letterSpacing: 1.5,
    fontSize: 11,
    marginBottom: theme.spacing.m,
    marginLeft: theme.spacing.s,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.borderFaint,
    overflow: 'hidden',
  },
  serverCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.m,
    gap: theme.spacing.m,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  healthBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: theme.spacing.m,
    marginBottom: theme.spacing.m,
    padding: theme.spacing.s + 2,
    borderRadius: theme.borderRadius.m,
    borderWidth: 1,
  },
  serverActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s,
    paddingHorizontal: theme.spacing.m,
    paddingBottom: theme.spacing.m,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.m,
    borderWidth: 1,
  },
  editContainer: {
    paddingHorizontal: theme.spacing.m,
    paddingBottom: theme.spacing.m,
  },
  input: {
    height: 40,
    borderRadius: theme.borderRadius.m,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.m,
    fontSize: 13,
    marginBottom: theme.spacing.s,
  },
  editButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: theme.spacing.s,
  },
  btnOutline: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: theme.borderRadius.m,
    borderWidth: 1,
  },
  btnSolid: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.m,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.m,
    gap: theme.spacing.m,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderFaint,
    marginLeft: 54,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.m,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
