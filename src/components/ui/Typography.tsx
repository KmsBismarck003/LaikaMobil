/**
 * Componente Typography — LaikaMobil
 * Texto tipográfico reutilizable alineado al design system.
 * Soporta todas las variantes del tema, color y alineación personalizados.
 */

import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useAppTheme } from '../../styles/ThemeProvider';
import { useAccessibility } from '../../funciones/accesibilidad/useAccessibility';

export type TypographyVariant =
  | 'display'
  | 'headline'
  | 'header'
  | 'title'
  | 'subheadline'
  | 'body'
  | 'caption'
  | 'footnote'
  | 'overline';

export interface TypographyProps extends TextProps {
  variant?: TypographyVariant;
  color?: string;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  weight?: '400' | '500' | '600' | '700' | 'bold';
}

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  color,
  align,
  weight,
  style,
  children,
  ...props
}) => {
  const { theme } = useAppTheme();
  const { textScale } = useAccessibility();
  const baseStyle = theme.typography[variant] ?? theme.typography.body;

  const dynamicFontSize = baseStyle.fontSize ? Math.round(baseStyle.fontSize * textScale) : undefined;
  const dynamicLineHeight = baseStyle.lineHeight ? Math.round(baseStyle.lineHeight * textScale) : undefined;

  return (
    <Text
      style={[
        baseStyle,
        dynamicFontSize ? { fontSize: dynamicFontSize } : null,
        dynamicLineHeight ? { lineHeight: dynamicLineHeight } : null,
        color   && { color },
        align   && { textAlign: align },
        weight  && { fontWeight: weight },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};
