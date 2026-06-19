import React, { useRef, useEffect } from 'react';
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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { theme } from '../theme';
import { MOCK_VENUES } from '../data/mockData';
import { Venue } from '../types';

/* ── Constants ───────────────────────────────────────── */

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BOTTOM_SHEET_HEIGHT = 240;
const MAP_GRID_SPACING = 48;
const PIN_SIZE = 36;

const FILTER_CHIPS = [
  { label: 'Tumu', key: 'all' },
  { label: 'Kahve', key: 'kahve' },
  { label: 'Bar', key: 'bar' },
  { label: 'Restoran', key: 'restoran' },
  { label: 'Gece Hayati', key: 'gece' },
  { label: 'Brunch', key: 'brunch' },
];

/* ── Pin positions (simulated scatter) ───────────────── */

const PIN_POSITIONS: { venueIndex: number; top: number; left: number }[] = [
  { venueIndex: 0, top: 0.18, left: 0.15 },
  { venueIndex: 1, top: 0.32, left: 0.62 },
  { venueIndex: 2, top: 0.12, left: 0.72 },
  { venueIndex: 3, top: 0.48, left: 0.28 },
  { venueIndex: 4, top: 0.55, left: 0.75 },
  { venueIndex: 5, top: 0.38, left: 0.42 },
  { venueIndex: 6, top: 0.65, left: 0.18 },
  { venueIndex: 7, top: 0.25, left: 0.38 },
];

/* ── Helpers ─────────────────────────────────────────── */

function getInitials(name: string): string {
  const words = name.split(' ');
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

function priceLabel(range: number): string {
  return '₺'.repeat(range);
}

/* ── Search Icon (SVG) ───────────────────────────────── */

function SearchIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Circle
        cx={11}
        cy={11}
        r={7}
        stroke={theme.colors.ash}
        strokeWidth={1.8}
      />
      <Line
        x1={16.5}
        y1={16.5}
        x2={21}
        y2={21}
        stroke={theme.colors.ash}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/* ── Crosshair / Location Icon (SVG) ────────────────── */

function LocationIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={3} stroke={theme.colors.graphite} strokeWidth={1.8} />
      <Path
        d="M12 2v4M12 18v4M2 12h4M18 12h4"
        stroke={theme.colors.graphite}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/* ── Pulse Animation Component ───────────────────────── */

function PulsingDot() {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 2.4,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.4,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [pulseAnim, opacityAnim]);

  return (
    <View style={styles.pulseContainer}>
      <Animated.View
        style={[
          styles.pulseRing,
          {
            transform: [{ scale: pulseAnim }],
            opacity: opacityAnim,
          },
        ]}
      />
      <View style={styles.locationDot} />
    </View>
  );
}

/* ── Map Grid Lines ──────────────────────────────────── */

function MapGrid({ width, height }: { width: number; height: number }) {
  const verticalLines = Math.floor(width / MAP_GRID_SPACING);
  const horizontalLines = Math.floor(height / MAP_GRID_SPACING);

  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
      {/* Vertical lines */}
      {Array.from({ length: verticalLines + 1 }).map((_, i) => (
        <Line
          key={`v-${i}`}
          x1={i * MAP_GRID_SPACING}
          y1={0}
          x2={i * MAP_GRID_SPACING}
          y2={height}
          stroke={theme.colors.hairline}
          strokeWidth={1}
        />
      ))}
      {/* Horizontal lines */}
      {Array.from({ length: horizontalLines + 1 }).map((_, i) => (
        <Line
          key={`h-${i}`}
          x1={0}
          y1={i * MAP_GRID_SPACING}
          x2={width}
          y2={i * MAP_GRID_SPACING}
          stroke={theme.colors.hairline}
          strokeWidth={1}
        />
      ))}
      {/* Diagonal accent lines for depth */}
      <Line
        x1={0}
        y1={height * 0.3}
        x2={width * 0.4}
        y2={0}
        stroke={theme.colors.hairline}
        strokeWidth={0.5}
        opacity={0.6}
      />
      <Line
        x1={width * 0.5}
        y1={height}
        x2={width}
        y2={height * 0.4}
        stroke={theme.colors.hairline}
        strokeWidth={0.5}
        opacity={0.6}
      />
    </Svg>
  );
}

/* ── Venue Pin ───────────────────────────────────────── */

