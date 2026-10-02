import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAccessibility } from '../useAccessibility';
import { useAppTheme } from '../../../styles/ThemeProvider';
import { Typography } from '../../../components/ui/Typography';
import { useStyles } from '../../../styles/useStyles';

export const AccessibilitySettingsView: React.FC = () => {
  const styles = useStyles(createStyles);
  const { theme } = useAppTheme();
  const { textScale, reduceMotion, setTextScale, setReduceMotion } = useAccessibility();
  const insets = useSafeAreaInsets();

  const handleTextScaleChange = (increment: boolean) => {
    if (increment && textScale < 1.5) {
      setTextScale(Number((textScale + 0.1).toFixed(1)));
    } else if (!increment && textScale > 0.8) {
      setTextScale(Number((textScale - 0.1).toFixed(1)));
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Tamaño de texto */}
        <View style={styles.section}>
          <Typography variant="overline" color={theme.colors.textSecondary} style={styles.sectionTitle}>
            VISIBILIDAD
          </Typography>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={[styles.iconBox, { backgroundColor: theme.colors.surfaceHighlight }]}>
                <Feather name="type" size={18} color={theme.colors.textTertiary} />
              </View>
              <View style={{ flex: 1 }}>
                <Typography variant="subheadline" color={theme.colors.text}>
                  Tamaño del texto
                </Typography>
                <Typography variant="footnote" color={theme.colors.textSecondary}>
                  Escala actual: {textScale}x
                </Typography>
              </View>
              
              <View style={styles.stepper}>
                <TouchableOpacity 
                  style={[styles.stepperBtn, textScale <= 0.8 && styles.stepperBtnDisabled]}
                  onPress={() => handleTextScaleChange(false)}
                  disabled={textScale <= 0.8}
                >
                  <Feather name="minus" size={16} color={textScale <= 0.8 ? theme.colors.textSecondary : theme.colors.text} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.stepperBtn, textScale >= 1.5 && styles.stepperBtnDisabled]}
                  onPress={() => handleTextScaleChange(true)}
                  disabled={textScale >= 1.5}
                >
                  <Feather name="plus" size={16} color={textScale >= 1.5 ? theme.colors.textSecondary : theme.colors.text} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Movimiento */}
        <View style={styles.section}>
          <Typography variant="overline" color={theme.colors.textSecondary} style={styles.sectionTitle}>
            MOVIMIENTO
          </Typography>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={[styles.iconBox, { backgroundColor: theme.colors.surfaceHighlight }]}>
                <Feather name="wind" size={18} color={theme.colors.textTertiary} />
              </View>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Typography variant="subheadline" color={theme.colors.text}>
                  Reducir animaciones
                </Typography>
                <Typography variant="footnote" color={theme.colors.textSecondary}>
                  Desactiva transiciones en la interfaz para una experiencia más estática y cómoda.
                </Typography>
              </View>
              <Switch 
                value={reduceMotion}
                onValueChange={setReduceMotion}
                trackColor={{ false: theme.colors.borderStrong, true: theme.colors.success }}
                thumbColor={theme.colors.white}
              />
            </View>
          </View>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.m,
    gap: theme.spacing.m,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.m,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepper: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceHighlight,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  stepperBtn: {
    padding: theme.spacing.s,
    paddingHorizontal: theme.spacing.m,
  },
  stepperBtnDisabled: {
    opacity: 0.5,
  },
});
