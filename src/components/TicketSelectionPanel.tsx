/**
 * Componente TicketSelectionPanel — LaikaMobil
 * Panel de selección de sección/boleto y control de cantidad.
 * Se renderiza dentro de EventDetailScreen.
 *
 * Responsabilidades:
 *  - Listar secciones disponibles (con precio y tipo)
 *  - Mostrar selección activa con indicador visual
 *  - Control de cantidad (para eventos sin mapa de asientos)
 *  - Resumen de total estimado
 *
 * Sin lógica de negocio ni estado propio: todo se controla desde el padre.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../styles/ThemeProvider';
import { Typography } from './ui/Typography';
import { useStyles } from '../styles/useStyles';

interface Section {
  id: string;
  name: string;
  price: number;
  capacity?: number;
  type?: string;
}

interface TicketSelectionPanelProps {
  sections: Section[];
  selectedSection: Section | null;
  onSelectSection: (section: Section) => void;
  quantity: number;
  onQuantityChange: (qty: number) => void;
  isSeatingMap: boolean;
  fallbackPrice?: number;
}

export const TicketSelectionPanel: React.FC<TicketSelectionPanelProps> = ({
  sections,
  selectedSection,
  onSelectSection,
  quantity,
  onQuantityChange,
  isSeatingMap,
  fallbackPrice = 0,
}) => {
  const styles = useStyles(createStyles);
  const { theme } = useAppTheme();
  // Si no hay secciones explícitas, crear una entrada general por defecto
  const displaySections: Section[] =
    sections && sections.length > 0
      ? sections
      : [{ id: 'general-default', name: 'Entrada General', price: fallbackPrice, type: 'general' }];

  const isFreeEvent = selectedSection?.price === 0;
  const showQuantityControl =
    selectedSection && !isSeatingMap && selectedSection.price > 0;
  const total = selectedSection ? selectedSection.price * quantity : 0;

  return (
    <View style={styles.container}>
      <Typography variant="title" color={theme.colors.text} style={styles.title}>
        Selecciona tu Boleto
      </Typography>

      {/* Lista de secciones */}
      {displaySections.map((section) => {
        const isSelected = selectedSection?.id === section.id;
        const isFree = section.price === 0;

        return (
          <TouchableOpacity
            key={section.id}
            style={[styles.sectionCard, isSelected && styles.sectionCardSelected]}
            onPress={() => onSelectSection(section)}
            activeOpacity={0.8}
          >
            {/* Icono de tipo */}
            <View style={[styles.sectionIconBox, isSelected && styles.sectionIconBoxSelected]}>
              <Feather
                name={isFree ? 'gift' : 'tag'}
                size={16}
                color={isSelected ? theme.colors.primary : theme.colors.textTertiary}
              />
            </View>

            {/* Info */}
            <View style={styles.sectionInfo}>
              <Typography
                variant="subheadline"
                color={theme.colors.text}
                weight={isSelected ? '700' : '500'}
              >
                {section.name}
              </Typography>
              <Typography variant="footnote" color={theme.colors.textSecondary}>
                {isSeatingMap ? 'Selección en mapa' : 'Entrada general'}
              </Typography>
            </View>

            {/* Precio */}
            <View style={styles.priceBox}>
              {isFree ? (
                <View style={styles.freeBadge}>
                  <Typography variant="overline" color={theme.colors.success} style={styles.freeText}>
                    GRATIS
                  </Typography>
                </View>
              ) : (
                <View style={styles.priceStack}>
                  <Typography variant="headline" color={theme.colors.text} style={styles.priceValue}>
                    ${section.price}
                  </Typography>
                  <Typography variant="footnote" color={theme.colors.textSecondary}>
                    c/u
                  </Typography>
                </View>
              )}
            </View>

            {/* Radio indicator */}
            <View style={[styles.radio, isSelected && styles.radioSelected]}>
              {isSelected && (
                <View style={styles.radioDot} />
              )}
            </View>
          </TouchableOpacity>
        );
      })}

      {/* Control de cantidad */}
      {showQuantityControl && (
        <View style={styles.quantityRow}>
          <Typography variant="subheadline" color={theme.colors.text}>
            Cantidad
          </Typography>
          <View style={styles.qtyControls}>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => onQuantityChange(Math.max(1, quantity - 1))}
              activeOpacity={0.7}
            >
              <Feather name="minus" size={16} color={theme.colors.primary} />
            </TouchableOpacity>

            <View style={styles.qtyValueBox}>
              <Typography variant="title" color={theme.colors.text} style={styles.qtyValue}>
                {quantity}
              </Typography>
            </View>

            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => onQuantityChange(Math.min(10, quantity + 1))}
              activeOpacity={0.7}
            >
              <Feather name="plus" size={16} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Total estimado */}
      {showQuantityControl && total > 0 && (
        <View style={styles.totalRow}>
          <View>
            <Typography variant="overline" color={theme.colors.textSecondary}>
              TOTAL ESTIMADO
            </Typography>
            <Typography variant="footnote" color={theme.colors.textTertiary}>
              {quantity} {quantity === 1 ? 'boleto' : 'boletos'}
            </Typography>
          </View>
          <Typography variant="headline" color={theme.colors.primary} style={styles.totalValue}>
            ${total.toFixed(2)}
          </Typography>
        </View>
      )}
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    gap: theme.spacing.s,
  },
  title: {
    marginBottom: theme.spacing.xs,
    fontSize: 18,
  },
  sectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.l,
    borderWidth: 1,
    borderColor: theme.colors.borderFaint,
    gap: theme.spacing.sm,
  },
  sectionCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryFaint,
  },
  sectionIconBox: {
    width: 38,
    height: 38,
    borderRadius: theme.borderRadius.m,
    backgroundColor: theme.colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionIconBoxSelected: {
    backgroundColor: theme.colors.primaryFaint,
  },
  sectionInfo: {
    flex: 1,
    gap: 2,
  },
  priceBox: {
    alignItems: 'flex-end',
  },
  priceStack: {
    alignItems: 'flex-end',
  },
  priceValue: {
    fontSize: 18,
    lineHeight: 22,
  },
  freeBadge: {
    backgroundColor: theme.colors.successFaint,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.s,
    borderWidth: 1,
    borderColor: `${theme.colors.success}44`,
  },
  freeText: {
    letterSpacing: 1,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.borderMedium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: theme.colors.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },
  quantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.l,
    marginTop: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.borderFaint,
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
  },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.m,
    backgroundColor: theme.colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyValueBox: {
    width: 44,
    alignItems: 'center',
  },
  qtyValue: {
    fontSize: 18,
    letterSpacing: -0.5,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.m,
    paddingHorizontal: theme.spacing.l,
    borderRadius: theme.borderRadius.l,
    backgroundColor: theme.colors.primaryFaint,
    borderWidth: 1,
    borderColor: theme.colors.primaryGlow,
    marginTop: theme.spacing.xs,
  },
  totalValue: {
    fontSize: 24,
    letterSpacing: -0.5,
  },
});
