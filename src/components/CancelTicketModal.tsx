/**
 * Componente CancelTicketModal — LaikaMobil
 * Modal interactivo para cotización, verificación de políticas y confirmación
 * de cancelación y reembolso de boletos (Cumple Criterios 1, 2, 3, 4, 5, 7).
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../styles/ThemeProvider';
import { Typography } from './ui/Typography';
import { Button } from './ui/Button';
import { useStyles } from '../styles/useStyles';
import {
  CancellationService,
  CancellationQuote,
  CancellationDetail,
} from '../services/CancellationService';
import { Ticket } from '../services/TicketService';

interface CancelTicketModalProps {
  visible: boolean;
  ticket: Ticket | null;
  onClose: () => void;
  onSuccess: (detail: CancellationDetail) => void;
}

export const CancelTicketModal: React.FC<CancelTicketModalProps> = ({
  visible,
  ticket,
  onClose,
  onSuccess,
}) => {
  const styles = useStyles(createStyles);
  const { theme } = useAppTheme();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [quote, setQuote] = useState<CancellationQuote | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [result, setResult] = useState<CancellationDetail | null>(null);

  useEffect(() => {
    if (!visible || !ticket) {
      setQuote(null);
      setErrorMsg(null);
      setReason('');
      setResult(null);
      setLoading(true);
      return;
    }

    let isMounted = true;
    const fetchQuote = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const data = await CancellationService.getQuote(ticket.id);
        if (isMounted) {
          setQuote(data);
        }
      } catch (err: any) {
        if (isMounted) {
          setErrorMsg(err.message || 'Error al validar las condiciones del evento');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchQuote();

    return () => {
      isMounted = false;
    };
  }, [visible, ticket]);

  const handleConfirmCancellation = async () => {
    if (!ticket) return;
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await CancellationService.requestCancellation(ticket.id, reason);
      setResult(res);
      onSuccess(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'No se pudo procesar la cancelación');
    } finally {
      setSubmitting(false);
    }
  };

  if (!visible) return null;

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
              {/* Handle superior */}
              <View style={styles.handle} />

              {/* Cabecera */}
              <View style={styles.header}>
                <View style={styles.headerTitleBox}>
                  <View style={styles.headerIconBadge}>
                    <Feather name="rotate-ccw" size={18} color={theme.colors.error} />
                  </View>
                  <Typography variant="title" color={theme.colors.text}>
                    Cancelar Boleto
                  </Typography>
                </View>
                <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
                  <Feather name="x" size={18} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.contentScroll}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
              >
                {/* 1. Estado Cargando */}
                {loading && (
                  <View style={styles.centeredState}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Typography
                      variant="body"
                      color={theme.colors.textSecondary}
                      align="center"
                      style={{ marginTop: 16 }}
                    >
                      Verificando políticas de cancelación y condiciones del evento...
                    </Typography>
                  </View>
                )}

                {/* 2. Estado Éxito */}
                {!loading && result && (
                  <View style={styles.centeredState}>
                    <View style={styles.successIconBadge}>
                      <Feather name="check" size={32} color={theme.colors.success} />
                    </View>
                    <Typography variant="title" color={theme.colors.text} align="center" style={{ marginTop: 16 }}>
                      Cancelación Procesada
                    </Typography>
                    <Typography
                      variant="body"
                      color={theme.colors.textSecondary}
                      align="center"
                      style={{ marginTop: 8, marginHorizontal: 16 }}
                    >
                      {result.message}
                    </Typography>

                    <View style={styles.summaryCard}>
                      <View style={styles.summaryRow}>
                        <Typography variant="caption" color={theme.colors.textSecondary}>
                          Estado:
                        </Typography>
                        <Typography variant="caption" weight="700" color={theme.colors.success}>
                          {result.statusLabel}
                        </Typography>
                      </View>
                      <View style={styles.summaryRow}>
                        <Typography variant="caption" color={theme.colors.textSecondary}>
                          Importe Reembolsado:
                        </Typography>
                        <Typography variant="caption" weight="700" color={theme.colors.text}>
                          ${result.refundAmount.toFixed(2)} MXN
                        </Typography>
                      </View>
                      <View style={styles.summaryRow}>
                        <Typography variant="caption" color={theme.colors.textSecondary}>
                          Referencia:
                        </Typography>
                        <Typography variant="caption" color={theme.colors.textSecondary}>
                          {result.gatewayRefundId || 'REF-CONFIRMADA'}
                        </Typography>
                      </View>
                    </View>

                    <Button
                      title="Entendido"
                      variant="primary"
                      size="medium"
                      onPress={onClose}
                      style={{ marginTop: 24, width: '100%' }}
                    />
                  </View>
                )}

                {/* 3. Estado Error / No Elegible */}
                {!loading && !result && (errorMsg || (quote && !quote.eligible)) && (
                  <View style={styles.ineligibleBox}>
                    <View style={styles.errorIconBadge}>
                      <Feather name="alert-triangle" size={28} color={theme.colors.warning} />
                    </View>
                    <Typography variant="headline" color={theme.colors.text} align="center" style={{ marginTop: 12 }}>
                      Cancelación No Disponible
                    </Typography>
                    <Typography
                      variant="body"
                      color={theme.colors.textSecondary}
                      align="center"
                      style={{ marginTop: 8 }}
                    >
                      {errorMsg || quote?.rejectionReason || 'Este boleto no cumple con las condiciones para cancelación o reembolso.'}
                    </Typography>

                    <Button
                      title="Cerrar"
                      variant="outline"
                      size="medium"
                      onPress={onClose}
                      style={{ marginTop: 20, width: '100%' }}
                    />
                  </View>
                )}

                {/* 4. Estado Elegible — Formulario y Desglose Financiero */}
                {!loading && !result && quote && quote.eligible && (
                  <View style={styles.eligibleContent}>
                    {/* Tarjeta del boleto */}
                    <View style={styles.ticketMiniCard}>
                      <Typography variant="headline" color={theme.colors.text} weight="700">
                        {quote.eventName}
                      </Typography>
                      <Typography variant="footnote" color={theme.colors.textSecondary} style={{ marginTop: 2 }}>
                        {quote.seatInfo} • Código: {quote.ticketCode}
                      </Typography>
                    </View>

                    {/* Desglose de Reembolso (Criterio 3) */}
                    <View style={styles.breakdownCard}>
                      <Typography variant="subheadline" weight="700" color={theme.colors.text} style={{ marginBottom: 12 }}>
                        Desglose de Reembolso
                      </Typography>

                      <View style={styles.breakdownRow}>
                        <Typography variant="body" color={theme.colors.textSecondary}>
                          Precio original del boleto:
                        </Typography>
                        <Typography variant="body" color={theme.colors.text}>
                          ${quote.originalPrice.toFixed(2)} MXN
                        </Typography>
                      </View>

                      {quote.penaltyFee > 0 && (
                        <View style={styles.breakdownRow}>
                          <Typography variant="body" color={theme.colors.textSecondary}>
                            Comisión por servicio/política:
                          </Typography>
                          <Typography variant="body" color={theme.colors.error}>
                            -${quote.penaltyFee.toFixed(2)} MXN
                          </Typography>
                        </View>
                      )}

                      <View style={[styles.breakdownRow, styles.breakdownTotal]}>
                        <Typography variant="headline" weight="700" color={theme.colors.text}>
                          Importe a reembolsar:
                        </Typography>
                        <Typography variant="headline" weight="700" color={theme.colors.success}>
                          ${quote.refundAmount.toFixed(2)} MXN
                        </Typography>
                      </View>

                      <View style={styles.divider} />

                      {/* Método de devolución y plazo (Criterio 3) */}
                      <View style={styles.detailRow}>
                        <Feather name="credit-card" size={16} color={theme.colors.primary} />
                        <View style={{ flex: 1 }}>
                          <Typography variant="footnote" color={theme.colors.textSecondary}>
                            Método de devolución
                          </Typography>
                          <Typography variant="body" weight="600" color={theme.colors.text}>
                            {quote.paymentMethod}
                          </Typography>
                        </View>
                      </View>

                      <View style={styles.detailRow}>
                        <Feather name="clock" size={16} color={theme.colors.primary} />
                        <View style={{ flex: 1 }}>
                          <Typography variant="footnote" color={theme.colors.textSecondary}>
                            Plazo estimado de acreditación
                          </Typography>
                          <Typography variant="body" weight="600" color={theme.colors.text}>
                            {quote.estimatedDays || '3 a 5 días hábiles bancarios'}
                          </Typography>
                        </View>
                      </View>
                    </View>

                    {/* Advertencia de Invalidación Inmediata (Criterio 4) */}
                    <View style={styles.warningBox}>
                      <Feather name="alert-circle" size={18} color={theme.colors.error} style={{ marginTop: 2 }} />
                      <View style={{ flex: 1 }}>
                        <Typography variant="footnote" weight="700" color={theme.colors.error}>
                          Atención
                        </Typography>
                        <Typography variant="footnote" color={theme.colors.textSecondary} style={{ marginTop: 2 }}>
                          Una vez aprobada la cancelación, el boleto dejará de ser válido de inmediato y no podrás acceder al evento.
                        </Typography>
                      </View>
                    </View>

                    {/* Campo de motivo opcional */}
                    <View style={styles.inputGroup}>
                      <Typography variant="footnote" color={theme.colors.textSecondary} style={{ marginBottom: 6 }}>
                        Motivo de cancelación (opcional):
                      </Typography>
                      <TextInput
                        style={styles.textInput}
                        placeholder="Ej. Imprevisto personal de viaje"
                        placeholderTextColor={theme.colors.textTertiary}
                        value={reason}
                        onChangeText={setReason}
                        maxLength={150}
                      />
                    </View>

                    {/* Botones de acción */}
                    <View style={styles.actionsBox}>
                      <Button
                        title="Confirmar Cancelación"
                        variant="danger"
                        size="medium"
                        loading={submitting}
                        disabled={submitting}
                        onPress={handleConfirmCancellation}
                        leftIcon={<Feather name="x-circle" size={16} color="#FFFFFF" />}
                      />

                      <Button
                        title="Conservar mi boleto"
                        variant="ghost"
                        size="medium"
                        disabled={submitting}
                        onPress={onClose}
                        style={{ marginTop: 8 }}
                      />
                    </View>
                  </View>
                )}
              </ScrollView>
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
      backgroundColor: theme.colors.overlayDark,
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: theme.colors.surfaceElevated,
      borderTopLeftRadius: theme.borderRadius.xxl,
      borderTopRightRadius: theme.borderRadius.xxl,
      maxHeight: '90%',
      paddingBottom: theme.spacing.xl,
      borderWidth: 1,
      borderColor: theme.colors.borderFaint,
      borderBottomWidth: 0,
    },
    handle: {
      width: 40,
      height: 4,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.borderDefault,
      alignSelf: 'center',
      marginTop: theme.spacing.s,
      marginBottom: theme.spacing.xs,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.l,
      paddingVertical: theme.spacing.m,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.borderFaint,
    },
    headerTitleBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.s,
    },
    headerIconBadge: {
      width: 32,
      height: 32,
      borderRadius: theme.borderRadius.m,
      backgroundColor: theme.colors.errorFaint || 'rgba(239, 68, 68, 0.1)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    closeButton: {
      width: 32,
      height: 32,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.surfaceHighlight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    contentScroll: {
      maxHeight: 520,
    },
    contentContainer: {
      padding: theme.spacing.l,
    },
    centeredState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.xxl,
    },
    successIconBadge: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: theme.colors.successFaint || 'rgba(34, 197, 94, 0.15)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: theme.colors.success,
    },
    summaryCard: {
      width: '100%',
      backgroundColor: theme.colors.surfaceHighlight,
      borderRadius: theme.borderRadius.m,
      padding: theme.spacing.m,
      marginTop: theme.spacing.l,
      gap: theme.spacing.s,
      borderWidth: 1,
      borderColor: theme.colors.borderFaint,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    ineligibleBox: {
      alignItems: 'center',
      paddingVertical: theme.spacing.l,
    },
    errorIconBadge: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.colors.warningFaint || 'rgba(245, 158, 11, 0.15)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    eligibleContent: {
      gap: theme.spacing.m,
    },
    ticketMiniCard: {
      backgroundColor: theme.colors.surfaceHighlight,
      padding: theme.spacing.m,
      borderRadius: theme.borderRadius.m,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.primary,
    },
    breakdownCard: {
      backgroundColor: theme.colors.surfaceHighlight,
      padding: theme.spacing.m,
      borderRadius: theme.borderRadius.m,
      borderWidth: 1,
      borderColor: theme.colors.borderFaint,
    },
    breakdownRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.s,
    },
    breakdownTotal: {
      marginTop: theme.spacing.xs,
      paddingTop: theme.spacing.s,
      borderTopWidth: 1,
      borderTopColor: theme.colors.borderFaint,
      marginBottom: 0,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.borderFaint,
      marginVertical: theme.spacing.m,
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.s,
      marginBottom: theme.spacing.s,
    },
    warningBox: {
      flexDirection: 'row',
      gap: theme.spacing.s,
      backgroundColor: theme.colors.errorFaint || 'rgba(239, 68, 68, 0.08)',
      padding: theme.spacing.m,
      borderRadius: theme.borderRadius.m,
      borderWidth: 1,
      borderColor: theme.colors.errorGlow || 'rgba(239, 68, 68, 0.25)',
    },
    inputGroup: {
      marginTop: theme.spacing.xs,
    },
    textInput: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.borderDefault,
      borderRadius: theme.borderRadius.m,
      paddingHorizontal: theme.spacing.m,
      paddingVertical: theme.spacing.s,
      color: theme.colors.text,
      fontSize: 14,
    },
    actionsBox: {
      marginTop: theme.spacing.s,
      gap: theme.spacing.xs,
    },
  });
