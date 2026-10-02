import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useAppTheme } from '../styles/ThemeProvider';
import { useStyles } from '../styles/useStyles';

interface AuthPromptModalProps {
  visible: boolean;
  onClose: () => void;
  onLoginPress: () => void;
  onRegisterPress: () => void;
}

/**
 * AuthPromptModal
 * Componente aislado (SOLID) para manejar la invitación al registro/login
 * sin saturar la vista principal de Detalles del Evento.
 */
export const AuthPromptModal: React.FC<AuthPromptModalProps> = ({
  visible,
  onClose,
  onLoginPress,
  onRegisterPress,
}) => {
  const styles = useStyles(createStyles);
  const { theme } = useAppTheme();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>¡Estás a unos pasos!</Text>
          <Text style={styles.modalDesc}>
            De ser parte de este gran viaje. Ya casi tienes tus boletos, solo faltas tú.
          </Text>
          
          <TouchableOpacity 
            style={styles.modalLoginButton} 
            activeOpacity={0.8}
            onPress={onLoginPress}
          >
            <Text style={styles.modalLoginText}>Iniciar Sesión</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.modalRegisterButton} 
            activeOpacity={0.8}
            onPress={onRegisterPress}
          >
            <Text style={styles.modalRegisterText}>Crear una Cuenta</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.modalCancelButton}
            onPress={onClose}
          >
            <Text style={styles.modalCancelText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlayDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalTitle: {
    ...theme.typography.title,
    fontSize: 22,
    marginBottom: theme.spacing.s,
    textAlign: 'center',
    color: theme.colors.text,
  },
  modalDesc: {
    ...theme.typography.body,
    fontSize: 15,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  modalLoginButton: {
    width: '100%',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  modalLoginText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalRegisterButton: {
    width: '100%',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary,
    paddingVertical: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    alignItems: 'center',
    marginBottom: theme.spacing.l,
  },
  modalRegisterText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalCancelButton: {
    padding: theme.spacing.s,
  },
  modalCancelText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  }
});
