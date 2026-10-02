import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAppTheme } from '../styles/ThemeProvider';
import { useStyles } from '../styles/useStyles';

interface FilterBarProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  date: string;
  onSetDate: (date: string) => void;
  location: string;
  onSetLocation: (location: string) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ 
  categories, 
  selectedCategory, 
  onSelectCategory,
  date,
  onSetDate,
  location,
  onSetLocation
}) => {
  const styles = useStyles(createStyles);
  const { theme } = useAppTheme();
  const [showDatePicker, setShowDatePicker] = useState(false);

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const yyyy = selectedDate.getFullYear();
      const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const dd = String(selectedDate.getDate()).padStart(2, '0');
      onSetDate(`${yyyy}-${mm}-${dd}`);
    }
  };

  const clearDate = () => {
    onSetDate('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Explorar Eventos</Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollContainer}>
        {categories.map((cat) => (
          <TouchableOpacity 
            key={cat} 
            style={[
              styles.pill, 
              selectedCategory === cat && styles.pillSelected
            ]}
            onPress={() => onSelectCategory(cat)}
          >
            <Text style={[
              styles.pillText,
              selectedCategory === cat && styles.pillTextSelected
            ]}>
              {cat === '' ? 'Todos' : cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.inputsRow}>
        <TouchableOpacity 
          style={styles.dateButton} 
          onPress={() => setShowDatePicker(true)}
          onLongPress={clearDate}
        >
          <Text style={date ? styles.dateTextSelected : styles.dateText}>
            {date ? date : 'Seleccionar Fecha'}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={date ? new Date(`${date}T12:00:00`) : new Date()}
            mode="date"
            display="default"
            onChange={onChangeDate}
          />
        )}

        <TextInput 
          style={styles.input}
          placeholder="Buscar Estado o Municipio..."
          placeholderTextColor={theme.colors.textSecondary}
          value={location}
          onChangeText={onSetLocation}
        />
      </View>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    paddingVertical: theme.spacing.m,
  },
  headerTitle: {
    ...theme.typography.header,
    paddingHorizontal: theme.spacing.m,
    marginBottom: theme.spacing.s,
  },
  scrollContainer: {
    paddingHorizontal: theme.spacing.m,
    marginBottom: theme.spacing.m,
  },
  inputsRow: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.m,
    gap: theme.spacing.s,
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.cardBackground,
    color: theme.colors.text,
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    borderRadius: theme.borderRadius.s,
    borderWidth: 1,
    borderColor: theme.colors.border,
    fontSize: 14,
  },
  pill: {
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
    marginRight: theme.spacing.s,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  pillSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  pillText: {
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  pillTextSelected: {
    color: theme.colors.white,
  },
  dateButton: {
    flex: 1,
    backgroundColor: theme.colors.cardBackground,
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    borderRadius: theme.borderRadius.s,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
  },
  dateText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  dateTextSelected: {
    color: theme.colors.text,
    fontSize: 14,
  }
});