function VenuePin({
  venue,
  top,
  left,
  onPress,
}: {
  venue: Venue;
  top: number;
  left: number;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.pin,
        {
          top,
          left,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.pinText}>{getInitials(venue.name)}</Text>
    </TouchableOpacity>
  );
}

/* ── Venue Card (Bottom Sheet) ───────────────────────── */

function VenueCard({ venue, onPress }: { venue: Venue; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={styles.venueCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Image placeholder */}
      <View style={styles.cardImagePlaceholder}>
        <Text style={styles.cardImageInitial}>{getInitials(venue.name)}</Text>
      </View>
      {/* Info */}
      <View style={styles.cardInfo}>
        <Text style={styles.cardName} numberOfLines={1}>
          {venue.name}
        </Text>
        <Text style={styles.cardNeighborhood} numberOfLines={1}>
          {venue.neighborhood}
        </Text>
        <View style={styles.cardMeta}>
          <Text style={styles.cardPrice}>{priceLabel(venue.priceRange)}</Text>
          <View style={styles.cardDot} />
          <Text style={styles.cardVibe}>%{venue.vibeMatchPercent}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

/* ── Main Screen ─────────────────────────────────────── */

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = React.useState('all');
  const [searchText, setSearchText] = React.useState('');

  const mapHeight =
    SCREEN_HEIGHT -
    insets.top -
    // search bar area + chips
    100 -
    // bottom sheet
    BOTTOM_SHEET_HEIGHT -
    // tab bar approx
    56;

  const mapWidth = SCREEN_WIDTH - theme.spacing['4'] * 2;

  const handleVenuePress = (venue: Venue) => {
    Alert.alert(venue.name, `${venue.neighborhood} • ${venue.address}`, [
      { text: 'Kapat', style: 'cancel' },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ── Top Section ──────────────────────────────── */}
      <View style={styles.topSection}>
        {/* Search bar */}
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <SearchIcon />
            <TextInput
              style={styles.searchInput}
              placeholder="Haritada ara..."
              placeholderTextColor={theme.colors.ash}
              value={searchText}
              onChangeText={setSearchText}
              returnKeyType="search"
            />
          </View>
          <TouchableOpacity style={styles.locationButton} activeOpacity={0.7}>
            <LocationIcon />
          </TouchableOpacity>
        </View>

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
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
                <Text
                  style={[styles.chipText, isActive && styles.chipTextActive]}
                >
                  {chip.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Simulated Map ────────────────────────────── */}
      <View style={styles.mapContainer}>
        <View
          style={[
            styles.mapArea,
            { height: Math.max(mapHeight, 280) },
          ]}
        >
          {/* Grid */}
          <MapGrid width={mapWidth} height={Math.max(mapHeight, 280)} />

          {/* Label overlays for roads */}
          <View style={[styles.roadLabel, { top: '22%', left: '5%' }]}>
            <Text style={styles.roadLabelText}>Istiklal Cad.</Text>
          </View>
          <View style={[styles.roadLabel, { top: '50%', left: '45%' }]}>
            <Text style={styles.roadLabelText}>Bogazici</Text>
          </View>
          <View style={[styles.roadLabel, { top: '72%', left: '10%' }]}>
            <Text style={styles.roadLabelText}>Galata Kpr.</Text>
          </View>

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
                onPress={() => handleVenuePress(venue)}
              />
            );
          })}

          {/* Current location pulse */}
          <View
            style={[
              styles.currentLocationContainer,
              {
                top: Math.max(mapHeight, 280) * 0.44,
                left: mapWidth * 0.50,
              },
            ]}
          >
            <PulsingDot />
          </View>

          {/* Coordinate labels */}
          <View style={styles.coordTopLeft}>
            <Text style={styles.coordText}>41.03N</Text>
          </View>
          <View style={styles.coordBottomRight}>
            <Text style={styles.coordText}>28.98E</Text>
          </View>
        </View>
      </View>

      {/* ── Bottom Sheet ─────────────────────────────── */}
      <View style={styles.bottomSheet}>
        {/* Drag handle */}
        <View style={styles.dragHandleRow}>
          <View style={styles.dragHandle} />
        </View>

        {/* Title */}
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Yakindaki Mekanlar</Text>
          <Text style={styles.sheetCount}>{MOCK_VENUES.length} mekan</Text>
        </View>

        {/* Horizontal venue list */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.venueListContent}
          style={styles.venueList}
        >
          {MOCK_VENUES.map((venue) => (
            <VenueCard
              key={venue.id}
              venue={venue}
              onPress={() => handleVenuePress(venue)}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

/* ── Styles ──────────────────────────────────────────── */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.chalk,
  },

  /* ── Top Section ── */
  topSection: {
    paddingHorizontal: theme.spacing['4'],
    paddingTop: theme.spacing['3'],
    backgroundColor: theme.colors.chalk,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing['2'],
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.chalk,
    borderWidth: 1,
    borderColor: theme.colors.hairline,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing['3'],
    height: 44,
    gap: theme.spacing['2'],
  },
  searchInput: {
    flex: 1,
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.graphite,
    paddingVertical: 0,
  },
  locationButton: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.chalk,
  },

  /* ── Chips ── */
  chipsScroll: {
    marginTop: theme.spacing['3'],
    marginBottom: theme.spacing['3'],
  },
  chipsContainer: {
    gap: theme.spacing['2'],
    paddingRight: theme.spacing['4'],
  },
  chip: {
    paddingHorizontal: theme.spacing['4'],
    paddingVertical: theme.spacing['1.5'],
    borderRadius: theme.radius.pills,
    borderWidth: 1,
    borderColor: theme.colors.hairline,
    backgroundColor: theme.colors.chalk,
  },
  chipActive: {
    backgroundColor: theme.colors.graphite,
    borderColor: theme.colors.graphite,
  },
  chipText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.concrete,
  },
  chipTextActive: {
    color: theme.colors.chalk,
  },

  /* ── Map ── */
  mapContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing['4'],
  },
  mapArea: {
    flex: 1,
    backgroundColor: theme.colors.mist,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.hairline,
    overflow: 'hidden',
    position: 'relative',
  },

  /* Road labels */
  roadLabel: {
    position: 'absolute',
  },
  roadLabelText: {
    fontSize: 10,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.ash,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    opacity: 0.6,
  },

  /* Coordinate labels */
  coordTopLeft: {
    position: 'absolute',
    top: theme.spacing['2'],
    left: theme.spacing['2'],
  },
  coordBottomRight: {
    position: 'absolute',
    bottom: theme.spacing['2'],
    right: theme.spacing['2'],
  },
  coordText: {
    fontSize: 9,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.ash,
    letterSpacing: 1,
    fontVariant: ['tabular-nums'],
    opacity: 0.5,
  },

  /* Venue pin */
  pin: {
    position: 'absolute',
    width: PIN_SIZE,
    height: PIN_SIZE,
    borderRadius: PIN_SIZE / 2,
    backgroundColor: theme.colors.graphite,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -(PIN_SIZE / 2),
    marginTop: -(PIN_SIZE / 2),
  },
  pinText: {
    fontSize: 11,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.chalk,
    letterSpacing: 0.3,
  },

  /* Current location pulse */
  currentLocationContainer: {
    position: 'absolute',
    marginLeft: -16,
    marginTop: -16,
  },
  pulseContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4A90D9',
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4A90D9',
    borderWidth: 2,
    borderColor: theme.colors.chalk,
  },

  /* ── Bottom Sheet ── */
  bottomSheet: {
    backgroundColor: theme.colors.chalk,
    borderTopWidth: 1,
    borderTopColor: theme.colors.hairline,
    paddingBottom: theme.spacing['2'],
  },
  dragHandleRow: {
    alignItems: 'center',
    paddingTop: theme.spacing['2'],
    paddingBottom: theme.spacing['3'],
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.hairline,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: theme.spacing['4'],
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

  /* ── Venue Cards ── */
  venueList: {
    flexGrow: 0,
  },
  venueListContent: {
    paddingHorizontal: theme.spacing['4'],
    gap: theme.spacing['3'],
  },
  venueCard: {
    width: 160,
    borderWidth: 1,
    borderColor: theme.colors.hairline,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    backgroundColor: theme.colors.chalk,
  },
  cardImagePlaceholder: {
    width: 160,
    height: 96,
    backgroundColor: theme.colors.mist,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardImageInitial: {
    fontSize: 22,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.ash,
    letterSpacing: 1,
  },
  cardInfo: {
    padding: theme.spacing['3'],
    gap: 2,
  },
  cardName: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.graphite,
  },
  cardNeighborhood: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.concrete,
    marginTop: 1,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing['1.5'],
    gap: theme.spacing['1.5'],
  },
  cardPrice: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.graphite,
  },
  cardDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: theme.colors.hairline,
  },
  cardVibe: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.concrete,
  },
});
