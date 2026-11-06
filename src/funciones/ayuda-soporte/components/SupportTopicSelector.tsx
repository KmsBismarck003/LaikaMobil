/**
 * SupportTopicSelector — LaikaMobil
 * Componente UI Atómico: Selector rápido de temas para enfocar la consulta por correo.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../../../styles/ThemeProvider';
import { useStyles } from '../../../styles/useStyles';

export interface TopicOption {
  id: string;
  label: string;
  icon: keyof typeof Feather.glyphMap;
  categoryKeyword: string;
}

export const SUPPORT_TOPICS: TopicOption[] = [
  { id: 'boletos', label: 'Boletos y Acceso', icon: 'tag', categoryKeyword: 'boletos' },
  { id: 'pagos', label: 'Pagos y Compras', icon: 'credit-card', categoryKeyword: 'compras' },
  { id: 'cuenta', label: 'Mi Cuenta y Perfil', icon: 'user', categoryKeyword: 'cuenta' },
  { id: 'tecnico', label: 'Problema Técnico', icon: 'alert-circle', categoryKeyword: 'primeros' },
];

interface SupportTopicSelectorProps {
  selectedTopicId: string;
  onSelectTopic: (topic: TopicOption) => void;
}

export const SupportTopicSelector: React.FC<SupportTopicSelectorProps> = ({
  selectedTopicId,
  onSelectTopic,
}) => {
  const styles = useStyles(createStyles);
  const { theme } = useAppTheme();

  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>SELECCIONA EL MOTIVO DE TU DUDA</Text>
      <View style={styles.grid}>
        {SUPPORT_TOPICS.map((topic) => {
          const isSelected = selectedTopicId === topic.id;
          return (
            <TouchableOpacity
              key={topic.id}
              style={[styles.topicButton, isSelected && styles.topicButtonActive]}
              onPress={() => onSelectTopic(topic)}
              activeOpacity={0.75}
            >
              <Feather
                name={topic.icon}
                size={16}
                color={isSelected ? theme.colors.text : theme.colors.textSecondary}
                style={{ marginRight: 8 }}
              />
              <Text
                style={[
                  styles.topicLabel,
                  isSelected ? styles.topicLabelActive : styles.topicLabelInactive,
                ]}
                numberOfLines={1}
              >
                {topic.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      marginBottom: 16,
    },
    sectionLabel: {
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 0.8,
      color: theme.colors.textTertiary,
      marginBottom: 8,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    topicButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceElevated || 'rgba(255, 255, 255, 0.03)',
      borderWidth: 1,
      borderColor: theme.colors.borderFaint || 'rgba(255, 255, 255, 0.06)',
      paddingVertical: 9,
      paddingHorizontal: 12,
      borderRadius: 12,
      width: '48.5%',
    },
    topicButtonActive: {
      backgroundColor: theme.colors.surfaceHighlight || theme.colors.surface,
      borderColor: theme.colors.borderMedium || 'rgba(255, 255, 255, 0.16)',
    },
    topicLabel: {
      fontSize: 11.5,
      fontWeight: '600',
    },
    topicLabelActive: {
      color: theme.colors.text,
      fontWeight: '700',
    },
    topicLabelInactive: {
      color: theme.colors.textSecondary,
    },
  });

