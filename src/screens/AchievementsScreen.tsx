import React from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../styles/ThemeProvider';
import { Typography } from '../components/ui/Typography';
import { useStyles } from '../styles/useStyles';
import { useAchievements, TIER_DATA } from '../hooks/useAchievements';
import * as Clipboard from 'expo-clipboard';

export const AchievementsScreen: React.FC = () => {
  const styles = useStyles(createStyles);
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { coupons, totalPoints, tier, nextTier, loading, error } = useAchievements();

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Feather name="alert-circle" size={48} color={theme.colors.error} />
        <Typography variant="headline" color={theme.colors.text} style={{ marginTop: 16 }}>
          Oops!
        </Typography>
        <Typography variant="body" color={theme.colors.textSecondary} align="center">
          {error}
        </Typography>
      </View>
    );
  }

  const ptsToNext = nextTier ? nextTier.pts - totalPoints : 0;
  const phases = ['GANCHO', 'RETENCIÓN', 'FIDELIZACIÓN', 'LEYENDA'];

  const copyToClipboard = async (code: string) => {
    await Clipboard.setStringAsync(code);
    alert('¡Código copiado!');
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* HERO SECTION */}
        <View style={styles.heroSection}>
          <View style={[styles.rankBadge, { borderColor: tier.color }]}>
            <Feather name={tier.icon as any} size={32} color={tier.color} />
          </View>
          <Typography variant="display" color={theme.colors.text} style={styles.rankTitle}>
            {tier.label}
          </Typography>
          <Typography variant="subheadline" color={theme.colors.textSecondary}>
            {totalPoints} XP Acumulados
          </Typography>
          
          {nextTier && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${(totalPoints / nextTier.pts) * 100}%`, backgroundColor: tier.color }]} />
              </View>
              <Typography variant="footnote" color={theme.colors.textTertiary} align="right" style={{ marginTop: 8 }}>
                Faltan {ptsToNext} XP para {nextTier.label}
              </Typography>
            </View>
          )}
        </View>

        {/* LOGROS (TIERS) POR FASE */}
        <View style={styles.contentPadding}>
          {phases.map((phaseName, phaseIdx) => {
            const phaseTiers = TIER_DATA.filter(t => t.phase === phaseName);
            const phaseProgress = phaseTiers.filter(t => totalPoints >= t.pts).length;
            const totalInPhase = phaseTiers.length;
            if (totalInPhase === 0) return null;

            return (
              <View key={phaseName} style={styles.phaseSection}>
                <View style={styles.phaseHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Typography variant="headline" color={theme.colors.textTertiary} style={{ opacity: 0.5 }}>
                      0{phaseIdx + 1}
                    </Typography>
                    <Typography variant="headline" color={theme.colors.text} style={{ letterSpacing: 1 }}>
                      {phaseName}
                    </Typography>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                     <Typography variant="caption" color={theme.colors.text}>
                        {phaseProgress}/{totalInPhase}
                     </Typography>
                     <View style={[styles.progressBarBg, { width: 60, height: 4 }]}>
                        <View style={[styles.progressBarFill, { width: `${(phaseProgress/totalInPhase)*100}%`, backgroundColor: theme.colors.text }]} />
                     </View>
                  </View>
                </View>

                <View style={styles.list}>
                  {phaseTiers.map((t) => {
                    const isUnlocked = totalPoints >= t.pts;
                    const tierProgress = t.pts === 0 ? 100 : Math.min(100, (totalPoints / t.pts) * 100);
                    
                    return (
                      <View key={t.tier} style={[styles.achievementCard, isUnlocked ? { borderColor: t.color } : {}]}>
                        {!isUnlocked && (
                          <View style={styles.lockOverlay}>
                            <Feather name="lock" size={14} color={theme.colors.textTertiary} />
                          </View>
                        )}
                        
                        <View style={{ alignItems: 'center', minWidth: 60 }}>
                          <View style={[styles.iconBox, { backgroundColor: isUnlocked ? `${t.color}20` : theme.colors.surfaceHighlight }]}>
                            <Feather name={t.icon as any} size={24} color={isUnlocked ? t.color : theme.colors.textTertiary} />
                          </View>
                          <Typography variant="overline" color={isUnlocked ? t.color : theme.colors.textTertiary} style={{ marginTop: 4 }}>
                            NIVEL {t.tier}
                          </Typography>
                        </View>

                        <View style={styles.achievementInfo}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 4 }}>
                            <Typography variant="subheadline" color={theme.colors.text}>
                              {t.label}
                            </Typography>
                            <Typography variant="footnote" color={isUnlocked ? t.color : theme.colors.textSecondary}>
                              {Math.floor(tierProgress)}%
                            </Typography>
                          </View>
                          
                          <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { 
                              width: `${tierProgress}%`, 
                              backgroundColor: tierProgress > 0 ? t.color : 'transparent' 
                            }]} />
                          </View>

                          <Typography variant="footnote" color={theme.colors.textSecondary} style={{ marginTop: 8 }}>
                            {t.pts === 0 
                              ? 'Desbloqueado al registrarte en LAIKA.' 
                              : `Necesitas ir o asistir a ${t.pts / 100} eventos.`}
                          </Typography>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>

        {/* BENEFICIOS Y CUPONES */}
        <View style={[styles.contentPadding, { marginTop: 24 }]}>
          <Typography variant="display" color={theme.colors.text} style={{ fontSize: 24, marginBottom: 16 }}>
            Tus Beneficios
          </Typography>
          
          <View style={styles.list}>
            {/* Beneficios de Tiers Desbloqueados */}
            {TIER_DATA.filter(t => totalPoints >= t.pts && t.reward).map((t, i) => (
              <View key={`tier-reward-${i}`} style={[styles.couponCard, { borderColor: t.color }]}>
                <View style={[styles.couponMain, { borderBottomColor: theme.colors.borderFaint }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <View style={{ backgroundColor: `${t.color}20`, padding: 6, borderRadius: 8 }}>
                      <Feather name={t.icon as any} size={16} color={t.color} />
                    </View>
                    <Typography variant="overline" color={t.color}>
                      RECOMPENSA DE NIVEL {t.tier}
                    </Typography>
                  </View>
                  <Typography variant="headline" color={theme.colors.text} style={{ marginBottom: 4 }}>
                    {t.reward}
                  </Typography>
                  <Typography variant="footnote" color={theme.colors.textSecondary}>
                    Obtenido por alcanzar el rango {t.label}
                  </Typography>
                </View>
                <View style={styles.couponFooter}>
                  <Typography variant="caption" color={t.color} style={{ fontWeight: '700' }}>
                    ✓ BENEFICIO ACTIVO
                  </Typography>
                  <View style={styles.permanentBadge}>
                    <Typography variant="overline" color={theme.colors.background}>PERMANENTE</Typography>
                  </View>
                </View>
              </View>
            ))}

            {/* Cupones de API */}
            {coupons.map((c, i) => (
              <View key={`coupon-${i}`} style={styles.couponCard}>
                <View style={[styles.couponMain, { borderBottomColor: theme.colors.borderFaint }]}>
                  <Typography variant="subheadline" color={theme.colors.text} style={{ marginBottom: 8 }}>
                    {c.description || 'CUPÓN ESPECIAL'}
                  </Typography>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="display" color={theme.colors.text} style={{ fontSize: 24, letterSpacing: 2 }}>
                      {c.code}
                    </Typography>
                    <TouchableOpacity onPress={() => copyToClipboard(c.code)} style={styles.copyBtn}>
                      <Feather name="copy" size={16} color={theme.colors.background} />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.couponFooter}>
                  <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontWeight: '700' }}>
                    {c.expires_at ? `EXPIRA: ${new Date(c.expires_at).toLocaleDateString()}` : 'CUPÓN PERMANENTE'}
                  </Typography>
                  <View style={styles.permanentBadge}>
                    <Typography variant="overline" color={theme.colors.background}>DISPONIBLE</Typography>
                  </View>
                </View>
              </View>
            ))}

            {TIER_DATA.filter(t => totalPoints >= t.pts && t.reward).length === 0 && coupons.length === 0 && (
              <View style={styles.emptyCoupons}>
                <Feather name="gift" size={40} color={theme.colors.textTertiary} style={{ marginBottom: 16 }} />
                <Typography variant="subheadline" color={theme.colors.text} align="center">
                  Aún no tienes beneficios o cupones activos.
                </Typography>
                <Typography variant="footnote" color={theme.colors.textSecondary} align="center" style={{ marginTop: 4 }}>
                  ¡Sigue asistiendo a eventos para desbloquear recompensas cósmicas!
                </Typography>
              </View>
            )}
          </View>
        </View>

      </ScrollView>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  scrollContent: {
    paddingVertical: theme.spacing.l,
  },
  heroSection: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderFaint,
    marginBottom: theme.spacing.l,
  },
  rankBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.surfaceHighlight,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.m,
  },
  rankTitle: {
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    marginTop: theme.spacing.l,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: theme.colors.surfaceHighlight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  contentPadding: {
    paddingHorizontal: theme.spacing.l,
  },
  phaseSection: {
    marginBottom: theme.spacing.xl,
  },
  phaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
    paddingBottom: theme.spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderFaint,
  },
  list: {
    gap: theme.spacing.m,
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.m,
    borderWidth: 1,
    borderColor: theme.colors.borderFaint,
    alignItems: 'center',
  },
  lockOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  achievementInfo: {
    flex: 1,
    marginLeft: theme.spacing.m,
  },
  couponCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.l,
    borderWidth: 1,
    borderColor: theme.colors.borderMedium,
    overflow: 'hidden',
  },
  couponMain: {
    padding: theme.spacing.m,
    borderBottomWidth: 1,
  },
  couponFooter: {
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceHighlight,
  },
  permanentBadge: {
    backgroundColor: theme.colors.text,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  copyBtn: {
    width: 40,
    height: 40,
    backgroundColor: theme.colors.text,
    borderRadius: theme.borderRadius.s,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCoupons: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.l,
    borderWidth: 1,
    borderColor: theme.colors.borderFaint,
    borderStyle: 'dashed',
  }
});
