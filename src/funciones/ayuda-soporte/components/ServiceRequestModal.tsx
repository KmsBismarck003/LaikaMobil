import React, { useState, useEffect } from 'react';
import {
  View,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Typography } from '../../../components/ui/Typography';
import { Button } from '../../../components/ui/Button';
import { useAppTheme } from '../../../styles/ThemeProvider';
import { useStyles } from '../../../styles/useStyles';
import { createSupportStyles } from '../../../styles/SupportService.styles';
import { ServiceCategory, CreateServiceTicketDTO, TicketSummary } from '../../../services/SupportService';
import { useAuth } from '../../../hooks/useAuth';

interface Props {
  visible: boolean;
  onClose: () => void;
  categories: ServiceCategory[];
  onSubmit: (dto: CreateServiceTicketDTO) => Promise<any>;
}

export const ServiceRequestModal: React.FC<Props> = ({
  visible,
  onClose,
  categories,
  onSubmit,
}) => {
  const styles = useStyles(createSupportStyles);
  const { theme } = useAppTheme();
  const user = useAuth();

  const [selectedCatId, setSelectedCatId] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [contactEmail, setContactEmail] = useState<string>('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [createdTicket, setCreatedTicket] = useState<TicketSummary | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Pre-llenar categoría y email si hay usuario autenticado
  useEffect(() => {
    if (visible) {
      if (categories.length > 0 && !selectedCatId) {
        setSelectedCatId(categories[0].id);
      }
      if (user?.email) {
        setContactEmail(user.email);
      }
      setFormErrors({});
      setCreatedTicket(null);
      setCopied(false);
    }
  }, [visible, categories, user]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!selectedCatId) {
      errors.categoryId = 'Selecciona una categoría de servicio.';
    }
    if (!subject.trim() || subject.trim().length < 5) {
      errors.subject = 'El asunto debe tener al menos 5 caracteres.';
    }
    if (!description.trim() || description.trim().length < 15) {
      errors.description = 'Detalla tu problema en al menos 15 caracteres.';
    }
    if (!contactEmail.trim() || !emailRegex.test(contactEmail.trim())) {
      errors.contactEmail = 'Ingresa un correo electrónico válido para darte seguimiento.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSend = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const res = await onSubmit({
        categoryId: selectedCatId,
        subject,
        description,
        contactEmail,
        priority,
      });

      if (res && res.ticket) {
        setCreatedTicket(res.ticket);
      }
    } catch (err: any) {
      Alert.alert('Aviso del Servidor', err.message || 'No fue posible enviar la solicitud');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyCode = async (code: string) => {
    await Clipboard.setStringAsync(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const resetAndClose = () => {
    setSubject('');
    setDescription('');
    setFormErrors({});
    setCreatedTicket(null);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={resetAndClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.s }}>
              <Feather name="life-buoy" size={20} color={theme.colors.primary} />
              <Typography variant="headline" color={theme.colors.text}>
                {createdTicket ? 'Solicitud Recibida' : 'Nueva Solicitud de Servicio'}
              </Typography>
            </View>
            <TouchableOpacity onPress={resetAndClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Feather name="x" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Estado de Éxito / Confirmación Transaccional */}
          {createdTicket ? (
            <View style={styles.successCard}>
              <View style={styles.successIconBadge}>
                <Feather name="check" size={32} color={theme.colors.success} />
              </View>

              <Typography variant="headline" color={theme.colors.text} align="center" style={{ marginBottom: theme.spacing.xs }}>
                ¡Registro completado en el servidor!
              </Typography>
              <Typography variant="body" color={theme.colors.textSecondary} align="center">
                Tu solicitud ha sido radicada bajo la categoría "{createdTicket.categoryTitle}".
              </Typography>

              <View style={styles.ticketBadge}>
                <Typography variant="overline" color={theme.colors.textSecondary}>
                  CÓDIGO DE RADICADO (TICKET)
                </Typography>
                <Typography variant="display" color={theme.colors.primary} style={styles.ticketCode}>
                  {createdTicket.ticketId}
                </Typography>
                <Typography variant="footnote" color={theme.colors.textTertiary} style={{ marginTop: theme.spacing.xs }}>
                  Tiempo estimado de atención: {createdTicket.estimatedSlaHours} horas
                </Typography>
              </View>

              <Button
                title={copied ? 'Código Copiado' : 'Copiar Código de Ticket'}
                variant="outline"
                size="medium"
                onPress={() => handleCopyCode(createdTicket.ticketId)}
                leftIcon={<Feather name={copied ? 'check' : 'copy'} size={16} color={theme.colors.text} />}
                style={{ width: '100%', marginBottom: theme.spacing.m }}
              />

              <Button
                title="Aceptar y Cerrar"
                variant="primary"
                size="medium"
                onPress={resetAndClose}
                style={{ width: '100%' }}
              />
            </View>
          ) : (
            /* Formulario de Captura */
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* Selección de Categoría */}
              <View style={styles.formGroup}>
                <Typography variant="subheadline" color={theme.colors.text} style={styles.label}>
                  Categoría de Atención
                </Typography>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesList}>
                  {categories.map((cat) => {
                    const isSelected = selectedCatId === cat.id;
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        onPress={() => setSelectedCatId(cat.id)}
                        style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
                        activeOpacity={0.7}
                      >
                        <Feather
                          name={(cat.icon as any) || 'help-circle'}
                          size={14}
                          color={isSelected ? theme.colors.primary : theme.colors.textSecondary}
                        />
                        <Typography
                          variant="caption"
                          color={isSelected ? theme.colors.primary : theme.colors.text}
                          style={styles.categoryChipText}
                        >
                          {cat.title}
                        </Typography>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
                {formErrors.categoryId && (
                  <Typography variant="footnote" color={theme.colors.error} style={styles.errorText}>
                    {formErrors.categoryId}
                  </Typography>
                )}
              </View>

              {/* Asunto */}
              <View style={styles.formGroup}>
                <Typography variant="subheadline" color={theme.colors.text} style={styles.label}>
                  Asunto
                </Typography>
                <TextInput
                  style={[styles.input, formErrors.subject ? styles.inputError : null]}
                  placeholder="Ej: Aclaración sobre código QR de mi entrada"
                  placeholderTextColor={theme.colors.textTertiary}
                  value={subject}
                  onChangeText={(val) => {
                    setSubject(val);
                    if (formErrors.subject) setFormErrors((prev) => ({ ...prev, subject: '' }));
                  }}
                  maxLength={100}
                />
                {formErrors.subject && (
                  <Typography variant="footnote" color={theme.colors.error} style={styles.errorText}>
                    {formErrors.subject}
                  </Typography>
                )}
              </View>

              {/* Descripción */}
              <View style={styles.formGroup}>
                <Typography variant="subheadline" color={theme.colors.text} style={styles.label}>
                  Detalle de la Solicitud
                </Typography>
                <TextInput
                  style={[styles.input, styles.inputMultiline, formErrors.description ? styles.inputError : null]}
                  placeholder="Describe con precisión lo que necesitas o el inconveniente presentado..."
                  placeholderTextColor={theme.colors.textTertiary}
                  value={description}
                  onChangeText={(val) => {
                    setDescription(val);
                    if (formErrors.description) setFormErrors((prev) => ({ ...prev, description: '' }));
                  }}
                  multiline
                  numberOfLines={4}
                  maxLength={500}
                />
                {formErrors.description && (
                  <Typography variant="footnote" color={theme.colors.error} style={styles.errorText}>
                    {formErrors.description}
                  </Typography>
                )}
              </View>

              {/* Correo Electrónico de Contacto */}
              <View style={styles.formGroup}>
                <Typography variant="subheadline" color={theme.colors.text} style={styles.label}>
                  Correo Electrónico de Notificación
                </Typography>
                <TextInput
                  style={[styles.input, formErrors.contactEmail ? styles.inputError : null]}
                  placeholder="tu_correo@ejemplo.com"
                  placeholderTextColor={theme.colors.textTertiary}
                  value={contactEmail}
                  onChangeText={(val) => {
                    setContactEmail(val);
                    if (formErrors.contactEmail) setFormErrors((prev) => ({ ...prev, contactEmail: '' }));
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {formErrors.contactEmail && (
                  <Typography variant="footnote" color={theme.colors.error} style={styles.errorText}>
                    {formErrors.contactEmail}
                  </Typography>
                )}
              </View>

              {/* Nivel de Prioridad */}
              <View style={styles.formGroup}>
                <Typography variant="subheadline" color={theme.colors.text} style={styles.label}>
                  Prioridad
                </Typography>
                <View style={styles.priorityRow}>
                  {(['LOW', 'MEDIUM', 'HIGH'] as const).map((lvl) => {
                    const isSel = priority === lvl;
                    const labels = { LOW: 'Baja', MEDIUM: 'Media', HIGH: 'Alta' };
                    return (
                      <TouchableOpacity
                        key={lvl}
                        onPress={() => setPriority(lvl)}
                        style={[styles.priorityChip, isSel && styles.priorityChipSelected]}
                        activeOpacity={0.7}
                      >
                        <Typography
                          variant="caption"
                          color={isSel ? theme.colors.primary : theme.colors.textSecondary}
                          style={{ fontWeight: isSel ? '700' : '400' }}
                        >
                          {labels[lvl]}
                        </Typography>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Botón de Envío */}
              <Button
                title={submitting ? 'Transmitiendo...' : 'Enviar Solicitud al Servidor'}
                variant="primary"
                size="large"
                loading={submitting}
                disabled={submitting}
                onPress={handleSend}
                leftIcon={<Feather name="send" size={16} color={theme.colors.white} />}
                style={styles.submitButton}
              />
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
