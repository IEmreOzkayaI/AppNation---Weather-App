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

import { theme } from '../theme';
import { MOCK_VENUES } from '../data/mockData';
import type { Venue, Comment } from '../types';

/* ── Route typing ─────────────────────────────────── */

type VenueDetailRouteProp = RouteProp<
  { VenueDetail: { venueId: string } },
  'VenueDetail'
>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_HEIGHT = 250;

/* ── Helpers ──────────────────────────────────────── */

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
  sakin: 'sakin',
  orta: 'orta',
  kalabalik: 'kalabali̇k',
};

/* ── Sub-components ───────────────────────────────── */

function Divider() {
  return <View style={styles.divider} />;
}

function Chip({ label, filled }: { label: string; filled?: boolean }) {
  return (
    <View
      style={[
        styles.chip,
        filled && {
          backgroundColor: theme.colors.graphite,
        },
      ]}
    >
      <Text
        style={[
          styles.chipText,
          filled && { color: theme.colors.chalk },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

function NoiseDots({ level }: { level: number }) {
  return (
    <View style={styles.dotsRow}>
      {[1, 2, 3, 4, 5].map((i) => (
        <View
          key={i}
          style={[
            styles.dot,
            {
              backgroundColor:
                i <= level ? theme.colors.graphite : theme.colors.hairline,
            },
          ]}
        />
      ))}
    </View>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Text
          key={i}
          style={[
            styles.star,
            {
              color:
                i <= rating ? theme.colors.graphite : theme.colors.hairline,
            },
          ]}
        >
          {'★'}
        </Text>
      ))}
    </View>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <View style={styles.infoValue}>{children}</View>
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
      <StarRating rating={comment.vibeRating} />
    </View>
  );
}

/* ── Main Screen ──────────────────────────────────── */

export default function VenueDetailScreen() {
  const route = useRoute<VenueDetailRouteProp>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { venueId } = route.params;

  const venue = MOCK_VENUES.find((v) => v.id === venueId);

  const [saved, setSaved] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!venue) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Mekan bulunamadi.</Text>
      </View>
    );
  }

  const allImages = [venue.coverImage, ...venue.images];
  const venueInitial = venue.name.charAt(0).toUpperCase();

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 1. Visual Content ──────────────────────── */}
        <View style={styles.imageContainer}>
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imageInitial}>{venueInitial}</Text>
          </View>

          {/* Carousel dots */}
          <View style={styles.carouselDots}>
            {allImages.map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.carouselDot,
                  {
                    backgroundColor:
                      idx === activeImageIndex
                        ? theme.colors.chalk
                        : 'rgba(255,255,255,0.4)',
                  },
                ]}
              />
            ))}
          </View>

          {/* Back button */}
          <Pressable
            style={[styles.overlayButton, styles.backButton, { top: insets.top + 12 }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.overlayButtonText}>{'←'}</Text>
          </Pressable>

          {/* Save button */}
          <Pressable
            style={[styles.overlayButton, styles.saveButton, { top: insets.top + 12 }]}
            onPress={() => setSaved(!saved)}
          >
            <Text style={styles.overlayButtonText}>
              {saved ? '♥' : '♡'}
            </Text>
          </Pressable>
        </View>

        {/* ── 2. Venue Header ────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.venueName}>{venue.name}</Text>
          <Text style={styles.venueLocation}>
            {venue.neighborhood}, {venue.city}
          </Text>

          <View style={styles.headerMetaRow}>
            <Text style={styles.priceText}>{priceSymbols(venue.priceRange)}</Text>
            <Chip label={venue.dressCode} />
            <NoiseDots level={venue.noiseLevel} />
          </View>

          <View style={styles.vibeMatchBadge}>
            <Text style={styles.vibeMatchText}>
              % {venue.vibeMatchPercent} Uyum
            </Text>
          </View>
        </View>

        <Divider />

        {/* ── 3. Vibe Indicators ─────────────────────── */}
        <View style={styles.section}>
          <SectionTitle title="Vibe" />

          <View style={styles.vibeGrid}>
            <InfoRow label="Dress Code">
              <Chip label={venue.dressCode} />
            </InfoRow>

            <InfoRow label="Gürültü">
              <NoiseDots level={venue.noiseLevel} />
            </InfoRow>

            <InfoRow label="Yoğunluk">
              <Text style={styles.infoValueText}>
                Hafta içi: {crowdLabels[venue.crowdWeekday]} / Hafta sonu:{' '}
                {crowdLabels[venue.crowdWeekend]}
              </Text>
            </InfoRow>

            <InfoRow label="Fiyat">
              <Text style={styles.infoValueText}>
                {priceSymbols(venue.priceRange)}
              </Text>
            </InfoRow>

            <InfoRow label="Ortam">
              <View style={styles.chipsRow}>
                {venue.vibe.map((v) => (
                  <Chip key={v} label={v} />
                ))}
              </View>
            </InfoRow>

            <InfoRow label="İdeal Zaman">
              <View style={styles.chipsRow}>
                {venue.idealTime.map((t) => (
                  <Chip key={t} label={idealTimeLabels[t] || t} />
                ))}
              </View>
            </InfoRow>
          </View>
        </View>

        <Divider />

        {/* ── 4. Audio & Atmosphere ──────────────────── */}
        <View style={styles.section}>
          <SectionTitle title="Müzik & Atmosfer" />

          <Chip label={venue.musicGenre} />

          <Text style={styles.audioProfileText}>{venue.audioProfile}</Text>

          {venue.playlistUrl && (
            <Pressable style={styles.outlinedButton}>
              <Text style={styles.outlinedButtonText}>
                Playlist'i Aç {'→'}
              </Text>
            </Pressable>
          )}
        </View>

        <Divider />

        {/* ── 5. Pratik Bilgiler ─────────────────────── */}
        <View style={styles.section}>
          <SectionTitle title="Pratik Bilgiler" />

          {/* Mini map placeholder */}
          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapPlaceholderText}>Harita</Text>
          </View>
          <Text style={styles.addressText}>{venue.address}</Text>

          <View style={styles.practicalRow}>
            <Text style={styles.practicalIcon}>{'⏰'}</Text>
            <Text style={styles.practicalText}>{venue.hours}</Text>
          </View>

          {venue.phone && (
            <View style={styles.practicalRow}>
              <Text style={styles.practicalIcon}>{'☎'}</Text>
              <Text style={styles.practicalText}>{venue.phone}</Text>
            </View>
          )}

          {venue.website && (
            <View style={styles.practicalRow}>
              <Text style={styles.practicalIcon}>{'\u{1F310}'}</Text>
              <Text style={styles.practicalText}>{venue.website}</Text>
            </View>
          )}

          <View style={styles.practicalRow}>
            <Text style={styles.practicalIcon}>{'\u{1F6AA}'}</Text>
            <Text style={styles.practicalText}>
              Giriş: {entryDifficultyLabels[venue.entryDifficulty]}
            </Text>
          </View>
        </View>

        <Divider />

        {/* ── 6. Community ───────────────────────────── */}
        <View style={styles.section}>
          <SectionTitle title="Topluluk" />

          <View style={styles.checkInBadge}>
            <Text style={styles.checkInBadgeText}>
              {venue.checkInCount} check-in
            </Text>
          </View>

          <View style={styles.chipsRow}>
            {venue.tags.map((tag) => (
              <Chip key={tag} label={tag} />
            ))}
          </View>

          <View style={styles.commentsList}>
            {venue.comments.map((comment) => (
              <CommentCard key={comment.id} comment={comment} />
            ))}
          </View>

          <Pressable style={styles.outlinedButton}>
            <Text style={styles.outlinedButtonText}>Yorum Ekle</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* ── 7. Action Buttons (sticky bottom) ────── */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable style={styles.filledButton}>
          <Text style={styles.filledButtonText}>Listeye Ekle</Text>
        </Pressable>
        <Pressable style={styles.actionOutlinedButton}>
          <Text style={styles.actionOutlinedButtonText}>Paylaş</Text>
        </Pressable>
        <Pressable style={styles.actionOutlinedButton}>
          <Text style={styles.actionOutlinedButtonText}>Benzer Mekanlar</Text>
        </Pressable>
      </View>
    </View>
  );
}

