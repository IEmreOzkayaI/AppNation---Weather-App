import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  StatusBar,
  Dimensions,
  type DimensionValue,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { theme } from '../theme';
import { MOCK_VENUES, VIBE_FILTERS } from '../data/mockData';
import type { Venue } from '../types';

/* ── Types ───────────────────────────────────────────── */

type ExploreStackParamList = {
  Home: undefined;
  VenueDetail: { venueId: string };
};

type HomeScreenNavigationProp = NativeStackNavigationProp<
  ExploreStackParamList,
  'Home'
>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

/* ── Constants ──────────────────────────────────────── */

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COMPACT_CARD_WIDTH = 220;
const SMALL_CARD_WIDTH = 172;
const ACCENT_BLUE = '#4A90D9';
const MAX_PRICE = 4;

/* ── Helpers ─────────────────────────────────────────── */

/** Renders price as "₺₺₺₺" — filled symbols dark, remaining light gray. */
function PriceIndicator({ range, large }: { range: number; large?: boolean }) {
  const symbols = Array.from({ length: MAX_PRICE }, (_, i) => i < range);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {symbols.map((filled, i) => (
        <Text
          key={i}
          style={{
            fontSize: large ? 14 : 12,
            fontWeight: filled
              ? theme.typography.weights.semibold
              : theme.typography.weights.regular,
            color: filled ? theme.colors.graphite : theme.colors.hairline,
            letterSpacing: 0.5,
          }}
        >
          {'₺'}
        </Text>
      ))}
    </View>
  );
}

/** Noise level as thin horizontal bars instead of dots. */
function NoiseIndicator({ level }: { level: number }) {
  const bars = Array.from({ length: 5 }, (_, i) => i < level);
  return (
    <View style={styles.noiseBarsRow}>
      <Text style={styles.noiseLabel}>Ses</Text>
      {bars.map((filled, i) => (
        <View
          key={i}
          style={[
            styles.noiseBar,
            {
              backgroundColor: filled
                ? theme.colors.graphite
                : theme.colors.hairline,
            },
          ]}
        />
      ))}
    </View>
  );
}

/* ── Sub-components ──────────────────────────────────── */

/**
 * Diagonal gradient placeholder for venue covers.
 * Two overlapping Views at slight angles create a subtle mist-to-white feel.
 */
function CoverPlaceholder({
  name,
  height,
  width,
}: {
  name: string;
  height: number;
  width?: DimensionValue;
}) {
  return (
    <View
      style={[
        styles.coverPlaceholder,
        { height, width: width ?? '100%' },
      ]}
    >
      {/* Diagonal layer 1 — slightly warmer mist */}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: '#f0f0f0',
            opacity: 1,
          },
        ]}
      />
      {/* Diagonal layer 2 — lighter overlay, offset to create gradient feel */}
      <View
        style={{
          position: 'absolute',
          top: -height * 0.3,
          right: -40,
          width: height * 1.6,
          height: height * 1.6,
          backgroundColor: '#fafafa',
          opacity: 0.7,
          transform: [{ rotate: '-35deg' }],
        }}
      />
      {/* Bottom gradient overlay — gentle darkening at the base */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: height * 0.45,
          backgroundColor: '#000',
          opacity: 0.04,
        }}
      />
      <Text style={styles.coverInitial}>{name.charAt(0).toUpperCase()}</Text>
    </View>
  );
}

function VibeChip({ label, small }: { label: string; small?: boolean }) {
  return (
    <View style={[styles.vibeChip, small && styles.vibeChipSmall]}>
      <Text style={[styles.vibeChipText, small && styles.vibeChipTextSmall]}>
        {label}
      </Text>
    </View>
  );
}

function FilterChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.filterChip, selected && styles.filterChipSelected]}
    >
      <Text
        style={[
          styles.filterChipText,
          selected && styles.filterChipTextSelected,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function SectionHeader({
  title,
  onSeeAll,
}: {
  title: string;
  onSeeAll?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onSeeAll && (
        <Pressable onPress={onSeeAll} hitSlop={12}>
          <Text style={styles.seeAllText}>{'Tumunu gor'}</Text>
        </Pressable>
      )}
    </View>
  );
}

/* ── Compact Venue Card (horizontal scroll — Trend) ── */

function CompactVenueCard({
  venue,
  onPress,
}: {
  venue: Venue;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.compactCard}>
      <CoverPlaceholder
        name={venue.name}
        height={130}
        width={COMPACT_CARD_WIDTH}
      />

      <View style={styles.compactCardContent}>
        <Text style={styles.compactCardName} numberOfLines={1}>
          {venue.name}
        </Text>

        {/* Location with dot separator */}
        <View style={styles.locationRow}>
          <Text style={styles.compactCardNeighborhood} numberOfLines={1}>
            {venue.neighborhood}
          </Text>
          <View style={styles.dotSeparator} />
          <Text style={styles.compactCardCity} numberOfLines={1}>
            {venue.city}
          </Text>
        </View>

        {/* Meta row: price + vibe tags inline */}
        <View style={styles.metaRow}>
          <PriceIndicator range={venue.priceRange} />
          <View style={styles.metaDivider} />
          {venue.vibe.slice(0, 2).map((v) => (
            <VibeChip key={v} label={v} small />
          ))}
        </View>
      </View>
    </Pressable>
  );
}

/* ── Featured Card ("Sana Ozel" — large, dramatic) ─── */

function FeaturedVenueCard({
  venue,
  onPress,
}: {
  venue: Venue;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.featuredCard}>
      <View>
        <CoverPlaceholder name={venue.name} height={220} />

        {/* Gradient overlay at the bottom of the cover */}
        <View style={styles.coverGradient} />

        {/* Match badge — top-right corner overlay */}
        <View style={styles.matchBadge}>
          <Text style={styles.matchBadgeText}>
            {venue.vibeMatchPercent}% Match
          </Text>
        </View>
      </View>

      <View style={styles.featuredCardContent}>
        <View style={styles.featuredCardTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.featuredCardName} numberOfLines={1}>
              {venue.name}
            </Text>
            <View style={styles.locationRow}>
              <Text style={styles.featuredCardNeighborhood} numberOfLines={1}>
                {venue.neighborhood}
              </Text>
              <View style={styles.dotSeparator} />
              <Text style={styles.compactCardCity} numberOfLines={1}>
                {venue.city}
              </Text>
            </View>
          </View>
          <PriceIndicator range={venue.priceRange} large />
        </View>

        {/* Vibe tags + noise — single refined row */}
        <View style={styles.featuredMetaRow}>
          <View style={styles.vibeRow}>
            {venue.vibe.map((v) => (
              <VibeChip key={v} label={v} />
            ))}
          </View>
        </View>

        <NoiseIndicator level={venue.noiseLevel} />
      </View>
    </Pressable>
  );
}

/* ── Small Venue Card (horizontal — Yeni Eklenenler) ── */

function SmallVenueCard({
  venue,
  onPress,
}: {
  venue: Venue;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.smallCard}>
      <CoverPlaceholder
        name={venue.name}
        height={110}
        width={SMALL_CARD_WIDTH}
      />
      <View style={styles.smallCardContent}>
        <Text style={styles.smallCardName} numberOfLines={1}>
          {venue.name}
        </Text>
        <View style={styles.locationRow}>
          <Text style={styles.smallCardNeighborhood} numberOfLines={1}>
            {venue.neighborhood}
          </Text>
          <View style={styles.dotSeparatorSmall} />
          <PriceIndicator range={venue.priceRange} />
        </View>
      </View>
    </Pressable>
  );
}

