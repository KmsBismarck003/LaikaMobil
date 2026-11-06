/**
 * HelpSupportScreen — LaikaMobil
 * Centro de Ayuda y Soporte Oficial.
 *
 * Arquitectura:
 *  - Header de navegación minimalista con botón Volver.
 *  - Buscador de preguntas frecuentes.
 *  - Selector de temas (SupportTopicSelector) para clasificar la consulta.
 *  - Tarjeta de contacto oficial con Smart Mailto (SupportEmailCard) que pre-llena
 *    la plantilla con datos de dispositivo, usuario y versión, eliminando formularios
 *    de tickets para prevenir spam.
 *  - Preguntas frecuentes categorizadas (FAQCategory / FAQItem).
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../styles/ThemeProvider';
import { useStyles } from '../styles/useStyles';
import { useAuth } from '../hooks/useAuth';
import { getCurrentUser } from '../store/AuthStore';
import {
  helpCategories,
  FAQCategory,
  SupportEmailCard,
  SupportTopicSelector,
  SUPPORT_TOPICS,
  TopicOption,
} from '../funciones/ayuda-soporte';

export const HelpSupportScreen: React.FC = () => {
  const styles = useStyles(createStyles);
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const userFromHook = useAuth();
  const user = userFromHook || getCurrentUser();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<TopicOption>(SUPPORT_TOPICS[0]);

  // Filtrado reactivo de FAQs locales
  const filteredFaqCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return helpCategories;

    return helpCategories
      .map((cat) => {
        const filteredFaqs = cat.faqs.filter(
          (faq) =>
            faq.question.toLowerCase().includes(query) ||
            faq.answer.toLowerCase().includes(query)
        );
        return {
          ...cat,
          faqs: filteredFaqs,
        };
      })
      .filter((cat) => cat.faqs.length > 0 || cat.title.toLowerCase().includes(query));
  }, [searchQuery]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* ── BARRA SUPERIOR FIJA RESPETANDO SAFE AREA ── */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Feather name="arrow-left" size={20} color={theme.colors.text} />
          <Text style={styles.backText}>Volver</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Ayuda y Soporte</Text>

        <View style={{ width: 60 }} />
      </View>

      {/* ── CONTENIDO SCROLLABLE ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 24) + 32 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Encabezado descriptivo */}
        <View style={styles.introBlock}>
          <Text style={styles.introTitle}>¿En qué podemos ayudarte?</Text>
          <Text style={styles.introSubtitle}>
            Consulta las dudas frecuentes o contáctanos directamente por correo con tus datos técnicos prellenados.
          </Text>
        </View>

        {/* Buscador minimalista sin neón */}
        <View
          style={[
            styles.searchContainer,
            isSearchFocused && styles.searchContainerFocused,
          ]}
        >
          <Feather
            name="search"
            size={18}
            color={isSearchFocused ? theme.colors.text : theme.colors.textTertiary}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por palabra clave (ej. boleto, reembolso)..."
            placeholderTextColor={theme.colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            returnKeyType="search"
          />
          {searchQuery.length > 0 ? (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather name="x-circle" size={18} color={theme.colors.textTertiary} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Selector de Motivo Rápido */}
        <SupportTopicSelector
          selectedTopicId={selectedTopic.id}
          onSelectTopic={(topic) => setSelectedTopic(topic)}
        />

        {/* Tarjeta de Contacto Directo Oficial (Smart Mailto) */}
        <SupportEmailCard
          selectedTopic={selectedTopic.label}
          user={user}
        />

        {/* Sección de Preguntas Frecuentes */}
        <View style={styles.faqSectionHeader}>
          <Text style={styles.faqSectionTitle}>Preguntas Frecuentes</Text>
          <Text style={styles.faqSectionCount}>
            {filteredFaqCategories.reduce((acc, cat) => acc + cat.faqs.length, 0)} respuestas disponibles
          </Text>
        </View>

        {filteredFaqCategories.length === 0 ? (
          <View style={styles.emptyFaqCard}>
            <Feather name="help-circle" size={28} color={theme.colors.textTertiary} style={{ marginBottom: 8 }} />
            <Text style={styles.emptyFaqTitle}>No encontramos respuestas para &quot;{searchQuery}&quot;</Text>
            <Text style={styles.emptyFaqSubtitle}>
              Puedes redactar tu correo arriba y nuestro equipo te responderá directamente.
            </Text>
          </View>
        ) : (
          filteredFaqCategories.map((category) => (
            <FAQCategory key={category.id} category={category} />
          ))
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.m,
      paddingBottom: 12,
      backgroundColor: theme.colors.surface || theme.colors.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.borderFaint || 'rgba(255, 255, 255, 0.06)',
      zIndex: 10,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      minWidth: 60,
      paddingVertical: 6,
    },
    backText: {
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: '600',
    },
    headerTitle: {
      ...theme.typography.header,
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.text,
      textAlign: 'center',
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingTop: 16,
    },
    introBlock: {
      marginBottom: 16,
    },
    introTitle: {
      ...theme.typography.header,
      fontSize: 22,
      fontWeight: '800',
      color: theme.colors.text,
      marginBottom: 4,
    },
    introSubtitle: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      lineHeight: 18,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceElevated || 'rgba(255, 255, 255, 0.04)',
      borderWidth: 1,
      borderColor: theme.colors.borderMedium || 'rgba(255, 255, 255, 0.08)',
      borderRadius: 14,
      paddingHorizontal: 14,
      height: 48,
      marginBottom: 16,
    },
    searchContainerFocused: {
      borderColor: theme.colors.textSecondary,
      backgroundColor: theme.colors.surface,
    },
    searchIcon: {
      marginRight: 10,
    },
    searchInput: {
      flex: 1,
      fontSize: 13,
      color: theme.colors.text,
      height: '100%',
    },
    faqSectionHeader: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      marginBottom: 14,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.borderFaint || 'rgba(255, 255, 255, 0.06)',
    },
    faqSectionTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.colors.text,
    },
    faqSectionCount: {
      fontSize: 11,
      color: theme.colors.textTertiary,
      fontWeight: '500',
    },
    emptyFaqCard: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 32,
      paddingHorizontal: 20,
      backgroundColor: theme.colors.surfaceElevated || 'rgba(255, 255, 255, 0.02)',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.borderFaint || 'rgba(255, 255, 255, 0.06)',
      marginTop: 8,
    },
    emptyFaqTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 4,
    },
    emptyFaqSubtitle: {
      fontSize: 11.5,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 16,
    },
  });