/* ── Styles ───────────────────────────────────────── */

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
    fontSize: theme.typography.sizes.md,
    color: theme.colors.concrete,
    fontWeight: theme.typography.weights.medium,
  },

  /* 1. Image area */
  imageContainer: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
    backgroundColor: theme.colors.mist,
    position: 'relative',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.hairline,
  },
  imageInitial: {
    fontSize: theme.typography.sizes.display,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.ash,
  },
  carouselDots: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  carouselDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  overlayButton: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.chalk,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.hairline,
  },
  overlayButtonText: {
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.graphite,
  },
  backButton: {
    left: 16,
  },
  saveButton: {
    right: 16,
  },

  /* 2. Venue header */
  section: {
    paddingHorizontal: theme.spacing['4'],
    paddingVertical: theme.spacing['4'],
    backgroundColor: theme.colors.chalk,
  },
  venueName: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.graphite,
    marginBottom: theme.spacing['1'],
  },
  venueLocation: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.concrete,
    marginBottom: theme.spacing['3'],
  },
  headerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing['3'],
    marginBottom: theme.spacing['3'],
  },
  priceText: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.graphite,
  },
  vibeMatchBadge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.graphite,
    paddingHorizontal: theme.spacing['3'],
    paddingVertical: theme.spacing['1.5'],
    borderRadius: theme.radius.badges,
  },
  vibeMatchText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.chalk,
  },

  /* Divider */
  divider: {
    height: 1,
    backgroundColor: theme.colors.hairline,
    marginHorizontal: theme.spacing['4'],
  },

  /* Section title */
  sectionTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.graphite,
    marginBottom: theme.spacing['4'],
  },

  /* 3. Vibe indicators */
  vibeGrid: {
    gap: theme.spacing['4'],
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoLabel: {
    width: 100,
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.concrete,
    fontWeight: theme.typography.weights.medium,
    paddingTop: 2,
  },
  infoValue: {
    flex: 1,
  },
  infoValueText: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.graphite,
    fontWeight: theme.typography.weights.regular,
  },

  /* Chips */
  chip: {
    paddingHorizontal: theme.spacing['3'],
    paddingVertical: theme.spacing['1'],
    borderRadius: theme.radius.pills,
    borderWidth: 1,
    borderColor: theme.colors.hairline,
    backgroundColor: theme.colors.chalk,
    alignSelf: 'flex-start',
  },
  chipText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.graphite,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing['2'],
  },

  /* Noise dots */
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingTop: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  /* 4. Audio */
  audioProfileText: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.concrete,
    marginTop: theme.spacing['2'],
    marginBottom: theme.spacing['3'],
  },

  /* Outlined button */
  outlinedButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing['4'],
    paddingVertical: theme.spacing['2.5'],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.graphite,
    marginTop: theme.spacing['2'],
  },
  outlinedButtonText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.graphite,
  },

  /* 5. Practical info */
  mapPlaceholder: {
    height: 120,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.mist,
    borderWidth: 1,
    borderColor: theme.colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing['3'],
  },
  mapPlaceholderText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.ash,
    fontWeight: theme.typography.weights.medium,
  },
  addressText: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.graphite,
    marginBottom: theme.spacing['4'],
  },
  practicalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing['2'],
    marginBottom: theme.spacing['3'],
  },
  practicalIcon: {
    fontSize: theme.typography.sizes.md,
    width: 24,
    textAlign: 'center',
  },
  practicalText: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.graphite,
  },

  /* 6. Community */
  checkInBadge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.mist,
    paddingHorizontal: theme.spacing['3'],
    paddingVertical: theme.spacing['1.5'],
    borderRadius: theme.radius.badges,
    borderWidth: 1,
    borderColor: theme.colors.hairline,
    marginBottom: theme.spacing['3'],
  },
  checkInBadgeText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.graphite,
  },
  commentsList: {
    marginTop: theme.spacing['4'],
    gap: theme.spacing['4'],
  },
  commentCard: {
    borderWidth: 1,
    borderColor: theme.colors.hairline,
    borderRadius: theme.radius.xl,
    padding: theme.spacing['4'],
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing['2'],
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.mist,
    borderWidth: 1,
    borderColor: theme.colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing['3'],
  },
  commentAvatarText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.graphite,
  },
  commentMeta: {
    flex: 1,
  },
  commentUserName: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.graphite,
  },
  commentDate: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.ash,
  },
  commentText: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.graphite,
    lineHeight: 20,
    marginBottom: theme.spacing['2'],
  },

  /* Stars */
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  star: {
    fontSize: theme.typography.sizes.sm,
  },

  /* 7. Bottom action bar */
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: theme.spacing['2'],
    paddingHorizontal: theme.spacing['4'],
    paddingTop: theme.spacing['3'],
    backgroundColor: theme.colors.chalk,
    borderTopWidth: 1,
    borderTopColor: theme.colors.hairline,
  },
  filledButton: {
    flex: 1,
    backgroundColor: theme.colors.graphite,
    paddingVertical: theme.spacing['3'],
    borderRadius: theme.radius.lg,
    alignItems: 'center',
  },
  filledButtonText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.chalk,
  },
  actionOutlinedButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.graphite,
    paddingVertical: theme.spacing['3'],
    borderRadius: theme.radius.lg,
    alignItems: 'center',
  },
  actionOutlinedButtonText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.graphite,
  },
});
