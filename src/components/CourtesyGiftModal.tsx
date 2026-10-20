/**
 * Componente CourtesyGiftModal — LaikaMobil
 * Experiencia WOW para usuarios que reciben un boleto de cortesía.
 * Presenta una fase de regalo/invitación sellada y la revelación del evento.
 */

import React, { useState, useEffect } from 'react';
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
import { Button } from './ui/Button';
import { useStyles } from '../styles/useStyles';
import { Ticket } from '../services/TicketService';
import { formatShortDate } from '../styles/designUtils';

interface CourtesyGiftModalProps {
  visible: boolean;
  ticket: Ticket | any | null;
  onClose: () => void;
  onOpenTicket: (ticket: Ticket | any) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const CourtesyGiftModal: React.FC<CourtesyGiftModalProps> = ({
  visible,
  ticket,
  onClose,
  onOpenTicket,
}) => {
  const styles = useStyles(createStyles);
  const { theme } = useAppTheme();
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    if (visible) {
      setIsRevealed(false);
    }
  }, [visible]);

  if (!ticket) return null;

  const eventName = ticket.eventName || ticket.event_name || ticket.event?.name || 'Evento Exclusivo';
  const dateStr = ticket.date || ticket.event_date || ticket.purchase_date;
  const seat = ticket.seatInfo || ticket.section_name || 'Acceso General';
  const recipient = ticket.recipientType || ticket.recipient_type || 'Invitado Especial';
  const motive = ticket.courtesyMotive || ticket.courtesy_motive;

  const handleReveal = () => {
    setIsRevealed(true);
  };

  const handleAccept = () => {
    onOpenTicket(ticket);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.card}>
              {/* Glow Aura */}
              <View style={styles.aura} />

              {/* Botón cerrar */}
              <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
                <Feather name="x" size={16} color={theme.colors.textSecondary} />
              </TouchableOpacity>

              {!isRevealed ? (
                /* ── FASE 1: INVITACIÓN SELLADA / REGALO ── */
                <View style={styles.content}>
                  <View style={styles.vipBadge}>
                    <Feather name="award" size={12} color="#fbbf24" style={{ marginRight: 6 }} />
                    <Typography variant="overline" color="#fbbf24" style={{ fontWeight: '800' }}>
                      INVITACIÓN VIP EXCLUSIVA
                    </Typography>
                  </View>

                  <View style={styles.giftIconBox}>
                    <View style={styles.giftIconGlow} />
                    <Feather name="gift" size={42} color="#fbbf24" />
                  </View>

                  <Typography variant="title" color={theme.colors.text} style={styles.title} align="center">
                    ¡Tienes una sorpresa especial!
                  </Typography>

                  <Typography variant="body" color={theme.colors.textSecondary} style={styles.subtitle} align="center">
                    Has recibido un acceso oficial de cortesía para un evento exclusivo en LAIKA Club.
                  </Typography>

                  <Button
                    variant="primary"
                    size="large"
                    title="Abrir Invitación"
                    onPress={handleReveal}
                    style={styles.openBtn}
                  />

                  <TouchableOpacity style={styles.dismissBtn} onPress={onClose} activeOpacity={0.7}>
                    <Typography variant="footnote" color={theme.colors.textTertiary} weight="600">
                      Ver más tarde
                    </Typography>
                  </TouchableOpacity>
                </View>
              ) : (
                /* ── FASE 2: REVELACIÓN WOW ── */
                <View style={styles.content}>
                  <View style={[styles.vipBadge, styles.confirmedBadge]}>
                    <Feather name="check-circle" size={12} color="#a78bfa" style={{ marginRight: 6 }} />
                    <Typography variant="overline" color="#a78bfa" style={{ fontWeight: '800' }}>
                      ACCESO DE CORTESÍA CONFIRMADO
                    </Typography>
                  </View>

                  <Typography variant="title" color={theme.colors.text} style={[styles.title, { marginTop: 4 }]} align="center">
                    ¡Estás invitado oficialmente!
                  </Typography>

                  <Typography variant="footnote" color={theme.colors.textSecondary} style={{ marginBottom: 16 }} align="center">
                    Tu pase de cortesía ha sido acreditado y vinculado a tu cuenta.
                  </Typography>

                  {/* Tarjeta de Revelación del Evento */}
                  <View style={styles.ticketCard}>
                    <View style={styles.ticketCardTop}>
                      <Typography variant="overline" color="#a78bfa" style={{ fontWeight: '800' }}>
                        {recipient.toUpperCase()}
                      </Typography>
                      <View style={styles.freeBadge}>
                        <Typography variant="overline" color="#fbbf24" style={{ fontWeight: '800' }}>
                          $0 • CORTESÍA
                        </Typography>
                      </View>
                    </View>

                    <Typography variant="headline" color={theme.colors.text} weight="700" style={styles.eventName}>
                      {eventName}
                    </Typography>

                    <View style={styles.metaRow}>
                      <View style={styles.metaItem}>
                        <Feather name="calendar" size={12} color={theme.colors.textSecondary} />
                        <Typography variant="caption" color={theme.colors.textSecondary}>
                          {formatShortDate(dateStr) || dateStr || 'Por confirmar'}
                        </Typography>
                      </View>
                      <View style={styles.metaItem}>
                        <Feather name="map-pin" size={12} color={theme.colors.textSecondary} />
                        <Typography variant="caption" color={theme.colors.textSecondary}>
                          {seat}
                        </Typography>
                      </View>
                    </View>

                    {motive ? (
                      <View style={styles.motiveBox}>
                        <Feather name="message-square" size={12} color="#a78bfa" style={{ marginRight: 6 }} />
                        <Typography variant="caption" color="#c4b5fd" style={{ flex: 1 }}>
                          Nota: &quot;{motive}&quot;
                        </Typography>
                      </View>
                    ) : null}
                  </View>

                  <Button
                    variant="primary"
                    size="large"
                    title="Ver Boleto y Código QR"
                    onPress={handleAccept}
                    style={styles.openBtn}
                  />

                  <TouchableOpacity style={styles.dismissBtn} onPress={onClose} activeOpacity={0.7}>
                    <Typography variant="footnote" color={theme.colors.textTertiary} weight="600">
                      Cerrar y volver a Mis Boletos
                    </Typography>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(5, 5, 8, 0.9)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.l,
    },
    card: {
      width: Math.min(SCREEN_WIDTH - 32, 420),
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.borderRadius.xxl,
      borderWidth: 1,
      borderColor: 'rgba(139, 92, 246, 0.4)',
      padding: theme.spacing.xl,
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
    },
    aura: {
      position: 'absolute',
      top: -80,
      width: 220,
      height: 220,
      borderRadius: 110,
      backgroundColor: 'rgba(139, 92, 246, 0.2)',
    },
    closeBtn: {
      position: 'absolute',
      top: theme.spacing.m,
      right: theme.spacing.m,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
    },
    content: {
      width: '100%',
      alignItems: 'center',
      zIndex: 1,
    },
    vipBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(245, 158, 11, 0.12)',
      borderWidth: 1,
      borderColor: 'rgba(245, 158, 11, 0.4)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 99,
      marginBottom: theme.spacing.l,
    },
    confirmedBadge: {
      backgroundColor: 'rgba(139, 92, 246, 0.15)',
      borderColor: 'rgba(139, 92, 246, 0.5)',
    },
    giftIconBox: {
      width: 88,
      height: 88,
      borderRadius: 24,
      backgroundColor: 'rgba(139, 92, 246, 0.2)',
      borderWidth: 1,
      borderColor: 'rgba(245, 158, 11, 0.3)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.l,
      position: 'relative',
    },
    giftIconGlow: {
      position: 'absolute',
      inset: -4,
      borderRadius: 28,
      backgroundColor: 'rgba(245, 158, 11, 0.15)',
    },
    title: {
      marginBottom: 8,
      lineHeight: 28,
    },
    subtitle: {
      lineHeight: 20,
      marginBottom: theme.spacing.xl,
    },
    openBtn: {
      width: '100%',
      backgroundColor: '#8b5cf6',
      borderRadius: theme.borderRadius.l,
    },
    dismissBtn: {
      marginTop: theme.spacing.m,
      paddingVertical: 4,
    },
    ticketCard: {
      width: '100%',
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: theme.borderRadius.l,
      padding: theme.spacing.m,
      marginBottom: theme.spacing.l,
    },
    ticketCardTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    freeBadge: {
      backgroundColor: 'rgba(245, 158, 11, 0.15)',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    eventName: {
      marginBottom: 10,
    },
    metaRow: {
      flexDirection: 'row',
      gap: 16,
      marginBottom: 8,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    motiveBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(139, 92, 246, 0.1)',
      borderWidth: 1,
      borderColor: 'rgba(139, 92, 246, 0.3)',
      borderRadius: 8,
      padding: 8,
      marginTop: 6,
    },
  });
