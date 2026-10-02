/**
 * Pantalla EventsScreen — LaikaMobil
 * Pantalla principal de exploración de eventos.
 * Estructura:
 *  - GlassSearchBar flotante sobre el HeroCarousel
 *  - HeroCarousel de eventos destacados
 *  - CategoryTabs de filtros
 *  - Listado de EventCards
 */

import React from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useEvents } from '../hooks/useEvents';
import { EventCard } from '../components/EventCard';
import { useAppTheme } from '../styles/ThemeProvider';
import { HeroCarousel } from '../components/ui/HeroCarousel';
import { GlassSearchBar } from '../components/ui/GlassSearchBar';
import { CategoryTabs } from '../components/ui/CategoryTabs';
import { Typography } from '../components/ui/Typography';
import { Button } from '../components/ui/Button';
import { useStyles } from '../styles/useStyles';

const CATEGORIES = [
  { id: '',         label: 'Destacados' },
  { id: 'concert',  label: 'Música' },
  { id: 'sport',    label: 'Deportes' },
  { id: 'theater',  label: 'Teatro' },
  { id: 'festival', label: 'Festivales' },
];

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'EventDetail'>;

export const EventsScreen: React.FC = () => {
  const { theme } = useAppTheme();
  const navigation = useNavigation<NavigationProp>();
  const styles = useStyles(createStyles);
  const {
    events,
    loading,
    error,
    category,
    setCategory,
    date,
    setDate,
    location,
    setLocation,
    availableLocations,
    refetch,
  } = useEvents();

  const [isSearchVisible, setIsSearchVisible] = React.useState(false);
  const [tempLocation, setTempLocation] = React.useState(location);
  const [tempDate, setTempDate] = React.useState(date);
  const [showDatePicker, setShowDatePicker] = React.useState(false);

  const handleDateChange = (...args: any[]) => {
    setShowDatePicker(false);
    const dateToUse = args.find(a => a instanceof Date) || (args[1] instanceof Date ? args[1] : null);
    if (dateToUse) {
      const yyyy = dateToUse.getFullYear();
      const mm = String(dateToUse.getMonth() + 1).padStart(2, '0');
      const dd = String(dateToUse.getDate()).padStart(2, '0');
      setTempDate(`${yyyy}-${mm}-${dd}`);
    }
  };

  const handleEventPress = (eventId: string, eventTitle: string) => {
    navigation.navigate('EventDetail', { eventId, eventTitle });
  };

  // Estado de error sin datos
  if (error && events.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Typography variant="title" color={theme.colors.error} style={styles.errorTitle}>
          Ocurrió un problema
        </Typography>
        <Typography variant="body" align="center" style={styles.errorBody}>
          {error}
        </Typography>
      </View>
    );
  }

  // Estado de carga inicial
  if (loading && events.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={
          <>
            <View style={{ position: 'relative' }}>
              <HeroCarousel
                events={events.slice(0, 5)}
                onPressEvent={(event) =>
                  handleEventPress(event.id, event.title)
                }
                onPressExplore={() => console.log('Explore All')}
              />
              <GlassSearchBar
                date={date}
                location={location}
                onSearchPress={() => setIsSearchVisible(true)}
              />
            </View>

            <CategoryTabs
              categories={CATEGORIES}
              selectedId={category}
              onSelect={setCategory}
            />

            <View style={styles.listHeader}>
              <Typography
                variant="overline"
                color={theme.colors.text}
                weight="700"
                style={styles.listTitle}
              >
                {category
                  ? CATEGORIES.find((c) => c.id === category)?.label ?? 'Eventos'
                  : 'Todos los eventos'}
              </Typography>
              <View style={styles.countBadge}>
                <Typography variant="overline" color={theme.colors.textSecondary}>
                  {events.length}
                </Typography>
              </View>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <EventCard
            event={item}
            onPress={() => handleEventPress(item.id, item.title)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refetch}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Typography
              variant="body"
              color={theme.colors.textSecondary}
              align="center"
            >
              No hay eventos disponibles en esta categoría.
            </Typography>
          </View>
        }
      />

      {/* Modal simple de búsqueda */}
      <Modal
        visible={isSearchVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setIsSearchVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Typography variant="title" color={theme.colors.text}>
                Filtrar Eventos
              </Typography>
              <TouchableOpacity onPress={() => setIsSearchVisible(false)}>
                <Typography variant="body" color={theme.colors.textSecondary}>Cerrar</Typography>
              </TouchableOpacity>
            </View>

            <Typography variant="subheadline" color={theme.colors.textSecondary} style={{ marginBottom: 8 }}>
              Ubicación
            </Typography>
            <View style={styles.dropdownContainer}>
              <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                <TouchableOpacity
                  style={[styles.dropdownRow, !tempLocation && styles.dropdownRowActive]}
                  onPress={() => setTempLocation('')}
                >
                  <Typography variant="footnote" color={!tempLocation ? theme.colors.primary : theme.colors.text}>
                    Cualquier ubicación
                  </Typography>
                  {!tempLocation && <Feather name="check" size={16} color={theme.colors.primary} />}
                </TouchableOpacity>

                {availableLocations.map((loc) => (
                  <TouchableOpacity
                    key={loc}
                    style={[styles.dropdownRow, tempLocation === loc && styles.dropdownRowActive]}
                    onPress={() => setTempLocation(loc)}
                  >
                    <Typography variant="footnote" color={tempLocation === loc ? theme.colors.primary : theme.colors.text}>
                      {loc}
                    </Typography>
                    {tempLocation === loc && <Feather name="check" size={16} color={theme.colors.primary} />}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <Typography variant="subheadline" color={theme.colors.textSecondary} style={{ marginBottom: 8 }}>
              Fecha
            </Typography>
            <TouchableOpacity 
              style={styles.input}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.8}
            >
              <Typography variant="body" color={tempDate ? theme.colors.text : theme.colors.textTertiary}>
                {tempDate || 'Cualquier fecha'}
              </Typography>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={tempDate ? new Date(tempDate + 'T12:00:00Z') : new Date()}
                mode="date"
                display="default"
                onValueChange={handleDateChange}
                onDismiss={() => setShowDatePicker(false)}
                onChange={(event: any, date?: Date) => {
                  // Fallback para Android si onValueChange no funciona en versiones viejas
                  if (event.type === 'set' || event.type === 'dismissed') {
                     if (event.type === 'set') handleDateChange(date);
                     else setShowDatePicker(false);
                  }
                }}
              />
            )}

            <View style={styles.modalActions}>
              <Button
                title="Limpiar"
                variant="outline"
                size="medium"
                onPress={() => {
                  setTempLocation('');
                  setTempDate('');
                  setLocation('');
                  setDate('');
                  setIsSearchVisible(false);
                }}
                style={{ flex: 1 }}
              />
              <Button
                title="Aplicar"
                variant="primary"
                size="medium"
                onPress={() => {
                  setLocation(tempLocation);
                  setDate(tempDate);
                  setIsSearchVisible(false);
                }}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.xl,
  },
  errorTitle: {
    marginBottom: theme.spacing.s,
  },
  errorBody: {
    lineHeight: 22,
  },
  listContent: {
    paddingHorizontal: theme.spacing.m,
    paddingBottom: 100, // Extra padding for the floating tab bar
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.xs,
  },
  listTitle: {
    letterSpacing: 1.5,
  },
  countBadge: {
    backgroundColor: theme.colors.surfaceHighlight,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xxs + 1,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.borderFaint,
  },
  emptyContainer: {
    paddingVertical: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.xl,
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  modalContent: {
    backgroundColor: theme.colors.surfaceElevated,
    padding: theme.spacing.l,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.borderFaint,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  input: {
    backgroundColor: theme.colors.surfaceHighlight,
    color: theme.colors.text,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.l,
  },
  modalActions: {
    flexDirection: 'row',
    gap: theme.spacing.m,
  },
  dropdownContainer: {
    backgroundColor: theme.colors.surfaceHighlight,
    borderRadius: theme.borderRadius.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.l,
    maxHeight: 180,
    overflow: 'hidden',
  },
  dropdownScroll: {
    paddingVertical: theme.spacing.xs,
  },
  dropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.m,
  },
  dropdownRowActive: {
    backgroundColor: 'rgba(124, 92, 252, 0.15)',
  },
});
