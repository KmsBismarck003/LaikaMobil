import { useState } from 'react';
import { Alert } from 'react-native';
import { UserService } from '../services/UserService';
import { getCurrentUser, getCurrentToken, logout } from '../store/AuthStore';

export const useDeleteAccount = () => {
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDeleteAccount = () => {
    Alert.alert(
      'Eliminar Cuenta',
      '¿Estás seguro de que deseas eliminar tu cuenta? Esta acción es irreversible.\n\nPerderás todos tus boletos, historial de compras, logros y cualquier otra información asociada a tu perfil. No hay forma de recuperarlos una vez eliminada.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sí, eliminar cuenta y perder todo', 
          style: 'destructive',
          onPress: handleDeleteAccount
        }
      ],
      { cancelable: true }
    );
  };

  const handleDeleteAccount = async () => {
    const user = getCurrentUser();
    const token = getCurrentToken();

    if (!user || (!user.id && !user._id) || !token) {
      Alert.alert('Error', 'No se encontró la información de la sesión.');
      return;
    }

    const userId = user.id || user._id;

    setIsDeleting(true);
    try {
      await UserService.deleteAccount(userId.toString(), token);
      await logout();
      Alert.alert('Cuenta Eliminada', 'Tu cuenta y todos tus datos han sido eliminados permanentemente.');
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.response?.data?.detail || error.message || 'Ocurrió un error al intentar eliminar la cuenta. Por favor, intenta de nuevo más tarde.';
      Alert.alert('Error al eliminar cuenta', message);
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    confirmDeleteAccount,
    isDeleting
  };
};
