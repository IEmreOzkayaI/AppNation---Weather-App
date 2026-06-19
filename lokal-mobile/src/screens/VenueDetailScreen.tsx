import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { theme } from '../theme';
import { MOCK_VENUES } from '../data/mockData';
import type { Venue, Comment } from '../types';

/* -- Route typing ---------------------------------------- */

type VenueDetailRouteProp = RouteProp<
  { VenueDetail: { venueId: string } },
  'VenueDetail'
>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_HEIGHT = 300;

/* -- Helpers --------------------------------------------- */

const priceSymbols = (range: number): string =>
  Array(range).fill('₺').join('');

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
};

const idealTimeLabels: Record<string, string> = {
  sabah: 'Sabah',
  oglen: 'Öğlen',
  aksam: 'Akşam',
  gece: 'Gece',
};

const entryDifficultyLabels: Record<string, string> = {
  kolay: 'Kolay',
  orta: 'Orta',
  zor: 'Zor',
};

const crowdLabels: Record<string, string> = {
  sakin: 'Sakin',
  orta: 'Orta',
  kalabalik: 'Kalabalık',
};

/* -- Sub-components -------------------------------------- */

function FullBleedDivider() {
  return <View style={styles.fullBleedDivider} />;
}

function SectionTitle({ title }: { title: string }) {
  return (
    <View style={styles.sectionTitleRow}>
      <View style={styles.sectionTitleAccent} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function NoiseBars({ level }: { level: number }) {
  const barHeights = [8, 12, 16, 14, 20];
  return (
    <View style={styles.noiseBarsRow}>
      {barHeights.map((h, i) => (
        <View
          key={i}
          style={[
            styles.noiseBar,
            {
              height: h,
              backgroundColor:
                i < level ? theme.colors.graphite : theme.colors.hairline,
            },
          ]}
        />
      ))}
    </View>
  );
}

function DotRating({ rating }: { rating: number }) {
  return (
    <View style={styles.dotRatingRow}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Text
          key={i}
          style={[
            styles.dotRatingChar,
            {
              color:
                i <= rating ? theme.colors.graphite : theme.colors.hairline,
            },
          ]}
        >
          {'●'}
        </Text>
      ))}
    </View>
  );
}

function InfoGridCell({
  label,
  value,
  showRightBorder,
  showBottomBorder,
}: {
  label: string;
  value: React.ReactNode;
  showRightBorder?: boolean;
  showBottomBorder?: boolean;
}) {
  return (
    <View
      style={[
        styles.gridCell,
        showRightBorder && styles.gridCellRightBorder,
        showBottomBorder && styles.gridCellBottomBorder,
      ]}
    >
      <Text style={styles.gridCellLabel}>{label}</Text>
      {typeof value === 'string' ? (
        <Text style={styles.gridCellValue}>{value}</Text>
      ) : (
        <View style={styles.gridCellValueContainer}>{value}</View>
      )}
    </View>
  );
}

function PracticalInfoRow({
  icon,
  text,
  isLast,
}: {
  icon: string;
  text: string;
  isLast?: boolean;
}) {
  return (
    <View
      style={[styles.practicalRow, !isLast && styles.practicalRowBorder]}
    >
      <Text style={styles.practicalIcon}>{icon}</Text>
      <Text style={styles.practicalText}>{text}</Text>
    </View>
  );
}

function CommentCard({ comment }: { comment: Comment }) {
  const initial = comment.userName.charAt(0).toUpperCase();

  return (
    <View style={styles.commentCard}>
      <View style={styles.commentHeader}>
        <View style={styles.commentAvatar}>
          <Text style={styles.commentAvatarText}>{initial}</Text>
        </View>
        <View style={styles.commentMeta}>
          <Text style={styles.commentUserName}>{comment.userName}</Text>
          <Text style={styles.commentDate}>
            {formatDate(comment.createdAt)}
          </Text>
        </View>
      </View>
      <Text style={styles.commentText}>{comment.text}</Text>
      <DotRating rating={comment.vibeRating} />
    </View>
  );
}

