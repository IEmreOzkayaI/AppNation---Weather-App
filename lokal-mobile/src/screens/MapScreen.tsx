import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Animated,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import { theme } from '../theme';
import { MOCK_VENUES } from '../data/mockData';
import { Venue } from '../types';

/* -- Constants -------------------------------------------------- */

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BOTTOM_SHEET_HEIGHT = 260;
const MAP_GRID_SPACING = 52;
const PIN_SIZE = 42;
const PIN_SIZE_SELECTED = 52;
const LOCATION_DOT_SIZE = 14;
const LOCATION_RING_SIZE = 28;

const FILTER_CHIPS = [
  { label: 'Tumu', key: 'all' },
  { label: 'Kahve', key: 'kahve' },
  { label: 'Bar', key: 'bar' },
  { label: 'Restoran', key: 'restoran' },
  { label: 'Gece Hayati', key: 'gece' },
  { label: 'Brunch', key: 'brunch' },
];

/* -- Pin positions (natural scatter across map) ----------------- */

const PIN_POSITIONS: { venueIndex: number; top: number; left: number }[] = [
  { venueIndex: 0, top: 0.14, left: 0.18 },
  { venueIndex: 1, top: 0.30, left: 0.68 },
  { venueIndex: 2, top: 0.10, left: 0.78 },
  { venueIndex: 3, top: 0.50, left: 0.24 },
  { venueIndex: 4, top: 0.58, left: 0.72 },
  { venueIndex: 5, top: 0.36, left: 0.44 },
  { venueIndex: 6, top: 0.68, left: 0.15 },
  { venueIndex: 7, top: 0.22, left: 0.36 },
];

/* -- Map labels ------------------------------------------------- */

const MAP_LABELS: { text: string; top: string; left: string }[] = [
  { text: 'ISTIKLAL', top: '18%', left: '6%' },
  { text: 'BOGAZICI', top: '46%', left: '48%' },
  { text: 'GALATA KPR.', top: '74%', left: '8%' },
  { text: 'CIHANGIR', top: '28%', left: '58%' },
  { text: 'KARAKOY', top: '62%', left: '52%' },
];

/* -- Helpers ---------------------------------------------------- */

