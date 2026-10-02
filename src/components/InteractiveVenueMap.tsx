import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity } from 'react-native';
import Svg, { G, Circle, Rect, Text as SvgText, TSpan } from 'react-native-svg';
import { useAppTheme } from '../styles/ThemeProvider';
import { useStyles } from '../styles/useStyles';

interface InteractiveVenueMapProps {
  mapData: any[];
  busySeats?: string[];
  onSeatSelect?: (seatId: string) => void;
}

const SEAT_R = 10.5;

const SEAT_COLORS: any = {
  normal: { base: '#2a2a2a', stroke: '#555', hover: '#3f3f46', busy: '#450a0a', busyStroke: '#7f1d1d' },
  vip: { base: '#2a2a2a', stroke: '#ffffff', hover: '#3f3f46', busy: '#450a0a', busyStroke: '#7f1d1d' },
  accessible: { base: '#0f2027', stroke: '#06b6d4', hover: '#164e63', busy: '#450a0a', busyStroke: '#7f1d1d' },
};

const TYPE_ICON: any = { vip: '★', accessible: '♿' };
const ELEM_LABELS: any = { stage: '🎸 ESCENARIO', screen: '🖥 PANTALLA', aisle: 'PASILLO', ga: 'GENERAL' };

const { width } = Dimensions.get('window');

export const InteractiveVenueMap: React.FC<InteractiveVenueMapProps> = ({ mapData, busySeats = [], onSeatSelect }) => {
  const styles = useStyles(createStyles);
  const { theme } = useAppTheme();
  const [selectedSeatIds, setSelectedSeatIds] = useState<Set<string>>(new Set());

  const handleSeatPress = (seatId: string) => {
    const newSet = new Set(selectedSeatIds);
    if (newSet.has(seatId)) {
      newSet.delete(seatId);
    } else {
      newSet.add(seatId);
    }
    setSelectedSeatIds(newSet);
    if (onSeatSelect) onSeatSelect(seatId);
  };

  const viewBoxStr = useMemo(() => {
    if (!mapData || mapData.length === 0) return '0 0 100 100';
    let allX: number[] = [];
    let allY: number[] = [];

    mapData.forEach(c => {
      if (c.type === 'seats') {
        c.blocks?.forEach((b: any) => b.seats?.forEach((s: any) => { 
          allX.push(s.x); 
          allY.push(s.y); 
        }));
      } else {
        allX.push(c.x, c.x + (c.width || 120));
        allY.push(c.y, c.y + (c.height || 40));
      }
    });

    if (allX.length === 0) return '0 0 100 100';

    const minX = Math.min(...allX) - 40;
    const minY = Math.min(...allY) - 40;
    const maxX = Math.max(...allX) + 40;
    const maxY = Math.max(...allY) + 40;
    
    const w = maxX - minX;
    const h = maxY - minY;

    return `${minX} ${minY} ${w} ${h}`;
  }, [mapData]);

  if (!mapData || mapData.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Sin mapa configurado</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.legendRow}>
          <View style={[styles.legendBox, { backgroundColor: '#3B82F6' }]} />
          <Text style={styles.legendText}>Seleccionado</Text>
          
          <View style={[styles.legendBox, { backgroundColor: '#2a2a2a', borderColor: '#555', borderWidth: 1 }]} />
          <Text style={styles.legendText}>Disponible</Text>

          <View style={[styles.legendBox, { backgroundColor: '#450a0a', borderColor: '#7f1d1d', borderWidth: 1 }]} />
          <Text style={styles.legendText}>Ocupado</Text>
        </View>
      </View>

      <View style={styles.svgContainer}>
        {/* El viewBox y width/height 100% hacen que el SVG escale para ajustarse automáticamente al espacio */}
        <Svg width="100%" height="100%" viewBox={viewBoxStr}>
          {mapData.map((comp) => {
            const cx = comp.x + (comp.width || 0) / 2;
            const cy = comp.y + (comp.height || 0) / 2;
            const rotation = comp.rotation || 0;

            if (comp.type === 'seats') {
              return (
                <G key={comp.id} rotation={rotation} originX={cx} originY={cy}>
                  {comp.blocks?.map((block: any) => (
                    <G key={block.id}>
                      {block.seats[0] && (
                        <SvgText
                          x={block.seats[0].x - 16}
                          y={block.seats[0].y + 4}
                          fontSize={8}
                          fill="rgba(255,255,255,0.3)"
                          fontWeight={800}
                          textAnchor="middle"
                        >
                          <TSpan>{block.rowLabel}</TSpan>
                        </SvgText>
                      )}
                      
                      {block.seats.map((seat: any, index: number) => {
                        const seatIdStr = String(seat.id || `${seat.rowLabel || 'A'}-${seat.number || index}`);
                        const isSelected = selectedSeatIds.has(seatIdStr);
                        const isBusy = busySeats.includes(seatIdStr);
                        const colors = SEAT_COLORS[seat.type] || SEAT_COLORS.normal;
                        
                        let fill = colors.base;
                        let stroke = colors.stroke;
                        let strokeW = 1;
                        
                        if (isBusy) {
                          fill = colors.busy;
                          stroke = colors.busyStroke;
                        } else if (isSelected) {
                          fill = '#3B82F6';
                          stroke = '#60a5fa';
                          strokeW = 2.5;
                        }

                        return (
                          <G key={seatIdStr} onPress={() => !isBusy && handleSeatPress(seatIdStr)}>
                            <Circle
                              cx={seat.x}
                              cy={seat.y}
                              r={SEAT_R}
                              fill={fill}
                              stroke={stroke}
                              strokeWidth={strokeW}
                            />
                            {seat.type && seat.type !== 'normal' && (
                              <SvgText
                                x={seat.x}
                                y={seat.y + 3.5}
                                textAnchor="middle"
                                fontSize={7}
                                fill={isSelected ? '#fff' : stroke}
                                fontWeight={900}
                              >
                                <TSpan>{TYPE_ICON[seat.type] || ''}</TSpan>
                              </SvgText>
                            )}
                          </G>
                        );
                      })}
                    </G>
                  ))}
                </G>
              );
            }

            // Escenario o no-asientos
            return (
              <G key={comp.id} rotation={rotation} originX={cx} originY={cy}>
                <Rect
                  x={comp.x}
                  y={comp.y}
                  width={comp.width || 120}
                  height={comp.height || 40}
                  rx={8}
                  fill={comp.color || '#1e293b'}
                  stroke="rgba(255,255,255,0.12)"
                  strokeWidth={1.5}
                />
                <SvgText
                  x={cx}
                  y={cy + 4}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight={900}
                  fill="#ffffff"
                >
                  <TSpan>{ELEM_LABELS[comp.type] || comp.name}</TSpan>
                </SvgText>
              </G>
            );
          })}
        </Svg>
      </View>
      <View style={styles.hintContainer}>
        <Text style={styles.hintText}>Toca un asiento para seleccionarlo</Text>
      </View>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    backgroundColor: '#080808',
    borderRadius: theme.borderRadius.m,
    marginBottom: theme.spacing.l,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  header: {
    padding: theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    backgroundColor: '#111',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendBox: {
    width: 14,
    height: 14,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    color: '#CCC',
    fontSize: 12,
    marginRight: 16,
  },
  svgContainer: {
    width: '100%',
    height: 350, 
    backgroundColor: '#080808',
  },
  emptyContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.m,
    marginBottom: theme.spacing.l,
  },
  emptyText: {
    color: theme.colors.textSecondary,
  },
  hintContainer: {
    padding: theme.spacing.s,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
  },
  hintText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontStyle: 'italic',
  }
});
