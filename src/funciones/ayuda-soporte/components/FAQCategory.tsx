import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '../../../components/ui/Typography';
import { useAppTheme } from '../../../styles/ThemeProvider';
import { Feather } from '@expo/vector-icons';
import { FAQItem } from './FAQItem';
import type { FAQCategory as FAQCategoryType } from '../domain/HelpContent';

interface Props {
  category: FAQCategoryType;
}

export const FAQCategory: React.FC<Props> = ({ category }) => {
  const { theme } = useAppTheme();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.indicator, { backgroundColor: theme.colors.primary }]} />
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceHighlight }]}>
          <Feather name={category.icon as any} size={16} color={theme.colors.textSecondary} />
        </View>
        <Typography variant="headline" color={theme.colors.text} style={styles.title}>
          {category.title}
        </Typography>
      </View>

      <View style={styles.list}>
        {category.faqs.map((faq) => (
          <FAQItem key={faq.id} faq={faq} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  indicator: {
    width: 4,
    height: 24,
    borderRadius: 2,
    marginRight: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  title: {
    flex: 1,
    letterSpacing: -0.3,
  },
  list: {
    flexDirection: 'column',
  }
});