/* -- Main Screen ----------------------------------------- */

export default function VenueDetailScreen() {
  const route = useRoute<VenueDetailRouteProp>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { venueId } = route.params;

  const venue = MOCK_VENUES.find((v) => v.id === venueId);

  const [saved, setSaved] = useState(false);

  if (!venue) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Mekan bulunamadi.</Text>
      </View>
    );
  }

  const venueInitial = venue.name.charAt(0).toUpperCase();

  /* Build practical info rows */
  const practicalRows: { icon: string; text: string }[] = [
    { icon: '→', text: venue.address },
    { icon: '◷', text: venue.hours },
  ];
  if (venue.phone) {
    practicalRows.push({ icon: '☏', text: venue.phone });
  }
  if (venue.website) {
    practicalRows.push({ icon: '↗', text: venue.website });
  }
  practicalRows.push({
    icon: '◎',
    text: `Giriş: ${entryDifficultyLabels[venue.entryDifficulty]}`,
  });

  /* Build vibe grid data (2-column layout) */
  const gridItems: { label: string; value: React.ReactNode }[] = [
    { label: 'DRESS CODE', value: venue.dressCode },
    {
      label: 'GÜRÜLTÜ',
      value: <NoiseBars level={venue.noiseLevel} />,
    },
    {
      label: 'HAFTA İÇİ',
      value: crowdLabels[venue.crowdWeekday],
    },
    {
      label: 'HAFTA SONU',
      value: crowdLabels[venue.crowdWeekend],
    },
    { label: 'FİYAT', value: priceSymbols(venue.priceRange) },
    {
      label: 'İDEAL ZAMAN',
      value: venue.idealTime.map((t) => idealTimeLabels[t] || t).join(', '),
    },
  ];

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* -- 1. Hero Image Area ----------------------------- */}
        <View style={styles.heroContainer}>
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imageInitial}>{venueInitial}</Text>
          </View>

          {/* Gradient overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.4)']}
            style={styles.heroGradient}
          />

          {/* Venue name overlay on image */}
          <View style={[styles.heroTextOverlay]}>
            <Text style={styles.heroVenueName}>{venue.name}</Text>
            <Text style={styles.heroNeighborhood}>
              {venue.neighborhood}, {venue.city}
            </Text>
          </View>

          {/* Back button - frosted glass */}
          <Pressable
            style={[
              styles.frostedButton,
              styles.backButton,
              { top: insets.top + 12 },
            ]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.frostedButtonText}>{'←'}</Text>
          </Pressable>

          {/* Save button - frosted glass */}
          <Pressable
            style={[
              styles.frostedButton,
              styles.saveButton,
              { top: insets.top + 12 },
            ]}
            onPress={() => setSaved(!saved)}
          >
            <Text style={styles.frostedButtonText}>
              {saved ? '♥' : '♡'}
            </Text>
          </Pressable>
        </View>

        {/* -- 2. Vibe Match Badge ---------------------------- */}
        <View style={styles.section}>
          <View style={styles.vibeMatchBadge}>
            <Text style={styles.vibeMatchText}>
              % {venue.vibeMatchPercent} Uyum
            </Text>
          </View>

          {/* Vibe tags */}
          <View style={styles.vibeTagsRow}>
            {venue.vibe.map((v) => (
              <View key={v} style={styles.vibeTag}>
                <Text style={styles.vibeTagText}>{v}</Text>
              </View>
            ))}
          </View>
        </View>

        <FullBleedDivider />

        {/* -- 3. Vibe Section (Info Grid) -------------------- */}
        <View style={styles.section}>
          <SectionTitle title="Vibe" />

          <View style={styles.infoGrid}>
            {gridItems.map((item, index) => {
              const isLeftCol = index % 2 === 0;
              const rowIndex = Math.floor(index / 2);
              const totalRows = Math.ceil(gridItems.length / 2);
              const isLastRow = rowIndex === totalRows - 1;

              return (
                <InfoGridCell
                  key={item.label}
                  label={item.label}
                  value={item.value}
                  showRightBorder={isLeftCol}
                  showBottomBorder={!isLastRow}
                />
              );
            })}
          </View>
        </View>

        <FullBleedDivider />

        {/* -- 4. Music & Atmosphere -------------------------- */}
        <View style={styles.section}>
          <SectionTitle title="Müzik & Atmosfer" />

          <View style={styles.musicGenrePill}>
            <Text style={styles.musicGenreText}>{venue.musicGenre}</Text>
          </View>

          <Text style={styles.audioProfileText}>{venue.audioProfile}</Text>

          {venue.playlistUrl && (
            <Pressable style={styles.playlistButton}>
              <Text style={styles.playlistButtonText}>
                Playlist'i Aç {'→'}
              </Text>
            </Pressable>
          )}
        </View>

        <FullBleedDivider />

        {/* -- 5. Pratik Bilgiler ----------------------------- */}
        <View style={styles.section}>
          <SectionTitle title="Pratik Bilgiler" />

          {/* Mini map placeholder */}
          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapPlaceholderText}>Harita</Text>
          </View>

          <View style={styles.practicalList}>
            {practicalRows.map((row, idx) => (
              <PracticalInfoRow
                key={idx}
                icon={row.icon}
                text={row.text}
                isLast={idx === practicalRows.length - 1}
              />
            ))}
          </View>
        </View>

        <FullBleedDivider />

        {/* -- 6. Community ----------------------------------- */}
        <View style={styles.section}>
          <SectionTitle title="Topluluk" />

          <View style={styles.checkInBadge}>
            <Text style={styles.checkInBadgeText}>
              {venue.checkInCount} check-in
            </Text>
          </View>

          <View style={styles.communityTagsRow}>
            {venue.tags.map((tag) => (
              <View key={tag} style={styles.communityTag}>
                <Text style={styles.communityTagText}>{tag}</Text>
              </View>
            ))}
          </View>

          {venue.comments.length > 0 && (
            <View style={styles.commentsList}>
              {venue.comments.map((comment) => (
                <CommentCard key={comment.id} comment={comment} />
              ))}
            </View>
          )}

          <Pressable style={styles.addCommentButton}>
            <Text style={styles.addCommentButtonText}>Yorum Ekle</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* -- 7. Bottom Action Bar (sticky) ------------------- */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Listeye Ekle</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Paylaş</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Benzer</Text>
        </Pressable>
      </View>
    </View>
  );
}

