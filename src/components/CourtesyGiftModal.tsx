/**
 * Componente CourtesyGiftModal — LaikaMobil
 * Experiencia WOW de Nivel Tier-1 para usuarios que reciben un boleto de cortesía VIP.
 * Presenta una fase de invitación sellada y una revelación espectacular estilo pase de concierto.
 */

import React, { useState, useEffect, useMemo } from 'react';
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
import { Ticket, normalizeTicket } from '../services/TicketService';
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
  ticket: rawTicket,
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

  const ticket = useMemo(() => {
    if (!rawTicket) return null;
    return normalizeTicket(rawTicket);
  }, [rawTicket]);

  if (!ticket) return null;

  const eventName = ticket.eventName || 'Evento Exclusivo';
  const formattedDate = formatShortDate(ticket.date) || ticket.date || 'Fecha por confirmar';
  const timeStr = ticket.time ? ` · ${ticket.time} hrs` : '';
  const seat = ticket.seatInfo || 'Acceso General';
  const recipient = ticket.recipientType || 'Invitado Especial';
  const motive = ticket.courtesyMotive;
  const venue = ticket.venueName;

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
              {/* Resplandor de Fondo (Aura VIP) */}
              <View style={styles.aura} />
              <View style={styles.auraGold} />

              {/* Botón cerrar flotante con área táctil cómoda */}
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={onClose}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather name="x" size={18} color={theme.colors.textSecondary} />
              </TouchableOpacity>

              {!isRevealed ? (
                /* ── FASE 1: INVITACIÓN VIP SELLADA ── */
                <View style={styles.content}>
                  <View style={styles.vipBadge}>
                    <Feather name="award" size={13} color="#fbbf24" style={{ marginRight: 6 }} />
                    <Typography variant="overline" color="#fbbf24" style={styles.badgeText}>
                      INVITACIÓN VIP EXCLUSIVA
                    </Typography>
                  </View>

                  <View style={styles.giftIconBox}>
                    <View style={styles.giftIconGlow} />
                    <Feather name="gift" size={44} color="#fbbf24" />
                  </View>

                  <Typography variant="title" color={theme.colors.text} style={styles.title} align="center">
                    ¡Tienes un Pase de Cortesía!
                  </Typography>

                  <Typography variant="body" color={theme.colors.textSecondary} style={styles.subtitle} align="center">
                    Se ha emitido una cortesía especial para ti con acceso directo a un evento exclusivo en LAIKA Club.
                  </Typography>

                  <Button
                    variant="primary"
                    size="large"
                    title="Abrir Mi Invitación"
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
                /* ── FASE 2: REVELACIÓN WOW — CREDENCIAL VIP ── */
                <View style={styles.content}>
                  <View style={[styles.vipBadge, styles.confirmedBadge]}>
                    <Feather name="check-circle" size={13} color="#a78bfa" style={{ marginRight: 6 }} />
                    <Typography variant="overline" color="#a78bfa" style={styles.badgeText} numberOfLines={1}>
                      ACCESO VIP CONFIRMADO
                    </Typography>
                  </View>

                  <Typography variant="title" color={theme.colors.text} style={styles.titleReveal} align="center">
                    ¡Estás invitado oficialmente!
                  </Typography>

                  <Typography variant="footnote" color={theme.colors.textSecondary} style={styles.subtitleReveal} align="center">
                    Tu acceso ha sido verificado y vinculado exitosamente a tu cuenta oficial.
                  </Typography>

                  {/* ── TICKET STUB ELEGANTE (PASE DE CORTESÍA) ── */}
                  <View style={styles.ticketStub}>
                    {/* Parte Superior del Pase */}
                    <View style={styles.stubTop}>
                      {/* Fila de Insignias Bento (Anti-colisión garantizada) */}
                      <View style={styles.badgeRow}>
                        <View style={styles.recipientBadge}>
                          <Feather name="star" size={11} color="#fbbf24" style={{ marginRight: 4 }} />
                          <Typography
                            variant="overline"
                            color="#fbbf24"
                            numberOfLines={1}
                            style={styles.badgeOverline}
                          >
                            {recipient.toUpperCase()}
                          </Typography>
                        </View>
                        <View style={styles.courtesyBadge}>
                          <Typography variant="overline" color="#a78bfa" style={styles.badgeOverline}>
                            $0 • CORTESÍA VIP
                          </Typography>
                        </View>
                      </View>

                      {/* Título del Evento */}
                      <Typography variant="headline" color={theme.colors.text} weight="700" style={styles.eventName}>
                        {eventName}
                      </Typography>

                      {/* Recinto si existe */}
                      {venue ? (
                        <View style={styles.venueRow}>
                          <Feather name="map-pin" size={12} color={theme.colors.textSecondary} style={{ marginRight: 4 }} />
                          <Typography variant="caption" color={theme.colors.textSecondary} numberOfLines={1}>
                            {venue}
                          </Typography>
                        </View>
                      ) : null}
                    </View>

                    {/* Línea de Perforación con Muescas Laterales */}
                    <View style={styles.perforationContainer}>
                      <View style={styles.notchLeft} />
                      <View style={styles.perforationDashed} />
                      <View style={styles.notchRight} />
                    </View>

                    {/* Parte Inferior del Pase */}
                    <View style={styles.stubBottom}>
                      <View style={styles.metaGrid}>
                        <View style={styles.metaCell}>
                          <View style={styles.metaLabelRow}>
                            <Feather name="calendar" size={11} color={theme.colors.textTertiary} />
                            <Typography variant="overline" color={theme.colors.textTertiary} style={styles.metaLabel}>
                              FECHA Y HORA
                            </Typography>
                          </View>
                          <Typography variant="caption" color={theme.colors.text} weight="600" numberOfLines={1}>
                            {formattedDate}{timeStr}
                          </Typography>
                        </View>

                        <View style={styles.metaCell}>
                          <View style={styles.metaLabelRow}>
                            <Feather name="compass" size={11} color={theme.colors.textTertiary} />
                            <Typography variant="overline" color={theme.colors.textTertiary} style={styles.metaLabel}>
                              ZONA / ASIENTO
                            </Typography>
                          </View>
                          <Typography variant="caption" color={theme.colors.text} weight="600" numberOfLines={1}>
                            {seat}
                          </Typography>
                        </View>
                      </View>

                      {/* Nota Personal del Organizador */}
                      {motive ? (
                        <View style={styles.motiveBox}>
                          <Feather name="message-square" size={12} color="#a78bfa" style={{ marginRight: 6, marginTop: 1 }} />
                          <Typography variant="caption" color="#ddd6fe" style={styles.motiveText}>
                            Mensaje: &quot;{motive}&quot;
                          </Typography>
                        </View>
                      ) : null}
                    </View>
                  </View>

                  {/* Botón de Acción Principal */}
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
      backgroundColor: 'rgba(5, 5, 8, 0.92)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.m,
    },
    card: {
      width: Math.min(SCREEN_WIDTH - 32, 420),
      backgroundColor: theme.colors.surfaceElevated || '#13111c',
      borderRadius: 24,
      borderWidth: 1,
      borderColor: 'rgba(139, 92, 246, 0.35)',
      padding: theme.spacing.l,
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
      shadowColor: '#8b5cf6',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.25,
      shadowRadius: 24,
      elevation: 12,
    },
    aura: {
      position: 'absolute',
      top: -100,
      width: 260,
      height: 260,
      borderRadius: 130,
      backgroundColor: 'rgba(139, 92, 246, 0.18)',
    },
    auraGold: {
      position: 'absolute',
      top: -60,
      right: -60,
      width: 180,
      height: 180,
      borderRadius: 90,
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
    },
    closeBtn: {
      position: 'absolute',
      top: 14,
      right: 14,
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: theme.colors.surface || 'rgba(255, 255, 255, 0.08)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
      zIndex: 20,
    },
    content: {
      width: '100%',
      alignItems: 'center',
      zIndex: 1,
      paddingTop: 8,
    },
    vipBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(245, 158, 11, 0.12)',
      borderWidth: 1,
      borderColor: 'rgba(245, 158, 11, 0.45)',
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 99,
      marginBottom: theme.spacing.m,
      maxWidth: '75%',
    },
    confirmedBadge: {
      backgroundColor: 'rgba(139, 92, 246, 0.15)',
      borderColor: 'rgba(139, 92, 246, 0.45)',
    },
    badgeText: {
      fontWeight: '800',
      letterSpacing: 0.6,
    },
    giftIconBox: {
      width: 86,
      height: 86,
      borderRadius: 24,
      backgroundColor: 'rgba(139, 92, 246, 0.18)',
      borderWidth: 1.5,
      borderColor: 'rgba(245, 158, 11, 0.35)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.m,
      position: 'relative',
    },
    giftIconGlow: {
      position: 'absolute',
      top: -4,
      left: -4,
      right: -4,
      bottom: -4,
      borderRadius: 28,
      backgroundColor: 'rgba(245, 158, 11, 0.12)',
    },
    title: {
      marginBottom: 8,
      lineHeight: 28,
      fontWeight: '800',
    },
    subtitle: {
      lineHeight: 20,
      marginBottom: theme.spacing.l,
      paddingHorizontal: 8,
    },
    titleReveal: {
      marginBottom: 4,
      lineHeight: 28,
      fontWeight: '800',
    },
    subtitleReveal: {
      lineHeight: 18,
      marginBottom: theme.spacing.m,
      paddingHorizontal: 8,
    },
    openBtn: {
      width: '100%',
      backgroundColor: '#8b5cf6',
      borderRadius: theme.borderRadius.l,
      minHeight: 48,
    },
    dismissBtn: {
      marginTop: theme.spacing.m,
      paddingVertical: 6,
      paddingHorizontal: 16,
    },
    /* ── TICKET STUB LUXURY ── */
    ticketStub: {
      width: '100%',
      backgroundColor: theme.colors.surface || '#191724',
      borderWidth: 1,
      borderColor: 'rgba(139, 92, 246, 0.25)',
      borderRadius: 16,
      marginBottom: theme.spacing.l,
      overflow: 'hidden',
    },
    stubTop: {
      padding: theme.spacing.m,
      paddingBottom: theme.spacing.s,
    },
    badgeRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8,
      width: '100%',
    },
    recipientBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(245, 158, 11, 0.14)',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: 'rgba(245, 158, 11, 0.35)',
      flexShrink: 1,
    },
    courtesyBadge: {
      backgroundColor: 'rgba(139, 92, 246, 0.16)',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: 'rgba(139, 92, 246, 0.35)',
      flexShrink: 0,
    },
    badgeOverline: {
      fontWeight: '800',
      letterSpacing: 0.5,
    },
    eventName: {
      fontSize: 18,
      lineHeight: 24,
      marginBottom: 4,
    },
    venueRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 2,
    },
    /* Perforación */
    perforationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 20,
      position: 'relative',
    },
    notchLeft: {
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: theme.colors.surfaceElevated || '#13111c',
      position: 'absolute',
      left: -9,
    },
    perforationDashed: {
      flex: 1,
      height: 1,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.15)',
      borderStyle: 'dashed',
      marginHorizontal: 16,
    },
    notchRight: {
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: theme.colors.surfaceElevated || '#13111c',
      position: 'absolute',
      right: -9,
    },
    /* Stub Bottom */
    stubBottom: {
      padding: theme.spacing.m,
      paddingTop: theme.spacing.s,
      backgroundColor: 'rgba(0, 0, 0, 0.15)',
    },
    metaGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
    },
    metaCell: {
      flex: 1,
    },
    metaLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginBottom: 3,
    },
    metaLabel: {
      fontWeight: '700',
      letterSpacing: 0.6,
    },
    motiveBox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: 'rgba(139, 92, 246, 0.12)',
      borderWidth: 1,
      borderColor: 'rgba(139, 92, 246, 0.3)',
      borderRadius: 8,
      padding: 8,
      marginTop: 10,
    },
    motiveText: {
      flex: 1,
      lineHeight: 16,
    },
  });
