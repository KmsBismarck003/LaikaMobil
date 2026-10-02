import React, { useState } from 'react';
import { View, StyleSheet, Linking, Alert } from 'react-native';
import { Typography } from '../../../components/ui/Typography';
import { Button } from '../../../components/ui/Button';
import { useAppTheme } from '../../../styles/ThemeProvider';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export const FeedbackSection: React.FC = () => {
  const { theme } = useAppTheme();
  const [feedbackGiven, setFeedbackGiven] = useState<'yes' | 'no' | null>(null);

  const handleContactSupport = async () => {
    const email = 'redjar481@gmail.com';
    const subject = 'Soporte LaikaMobil';
    const body = `Hola, equipo de Laika Club.\n\nNecesito ayuda con:\n[Describe aquí tu problema]\n\nPantalla o funcionalidad relacionada:\n[Indica dónde ocurre]\n\nInformación adicional:\n\n\nGracias.`;

    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    try {
      const canOpen = await Linking.canOpenURL(mailtoUrl);
      if (canOpen) {
        await Linking.openURL(mailtoUrl);
      } else {
        Alert.alert("No se puede abrir el correo", `Tu dispositivo no tiene una app configurada.\nPor favor escribe a:\n${email}`);
      }
    } catch (error) {
      Alert.alert("Error", `Ocurrió un error.\nEscríbenos directamente a:\n${email}`);
    }
  };

  return (
    <View style={styles.container}>
      {/* Tarjeta de Feedback con efecto glass */}
      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        {!feedbackGiven ? (
          <>
            <Typography variant="headline" color={theme.colors.text} align="center" style={styles.title}>
              ¿Encontraste lo que buscabas?
            </Typography>
            <View style={styles.feedbackButtons}>
              <Button 
                title="Sí, me ayudó" 
                variant="outline" 
                size="medium"
                onPress={() => setFeedbackGiven('yes')}
                style={styles.buttonHalf}
                leftIcon={<Feather name="thumbs-up" size={16} color={theme.colors.text} />}
              />
              <Button 
                title="No, necesito ayuda" 
                variant="outline" 
                size="medium"
                onPress={() => setFeedbackGiven('no')}
                style={styles.buttonHalf}
                leftIcon={<Feather name="thumbs-down" size={16} color={theme.colors.text} />}
              />
            </View>
          </>
        ) : (
          <View style={styles.thanksContainer}>
            <View style={[styles.thanksIconWrapper, { backgroundColor: feedbackGiven === 'yes' ? theme.colors.successFaint : theme.colors.primaryFaint }]}>
              <Feather 
                name={feedbackGiven === 'yes' ? "check" : "message-circle"} 
                size={24} 
                color={feedbackGiven === 'yes' ? theme.colors.success : theme.colors.primary} 
              />
            </View>
            <Typography variant="subheadline" color={theme.colors.text} align="center" style={{ marginTop: 16 }}>
              {feedbackGiven === 'yes' 
                ? "¡Nos alegra haberte ayudado!\nGracias por utilizar LaikaMobil." 
                : "Lamentamos no haber resuelto tu duda.\nPor favor contáctanos."}
            </Typography>
          </View>
        )}
      </View>

      {/* Tarjeta de Contacto Premium */}
      <LinearGradient
        colors={[theme.colors.primaryDark, theme.colors.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.contactCard}
      >
        <View style={styles.contactIcon}>
          <Feather name="life-buoy" size={24} color={theme.colors.primaryDark} />
        </View>
        <Typography variant="headline" color={theme.colors.white} style={styles.contactTitle} align="center">
          ¿Necesitas ayuda personalizada?
        </Typography>
        <Typography variant="body" color={'rgba(255,255,255,0.8)'} align="center" style={styles.contactDesc}>
          Si no encontraste lo que buscabas, cuéntanos qué sucede y te ayudaremos directamente.
        </Typography>
        <Button 
          title="Envíanos tu mensaje" 
          variant="secondary" 
          size="large"
          onPress={handleContactSupport}
          leftIcon={<Feather name="mail" size={18} color={theme.colors.primaryDark} />}
          style={{ width: '100%', marginTop: 16, backgroundColor: theme.colors.white }}
        />
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    marginBottom: 40,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
  },
  title: {
    marginBottom: 24,
    letterSpacing: -0.5,
  },
  feedbackButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  buttonHalf: {
    flex: 1,
    borderRadius: 12,
  },
  thanksContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  thanksIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactCard: {
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
  },
  contactIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  contactTitle: {
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  contactDesc: {
    marginBottom: 16,
    paddingHorizontal: 8,
    lineHeight: 22,
  }
});
