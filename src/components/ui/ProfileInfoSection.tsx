/**
 * Componente ProfileInfoSection — LaikaMobil
 * Sección de información personal del usuario en la pantalla de perfil.
 * Muestra los datos reales del usuario de forma ordenada y elegante.
 *
 * Responsabilidades: solo presentación de datos del usuario.
 * Sin lógica de autenticación ni navegación.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../../styles/ThemeProvider';
import { Typography } from './Typography';
import { Card } from './Card';
import { useStyles } from '../../styles/useStyles';

interface ProfileInfoSectionProps {
  user: any;
}

interface InfoRowProps {
  icon: string;
  label: string;
  value: string;
  isLast?: boolean;
}

/**
 * Sub-componente: fila individual de información.
 */
const InfoRow: React.FC<InfoRowProps> = ({ icon, label, value, isLast = false }) => {
  const rowStyles = useStyles(createRowStyles);
  const { theme } = useAppTheme();
  
  return (
    <View style={[rowStyles.container, !isLast && rowStyles.divider]}>
      <View style={rowStyles.iconBox}>
        <Feather name={icon as any} size={15} color={theme.colors.primary} />
      </View>
      <View style={rowStyles.content}>
        <Typography variant="overline" color={theme.colors.textTertiary} style={rowStyles.label}>
          {label}
        </Typography>
        <Typography variant="subheadline" color={theme.colors.text} style={rowStyles.value}>
          {value}
        </Typography>
      </View>
    </View>
  );
};

const createRowStyles = (theme: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.m,
    gap: theme.spacing.m,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderFaint,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.m,
    backgroundColor: theme.colors.primaryFaint,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primaryGlow,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: 9,
    letterSpacing: 1,
  },
  value: {
    fontSize: 15,
  },
});

// ─── Componente principal ────────────────────────────────────────────────────

export const ProfileInfoSection: React.FC<ProfileInfoSectionProps> = ({ user }) => {
  const styles = useStyles(createStyles);
  const { theme } = useAppTheme();
  if (!user) return null;

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Desconocida';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const fullName = [user.firstName || user.name, user.lastName]
    .filter(Boolean)
    .join(' ') || 'No especificado';

  return (
    <Card style={styles.card} elevation="raised" padding="medium">
      <View style={styles.sectionHeader}>
        <Typography variant="overline" color={theme.colors.textSecondary} style={styles.sectionLabel}>
          INFORMACIÓN PERSONAL
        </Typography>
      </View>

      <InfoRow
        icon="user"
        label="NOMBRE COMPLETO"
        value={fullName}
      />
      <InfoRow
        icon="mail"
        label="CORREO ELECTRÓNICO"
        value={user.email || 'No especificado'}
      />
      <InfoRow
        icon="calendar"
        label="MIEMBRO DESDE"
        value={formatDate(user.createdAt)}
      />
      <InfoRow
        icon="shield"
        label="ESTADO DE CUENTA"
        value={(user.status || 'Activa').toString()}
        isLast
      />
    </Card>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  card: {
    marginHorizontal: theme.spacing.l,
    marginVertical: theme.spacing.s,
    paddingBottom: theme.spacing.xs,
  },
  sectionHeader: {
    paddingBottom: theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderFaint,
    marginBottom: theme.spacing.xs,
  },
  sectionLabel: {
    letterSpacing: 1.5,
    fontSize: 10,
  },
});