/* -- Styles ---------------------------------------------- */

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.chalk,
  },
  scrollView: {
    flex: 1,
  },

  /* Empty state */
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.chalk,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.concrete,
    fontWeight: theme.typography.weights.medium,
  },

  /* 1. Hero image area */
  heroContainer: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
    position: 'relative',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.hairline,
  },
  imageInitial: {
    fontSize: 64,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.ash,
  },
  heroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: IMAGE_HEIGHT * 0.5,
  },
  heroTextOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 24,
    right: 24,
  },
  heroVenueName: {
    fontSize: 24,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.chalk,
    marginBottom: 4,
  },
  heroNeighborhood: {
    fontSize: 14,
    color: theme.colors.chalk,
    opacity: 0.9,
  },

  /* Frosted glass buttons */
  frostedButton: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  frostedButtonText: {
    fontSize: 18,
    color: theme.colors.graphite,
  },
  backButton: {
    left: 16,
  },
  saveButton: {
    right: 16,
  },

  /* Section */
  section: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: theme.colors.chalk,
  },

  /* Full bleed divider */
  fullBleedDivider: {
    height: 1,
    backgroundColor: theme.colors.hairline,
  },

  /* Section title with accent bar */
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitleAccent: {
    width: 2,
    height: 16,
    backgroundColor: theme.colors.graphite,
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.graphite,
    letterSpacing: -0.3,
  },

  /* Vibe match badge */
  vibeMatchBadge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.graphite,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 9999,
    marginBottom: 16,
  },
  vibeMatchText: {
    fontSize: 14,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.chalk,
  },

  /* Vibe tags */
  vibeTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  vibeTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: theme.colors.hairline,
    backgroundColor: theme.colors.chalk,
  },
  vibeTagText: {
    fontSize: 12,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.graphite,
  },

  /* Info grid (Swiss grid) */
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridCell: {
    width: '50%',
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  gridCellRightBorder: {
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: theme.colors.hairline,
  },
  gridCellBottomBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.hairline,
  },
  gridCellLabel: {
    fontSize: 11,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.ash,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  gridCellValue: {
    fontSize: 14,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.graphite,
  },
  gridCellValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  /* Noise bars (equalizer) */
  noiseBarsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    height: 20,
  },
  noiseBar: {
    width: 3,
    borderRadius: 1.5,
  },

  /* Dot rating */
  dotRatingRow: {
    flexDirection: 'row',
    gap: 3,
  },
  dotRatingChar: {
    fontSize: 10,
  },

  /* Music section */
  musicGenrePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: theme.colors.hairline,
    marginBottom: 12,
  },
  musicGenreText: {
    fontSize: 14,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.graphite,
  },
  audioProfileText: {
    fontSize: 14,
    color: theme.colors.concrete,
    marginBottom: 16,
    lineHeight: 20,
  },
  playlistButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.graphite,
  },
  playlistButtonText: {
    fontSize: 14,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.graphite,
  },

  /* Practical info */
  mapPlaceholder: {
    height: 120,
    borderRadius: 10,
    backgroundColor: theme.colors.mist,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  mapPlaceholderText: {
    fontSize: 12,
    color: theme.colors.ash,
    fontWeight: theme.typography.weights.medium,
  },
  practicalList: {},
  practicalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  practicalRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.hairline,
  },
  practicalIcon: {
    fontSize: 16,
    width: 28,
    textAlign: 'left',
    color: theme.colors.graphite,
    fontFamily: undefined, // system default for monospace-like chars
  },
  practicalText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.graphite,
    lineHeight: 20,
  },

  /* Community */
  checkInBadge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.mist,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    marginBottom: 16,
  },
  checkInBadgeText: {
    fontSize: 12,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.graphite,
  },
  communityTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  communityTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: theme.colors.hairline,
  },
  communityTagText: {
    fontSize: 12,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.graphite,
  },
  commentsList: {
    gap: 12,
    marginBottom: 20,
  },
  commentCard: {
    backgroundColor: '#f2f2f2',
    borderRadius: 14,
    padding: 16,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.chalk,
    borderWidth: 2,
    borderColor: theme.colors.chalk,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  commentAvatarText: {
    fontSize: 14,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.graphite,
  },
  commentMeta: {
    flex: 1,
  },
  commentUserName: {
    fontSize: 14,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.graphite,
  },
  commentDate: {
    fontSize: 12,
    color: theme.colors.ash,
    marginTop: 2,
  },
  commentText: {
    fontSize: 14,
    color: theme.colors.graphite,
    lineHeight: 20,
    marginBottom: 8,
  },
  addCommentButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.graphite,
  },
  addCommentButtonText: {
    fontSize: 14,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.graphite,
  },

  /* Bottom action bar */
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 24,
    paddingTop: 12,
    backgroundColor: theme.colors.chalk,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.hairline,
  },
  primaryButton: {
    flex: 2,
    backgroundColor: theme.colors.graphite,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.chalk,
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.graphite,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.graphite,
  },
});