/* ── Main Screen ─────────────────────────────────────── */

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const insets = useSafeAreaInsets();
  const [selectedFilter, setSelectedFilter] = useState<string>('Tümü');
  const [searchQuery, setSearchQuery] = useState('');

  const navigateToVenue = useCallback(
    (venueId: string) => {
      navigation.navigate('VenueDetail', { venueId });
    },
    [navigation],
  );

  // Filter venues by selected vibe
  const filteredVenues =
    selectedFilter === 'Tümü'
      ? MOCK_VENUES
      : MOCK_VENUES.filter((v) => v.vibe.includes(selectedFilter));

  // Derive sections
  const trendVenues = [...filteredVenues]
    .sort((a, b) => b.checkInCount - a.checkInCount)
    .slice(0, 6);

  const personalVenues = [...filteredVenues]
    .sort((a, b) => b.vibeMatchPercent - a.vibeMatchPercent)
    .slice(0, 4);

  const newVenues = [...filteredVenues]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 6);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.chalk} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ──────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <Text style={styles.logoText}>lokal</Text>
            <View style={styles.logoDot} />
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>&#x1F50D;</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Mekan veya vibe ara..."
              placeholderTextColor={theme.colors.ash}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
          </View>

          {/* Filter Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {VIBE_FILTERS.map((filter) => (
              <FilterChip
                key={filter}
                label={filter}
                selected={selectedFilter === filter}
                onPress={() => setSelectedFilter(filter)}
              />
            ))}
          </ScrollView>
        </View>

        {/* ── Trend Mekanlar ──────────────────────────── */}
        <SectionHeader title="Trend Mekanlar" onSeeAll={() => {}} />
        <FlatList
          data={trendVenues}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
          renderItem={({ item }) => (
            <CompactVenueCard
              venue={item}
              onPress={() => navigateToVenue(item.id)}
            />
          )}
          scrollEnabled
          nestedScrollEnabled
        />

        {/* ── Sana Ozel ───────────────────────────────── */}
        <SectionHeader title="Sana Ozel" />
        <View style={styles.verticalSection}>
          {personalVenues.map((venue) => (
            <FeaturedVenueCard
              key={venue.id}
              venue={venue}
              onPress={() => navigateToVenue(venue.id)}
            />
          ))}
        </View>

        {/* ── Yeni Eklenenler ─────────────────────────── */}
        <SectionHeader title="Yeni Eklenenler" onSeeAll={() => {}} />
        <FlatList
          data={newVenues}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
          renderItem={({ item }) => (
            <SmallVenueCard
              venue={item}
              onPress={() => navigateToVenue(item.id)}
            />
          )}
          scrollEnabled
          nestedScrollEnabled
        />

        {/* ── Bottom brand watermark ─────────────────── */}
        <View style={styles.bottomBrand}>
          <Text style={styles.bottomBrandText}>lokal</Text>
          <View style={styles.bottomBrandDot} />
        </View>

        {/* Bottom spacing for tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

/* ── Styles ──────────────────────────────────────────── */

const styles = StyleSheet.create({
  /* ─── Layout ───────────────────────────────────────── */
  container: {
    flex: 1,
    backgroundColor: theme.colors.chalk,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.spacing['4'],
  },

  /* ─── Header ───────────────────────────────────────── */
  header: {
    paddingHorizontal: theme.spacing['5'],
    paddingTop: theme.spacing['4'],
    paddingBottom: theme.spacing['2'],
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing['5'],
  },
  logoText: {
    fontSize: 32,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.graphite,
    letterSpacing: -1,
  },
  logoDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: ACCENT_BLUE,
    marginLeft: 4,
    marginTop: -14,
  },

  /* ─── Search ───────────────────────────────────────── */
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.mist,
    borderRadius: theme.radius.xl,
    paddingHorizontal: theme.spacing['4'],
    height: 48,
    marginBottom: theme.spacing['4'],
  },
  searchIcon: {
    fontSize: 15,
    marginRight: theme.spacing['2.5'],
    opacity: 0.5,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.typography.sizes.base,
    color: theme.colors.graphite,
    padding: 0,
    letterSpacing: -0.1,
  },

  /* ─── Filter Chips ─────────────────────────────────── */
  filterRow: {
    flexDirection: 'row',
    gap: theme.spacing['2'],
    paddingBottom: theme.spacing['2'],
  },
  filterChip: {
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.radius.pills,
    paddingHorizontal: theme.spacing['5'],
    borderWidth: 1,
    borderColor: theme.colors.hairline,
    backgroundColor: theme.colors.chalk,
  },
  filterChipSelected: {
    backgroundColor: theme.colors.graphite,
    borderColor: theme.colors.graphite,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.graphite,
    letterSpacing: -0.1,
  },
  filterChipTextSelected: {
    color: theme.colors.chalk,
  },

  /* ─── Section Header ───────────────────────────────── */
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing['5'],
    paddingTop: theme.spacing['10'], // 40px — generous section gap
    paddingBottom: theme.spacing['4'],
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.graphite,
    letterSpacing: -0.5,
  },
  seeAllText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.ash,
    letterSpacing: -0.2,
  },

  /* ─── Horizontal List ──────────────────────────────── */
  horizontalList: {
    paddingHorizontal: theme.spacing['5'],
    gap: theme.spacing['4'], // 16px gap between cards
  },

  /* ─── Cover Placeholder ────────────────────────────── */
  coverPlaceholder: {
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  coverInitial: {
    fontSize: 36,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.smoke,
    opacity: 0.5,
  },

  /* ─── Gradient overlay for featured cover ──────────── */
  coverGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: '#000',
    opacity: 0.06,
  },

  /* ─── Shared location row ──────────────────────────── */
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  dotSeparator: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: theme.colors.ash,
    marginHorizontal: 6,
  },
  dotSeparatorSmall: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: theme.colors.ash,
    marginHorizontal: 5,
  },

  /* ─── Meta row (price + vibes inline) ──────────────── */
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing['2.5'],
    gap: 6,
  },
  metaDivider: {
    width: 1,
    height: 12,
    backgroundColor: theme.colors.hairline,
    marginHorizontal: 4,
  },

  /* ─── Compact Card ─────────────────────────────────── */
  compactCard: {
    width: COMPACT_CARD_WIDTH,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.chalk,
    overflow: 'hidden',
    // Elevation via subtle shadow instead of border
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  compactCardContent: {
    padding: theme.spacing['5'], // 20px internal padding — cards breathe
  },
  compactCardName: {
    fontSize: 16,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.graphite,
    letterSpacing: -0.3,
  },
  compactCardNeighborhood: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.concrete,
    letterSpacing: -0.1,
  },
  compactCardCity: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.ash,
    letterSpacing: -0.1,
  },

  /* ─── Vibe Chips ───────────────────────────────────── */
  vibeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing['1.5'],
  },
  vibeChip: {
    backgroundColor: theme.colors.mist,
    borderRadius: theme.radius.pills,
    paddingHorizontal: theme.spacing['2.5'],
    paddingVertical: 4,
  },
  vibeChipSmall: {
    paddingHorizontal: theme.spacing['2'],
    paddingVertical: 3,
  },
  vibeChipText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.concrete,
    fontWeight: theme.typography.weights.medium,
    letterSpacing: -0.1,
  },
  vibeChipTextSmall: {
    fontSize: 11,
  },

  /* ─── Featured Card ("Sana Ozel") ──────────────────── */
  featuredCard: {
    marginHorizontal: theme.spacing['5'],
    marginBottom: theme.spacing['5'],
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.chalk,
    overflow: 'hidden',
    // Premium elevation
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
  },
  featuredCardContent: {
    padding: theme.spacing['5'], // 20px
  },
  featuredCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing['4'],
  },
  featuredCardName: {
    fontSize: 18,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.graphite,
    letterSpacing: -0.4,
  },
  featuredCardNeighborhood: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.concrete,
    letterSpacing: -0.1,
  },
  featuredMetaRow: {
    marginBottom: theme.spacing['3'],
  },

  /* ─── Match Badge ──────────────────────────────────── */
  matchBadge: {
    position: 'absolute',
    top: theme.spacing['4'],
    right: theme.spacing['4'],
    backgroundColor: theme.colors.graphite,
    borderRadius: 14,
    paddingHorizontal: theme.spacing['4'],
    paddingVertical: theme.spacing['1.5'],
  },
  matchBadgeText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.chalk,
    letterSpacing: 0.3,
  },

  /* ─── Noise Indicator (thin bars) ──────────────────── */
  noiseBarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing['3'],
    gap: 2,
  },
  noiseLabel: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.ash,
    fontWeight: theme.typography.weights.medium,
    marginRight: theme.spacing['2'],
    letterSpacing: -0.1,
  },
  noiseBar: {
    width: 3,
    height: 12,
    borderRadius: 1.5,
  },

  /* ─── Vertical section ─────────────────────────────── */
  verticalSection: {
    paddingTop: theme.spacing['1'],
  },

  /* ─── Small Card ───────────────────────────────────── */
  smallCard: {
    width: SMALL_CARD_WIDTH,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.chalk,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  smallCardContent: {
    padding: theme.spacing['4'],
  },
  smallCardName: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.graphite,
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  smallCardNeighborhood: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.concrete,
    letterSpacing: -0.1,
  },

  /* ─── Bottom Brand Watermark ───────────────────────── */
  bottomBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: theme.spacing['10'],
    paddingBottom: theme.spacing['4'],
  },
  bottomBrandText: {
    fontSize: 12,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.ash,
    letterSpacing: -0.5,
  },
  bottomBrandDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: ACCENT_BLUE,
    marginLeft: 2,
    marginTop: -6,
  },
});
