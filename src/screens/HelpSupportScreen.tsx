import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography } from '../components/ui/Typography';
import { useAppTheme } from '../styles/ThemeProvider';
import { Feather } from '@expo/vector-icons';
import { helpCategories, FAQCategory, FeedbackSection } from '../funciones/ayuda-soporte';
import { LinearGradient } from 'expo-linear-gradient';

export const HelpSupportScreen: React.FC = () => {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const filteredCategories = helpCategories.map(cat => {
    const filteredFaqs = cat.faqs.filter(faq => 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return {
      ...cat,
      faqs: filteredFaqs
    };
  }).filter(cat => cat.faqs.length > 0 || cat.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
      >
        <LinearGradient
          colors={[theme.colors.primaryFaint, theme.colors.background]}
          style={styles.headerGradient}
        />
        
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
            ¿En qué podemos{'\n'}ayudarte?
          </Typography>
        </View>

        <View style={[
          styles.searchContainer, 
          { backgroundColor: theme.colors.surface, ...theme.shadows.small },
          isSearchFocused && { borderColor: theme.colors.primary, borderWidth: 1 }
        ]}>
          <Feather name="search" size={20} color={isSearchFocused ? theme.colors.primary : theme.colors.textTertiary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Escribe tu duda aquí..."
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

        <View style={styles.categoriesContainer}>
          {filteredCategories.length > 0 ? (
            filteredCategories.map(category => (
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
                No encontramos respuestas para "{searchQuery}". Intenta con otras palabras o contacta a soporte.
              </Typography>
            </View>
          )}
        </View>

        <FeedbackSection />
        
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
    marginBottom: 32,
  },
  heroIconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    padding: 6,
    marginBottom: 24,
  },
  heroIconInner: {
    flex: 1,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainTitle: {
    marginBottom: 8,
    lineHeight: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 20,
    height: 60,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
    fontWeight: '500',
  },
  categoriesContainer: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
