/**
 * Componente TransferTicketModal — LaikaMobil
 * Modal interactivo para transferir boletos a usuarios registrados o
 * generar invitaciones seguras con token de reclamación para no registrados.
 * Cumple Criterios 1, 2, 3, 5 y 8 de la historia de usuario.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
  ScrollView,
  Share,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../styles/ThemeProvider';
import { Typography } from './ui/Typography';
import { Button } from './ui/Button';
import { useStyles } from '../styles/useStyles';
import { TicketService, Ticket, TransferRequestResult } from '../services/TicketService';
import { biometricService } from '../services/security/BiometricService';

interface TransferTicketModalProps {
  visible: boolean;
  ticket: Ticket | null;
  onClose: () => void;
  onSuccess: (result: TransferRequestResult) => void;
}

export const TransferTicketModal: React.FC<TransferTicketModalProps> = ({
  visible,
  ticket,
  onClose,
  onSuccess,
}) => {
  const styles = useStyles(createStyles);
  const { theme } = useAppTheme();

  const [recipientEmail, setRecipientEmail] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<TransferRequestResult | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!visible || !ticket) {
      setRecipientEmail('');
      setPasswordConfirm('');
      setErrorMsg(null);
      setResult(null);
      setCopiedLink(false);
      setSubmitting(false);
    }
  }, [visible, ticket]);

  const handleSendTransfer = async () => {
    if (!ticket) return;

    const emailTrim = recipientEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailTrim || !emailRegex.test(emailTrim)) {
      setErrorMsg('Por favor ingresa un correo electrónico válido');
      return;
    }

    if (!passwordConfirm.trim()) {
      setErrorMsg('Por favor ingresa tu contraseña para autorizar la transferencia');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      // Verificación de seguridad del dispositivo (huella, rostro o PIN) si aplica
      const isBioAvailable = await biometricService.isBiometricAvailable();
      if (isBioAvailable) {
        const authSuccess = await biometricService.authenticateUser(
          'Autoriza la transferencia de tu boleto con tu huella, rostro o PIN'
        );
        if (!authSuccess) {
          setErrorMsg('Autenticación cancelada. Se requiere verificar tu identidad en el dispositivo para autorizar la transferencia.');
          setSubmitting(false);
          return;
        }
      }

      const res = await TicketService.requestTransfer(ticket.id, emailTrim, passwordConfirm);
      setResult(res);
      onSuccess(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al procesar la transferencia del boleto');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyLink = async () => {
    if (!result?.claimUrl) return;
    await Clipboard.setStringAsync(result.claimUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShareLink = async () => {
    if (!result?.claimUrl) return;
    try {
      await Share.share({
        title: `Boleto para ${ticket?.eventName || 'LAIKA Club'}`,
        message: `Te he transferido un boleto para ${ticket?.eventName || 'el evento'} en LAIKA Club. Reclámalo aquí antes de que expire: ${result.claimUrl}`,
        url: result.claimUrl,
      });
    } catch (err) {
      console.warn('Error sharing transfer link:', err);
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
                    <Feather name="send" size={18} color={theme.colors.primary} />
                  </View>
                  <Typography variant="title" color={theme.colors.text}>
                    Transferir Boleto
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
                {/* ESTADO 1: ÉXITO - USUARIO REGISTRADO */}
                {result && result.registeredUser && (
                  <View style={styles.centeredState}>
                    <View style={styles.successIconBadge}>
                      <Feather name="check" size={32} color={theme.colors.success} />
                    </View>
                    <Typography variant="title" color={theme.colors.text} align="center" style={{ marginTop: 16 }}>
                      Transferencia Enviada
                    </Typography>
                    <Typography
                      variant="body"
                      color={theme.colors.textSecondary}
                      align="center"
                      style={{ marginTop: 8 }}
                    >
                      {result.message}
                    </Typography>

                    <View style={styles.summaryCard}>
                      <View style={styles.summaryRow}>
                        <Typography variant="caption" color={theme.colors.textSecondary}>
                          Destinatario:
                        </Typography>
                        <Typography variant="caption" weight="700" color={theme.colors.text}>
                          {result.transfer?.recipientEmail || result.recipientEmail || recipientEmail}
                        </Typography>
                      </View>
                      <View style={styles.summaryRow}>
                        <Typography variant="caption" color={theme.colors.textSecondary}>
                          Estado:
                        </Typography>
                        <Typography variant="caption" weight="700" color={theme.colors.warning}>
                          Pendiente de aceptación
                        </Typography>
                      </View>
                      <View style={styles.summaryRow}>
                        <Typography variant="caption" color={theme.colors.textSecondary}>
                          Vigencia de oferta:
                        </Typography>
                        <Typography variant="caption" color={theme.colors.textSecondary}>
                          48 horas
                        </Typography>
                      </View>
                    </View>

                    <View style={styles.noticeBox}>
                      <Feather name="info" size={16} color={theme.colors.primary} />
                      <Typography variant="footnote" color={theme.colors.textSecondary} style={{ flex: 1 }}>
                        El destinatario ya puede ingresar a su cuenta de LAIKA Club para aceptar o rechazar el boleto. Mientras tanto, tu código QR anterior ha sido congelado.
                      </Typography>
                    </View>

                    <Button
                      title="Entendido"
                      variant="primary"
                      size="medium"
                      onPress={onClose}
                      style={{ marginTop: 20, width: '100%' }}
                    />
                  </View>
                )}

                {/* ESTADO 2: ÉXITO - USUARIO NO REGISTRADO (ENLACE DE INVITACIÓN) */}
                {result && !result.registeredUser && (
                  <View style={styles.centeredState}>
                    <View style={[styles.successIconBadge, styles.inviteIconBadge]}>
                      <Feather name="user-plus" size={30} color={theme.colors.primary} />
                    </View>
                    <Typography variant="title" color={theme.colors.text} align="center" style={{ marginTop: 16 }}>
                      Invitación Generada
                    </Typography>
                    <Typography
                      variant="body"
                      color={theme.colors.textSecondary}
                      align="center"
                      style={{ marginTop: 8 }}
                    >
                      El destinatario ({result.transfer?.recipientEmail || result.recipientEmail || recipientEmail}) aún no tiene cuenta en LAIKA Club. Comparte este enlace exclusivo para que se registre y reclame el boleto:
                    </Typography>

                    {result.claimUrl && (
                      <View style={styles.linkContainer}>
                        <Typography
                          variant="footnote"
                          color={theme.colors.text}
                          numberOfLines={1}
                          style={styles.linkText}
                        >
                          {result.claimUrl}
                        </Typography>
                        <TouchableOpacity
                          style={styles.copyButton}
                          onPress={handleCopyLink}
                          activeOpacity={0.7}
                        >
                          <Feather
                            name={copiedLink ? 'check' : 'copy'}
                            size={16}
                            color={copiedLink ? theme.colors.success : theme.colors.primary}
                          />
                          <Typography
                            variant="overline"
                            weight="700"
                            color={copiedLink ? theme.colors.success : theme.colors.primary}
                          >
                            {copiedLink ? 'Copiado' : 'Copiar'}
                          </Typography>
                        </TouchableOpacity>
                      </View>
                    )}

                    <View style={styles.shareButtonsRow}>
                      <Button
                        title="Compartir Enlace"
                        variant="primary"
                        size="medium"
                        onPress={handleShareLink}
                        leftIcon={<Feather name="share-2" size={16} color="#FFFFFF" />}
                        style={{ flex: 1 }}
                      />
                    </View>

                    <Button
                      title="Listo"
                      variant="ghost"
                      size="medium"
                      onPress={onClose}
                      style={{ marginTop: 12, width: '100%' }}
                    />
                  </View>
                )}

                {/* ESTADO 3: FORMULARIO DE TRANSFERENCIA */}
                {!result && ticket && (
                  <View style={styles.formContainer}>
                    {/* Resumen del Boleto */}
                    <View style={styles.ticketSummaryBox}>
                      <Typography variant="headline" color={theme.colors.text} weight="700">
                        {ticket.eventName}
                      </Typography>
                      <Typography variant="footnote" color={theme.colors.textSecondary} style={{ marginTop: 2 }}>
                        {ticket.seatInfo || 'General'} • Boleto #{ticket.id}
                      </Typography>
                      <Typography variant="footnote" color={theme.colors.textTertiary} style={{ marginTop: 2 }}>
                        Fecha: {ticket.date}
                      </Typography>
                    </View>

                    {/* Mensaje de Error si ocurre */}
                    {errorMsg && (
                      <View style={styles.errorBanner}>
                        <Feather name="alert-triangle" size={16} color={theme.colors.error} />
                        <Typography variant="footnote" color={theme.colors.error} style={{ flex: 1 }}>
                          {errorMsg}
                        </Typography>
                      </View>
                    )}

                    {/* Campo Correo del Destinatario */}
                    <View style={styles.inputGroup}>
                      <Typography variant="footnote" weight="600" color={theme.colors.text} style={{ marginBottom: 6 }}>
                        Correo electrónico del destinatario:
                      </Typography>
                      <View style={styles.inputWrapper}>
                        <Feather name="mail" size={16} color={theme.colors.textSecondary} style={styles.inputIcon} />
                        <TextInput
                          style={styles.textInput}
                          placeholder="ejemplo@correo.com"
                          placeholderTextColor={theme.colors.textTertiary}
                          value={recipientEmail}
                          onChangeText={(text) => {
                            setRecipientEmail(text);
                            if (errorMsg) setErrorMsg(null);
                          }}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoCorrect={false}
                          editable={!submitting}
                        />
                      </View>
                      <Typography variant="caption" color={theme.colors.textTertiary} style={{ marginTop: 4 }}>
                        Si no tiene cuenta, se creará un enlace de invitación para que se registre.
                      </Typography>
                    </View>

                    {/* Campo Contraseña de Confirmación */}
                    <View style={styles.inputGroup}>
                      <Typography variant="footnote" weight="600" color={theme.colors.text} style={{ marginBottom: 6 }}>
                        Confirma con tu contraseña:
                      </Typography>
                      <View style={styles.inputWrapper}>
                        <Feather name="lock" size={16} color={theme.colors.textSecondary} style={styles.inputIcon} />
                        <TextInput
                          style={styles.textInput}
                          placeholder="Tu contraseña actual"
                          placeholderTextColor={theme.colors.textTertiary}
                          value={passwordConfirm}
                          onChangeText={(text) => {
                            setPasswordConfirm(text);
                            if (errorMsg) setErrorMsg(null);
                          }}
                          secureTextEntry
                          editable={!submitting}
                        />
                      </View>
                    </View>

                    {/* Advertencia de Seguridad */}
                    <View style={styles.securityWarning}>
                      <Feather name="shield" size={16} color={theme.colors.warning} />
                      <Typography variant="footnote" color={theme.colors.textSecondary} style={{ flex: 1 }}>
                        Se solicitará la verificación biométrica o PIN de tu dispositivo para autorizar la operación. Al completarse, tu código QR actual quedará invalidado y se emitirá una nueva credencial única para el destinatario.
                      </Typography>
                    </View>

                    {/* Botones de Acción */}
                    <View style={styles.actionsBox}>
                      <Button
                        title="Enviar Transferencia"
                        variant="primary"
                        size="medium"
                        loading={submitting}
                        disabled={submitting || !recipientEmail || !passwordConfirm}
                        onPress={handleSendTransfer}
                        leftIcon={<Feather name="send" size={16} color="#FFFFFF" />}
                      />

                      <Button
                        title="Cancelar"
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
      backgroundColor: theme.colors.primaryFaint,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.primaryGlow,
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
      maxHeight: 540,
    },
    contentContainer: {
      padding: theme.spacing.l,
    },
    centeredState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.m,
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
    inviteIconBadge: {
      backgroundColor: theme.colors.primaryFaint,
      borderColor: theme.colors.primary,
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
    noticeBox: {
      flexDirection: 'row',
      gap: theme.spacing.s,
      backgroundColor: theme.colors.surfaceHighlight,
      padding: theme.spacing.m,
      borderRadius: theme.borderRadius.m,
      borderWidth: 1,
      borderColor: theme.colors.borderFaint,
      marginTop: theme.spacing.m,
    },
    linkContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.borderDefault,
      borderRadius: theme.borderRadius.m,
      paddingHorizontal: theme.spacing.m,
      paddingVertical: theme.spacing.s,
      marginTop: theme.spacing.m,
      width: '100%',
      gap: theme.spacing.s,
    },
    linkText: {
      flex: 1,
      fontSize: 12,
    },
    copyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: theme.colors.surfaceHighlight,
      paddingHorizontal: 8,
      paddingVertical: 5,
      borderRadius: theme.borderRadius.s,
    },
    shareButtonsRow: {
      flexDirection: 'row',
      marginTop: theme.spacing.l,
      width: '100%',
      gap: theme.spacing.s,
    },
    formContainer: {
      gap: theme.spacing.m,
    },
    ticketSummaryBox: {
      backgroundColor: theme.colors.surfaceHighlight,
      padding: theme.spacing.m,
      borderRadius: theme.borderRadius.m,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.primary,
    },
    errorBanner: {
      flexDirection: 'row',
      gap: theme.spacing.s,
      backgroundColor: theme.colors.errorFaint || 'rgba(239, 68, 68, 0.1)',
      borderWidth: 1,
      borderColor: theme.colors.errorGlow || 'rgba(239, 68, 68, 0.25)',
      padding: theme.spacing.m,
      borderRadius: theme.borderRadius.m,
    },
    inputGroup: {
      marginTop: theme.spacing.xs,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.borderDefault,
      borderRadius: theme.borderRadius.m,
      paddingHorizontal: theme.spacing.m,
    },
    inputIcon: {
      marginRight: theme.spacing.s,
    },
    textInput: {
      flex: 1,
      paddingVertical: theme.spacing.s,
      color: theme.colors.text,
      fontSize: 14,
    },
    securityWarning: {
      flexDirection: 'row',
      gap: theme.spacing.s,
      backgroundColor: theme.colors.warningFaint || 'rgba(245, 158, 11, 0.08)',
      padding: theme.spacing.m,
      borderRadius: theme.borderRadius.m,
      borderWidth: 1,
      borderColor: theme.colors.warningGlow || 'rgba(245, 158, 11, 0.25)',
    },
    actionsBox: {
      marginTop: theme.spacing.s,
      gap: theme.spacing.xs,
    },
  });
