/**
 * Componente RedeemCourtesyModal — LaikaMobil
 * Centro de canje de cortesías móviles.
 * Permite a cualquier asistente ingresar un código de invitación/cortesía (6 caracteres),
 * pre-visualizar el evento asignado y canjearlo directamente en su cuenta oficial.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../styles/ThemeProvider';
import { Typography } from './ui/Typography';
import { Button } from './ui/Button';
import { useStyles } from '../styles/useStyles';
import { TicketService } from '../services/TicketService';

interface RedeemCourtesyModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const RedeemCourtesyModal: React.FC<RedeemCourtesyModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const styles = useStyles(createStyles);
  const { theme } = useAppTheme();

  const [code, setCode] = useState('');
  const [validating, setValidating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      setCode('');
      setPreview(null);
      setErrorMsg(null);
      setSuccessMsg(null);
      setValidating(false);
      setSubmitting(false);
    }
  }, [visible]);

  const handleValidate = async () => {
    const clean = code.trim().toUpperCase();
    if (!clean || clean.length < 5) {
      setErrorMsg('Ingresa un código de cortesía válido');
      return;
    }

    setValidating(true);
    setErrorMsg(null);
    setPreview(null);

    try {
      const data = await TicketService.validateCourtesyToken(clean);
      setPreview(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Código no encontrado o ya utilizado');
    } finally {
      setValidating(false);
    }
  };

  const handleClaim = async () => {
    const clean = code.trim().toUpperCase();
    if (!clean) return;

    setSubmitting(true);
    setErrorMsg(null);

    try {
      await TicketService.claimCourtesyTicket(clean);
      setSuccessMsg('Boleto de cortesía canjeado con éxito');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al canjear el código de cortesía');
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.sheetContainer}
            >
              <View style={styles.sheet}>
                {/* Handle bar */}
                <View style={styles.handle} />

                {/* Header */}
                <View style={styles.header}>
                  <View style={styles.headerTitleRow}>
                    <View style={styles.giftBadge}>
                      <Feather name="gift" size={16} color="#a78bfa" />
                    </View>
                    <Typography variant="title" color={theme.colors.text}>
                      Canjear Cortesía
                    </Typography>
                  </View>
                  <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
                    <Feather name="x" size={18} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <Typography variant="footnote" color={theme.colors.textSecondary} style={styles.subtitle}>
                  Ingresa el código alfanumérico que recibiste para vincular tu boleto a tu cuenta oficial.
                </Typography>

                {/* Input row */}
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej. AB12CD o LAIKA-COR-..."
                    placeholderTextColor={theme.colors.textTertiary}
                    value={code}
                    onChangeText={(val) => {
                      setCode(val.toUpperCase());
                      setErrorMsg(null);
                      setPreview(null);
                    }}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    maxLength={20}
                  />
                  <TouchableOpacity
                    style={[styles.validateBtn, (!code.trim() || validating) && styles.validateBtnDisabled]}
                    onPress={handleValidate}
                    disabled={!code.trim() || validating}
                    activeOpacity={0.8}
                  >
                    {validating ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <Feather name="search" size={16} color="#ffffff" />
                    )}
                  </TouchableOpacity>
                </View>

                {/* Error Banner */}
                {errorMsg && (
                  <View style={styles.errorBox}>
                    <Feather name="alert-circle" size={14} color={theme.colors.error} />
                    <Typography variant="footnote" color={theme.colors.error} style={{ flex: 1 }}>
                      {errorMsg}
                    </Typography>
                  </View>
                )}

                {/* Success Banner */}
                {successMsg && (
                  <View style={styles.successBox}>
                    <Feather name="check-circle" size={14} color={theme.colors.success} />
                    <Typography variant="footnote" color={theme.colors.success} style={{ flex: 1 }}>
                      {successMsg}
                    </Typography>
                  </View>
                )}

                {/* Ticket Preview Card */}
                {preview && !successMsg && (
                  <View style={styles.previewCard}>
                    <View style={styles.previewHeader}>
                      <Typography variant="overline" color="#a78bfa" style={{ fontWeight: '800' }}>
                        CORTESÍA DISPONIBLE
                      </Typography>
                      <Typography variant="caption" color={theme.colors.textSecondary}>
                        {preview.recipient_type || 'Invitado Especial'}
                      </Typography>
                    </View>

                    <Typography variant="subheadline" color={theme.colors.text} weight="700" style={{ marginTop: 4 }}>
                      {preview.event_name || 'Evento LAIKA Club'}
                    </Typography>

                    <View style={styles.previewMeta}>
                      <View style={styles.previewMetaItem}>
                        <Feather name="calendar" size={12} color={theme.colors.textSecondary} />
                        <Typography variant="caption" color={theme.colors.textSecondary}>
                          {preview.event_date || 'Fecha por confirmar'}
                        </Typography>
                      </View>
                      <View style={styles.previewMetaItem}>
                        <Feather name="map-pin" size={12} color={theme.colors.textSecondary} />
                        <Typography variant="caption" color={theme.colors.textSecondary}>
                          {preview.section_name || 'General'}
                        </Typography>
                      </View>
                    </View>

                    <Button
                      variant="primary"
                      size="medium"
                      title={submitting ? 'Canjeando...' : 'Reclamar y Guardar en mi Cuenta'}
                      onPress={handleClaim}
                      loading={submitting}
                      style={{ marginTop: 12, backgroundColor: '#8b5cf6' }}
                    />
                  </View>
                )}

                {/* Cancel Button */}
                <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.75}>
                  <Typography variant="subheadline" color={theme.colors.textSecondary} weight="600">
                    Cancelar
                  </Typography>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
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
    sheetContainer: {
      width: '100%',
    },
    sheet: {
      backgroundColor: theme.colors.surfaceElevated,
      borderTopLeftRadius: theme.borderRadius.xxl,
      borderTopRightRadius: theme.borderRadius.xxl,
      paddingHorizontal: theme.spacing.l,
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
      paddingVertical: theme.spacing.s,
    },
    headerTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.s,
    },
    giftBadge: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: 'rgba(139, 92, 246, 0.15)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(139, 92, 246, 0.3)',
    },
    closeButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    subtitle: {
      marginTop: 4,
      marginBottom: theme.spacing.m,
      lineHeight: 18,
    },
    inputContainer: {
      flexDirection: 'row',
      gap: theme.spacing.s,
      marginBottom: theme.spacing.m,
    },
    input: {
      flex: 1,
      height: 48,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.l,
      paddingHorizontal: theme.spacing.m,
      color: theme.colors.text,
      fontSize: 15,
      fontWeight: '600',
      letterSpacing: 1.5,
      borderWidth: 1,
      borderColor: theme.colors.borderFaint,
    },
    validateBtn: {
      width: 48,
      height: 48,
      borderRadius: theme.borderRadius.l,
      backgroundColor: '#8b5cf6',
      alignItems: 'center',
      justifyContent: 'center',
    },
    validateBtnDisabled: {
      opacity: 0.5,
    },
    errorBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      borderWidth: 1,
      borderColor: 'rgba(239, 68, 68, 0.25)',
      padding: theme.spacing.s,
      borderRadius: theme.borderRadius.m,
      marginBottom: theme.spacing.m,
    },
    successBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      borderWidth: 1,
      borderColor: 'rgba(34, 197, 94, 0.25)',
      padding: theme.spacing.s,
      borderRadius: theme.borderRadius.m,
      marginBottom: theme.spacing.m,
    },
    previewCard: {
      backgroundColor: 'rgba(139, 92, 246, 0.08)',
      borderWidth: 1,
      borderColor: 'rgba(139, 92, 246, 0.25)',
      borderRadius: theme.borderRadius.l,
      padding: theme.spacing.m,
      marginBottom: theme.spacing.m,
    },
    previewHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    previewMeta: {
      flexDirection: 'row',
      gap: theme.spacing.m,
      marginTop: 8,
    },
    previewMetaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    cancelBtn: {
      paddingVertical: theme.spacing.s,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
