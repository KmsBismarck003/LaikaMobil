import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Typography } from '../../../components/ui/Typography';
import { useAppTheme } from '../../../styles/ThemeProvider';
import { Feather } from '@expo/vector-icons';
import Animated, { 
  useAnimatedStyle, 
  withTiming, 
  useSharedValue,
  interpolate,
  interpolateColor
} from 'react-native-reanimated';
import type { FAQ } from '../domain/HelpContent';

interface Props {
  faq: FAQ;
}

export const FAQItem: React.FC<Props> = ({ faq }) => {
  const { theme } = useAppTheme();
  const [expanded, setExpanded] = useState(false);
  const progress = useSharedValue(0);

  const toggleExpand = () => {
    setExpanded(!expanded);
    progress.value = withTiming(expanded ? 0 : 1, { duration: 350 });
  };

  const bodyStyle = useAnimatedStyle(() => {
    return {
      opacity: progress.value,
      maxHeight: interpolate(progress.value, [0, 1], [0, 500]),
      marginTop: interpolate(progress.value, [0, 1], [0, theme.spacing.m]),
      transform: [
        { translateY: interpolate(progress.value, [0, 1], [-10, 0]) }
      ]
    };
  });

  const iconStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${interpolate(progress.value, [0, 1], [0, 180])}deg` }
      ]
    };
  });

  return (
    <View style={[
      styles.container, 
      { backgroundColor: theme.colors.surface },
      expanded && { ...theme.shadows.small, borderColor: theme.colors.primaryFaint, borderWidth: 1 }
    ]}>
      <TouchableOpacity 
        style={styles.header} 
        activeOpacity={0.7} 
        onPress={toggleExpand}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={faq.question}
      >
        <View style={styles.questionContainer}>
          <Typography variant="subheadline" color={expanded ? theme.colors.primary : theme.colors.text} style={styles.questionText}>
            {faq.question}
          </Typography>
        </View>
        <Animated.View style={[styles.iconWrapper, expanded ? { backgroundColor: theme.colors.primaryFaint } : { backgroundColor: theme.colors.surfaceHighlight }]}>
          <Animated.View style={iconStyle}>
            <Feather name="chevron-down" size={18} color={expanded ? theme.colors.primary : theme.colors.textSecondary} />
          </Animated.View>
        </Animated.View>
      </TouchableOpacity>
      
      <Animated.View style={[styles.body, bodyStyle]}>
        <View style={[styles.indicator, { backgroundColor: theme.colors.primary }]} />
        <View style={styles.answerContent}>
          <Typography variant="body" color={theme.colors.textSecondary} style={{ lineHeight: 24 }}>
            {faq.answer}
          </Typography>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  questionContainer: {
    flex: 1,
    paddingRight: 16,
  },
  questionText: {
    fontWeight: '600',
    lineHeight: 22,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  indicator: {
    width: 3,
    borderRadius: 1.5,
    marginRight: 12,
    opacity: 0.5,
  },
  answerContent: {
    flex: 1,
  }
});
