/**
 * Componente TicketActionModal — LaikaMobil
 * Modal de acciones rápidas para un boleto seleccionado.
 * Aparece como bottom sheet animado desde la parte inferior.
 */

import React from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../styles/ThemeProvider';
import { Typography } from './ui/Typography';
import { useStyles } from '../styles/useStyles';

interface TicketActionModalProps {
  visible: boolean;
  onClose: () => void;
  onViewItinerary: () => void;
  onViewTicket: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const TicketActionModal: React.FC<TicketActionModalProps> = ({
  visible,
  onClose,
  onViewItinerary,
  onViewTicket,
}) => {
  const styles = useStyles(createStyles);
  const { theme } = useAppTheme();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheet}>
              {/* Handle bar */}
              <View style={styles.handle} />

              {/* Cabecera */}
              <View style={styles.header}>
                <Typography variant="title" color={theme.colors.text}>
                  Opciones del Boleto
                </Typography>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <Feather name="x" size={18} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Acciones */}
              <View style={styles.actions}>
                {/* Itinerario (próximamente) */}
                <TouchableOpacity
                  style={[styles.actionItem, styles.actionItemDisabled]}
                  onPress={onViewItinerary}
                  activeOpacity={0.6}
                >
                  <View style={[styles.actionIcon, styles.actionIconDisabled]}>
                    <Feather name="map" size={18} color={theme.colors.textTertiary} />
                  </View>
                  <View style={styles.actionText}>
                    <Typography variant="subheadline" color={theme.colors.textSecondary}>
                      Ver itinerario
                    </Typography>
                    <Typography variant="footnote" color={theme.colors.textTertiary}>
                      Próximamente disponible
                    </Typography>
                  </View>
                  <View style={styles.comingSoonBadge}>
                    <Typography variant="overline" color={theme.colors.textTertiary} style={styles.comingSoonText}>
                      PRONTO
                    </Typography>
                  </View>
                </TouchableOpacity>

                {/* Ver boleto */}
                <TouchableOpacity
                  style={styles.actionItem}
                  onPress={onViewTicket}
                  activeOpacity={0.8}
                >
                  <View style={styles.actionIcon}>
                    <Feather name="grid" size={18} color={theme.colors.primary} />
                  </View>
                  <View style={styles.actionText}>
                    <Typography variant="subheadline" color={theme.colors.text} weight="600">
                      Ver boleto
                    </Typography>
                    <Typography variant="footnote" color={theme.colors.textSecondary}>
                      Mostrar código QR y detalles
                    </Typography>
                  </View>
                  <Feather name="chevron-right" size={18} color={theme.colors.textTertiary} />
                </TouchableOpacity>
              </View>

              {/* Cancelar */}
              <TouchableOpacity style={styles.cancelButton} onPress={onClose} activeOpacity={0.75}>
                <Typography variant="subheadline" color={theme.colors.textSecondary} weight="600">
                  Cancelar
                </Typography>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.overlayDark,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.colors.surfaceElevated,
    borderTopLeftRadius: theme.borderRadius.xxl,
    borderTopRightRadius: theme.borderRadius.xxl,
    paddingBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.borderFaint,
    borderBottomWidth: 0,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.borderMedium,
    alignSelf: 'center',
    marginTop: theme.spacing.m,
    marginBottom: theme.spacing.s,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.m,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: theme.colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: theme.colors.borderFaint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    paddingHorizontal: theme.spacing.l,
    gap: theme.spacing.s,
    marginBottom: theme.spacing.m,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.m,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.l,
    borderWidth: 1,
    borderColor: theme.colors.borderFaint,
  },
  actionItemDisabled: {
    opacity: 0.6,
  },
  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: theme.borderRadius.m,
    backgroundColor: theme.colors.primaryFaint,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primaryGlow,
  },
  actionIconDisabled: {
    backgroundColor: theme.colors.surfaceHighlight,
    borderColor: theme.colors.borderFaint,
  },
  actionText: {
    flex: 1,
    gap: 2,
  },
  comingSoonBadge: {
    backgroundColor: theme.colors.surfaceHighlight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.borderFaint,
  },
  comingSoonText: {
    fontSize: 8,
    letterSpacing: 0.5,
  },
  cancelButton: {
    marginHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.m,
    borderRadius: theme.borderRadius.l,
    backgroundColor: theme.colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: theme.colors.borderFaint,
    alignItems: 'center',
  },
});