function getInitials(name: string): string {
  const words = name.split(' ');
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

function priceLabel(range: number): string {
  return '₺'.repeat(range);
}

/* -- Pulsing Location Dot --------------------------------------- */

function PulsingLocationDot() {
  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseScale, {
            toValue: 2.2,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseScale, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(pulseOpacity, {
            toValue: 0,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0.35,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [pulseScale, pulseOpacity]);

  return (
    <View style={styles.locationPulseContainer}>
      <Animated.View
        style={[
          styles.locationPulseRing,
          {
            transform: [{ scale: pulseScale }],
            opacity: pulseOpacity,
          },
        ]}
      />
      <View style={styles.locationDotOuter}>
        <View style={styles.locationDotInner} />
      </View>
    </View>
  );
}

/* -- Nearest-venue pulse ring (web only) ------------------------ */

function NearestPulseRing() {
  const ringScale = useRef(new Animated.Value(1)).current;
  const ringOpacity = useRef(new Animated.Value(0.25)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(ringScale, {
            toValue: 1.8,
            duration: 2200,
            useNativeDriver: true,
          }),
          Animated.timing(ringScale, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(ringOpacity, {
            toValue: 0,
            duration: 2200,
            useNativeDriver: true,
          }),
          Animated.timing(ringOpacity, {
            toValue: 0.25,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [ringScale, ringOpacity]);

  return (
    <Animated.View
      style={[
        styles.nearestPulseRing,
        {
          transform: [{ scale: ringScale }],
          opacity: ringOpacity,
        },
      ]}
    />
  );
}

/* -- Premium Map Grid ------------------------------------------- */

function PremiumMapGrid({ width, height }: { width: number; height: number }) {
  const verticalCount = Math.floor(width / MAP_GRID_SPACING);
  const horizontalCount = Math.floor(height / MAP_GRID_SPACING);

  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
      <Defs>
        <LinearGradient id="diag1" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#e8e8e8" stopOpacity="0.3" />
          <Stop offset="0.5" stopColor="#e8e8e8" stopOpacity="0.15" />
          <Stop offset="1" stopColor="#e8e8e8" stopOpacity="0" />
        </LinearGradient>
        <LinearGradient id="diag2" x1="1" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#e8e8e8" stopOpacity="0" />
          <Stop offset="0.5" stopColor="#e8e8e8" stopOpacity="0.15" />
          <Stop offset="1" stopColor="#e8e8e8" stopOpacity="0.3" />
        </LinearGradient>
      </Defs>

      {/* Subtle grid lines */}
      {Array.from({ length: verticalCount + 1 }).map((_, i) => (
        <Line
          key={`v-${i}`}
          x1={i * MAP_GRID_SPACING}
          y1={0}
          x2={i * MAP_GRID_SPACING}
          y2={height}
          stroke="#f0f0f0"
          strokeWidth={0.5}
        />
      ))}
      {Array.from({ length: horizontalCount + 1 }).map((_, i) => (
        <Line
          key={`h-${i}`}
          x1={0}
          y1={i * MAP_GRID_SPACING}
          x2={width}
          y2={i * MAP_GRID_SPACING}
          stroke="#f0f0f0"
          strokeWidth={0.5}
        />
      ))}

      {/* Street-like diagonal lines */}
      <Line
        x1={0}
        y1={height * 0.25}
        x2={width * 0.55}
        y2={0}
        stroke="url(#diag1)"
        strokeWidth={1.5}
      />
      <Line
        x1={width * 0.3}
        y1={height}
        x2={width}
        y2={height * 0.35}
        stroke="url(#diag2)"
        strokeWidth={1.5}
      />
      <Line
        x1={0}
        y1={height * 0.6}
        x2={width * 0.35}
        y2={height * 0.38}
        stroke="#ececec"
        strokeWidth={0.8}
        opacity={0.5}
      />
      <Line
        x1={width * 0.55}
        y1={height * 0.2}
        x2={width}
        y2={height * 0.55}
        stroke="#ececec"
        strokeWidth={0.8}
        opacity={0.5}
      />
      <Line
        x1={width * 0.15}
        y1={height}
        x2={width * 0.65}
        y2={height * 0.55}
        stroke="#ececec"
        strokeWidth={0.6}
        opacity={0.35}
      />

      {/* Subtle water/park area block */}
      <Rect
        x={width * 0.7}
        y={height * 0.75}
        width={width * 0.25}
        height={height * 0.2}
        rx={4}
        fill="#f4f7fa"
        opacity={0.6}
      />
      <Rect
        x={width * 0.02}
        y={height * 0.82}
        width={width * 0.18}
        height={height * 0.12}
        rx={4}
        fill="#f4f7fa"
        opacity={0.4}
      />
    </Svg>
  );
}

/* -- Venue Pin -------------------------------------------------- */

function VenuePin({
  venue,
  top,
  left,
  isSelected,
  isNearest,
  onPress,
}: {
  venue: Venue;
  top: number;
  left: number;
  isSelected: boolean;
  isNearest: boolean;
  onPress: () => void;
}) {
  const size = isSelected ? PIN_SIZE_SELECTED : PIN_SIZE;
  const shadowSize = size + 4;

  return (
    <TouchableOpacity
      style={[
        styles.pinTouchable,
        {
          top,
          left,
          marginLeft: -(size / 2),
          marginTop: -(size / 2),
          width: size + 8,
          height: size + 8,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Web-only pulse ring for nearest venue */}
      {isNearest && Platform.OS === 'web' && (
        <View style={[styles.nearestPulseWrapper, { width: size + 20, height: size + 20 }]}>
          <NearestPulseRing />
        </View>
      )}
      {/* Shadow circle behind */}
      <View
        style={[
          styles.pinShadow,
          {
            width: shadowSize,
            height: shadowSize,
            borderRadius: shadowSize / 2,
          },
        ]}
      />
      {/* Main pin circle */}
      <View
        style={[
          styles.pinCircle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      >
        <Text style={[styles.pinInitials, isSelected && styles.pinInitialsSelected]}>
          {getInitials(venue.name)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

/* -- Venue Card (Bottom Sheet) ---------------------------------- */

function VenueCard({ venue, onPress }: { venue: Venue; onPress: () => void }) {
  const vibeChips = venue.vibe.slice(0, 2);
  return (
    <TouchableOpacity
      style={styles.venueCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Cover placeholder with diagonal gradient */}
      <View style={styles.cardCover}>
        <Svg width={180} height={100} style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id={`cover-${venue.id}`} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#e2e2e2" stopOpacity="1" />
              <Stop offset="0.5" stopColor="#ebebeb" stopOpacity="1" />
              <Stop offset="1" stopColor="#f5f5f5" stopOpacity="1" />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="180" height="100" fill={`url(#cover-${venue.id})`} />
          {/* Subtle diagonal lines on cover */}
          <Line x1="0" y1="100" x2="180" y2="0" stroke="#d8d8d8" strokeWidth={0.5} opacity={0.5} />
          <Line x1="0" y1="60" x2="120" y2="0" stroke="#d8d8d8" strokeWidth={0.3} opacity={0.4} />
          <Line x1="60" y1="100" x2="180" y2="40" stroke="#d8d8d8" strokeWidth={0.3} opacity={0.4} />
        </Svg>
        <Text style={styles.cardCoverInitial}>{getInitials(venue.name)}</Text>
      </View>

      {/* Info section */}
      <View style={styles.cardBody}>
        <Text style={styles.cardName} numberOfLines={1}>
          {venue.name}
        </Text>
        <Text style={styles.cardNeighborhood} numberOfLines={1}>
          {venue.neighborhood}
        </Text>
        {/* Price + match on same line */}
        <View style={styles.cardMetaRow}>
          <Text style={styles.cardPrice}>{priceLabel(venue.priceRange)}</Text>
          <Text style={styles.cardMetaDot}>{'·'}</Text>
          <Text style={styles.cardMatch}>%{venue.vibeMatchPercent}</Text>
        </View>
        {/* Vibe chips */}
        <View style={styles.cardVibeRow}>
          {vibeChips.map((v) => (
            <View key={v} style={styles.cardVibeChip}>
              <Text style={styles.cardVibeChipText}>{v}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

/* -- Main Screen ------------------------------------------------ */

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [selectedPinIndex, setSelectedPinIndex] = useState<number | null>(null);

  // Nearest venue is index 5 (center-ish pin, closest to current location dot)
  const nearestVenueIndex = 5;

  const mapHeight =
    SCREEN_HEIGHT -
    insets.top -
    108 - // search bar + chips area
    BOTTOM_SHEET_HEIGHT -
    56; // tab bar approx

  const mapWidth = SCREEN_WIDTH;

  const handleVenuePress = (venue: Venue, pinIndex: number) => {
    setSelectedPinIndex(pinIndex);
    Alert.alert(venue.name, `${venue.neighborhood} • ${venue.address}`, [
      { text: 'Kapat', style: 'cancel' },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* -- Search bar (full-bleed) ----------------------------- */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>{'⌕'}</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Haritada ara..."
            placeholderTextColor={theme.colors.ash}
            value={searchText}
            onChangeText={setSearchText}
            returnKeyType="search"
          />
        </View>
      </View>

      {/* -- Filter chips ---------------------------------------- */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsContent}
        style={styles.chipsScroll}
      >
        {FILTER_CHIPS.map((chip) => {
          const isActive = activeFilter === chip.key;
          return (
            <TouchableOpacity
              key={chip.key}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => setActiveFilter(chip.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipLabel, isActive && styles.chipLabelActive]}>
                {chip.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* -- Simulated Map --------------------------------------- */}
      <View style={[styles.mapArea, { height: Math.max(mapHeight, 280) }]}>
        {/* Premium grid */}
        <PremiumMapGrid width={mapWidth} height={Math.max(mapHeight, 280)} />

        {/* Map labels */}
        {MAP_LABELS.map((label) => (
          <View
            key={label.text}
            style={[
              styles.mapLabel,
              { top: label.top as any, left: label.left as any },
            ]}
          >
            <Text style={styles.mapLabelText}>{label.text}</Text>
          </View>
        ))}

        {/* Venue pins */}
        {PIN_POSITIONS.map((pos) => {
          const venue = MOCK_VENUES[pos.venueIndex];
          if (!venue) return null;
          return (
            <VenuePin
              key={venue.id}
              venue={venue}
              top={Math.max(mapHeight, 280) * pos.top}
              left={mapWidth * pos.left}
              isSelected={selectedPinIndex === pos.venueIndex}
              isNearest={pos.venueIndex === nearestVenueIndex}
              onPress={() => handleVenuePress(venue, pos.venueIndex)}
            />
          );
        })}

        {/* Current location pulse dot */}
        <View
          style={[
            styles.currentLocationWrapper,
            {
              top: Math.max(mapHeight, 280) * 0.44,
              left: mapWidth * 0.50,
            },
          ]}
        >
          <PulsingLocationDot />
        </View>

        {/* Coordinate markers */}
        <View style={styles.coordNorth}>
          <Text style={styles.coordText}>41.03{'°'}N</Text>
        </View>
        <View style={styles.coordEast}>
          <Text style={styles.coordText}>28.98{'°'}E</Text>
        </View>
      </View>

      {/* -- Bottom Sheet ---------------------------------------- */}
      <View style={styles.bottomSheet}>
        {/* Drag handle */}
        <View style={styles.dragHandleContainer}>
          <View style={styles.dragHandle} />
        </View>

        {/* Header */}
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Yakindaki Mekanlar</Text>
          <Text style={styles.sheetCount}>{MOCK_VENUES.length} mekan</Text>
        </View>

        {/* Horizontal venue cards */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.venueListContent}
          style={styles.venueList}
        >
          {MOCK_VENUES.map((venue, idx) => (
            <VenueCard
              key={venue.id}
              venue={venue}
              onPress={() => handleVenuePress(venue, idx)}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

/* -- Styles ----------------------------------------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },

  /* -- Search bar -- */
  searchBarContainer: {
    paddingHorizontal: 0,
    paddingTop: theme.spacing['3'],
    paddingBottom: theme.spacing['2'],
    backgroundColor: '#fafafa',
  },
  searchBar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.mist,
    paddingHorizontal: theme.spacing['4'],
    gap: theme.spacing['2'],
  },
  searchIcon: {
    fontSize: 20,
    color: theme.colors.ash,
    marginTop: -2,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.graphite,
    paddingVertical: 0,
  },

  /* -- Filter chips -- */
  chipsScroll: {
    flexGrow: 0,
    marginBottom: theme.spacing['2'],
  },
  chipsContent: {
    paddingHorizontal: theme.spacing['4'],
    gap: theme.spacing['2'],
  },
  chip: {
    height: 34,
    paddingHorizontal: theme.spacing['4'],
    borderRadius: theme.radius.pills,
    borderWidth: 1,
    borderColor: theme.colors.concrete,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: theme.colors.graphite,
    borderColor: theme.colors.graphite,
  },
  chipLabel: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.concrete,
  },
  chipLabelActive: {
    color: theme.colors.chalk,
  },

  /* -- Map area -- */
  mapArea: {
    flex: 1,
    backgroundColor: '#fafafa',
    overflow: 'hidden',
    position: 'relative' as const,
  },

  /* Map annotations */
  mapLabel: {
    position: 'absolute' as const,
  },
  mapLabelText: {
    fontSize: 9,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.ash,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
    opacity: 0.55,
  },

  /* Coordinate markers */
  coordNorth: {
    position: 'absolute' as const,
    top: theme.spacing['3'],
    left: theme.spacing['3'],
  },
  coordEast: {
    position: 'absolute' as const,
    bottom: theme.spacing['3'],
    right: theme.spacing['3'],
  },
  coordText: {
    fontSize: 10,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.ash,
    letterSpacing: 1,
    fontVariant: ['tabular-nums'],
    opacity: 0.45,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },

  /* -- Venue pins -- */
  pinTouchable: {
    position: 'absolute' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    zIndex: 10,
  },
  pinShadow: {
    position: 'absolute' as const,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  pinCircle: {
    backgroundColor: theme.colors.graphite,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  pinInitials: {
    fontSize: 14,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.chalk,
    letterSpacing: 0.3,
  },
  pinInitialsSelected: {
    fontSize: 16,
  },

  /* Nearest-venue pulse wrapper (web) */
  nearestPulseWrapper: {
    position: 'absolute' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  nearestPulseRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: 'rgba(74,144,217,0.35)',
    position: 'absolute' as const,
  },

  /* -- Current location dot -- */
  currentLocationWrapper: {
    position: 'absolute' as const,
    marginLeft: -(LOCATION_RING_SIZE / 2),
    marginTop: -(LOCATION_RING_SIZE / 2),
    zIndex: 5,
  },
  locationPulseContainer: {
    width: LOCATION_RING_SIZE,
    height: LOCATION_RING_SIZE,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  locationPulseRing: {
    position: 'absolute' as const,
    width: LOCATION_RING_SIZE,
    height: LOCATION_RING_SIZE,
    borderRadius: LOCATION_RING_SIZE / 2,
    backgroundColor: '#4A90D9',
  },
  locationDotOuter: {
    width: LOCATION_DOT_SIZE + 4,
    height: LOCATION_DOT_SIZE + 4,
    borderRadius: (LOCATION_DOT_SIZE + 4) / 2,
    backgroundColor: theme.colors.chalk,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  locationDotInner: {
    width: LOCATION_DOT_SIZE,
    height: LOCATION_DOT_SIZE,
    borderRadius: LOCATION_DOT_SIZE / 2,
    backgroundColor: '#4A90D9',
  },

  /* -- Bottom Sheet -- */
  bottomSheet: {
    backgroundColor: theme.colors.chalk,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.hairline,
    paddingBottom: theme.spacing['2'],
  },
  dragHandleContainer: {
    alignItems: 'center' as const,
    paddingTop: theme.spacing['2.5'],
    paddingBottom: theme.spacing['3'],
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#d0d0d0',
  },
  sheetHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'baseline' as const,
    paddingHorizontal: theme.spacing['5'],
    marginBottom: theme.spacing['3'],
  },
  sheetTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.graphite,
  },
  sheetCount: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.ash,
  },

  /* -- Venue cards -- */
  venueList: {
    flexGrow: 0,
  },
  venueListContent: {
    paddingHorizontal: theme.spacing['5'],
    gap: theme.spacing['3'],
  },
  venueCard: {
    width: 180,
    borderRadius: theme.radius.lg,
    overflow: 'hidden' as const,
    backgroundColor: theme.colors.chalk,
    borderWidth: 1,
    borderColor: theme.colors.hairline,
  },
  cardCover: {
    width: 180,
    height: 100,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    overflow: 'hidden' as const,
  },
  cardCoverInitial: {
    fontSize: 24,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.ash,
    letterSpacing: 1.5,
    opacity: 0.5,
  },
  cardBody: {
    padding: theme.spacing['3'],
    gap: 2,
  },
  cardName: {
    fontSize: 14,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.graphite,
  },
  cardNeighborhood: {
    fontSize: 12,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.concrete,
    marginTop: 1,
  },
  cardMetaRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginTop: theme.spacing['1.5'],
    gap: theme.spacing['1.5'],
  },
  cardPrice: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.graphite,
  },
  cardMetaDot: {
    fontSize: 12,
    color: theme.colors.ash,
    marginHorizontal: 1,
  },
  cardMatch: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.concrete,
  },
  cardVibeRow: {
    flexDirection: 'row' as const,
    gap: theme.spacing['1.5'],
    marginTop: theme.spacing['2'],
  },
  cardVibeChip: {
    paddingHorizontal: theme.spacing['2'],
    paddingVertical: 3,
    borderRadius: theme.radius.pills,
    backgroundColor: theme.colors.mist,
  },
  cardVibeChipText: {
    fontSize: 10,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.concrete,
  },
});
