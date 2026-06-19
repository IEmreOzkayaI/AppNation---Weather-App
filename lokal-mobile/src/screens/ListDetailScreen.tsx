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

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const months = [
    'Oca', 'Sub', 'Mar', 'Nis', 'May', 'Haz',
    'Tem', 'Agu', 'Eyl', 'Eki', 'Kas', 'Ara',
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

/* ── Venue Row ────────────────────────────────────── */

function VenueRow({ venue, isLast }: { venue: Venue; isLast: boolean }) {
  const vibeChips = venue.vibe.slice(0, 2);

  return (
    <View style={[styles.venueRow, !isLast && styles.venueRowBorder]}>
      <View style={styles.venueImage}>
        <Text style={styles.venueImageInitial}>{getInitial(venue.name)}</Text>
      </View>

      <View style={styles.venueInfo}>
        <Text style={styles.venueName} numberOfLines={1}>
          {venue.name}
        </Text>
        <Text style={styles.venueNeighborhood}>{venue.neighborhood}</Text>

        {vibeChips.length > 0 && (
          <View style={styles.vibeRow}>
            {vibeChips.map((vibe) => (
              <View key={vibe} style={styles.vibeChip}>
                <Text style={styles.vibeChipText}>{vibe}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

/* ── Empty State ──────────────────────────────────── */

function EmptyState() {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptySymbol}>{'◇'}</Text>
      <Text style={styles.emptyText}>Bu listede henuz mekan yok</Text>
      <Text style={styles.emptyHint}>Kesfet'ten mekan ekle</Text>
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
            style={styles.headerCircle}
          >
            <Text style={styles.headerCircleIcon}>{'←'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Liste bulunamadi</Text>
          <View style={styles.headerCircleSpacer} />
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
          style={styles.headerCircle}
        >
          <Text style={styles.headerCircleIcon}>{'←'}</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {list.name}
        </Text>

        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.headerCircle}
        >
          <Text style={styles.headerCircleIcon}>{'↗'}</Text>
        </TouchableOpacity>
      </View>

      {/* Info Bar */}
      <View style={styles.infoBar}>
        <Text style={styles.infoText}>{venues.length} mekan</Text>
        <Text style={styles.infoDot}>{'·'}</Text>
        <Text style={styles.infoText}>
          {list.isPublic ? 'Herkese acik' : 'Gizli'}
        </Text>
        <Text style={styles.infoDot}>{'·'}</Text>
        <Text style={styles.infoText}>{formatDate(list.createdAt)}</Text>
      </View>

      {/* Description */}
      {list.description ? (
        <Text style={styles.description}>{list.description}</Text>
      ) : null}

      {/* Venue List */}
      {venues.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={venues}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <VenueRow venue={item} isLast={index === venues.length - 1} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
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
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
  },
  headerCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.mist,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCircleSpacer: {
    width: 40,
    height: 40,
  },
  headerCircleIcon: {
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.graphite,
  },
  headerTitle: {
    flex: 1,
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.graphite,
    textAlign: 'center',
    marginHorizontal: theme.spacing[3],
  },

  /* Info Bar */
  infoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing[4],
    paddingTop: theme.spacing[1],
    paddingBottom: theme.spacing[3],
    gap: theme.spacing[2],
  },
  infoText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.concrete,
  },
  infoDot: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.ash,
  },

  /* Description */
  description: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.concrete,
    paddingHorizontal: theme.spacing[4],
    paddingBottom: theme.spacing[4],
    textAlign: 'center',
  },

  /* Venue List */
  listContent: {
    paddingHorizontal: theme.spacing[4],
    paddingBottom: theme.spacing[10],
  },

  /* Venue Row */
  venueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing[4],
    gap: theme.spacing[4],
  },
  venueRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.hairline,
  },
  venueImage: {
    width: 64,
    height: 64,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.mist,
    alignItems: 'center',
    justifyContent: 'center',
  },
  venueImageInitial: {
    fontSize: 22,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.ash,
  },
  venueInfo: {
    flex: 1,
    gap: 3,
  },
  venueName: {
    fontSize: 15,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.graphite,
  },
  venueNeighborhood: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.concrete,
  },
  vibeRow: {
    flexDirection: 'row',
    gap: theme.spacing['1.5'],
    marginTop: 4,
  },
  vibeChip: {
    paddingHorizontal: theme.spacing[2],
    paddingVertical: 3,
    borderRadius: theme.radius.pills,
    backgroundColor: theme.colors.mist,
  },
  vibeChipText: {
    fontSize: 11,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.concrete,
  },

  /* Empty State */
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing[8],
    gap: theme.spacing[3],
  },
  emptySymbol: {
    fontSize: 48,
    color: theme.colors.ash,
    marginBottom: theme.spacing[2],
  },
  emptyText: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.concrete,
    textAlign: 'center',
  },
  emptyHint: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.ash,
    textAlign: 'center',
  },
});
