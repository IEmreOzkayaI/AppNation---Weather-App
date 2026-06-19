import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';

import { theme } from '../theme';
import { MOCK_VENUES, MOCK_LISTS } from '../data/mockData';
import type { Venue } from '../types';

/* ── Route params ─────────────────────────────────── */

type ListDetailParams = {
  ListDetail: { listId: string };
};

/* ── Helpers ──────────────────────────────────────── */

function getInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

function priceLabel(range: number): string {
  return Array(range).fill('₺').join('');
}

/* ── Venue Card ───────────────────────────────────── */

function VenueCard({ venue }: { venue: Venue }) {
  const vibeChips = venue.vibe.slice(0, 3);

  return (
    <View style={styles.venueCard}>
      {/* Left: image placeholder */}
      <View style={styles.venueImage}>
        <Text style={styles.venueImageInitial}>{getInitial(venue.name)}</Text>
      </View>

      {/* Right: info */}
      <View style={styles.venueInfo}>
        <Text style={styles.venueName} numberOfLines={1}>
          {venue.name}
        </Text>
        <Text style={styles.venueNeighborhood}>{venue.neighborhood}</Text>

        <View style={styles.vibeRow}>
          {vibeChips.map((vibe) => (
            <View key={vibe} style={styles.vibeChip}>
              <Text style={styles.vibeChipText}>{vibe}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.venuePrice}>{priceLabel(venue.priceRange)}</Text>
      </View>

      {/* Delete hint */}
      <View style={styles.deleteHint}>
        <Text style={styles.deleteHintIcon}>x</Text>
      </View>
    </View>
  );
}

/* ── Empty State ──────────────────────────────────── */

function EmptyState() {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIllustration}>
        <Text style={styles.emptyIllustrationText}>[ ]</Text>
      </View>
      <Text style={styles.emptyText}>Bu listede henuz mekan yok</Text>
    </View>
  );
}

/* ── Main Screen ──────────────────────────────────── */

export default function ListDetailScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<ListDetailParams, 'ListDetail'>>();

  const { listId } = route.params;
  const list = MOCK_LISTS.find((l) => l.id === listId);

  const venues: Venue[] = list
    ? list.venueIds
        .map((id) => MOCK_VENUES.find((v) => v.id === id))
        .filter(Boolean) as Venue[]
    : [];

  if (!list) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            style={styles.backButton}
          >
            <Text style={styles.backText}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Liste bulunamadi</Text>
          <View style={styles.headerSpacer} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          style={styles.backButton}
        >
          <Text style={styles.backText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {list.name}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Description */}
      {list.description ? (
        <Text style={styles.description}>{list.description}</Text>
      ) : null}

      {/* Info Row */}
      <View style={styles.infoRow}>
        <Text style={styles.infoText}>{venues.length} mekan</Text>
        <View style={styles.dot} />
        <View
          style={[
            styles.visibilityBadge,
            list.isPublic ? styles.publicBadge : styles.privateBadge,
          ]}
        >
          <Text style={styles.visibilityBadgeText}>
            {list.isPublic ? 'Herkese acik' : 'Gizli'}
          </Text>
        </View>
        <View style={{ flex: 1 }} />
        <TouchableOpacity activeOpacity={0.7} style={styles.shareButton}>
          <Text style={styles.shareButtonText}>Paylas</Text>
        </TouchableOpacity>
      </View>

      {/* Venue List */}
      {venues.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={venues}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <VenueCard venue={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: theme.spacing[3] }} />}
        />
      )}
    </View>
  );
}

/* ── Styles ───────────────────────────────────────── */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.chalk,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.hairline,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing[3],
  },
  backText: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.graphite,
  },
  headerTitle: {
    flex: 1,
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.graphite,
  },
  headerSpacer: {
    width: 32,
  },

  /* Description */
  description: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.concrete,
    paddingHorizontal: theme.spacing[4],
    paddingTop: theme.spacing[4],
  },

  /* Info Row */
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    gap: theme.spacing[2],
  },
  infoText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.concrete,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: theme.colors.ash,
  },
  visibilityBadge: {
    paddingHorizontal: theme.spacing[3],
    paddingVertical: 4,
    borderRadius: theme.radius.pills,
    borderWidth: 1,
  },
  publicBadge: {
    borderColor: theme.colors.hairline,
    backgroundColor: theme.colors.mist,
  },
  privateBadge: {
    borderColor: theme.colors.hairline,
    backgroundColor: theme.colors.mist,
  },
  visibilityBadgeText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.concrete,
  },
  shareButton: {
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.hairline,
  },
  shareButtonText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.graphite,
  },

  /* Venue List */
  listContent: {
    paddingHorizontal: theme.spacing[4],
    paddingTop: theme.spacing[3],
    paddingBottom: theme.spacing[10],
  },

  /* Venue Card */
  venueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.hairline,
    borderRadius: theme.radius.xl,
    padding: theme.spacing[3],
    gap: theme.spacing[3],
  },
  venueImage: {
    width: 80,
    height: 80,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.mist,
    borderWidth: 1,
    borderColor: theme.colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  venueImageInitial: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.concrete,
  },
  venueInfo: {
    flex: 1,
    gap: 4,
  },
  venueName: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.graphite,
  },
  venueNeighborhood: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.concrete,
  },
  vibeRow: {
    flexDirection: 'row',
    gap: theme.spacing[1],
    marginTop: 2,
  },
  vibeChip: {
    paddingHorizontal: theme.spacing[2],
    paddingVertical: 2,
    borderRadius: theme.radius.pills,
    borderWidth: 1,
    borderColor: theme.colors.hairline,
    backgroundColor: theme.colors.mist,
  },
  vibeChipText: {
    fontSize: 11,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.concrete,
  },
  venuePrice: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.graphite,
    marginTop: 2,
  },

  /* Delete Hint */
  deleteHint: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteHintIcon: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.ash,
  },

  /* Empty State */
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing[8],
    gap: theme.spacing[4],
  },
  emptyIllustration: {
    width: 120,
    height: 120,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.mist,
    borderWidth: 1,
    borderColor: theme.colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIllustrationText: {
    fontSize: 32,
    color: theme.colors.ash,
  },
  emptyText: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.concrete,
    textAlign: 'center',
  },
});
