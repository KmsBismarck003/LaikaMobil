import React from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HeaderBrandRowProps {
  onUserPress: () => void;
  userName?: string;
  onLayout?: (height: number) => void;
}

interface FloatingSearchBarProps {
  query: string;
  onQueryChange: (q: string) => void;
  locationLabel: string;
  onLocationPress: () => void;
  dateLabel: string;
  onDatePress: () => void;
}

/**
 * Fila de marca (cuadro negro): hace scroll con la lista y se va hacia arriba.
 */
export const HeaderBrandRow: React.FC<HeaderBrandRowProps> = ({
  onUserPress,
  userName,
  onLayout,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.brandContainer, { paddingTop: Math.max(insets.top, 12) }]}
      onLayout={(e) => onLayout?.(e.nativeEvent.layout.height)}
    >
      <View style={styles.brandCenter}>
        <Image
          source={require('../../../assets/logo-claro.png')}
          style={styles.logoBig}
          resizeMode="contain"
        />
        <TouchableOpacity
          onPress={onUserPress}
          style={styles.userBtnRight}
          accessibilityLabel="Mi cuenta"
        >
          <Feather name="user" size={12} color="#FFFFFF" />
          <Text style={styles.userLabelSmall} numberOfLines={1}>
            {userName ? userName.toUpperCase().slice(0, 8) : 'Ingresa'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

/**
 * Barra de búsqueda flotante: vive fuera del scroll, siempre visible.
 */
export const FloatingSearchBar: React.FC<FloatingSearchBarProps> = ({
  query,
  onQueryChange,
  locationLabel,
  onLocationPress,
  dateLabel,
  onDatePress,
}) => {
  return (
    <View style={styles.searchBlock}>
      {/* UBICACIÓN */}
      <TouchableOpacity style={styles.searchSection} onPress={onLocationPress}>
        <Feather name="map-pin" size={15} color="#1C1C1E" />
        <View style={styles.sectionContent}>
          <Text style={styles.label}>UBICACIÓN</Text>
          <Text style={styles.value} numberOfLines={1}>
            {locationLabel || 'Todo México'}
          </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.divider} />

      {/* FECHAS */}
      <TouchableOpacity style={styles.searchSection} onPress={onDatePress}>
        <Feather name="calendar" size={15} color="#1C1C1E" />
        <View style={styles.sectionContent}>
          <Text style={styles.label}>FECHAS</Text>
          <Text style={styles.value} numberOfLines={1}>
            {dateLabel || 'Todas las fechas'}
          </Text>
        </View>
        <Feather name="chevron-down" size={13} color="#636366" />
      </TouchableOpacity>

      <View style={styles.divider} />

      {/* BUSCAR */}
      <View style={styles.searchInput}>
        <Feather name="search" size={15} color="#1C1C1E" />
        <View style={styles.sectionContent}>
          <Text style={styles.label}>BUSCAR</Text>
          <TextInput
            placeholder="Artista, evento o inmueble"
            placeholderTextColor="#8E8E93"
            value={query}
            onChangeText={onQueryChange}
            returnKeyType="search"
            onSubmitEditing={() => Keyboard.dismiss()}
            style={styles.input}
          />
        </View>
      </View>

      <TouchableOpacity
        style={styles.submitBtn}
        onPress={() => Keyboard.dismiss()}
        accessibilityLabel="Buscar"
      >
        <Text style={styles.submitText}>BUSCAR</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  brandContainer: {
    backgroundColor: 'rgba(13,13,15,0.95)',
    paddingHorizontal: 12,
    paddingBottom: 4,
  },
  brandCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoBig: {
    height: 56,
    width: 210,
  },
  userBtnRight: {
    position: 'absolute',
    right: 0,
    top: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 28,
    paddingHorizontal: 11,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    gap: 5,
  },
  userLabelSmall: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  userLabel: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  searchBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 9,
    paddingLeft: 9,
    paddingRight: 5,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  searchSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  searchInput: {
    flex: 1.3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionContent: {
    flex: 1,
  },
  label: {
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 0.7,
    color: '#636366',
  },
  value: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  input: {
    fontSize: 11,
    fontWeight: '500',
    color: '#1C1C1E',
    paddingVertical: 1,
  },
  divider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: '#E5E5EA',
    marginHorizontal: 8,
  },
  submitBtn: {
    backgroundColor: '#0D0D0F',
    borderRadius: 6,
    paddingHorizontal: 11,
    paddingVertical: 8,
    marginLeft: 5,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
