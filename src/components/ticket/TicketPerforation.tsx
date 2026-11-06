import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { useAppTheme } from '../../styles/ThemeProvider';
import { useStyles } from '../../styles/useStyles';

export const TicketPerforation: React.FC = () => {
  const styles = useStyles(createStyles);
  const { theme } = useAppTheme();

  return (
    <View style={styles.container}>
      {/* Muesca lateral izquierda */}
      <View style={styles.cutoutLeft} />

      {/* Línea de perforación vectorial punteada */}
      <View style={styles.lineContainer}>
        <Svg height="2" width="100%">
          <Line
            x1="0"
            y1="1"
            x2="100%"
            y2="1"
            stroke={theme.colors.borderMedium || 'rgba(255, 255, 255, 0.16)'}
            strokeWidth="1.5"
            strokeDasharray="6, 6"
          />
        </Svg>
      </View>

      {/* Muesca lateral derecha */}
      <View style={styles.cutoutRight} />
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      height: 32,
      position: 'relative',
      marginHorizontal: 0,
      zIndex: 2,
    },
    cutoutLeft: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: theme.colors.background,
      position: 'absolute',
      left: -13,
      shadowColor: '#000000',
      shadowOffset: { width: 1, height: 0 },
      shadowOpacity: 0.15,
      shadowRadius: 2,
      elevation: 2,
    },
    cutoutRight: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: theme.colors.background,
      position: 'absolute',
      right: -13,
      shadowColor: '#000000',
      shadowOffset: { width: -1, height: 0 },
      shadowOpacity: 0.15,
      shadowRadius: 2,
      elevation: 2,
    },
    lineContainer: {
      flex: 1,
      height: 2,
      marginHorizontal: 22,
      justifyContent: 'center',
    },
  });

