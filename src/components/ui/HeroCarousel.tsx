/**
 * Componente HeroCarousel — LaikaMobil
 * Carrusel principal de eventos destacados en la pantalla de inicio.
 * Implementa un FlatList horizontal real con auto-scroll, paginación
 * y overlay de gradiente para máxima legibilidad del contenido.
 *
 * Separado en sub-componentes:
 *  - HeroSlide: renderiza un slide individual
 *  - PaginationDots: renderiza los indicadores de posición
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
  NativeScrollEvent,
  Animated,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Typography } from './Typography';
import { useAppTheme } from '../../styles/ThemeProvider';
import { Event } from '../../services/EventService';
import { parseDateParts, getCategoryColor } from '../../styles/designUtils';
import { useStyles } from '../../styles/useStyles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDE_HEIGHT = 440;
const AUTO_SCROLL_INTERVAL = 5000;

// ─── Sub-componente: indicadores de paginación ──────────────────────────────

interface PaginationDotsProps {
  count: number;
  activeIndex: number;
}

const PaginationDots: React.FC<PaginationDotsProps> = ({ count, activeIndex }) => {
  const dotsStyles = useStyles(createDotsStyles);
  return (
    <View style={dotsStyles.row}>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={[
            dotsStyles.dot,
            i === activeIndex ? dotsStyles.dotActive : dotsStyles.dotInactive,
          ]}
        />
      ))}
    </View>
  );
};

const createDotsStyles = (theme: any) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 3,
    borderRadius: 2,
  },
  dotActive: {
    width: 20,
    backgroundColor: theme.colors.white,
  },
  dotInactive: {
    width: 6,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
});

// ─── Sub-componente: slide individual ───────────────────────────────────────

interface HeroSlideProps {
  event: Event;
  index: number;
  total: number;
  onPress: (event: Event) => void;
}

const HeroSlide: React.FC<HeroSlideProps> = ({ event, index, total, onPress }) => {
  const slideStyles = useStyles(createSlideStyles);
  const { theme } = useAppTheme();
  const { day, month, weekday } = parseDateParts(event.date);

  const dateLocationStr = `${weekday ? weekday.toUpperCase() + ' ' : ''}${day} ${month ? month.toUpperCase() : ''} - ${(event.location || '').toUpperCase()}`;

  return (
    <TouchableOpacity
      activeOpacity={0.95}
      style={slideStyles.container}
      onPress={() => onPress(event)}
    >
      <View style={slideStyles.imageContainer}>
        <ImageBackground
          source={{ uri: event.imageUrl }}
          style={slideStyles.image}
          imageStyle={slideStyles.imageStyle}
        >
          <LinearGradient
            colors={['transparent', 'rgba(10,10,15,0.6)', 'rgba(10,10,15,1)']}
            locations={[0, 0.4, 1]}
            style={slideStyles.gradientBottom}
          />

          <View style={slideStyles.content}>
            <View style={slideStyles.infoWrapper}>
              <Typography variant="overline" color="rgba(255,255,255,0.8)" align="center" style={slideStyles.topText}>
                {dateLocationStr}
              </Typography>
              
              <Typography
                variant="display"
                color={theme.colors.white}
                align="center"
                style={slideStyles.title}
                numberOfLines={2}
              >
                {event.title.toUpperCase()}
              </Typography>

              <View style={slideStyles.ctaRow}>
                <TouchableOpacity
                  style={slideStyles.ctaButton}
                  onPress={() => onPress(event)}
                  activeOpacity={0.85}
                >
                  <Typography variant="footnote" weight="bold" color={theme.colors.white}>
                    {event.minPrice && event.minPrice > 0 ? `Comprar Boletos desde $${event.minPrice}` : 'Ver detalles'}
                  </Typography>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ImageBackground>
      </View>
    </TouchableOpacity>
  );
};

const createSlideStyles = (theme: any) => StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SLIDE_HEIGHT,
    paddingHorizontal: theme.spacing.m, // Add padding so it doesn't touch edges
  },
  imageContainer: {
    flex: 1,
    borderRadius: theme.borderRadius.xl, // 24ish
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageStyle: {
    resizeMode: 'cover',
  },
  gradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  content: {
    flex: 1,
    padding: theme.spacing.l,
    justifyContent: 'flex-end',
  },
  infoWrapper: {
    alignItems: 'center',
    gap: theme.spacing.s,
    marginBottom: theme.spacing.l,
  },
  topText: {
    letterSpacing: 0.5,
    fontSize: 10,
    marginBottom: 4,
  },
  title: {
    fontSize: 32,
    lineHeight: 36,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-condensed',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
    marginBottom: theme.spacing.m,
  },
  ctaRow: {
    flexDirection: 'row',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.full,
  },
});

// ─── Componente principal: HeroCarousel ─────────────────────────────────────

interface HeroCarouselProps {
  events: Event[];
  onPressEvent: (event: Event) => void;
  onPressExplore: () => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({
  events,
  onPressEvent,
  onPressExplore,
}) => {
  const styles = useStyles(createStyles);
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const displayEvents = events.slice(0, 5);

  const scrollToIndex = useCallback(
    (index: number) => {
      if (flatListRef.current && displayEvents.length > 0) {
        const safeIndex = Math.min(index, displayEvents.length - 1);
        flatListRef.current.scrollToOffset({
          offset: safeIndex * SCREEN_WIDTH,
          animated: true,
        });
        setActiveIndex(safeIndex);
      }
    },
    [displayEvents.length]
  );

  const startAutoScroll = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (displayEvents.length <= 1) return;
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % displayEvents.length;
        scrollToIndex(next);
        return next;
      });
    }, AUTO_SCROLL_INTERVAL);
  }, [displayEvents.length, scrollToIndex]);

  useEffect(() => {
    startAutoScroll();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startAutoScroll]);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
      if (index !== activeIndex) {
        setActiveIndex(index);
      }
    },
    [activeIndex]
  );

  const handleScrollBeginDrag = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const handleScrollEndDrag = useCallback(() => {
    startAutoScroll();
  }, [startAutoScroll]);

  if (!displayEvents || displayEvents.length === 0) return null;

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={displayEvents}
        horizontal
        pagingEnabled
        snapToAlignment="center"
        snapToInterval={SCREEN_WIDTH}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <HeroSlide
            event={item}
            index={index}
            total={displayEvents.length}
            onPress={onPressEvent}
          />
        )}
        onScroll={handleScroll}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        scrollEventThrottle={16}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
      />

      {/* Indicadores de paginación superpuestos */}
      {displayEvents.length > 1 && (
        <View style={styles.dotsContainer}>
          <PaginationDots count={displayEvents.length} activeIndex={activeIndex} />
        </View>
      )}
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    height: SLIDE_HEIGHT + 24, // extra space for dots below
    backgroundColor: theme.colors.background, // Match app background, not black
    paddingTop: theme.spacing.m,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 0, // place at the bottom of the container, outside the image
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
});
