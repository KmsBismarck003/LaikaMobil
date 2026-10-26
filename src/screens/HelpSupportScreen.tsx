import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography } from '../components/ui/Typography';
import { Button } from '../components/ui/Button';
import { useAppTheme } from '../styles/ThemeProvider';
import { Feather } from '@expo/vector-icons';
import {
  FAQCategory,
  FeedbackSection,
  ServiceRequestModal,
  SupportSkeleton,
  helpCategories,
} from '../funciones/ayuda-soporte';
import { LinearGradient } from 'expo-linear-gradient';
import { useSupportService } from '../hooks/useSupportService';

export const HelpSupportScreen: React.FC = () => {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Hook desacoplado de servicio remoto (Fases 2 y 3: Lectura GET y Envío POST)
  const { categories: remoteCategories, loading, error, refresh, submitTicket } = useSupportService();

  // Filtrado de FAQs locales de referencia
  const filteredFaqCategories = helpCategories.map(cat => {
    const filteredFaqs = cat.faqs.filter(faq => 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return {
      ...cat,
      faqs: filteredFaqs
    };
  }).filter(cat => cat.faqs.length > 0 || cat.title.toLowerCase().includes(searchQuery.toLowerCase()));

  // Filtrado de Categorías de Servicio Remotas
  const filteredRemoteCategories = remoteCategories.filter(cat =>
    cat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
      >
        <LinearGradient
          colors={[theme.colors.primaryFaint, theme.colors.background]}
          style={styles.headerGradient}
        />
        
        {/* HERO INFO */}
        <View style={styles.headerInfo}>
          <View style={[styles.heroIconWrapper, { backgroundColor: theme.colors.surface, ...theme.shadows.medium }]}>
            <LinearGradient
              colors={[theme.colors.primaryLight, theme.colors.primary]}
              style={styles.heroIconInner}
            >
              <Feather name="help-circle" size={32} color={theme.colors.white} />
            </LinearGradient>
          </View>
          <Typography variant="display" color={theme.colors.text} align="center" style={styles.mainTitle}>
            Centro de Ayuda{'\n'}& Servicios
          </Typography>
          <Typography variant="body" color={theme.colors.textSecondary} align="center" style={{ marginTop: 4 }}>
            Consulta canales oficiales o radica una solicitud directa con el equipo técnico.
          </Typography>

          {/* Botón de acción rápida para abrir formulario */}
          <Button
            title="Crear Solicitud de Servicio"
            variant="primary"
            size="medium"
            onPress={() => setModalVisible(true)}
            leftIcon={<Feather name="plus-circle" size={16} color={theme.colors.white} />}
            style={{ marginTop: 16 }}
          />
        </View>

        {/* BUSCADOR */}
        <View style={[
          styles.searchContainer, 
          { backgroundColor: theme.colors.surface, ...theme.shadows.small },
          isSearchFocused && { borderColor: theme.colors.primary, borderWidth: 1 }
        ]}>
          <Feather name="search" size={20} color={isSearchFocused ? theme.colors.primary : theme.colors.textTertiary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Buscar por categoría o palabra clave..."
            placeholderTextColor={theme.colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <Feather 
              name="x-circle" 
              size={20} 
              color={theme.colors.textTertiary} 
              onPress={() => setSearchQuery('')} 
              style={{ padding: 4 }}
            />
          )}
        </View>

        {/* SECCIÓN 1: CANALES Y SERVICIOS REMOTOS (CONSUMO GET) */}
        <View style={styles.sectionHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Feather name="cloud" size={18} color={theme.colors.primary} />
            <Typography variant="headline" color={theme.colors.text}>
              Canales de Servicio Conectados
            </Typography>
          </View>
          <Typography variant="caption" color={theme.colors.textTertiary}>
            Servicio Remoto Pilgrim
          </Typography>
        </View>

        {/* Estado de Carga (Loading Skeleton) */}
        {loading && <SupportSkeleton />}

        {/* Estado de Error de Red con opción de reintento */}
        {!loading && error && (
          <View style={[styles.errorCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.errorFaint }]}>
            <Feather name="alert-triangle" size={28} color={theme.colors.error} style={{ marginBottom: 8 }} />
            <Typography variant="subheadline" color={theme.colors.text} align="center">
              No fue posible sincronizar los servicios remotos
            </Typography>
            <Typography variant="footnote" color={theme.colors.textSecondary} align="center" style={{ marginTop: 4, marginBottom: 12 }}>
              {error}
            </Typography>
            <Button
              title="Reintentar Conexión"
              variant="outline"
              size="small"
              onPress={refresh}
              leftIcon={<Feather name="refresh-cw" size={14} color={theme.colors.text} />}
            />
          </View>
        )}

        {/* Renderizado de Categorías Remotas Reales */}
        {!loading && !error && filteredRemoteCategories.length > 0 && (
          <View style={styles.remoteList}>
            {filteredRemoteCategories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.remoteCategoryCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderFaint }]}
                activeOpacity={0.75}
                onPress={() => setModalVisible(true)}
              >
                <View style={[styles.remoteIconBox, { backgroundColor: theme.colors.primaryFaint }]}>
                  <Feather name={(cat.icon as any) || 'folder'} size={20} color={theme.colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                    <Typography variant="subheadline" color={theme.colors.text} style={{ fontWeight: '600' }}>
                      {cat.title}
                    </Typography>
                    <View style={[styles.slaBadge, { backgroundColor: theme.colors.surfaceHighlight }]}>
                      <Typography variant="overline" color={theme.colors.textSecondary}>
                        SLA: {cat.slaHours}H
                      </Typography>
                    </View>
                  </View>
                  <Typography variant="footnote" color={theme.colors.textSecondary} numberOfLines={2}>
                    {cat.description}
                  </Typography>
                </View>
                <Feather name="chevron-right" size={18} color={theme.colors.textTertiary} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* SECCIÓN 2: PREGUNTAS FRECUENTES Y GUÍAS DE AUTO-SERVICIO */}
        <View style={[styles.sectionHeader, { marginTop: 32 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Feather name="book-open" size={18} color={theme.colors.primary} />
            <Typography variant="headline" color={theme.colors.text}>
              Guías Frecuentes
            </Typography>
          </View>
        </View>

        <View style={styles.categoriesContainer}>
          {filteredFaqCategories.length > 0 ? (
            filteredFaqCategories.map(category => (
              <FAQCategory key={category.id} category={category} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <View style={[styles.emptyIconWrapper, { backgroundColor: theme.colors.surfaceHighlight }]}>
                <Feather name="search" size={32} color={theme.colors.textTertiary} />
              </View>
              <Typography variant="headline" color={theme.colors.text} style={{ marginTop: 24 }}>
                Sin resultados
              </Typography>
              <Typography variant="body" color={theme.colors.textSecondary} align="center" style={{ marginTop: 8, paddingHorizontal: 32 }}>
                No encontramos respuestas para "{searchQuery}". Radica una solicitud directa mediante el botón inferior.
              </Typography>
            </View>
          )}
        </View>

        {/* SECCIÓN DE CONTACTO DIRECTO (Invoca Modal de Escritura POST) */}
        <FeedbackSection onRequestSupport={() => setModalVisible(true)} />
        
        {/* MODAL DE REGISTRO / ESCRITURA REMOTA POST */}
        <ServiceRequestModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          categories={remoteCategories}
          onSubmit={submitTicket}
        />

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    position: 'absolute',
    top: -100,
    left: 0,
    right: 0,
    height: 300,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  headerInfo: {
    alignItems: 'center',
    marginBottom: 28,
  },
  heroIconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    padding: 6,
    marginBottom: 20,
  },
  heroIconInner: {
    flex: 1,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainTitle: {
    marginBottom: 8,
    lineHeight: 38,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 20,
    height: 56,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    height: '100%',
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  remoteList: {
    gap: 12,
    marginBottom: 16,
  },
  remoteCategoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  remoteIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slaBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  errorCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 16,
  },
  categoriesContainer: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyIconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
