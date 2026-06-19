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

/* ── Helpers ─────────────────────────────────────────── */

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COMPACT_CARD_WIDTH = 200;
const SMALL_CARD_WIDTH = 160;

function priceLabel(range: number): string {
  return Array(range).fill('₺').join('');
}

function noiseDots(level: number): string[] {
  return Array.from({ length: 5 }, (_, i) => (i < level ? 'filled' : 'empty'));
}

/* ── Sub-components ──────────────────────────────────── */

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
        <Pressable onPress={onSeeAll} hitSlop={8}>
          <Text style={styles.seeAllText}>{'Tümünü gör →'}</Text>
        </Pressable>
      )}
    </View>
  );
}

/* ── Compact Card (horizontal scroll) ────────────────── */

function CompactVenueCard({
  venue,
  onPress,
}: {
  venue: Venue;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.compactCard}>
      <CoverPlaceholder name={venue.name} height={120} width={COMPACT_CARD_WIDTH} />
      <View style={styles.compactCardContent}>
        <Text style={styles.compactCardName} numberOfLines={1}>
          {venue.name}
        </Text>
        <Text style={styles.compactCardNeighborhood} numberOfLines={1}>
          {venue.neighborhood}
        </Text>
        <View style={styles.compactCardMeta}>
          <Text style={styles.priceText}>{priceLabel(venue.priceRange)}</Text>
        </View>
        <View style={styles.vibeRow}>
          {venue.vibe.slice(0, 2).map((v) => (
            <VibeChip key={v} label={v} small />
          ))}
        </View>
      </View>
    </Pressable>
  );
}

/* ── Full-width Card (vertical feed) ─────────────────── */

function FullVenueCard({
  venue,
  onPress,
}: {
  venue: Venue;
  onPress: () => void;
}) {
  const dots = noiseDots(venue.noiseLevel);

  return (
    <Pressable onPress={onPress} style={styles.fullCard}>
      <CoverPlaceholder name={venue.name} height={180} />

      {/* Match badge */}
      <View style={styles.matchBadge}>
        <Text style={styles.matchBadgeText}>
          % {venue.vibeMatchPercent} Match
        </Text>
      </View>

      <View style={styles.fullCardContent}>
        <View style={styles.fullCardTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.fullCardName} numberOfLines={1}>
              {venue.name}
            </Text>
            <Text style={styles.fullCardNeighborhood} numberOfLines={1}>
              {venue.neighborhood}
            </Text>
          </View>
          <Text style={styles.priceTextLarge}>{priceLabel(venue.priceRange)}</Text>
        </View>

        <View style={styles.vibeRow}>
          {venue.vibe.map((v) => (
            <VibeChip key={v} label={v} />
          ))}
        </View>

        <View style={styles.noiseRow}>
          <Text style={styles.noiseLabel}>Ses</Text>
          {dots.map((dot, i) => (
            <View
              key={i}
              style={[
                styles.noiseDot,
                dot === 'filled' ? styles.noiseDotFilled : styles.noiseDotEmpty,
              ]}
            />
          ))}
        </View>
      </View>
    </Pressable>
  );
}

/* ── Small Card (horizontal scroll) ──────────────────── */

