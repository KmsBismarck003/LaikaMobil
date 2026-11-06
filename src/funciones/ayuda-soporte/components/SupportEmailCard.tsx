/**
 * SupportEmailCard — LaikaMobil
 * Componente UI Atómico: Tarjeta de contacto oficial y generador de correo estructurado.
 * Reemplaza los formularios de tickets para evitar spam y agilizar la respuesta técnica.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useAppTheme } from '../../../styles/ThemeProvider';
import { useStyles } from '../../../styles/useStyles';

interface SupportEmailCardProps {
  selectedTopic: string;
  user: any;
}

export const SupportEmailCard: React.FC<SupportEmailCardProps> = ({
  selectedTopic,
  user,
}) => {
  const styles = useStyles(createStyles);
  const { theme } = useAppTheme();
  const [copied, setCopied] = useState(false);

  const SUPPORT_EMAIL = 'jreyes6458@gmail.com';

  const generateTemplate = () => {
    const userName = user?.name || user?.fullName || 'Usuario';
    const userId = user?.id ? `#${user.id}` : 'No autenticado';
    const userEmail = user?.email || 'No registrado';
    const platformName = Platform.OS === 'ios' ? 'iOS' : 'Android';
    const now = new Date();
    const dateStr = `${now.toLocaleDateString('es-MX')} ${now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })} hrs`;

    const subject = `[SOPORTE - ${selectedTopic.toUpperCase()}] Usuario ${userId}`;
    const body = `Hola equipo de Soporte Laika,

Describe tu duda o problema a continuación:
--------------------------------------------------
[Escribe aquí tu mensaje...]



--------------------------------------------------
DATOS DE LA CUENTA (Para verificar y agilizar tu atención):
• Usuario: ${userName} (${userId})
• Correo registrado: ${userEmail}
• Sistema: ${platformName}
• Versión App: LaikaMobil v1.0.0
• Fecha/Hora: ${dateStr}
--------------------------------------------------`;

    return { subject, body };
  };

  const handleOpenMail = async () => {
    const { subject, body } = generateTemplate();
    const mailtoUrl = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    try {
      const canOpen = await Linking.canOpenURL(mailtoUrl);
      if (canOpen) {
        await Linking.openURL(mailtoUrl);
      } else {
        await handleCopy();
        Alert.alert(
          'App de correo no configurada',
          `Copiamos la dirección (${SUPPORT_EMAIL}) y la plantilla con tus datos al portapapeles para que la envíes desde tu correo.`
        );
      }
    } catch {
      await handleCopy();
    }
  };

  const handleCopy = async () => {
    const { subject, body } = generateTemplate();
    const fullText = `Para: ${SUPPORT_EMAIL}\nAsunto: ${subject}\n\n${body}`;
    await Clipboard.setStringAsync(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  };

  return (
    <View style={styles.card}>
      {/* Cabecera de la tarjeta */}
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Feather name="mail" size={20} color={theme.colors.text} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>Canal Oficial de Asistencia</Text>
          <Text style={styles.emailText}>{SUPPORT_EMAIL}</Text>
        </View>
      </View>

      <Text style={styles.description}>
        Al redactar tu consulta, la app prepara el correo con tu ID de cuenta y versión de la app para resolver tu caso directamente sin intermediarios ni spam.
      </Text>

      {/* Botón Principal: Redactar */}
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleOpenMail}
        activeOpacity={0.8}
      >
        <Feather name="send" size={15} color="#FFFFFF" style={{ marginRight: 8 }} />
        <Text style={styles.primaryButtonText}>Redactar Correo con mis Datos</Text>
      </TouchableOpacity>

      {/* Botón Secundario: Copiar plantilla */}
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={handleCopy}
        activeOpacity={0.7}
      >
        <Feather
          name={copied ? 'check' : 'copy'}
          size={14}
          color={copied ? theme.colors.success : theme.colors.textSecondary}
          style={{ marginRight: 6 }}
        />
        <Text style={[styles.secondaryButtonText, copied && { color: theme.colors.success }]}>
          {copied ? '¡Plantilla copiada al portapapeles!' : 'Copiar correo y plantilla'}
        </Text>
      </TouchableOpacity>

      {/* Micro-pie de horario */}
      <View style={styles.footerNote}>
        <Feather name="clock" size={11} color={theme.colors.textTertiary} style={{ marginRight: 5 }} />
        <Text style={styles.footerText}>
          Atención: Lun a Sáb · 9:00 a 19:00 hrs (Tiempo estimado: &lt; 4h)
        </Text>
      </View>
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.colors.borderMedium || 'rgba(255, 255, 255, 0.1)',
      marginBottom: 20,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 10,
      elevation: 4,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 10,
    },
    iconCircle: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: theme.colors.surfaceElevated || 'rgba(255, 255, 255, 0.05)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.borderFaint || 'rgba(255, 255, 255, 0.08)',
    },
    cardTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.text,
    },
    emailText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      marginTop: 1,
    },
    description: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      lineHeight: 17,
      marginBottom: 14,
    },
    primaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.text,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      marginBottom: 8,
    },
    primaryButtonText: {
      color: theme.colors.background || '#000000',
      fontSize: 13,
      fontWeight: '700',
    },
    secondaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surfaceElevated || 'rgba(255, 255, 255, 0.03)',
      borderWidth: 1,
      borderColor: theme.colors.borderFaint || 'rgba(255, 255, 255, 0.08)',
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 12,
      marginBottom: 12,
    },
    secondaryButtonText: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      fontWeight: '600',
    },
    footerNote: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: theme.colors.borderFaint || 'rgba(255, 255, 255, 0.06)',
    },
    footerText: {
      fontSize: 10.5,
      color: theme.colors.textTertiary,
      fontWeight: '500',
    },
  });