function SmallVenueCard({
  venue,
  onPress,
}: {
  venue: Venue;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.smallCard}>
      <CoverPlaceholder name={venue.name} height={100} width={SMALL_CARD_WIDTH} />
      <View style={styles.smallCardContent}>
        <Text style={styles.smallCardName} numberOfLines={1}>
          {venue.name}
        </Text>
        <Text style={styles.smallCardNeighborhood} numberOfLines={1}>
          {venue.neighborhood}
        </Text>
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
            <View style={styles.lollipopIndicator} />
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
        <SectionHeader title="Sana Özel" />
        <View style={styles.verticalSection}>
          {personalVenues.map((venue) => (
            <FullVenueCard
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

        {/* Bottom spacing for tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

/* ── Styles ──────────────────────────────────────────── */

const styles = StyleSheet.create({
  /* Layout */
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

  /* Header */
  header: {
    paddingHorizontal: theme.spacing['4'],
    paddingTop: theme.spacing['3'],
    paddingBottom: theme.spacing['2'],
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing['4'],
  },
  logoText: {
    fontSize: 24,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.graphite,
    letterSpacing: -0.5,
  },
  lollipopIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4A90D9',
    marginLeft: 6,
    marginTop: -8,
  },

  /* Search */
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.chalk,
    borderWidth: 1,
    borderColor: theme.colors.hairline,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing['3'],
    height: 44,
    marginBottom: theme.spacing['3'],
  },
  searchIcon: {
    fontSize: 14,
    marginRight: theme.spacing['2'],
  },
  searchInput: {
    flex: 1,
    fontSize: theme.typography.sizes.base,
    color: theme.colors.graphite,
    padding: 0,
  },

  /* Filter Chips */
  filterRow: {
    flexDirection: 'row',
    gap: theme.spacing['2'],
    paddingBottom: theme.spacing['2'],
  },
  filterChip: {
    backgroundColor: theme.colors.mist,
    borderRadius: theme.radius.badges,
    paddingHorizontal: theme.spacing['4'],
    paddingVertical: theme.spacing['2'],
  },
  filterChipSelected: {
    backgroundColor: theme.colors.graphite,
  },
  filterChipText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.graphite,
  },
  filterChipTextSelected: {
    color: theme.colors.chalk,
  },

  /* Section Header */
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing['4'],
    paddingTop: theme.spacing['6'],
    paddingBottom: theme.spacing['3'],
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.graphite,
  },
  seeAllText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.concrete,
  },

  /* Horizontal list */
  horizontalList: {
    paddingHorizontal: theme.spacing['4'],
    gap: theme.spacing['3'],
  },

  /* Cover Placeholder */
  coverPlaceholder: {
    backgroundColor: theme.colors.mist,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    overflow: 'hidden',
  },
  coverInitial: {
    fontSize: 32,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.ash,
  },

  /* Compact Card */
  compactCard: {
    width: COMPACT_CARD_WIDTH,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.hairline,
    backgroundColor: theme.colors.chalk,
    overflow: 'hidden',
  },
  compactCardContent: {
    padding: theme.spacing['3'],
  },
  compactCardName: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.graphite,
    marginBottom: 2,
  },
  compactCardNeighborhood: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.concrete,
    marginBottom: theme.spacing['2'],
  },
  compactCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing['2'],
  },
  priceText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.graphite,
  },

  /* Vibe chips */
  vibeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing['1'],
  },
  vibeChip: {
    backgroundColor: theme.colors.mist,
    borderRadius: theme.radius.pills,
    paddingHorizontal: theme.spacing['2'],
    paddingVertical: 3,
  },
  vibeChipSmall: {
    paddingHorizontal: theme.spacing['1.5'],
    paddingVertical: 2,
  },
  vibeChipText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.concrete,
    fontWeight: theme.typography.weights.medium,
  },
  vibeChipTextSmall: {
    fontSize: 10,
  },

  /* Full Card */
  fullCard: {
    marginHorizontal: theme.spacing['4'],
    marginBottom: theme.spacing['4'],
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.hairline,
    backgroundColor: theme.colors.chalk,
    overflow: 'hidden',
  },
  fullCardContent: {
    padding: theme.spacing['4'],
  },
  fullCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing['3'],
  },
  fullCardName: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.graphite,
    marginBottom: 2,
  },
  fullCardNeighborhood: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.concrete,
  },
  priceTextLarge: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.graphite,
  },
  matchBadge: {
    position: 'absolute',
    top: theme.spacing['3'],
    right: theme.spacing['3'],
    backgroundColor: theme.colors.graphite,
    borderRadius: theme.radius.pills,
    paddingHorizontal: theme.spacing['3'],
    paddingVertical: theme.spacing['1'],
  },
  matchBadgeText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.chalk,
  },

  /* Noise indicator */
  noiseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing['3'],
    gap: theme.spacing['1'],
  },
  noiseLabel: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.ash,
    fontWeight: theme.typography.weights.medium,
    marginRight: theme.spacing['1'],
  },
  noiseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  noiseDotFilled: {
    backgroundColor: theme.colors.graphite,
  },
  noiseDotEmpty: {
    backgroundColor: theme.colors.hairline,
  },

  /* Vertical section */
  verticalSection: {
    paddingTop: theme.spacing['1'],
  },

  /* Small Card */
  smallCard: {
    width: SMALL_CARD_WIDTH,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.hairline,
    backgroundColor: theme.colors.chalk,
    overflow: 'hidden',
  },
  smallCardContent: {
    padding: theme.spacing['2'],
  },
  smallCardName: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.graphite,
    marginBottom: 1,
  },
  smallCardNeighborhood: {
    fontSize: 11,
    color: theme.colors.concrete,
  },
});
