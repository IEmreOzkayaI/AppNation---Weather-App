import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { theme } from '../theme';
import { MOCK_USER, MOCK_VENUES, MOCK_LISTS } from '../data/mockData';
import LokalMascot from '../components/LokalMascot';

type TabKey = 'saved' | 'lists';

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>('saved');

  const user = MOCK_USER;
  const savedVenues = MOCK_VENUES.filter((v) =>
    user.savedVenueIds.includes(v.id),
  );
  const savedMekanCount = savedVenues.length;

  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  /* ── Saved venues grid (2 columns) ── */
  const renderSavedGrid = () => {
    const rows: React.ReactNode[] = [];
    for (let i = 0; i < savedVenues.length; i += 2) {
      const left = savedVenues[i];
      const right = savedVenues[i + 1];
      rows.push(
        <View key={i} style={styles.gridRow}>
          {renderVenueCard(left)}
          {right ? renderVenueCard(right) : <View style={styles.gridCardSpacer} />}
        </View>,
      );
    }
    return <View style={styles.gridContainer}>{rows}</View>;
  };

  const renderVenueCard = (venue: (typeof MOCK_VENUES)[number]) => (
    <View key={venue.id} style={styles.venueCard}>
      <View style={styles.venueCardImage}>
        <Text style={styles.venueCardInitial}>{getInitial(venue.name)}</Text>
      </View>
      <View style={styles.venueCardBody}>
        <Text style={styles.venueCardName} numberOfLines={1}>
          {venue.name}
        </Text>
        <Text style={styles.venueCardNeighborhood}>{venue.neighborhood}</Text>
      </View>
    </View>
  );

  /* ── Lists tab ── */
  const renderLists = () => (
    <View style={styles.listsContainer}>
      {MOCK_LISTS.map((list, index) => {
        const listVenues = MOCK_VENUES.filter((v) =>
          list.venueIds.includes(v.id),
        );
        return (
          <View
            key={list.id}
            style={[
              styles.listRow,
              index < MOCK_LISTS.length - 1 && styles.listRowBorder,
            ]}
          >
            <View style={styles.listAvatars}>
              {listVenues.slice(0, 4).map((v, idx) => (
                <View
                  key={v.id}
                  style={[
                    styles.listAvatarCircle,
                    { marginLeft: idx === 0 ? 0 : -8 },
                  ]}
                >
                  <Text style={styles.listAvatarText}>
                    {getInitial(v.name)}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.listRowContent}>
              <Text style={styles.listRowName} numberOfLines={1}>
                {list.name}
              </Text>
              <Text style={styles.listRowMeta} numberOfLines={1}>
                {list.venueIds.length} mekan {'·'}{' '}
                {list.isPublic ? 'Herkese acik' : 'Gizli'}
              </Text>
              {list.description ? (
                <Text style={styles.listRowDescription} numberOfLines={1}>
                  {list.description}
                </Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );

  /* ── Settings rows ── */
  const settingsItems = ['Bildirimler', 'Gizlilik', 'Yardim', 'Hakkinda'];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Profile Header ── */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarInitial}>
            {getInitial(user.name)}
          </Text>
        </View>

        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userHandle}>@{user.username}</Text>
        {user.bio ? (
          <Text style={styles.userBio} numberOfLines={2}>
            {user.bio}
          </Text>
        ) : null}

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.followers}</Text>
            <Text style={styles.statLabel}>TAKIPCI</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.following}</Text>
            <Text style={styles.statLabel}>TAKIP</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{savedMekanCount}</Text>
            <Text style={styles.statLabel}>MEKAN</Text>
          </View>
        </View>
      </View>

      {/* ── Action Buttons ── */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
          <Text style={styles.actionButtonText}>Profili Duzenle</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
          <Text style={styles.actionButtonText}>Paylas</Text>
        </TouchableOpacity>
      </View>

      {/* ── Tab Switcher ── */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'saved' && styles.tabActive]}
          onPress={() => setActiveTab('saved')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'saved' && styles.tabTextActive,
            ]}
          >
            Kaydedilenler
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'lists' && styles.tabActive]}
          onPress={() => setActiveTab('lists')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'lists' && styles.tabTextActive,
            ]}
          >
            Listelerim
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Tab Content ── */}
      {activeTab === 'saved' ? renderSavedGrid() : renderLists()}

      {/* ── Settings Section ── */}
      <View style={styles.settingsSection}>
        {settingsItems.map((label, index) => (
          <View
            key={label}
            style={[
              styles.settingsRow,
              index < settingsItems.length - 1 && styles.settingsRowBorder,
            ]}
          >
            <Text style={styles.settingsLabel}>{label}</Text>
            <Text style={styles.settingsArrow}>{'→'}</Text>
          </View>
        ))}
      </View>

      {/* ── Logout ── */}
      <TouchableOpacity style={styles.logoutButton} activeOpacity={0.7}>
        <Text style={styles.logoutText}>Cikis Yap</Text>
      </TouchableOpacity>

      {/* ── Footer ── */}
      <View style={styles.footer}>
        <LokalMascot size={40} />
        <Text style={styles.footerBrand}>lokal</Text>
        <Text style={styles.footerVersion}>v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.chalk,
  },
  content: {
    paddingTop: theme.spacing[10],
    paddingBottom: theme.spacing[10],
  },

  /* ── Header ── */
  header: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing[4],
    gap: theme.spacing['1.25'],
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: theme.colors.mist,
    borderWidth: 2,
    borderColor: theme.colors.graphite,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing[3],
  },
  avatarInitial: {
    fontSize: 28,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.graphite,
  },
  userName: {
    fontSize: 22,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.graphite,
  },
  userHandle: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.concrete,
  },
  userBio: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.concrete,
    textAlign: 'center',
    marginTop: theme.spacing[1],
    lineHeight: 20,
  },

  /* ── Stats ── */
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing[5],
    paddingHorizontal: theme.spacing[6],
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statNumber: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.graphite,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.ash,
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: theme.colors.hairline,
  },

  /* ── Action Buttons ── */
  actionRow: {
    flexDirection: 'row',
    gap: theme.spacing[3],
    marginTop: theme.spacing[6],
    paddingHorizontal: theme.spacing[4],
  },
  actionButton: {
    flex: 1,
    height: 44,
    backgroundColor: theme.colors.mist,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.graphite,
  },

  /* ── Tab Switcher ── */
  tabBar: {
    flexDirection: 'row',
    marginTop: theme.spacing[8],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.hairline,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: theme.spacing[3],
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.graphite,
  },
  tabText: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.concrete,
  },
  tabTextActive: {
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.graphite,
  },

  /* ── Saved Grid ── */
  gridContainer: {
    marginTop: theme.spacing[4],
    paddingHorizontal: theme.spacing[4],
    gap: theme.spacing[3],
  },
  gridRow: {
    flexDirection: 'row',
    gap: theme.spacing[3],
  },
  gridCardSpacer: {
    flex: 1,
  },
  venueCard: {
    flex: 1,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
  },
  venueCardImage: {
    width: '100%',
    aspectRatio: 1 / 1.2,
    backgroundColor: theme.colors.mist,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  venueCardInitial: {
    fontSize: 28,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.ash,
  },
  venueCardBody: {
    paddingTop: theme.spacing[2],
    gap: 2,
  },
  venueCardName: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.graphite,
  },
  venueCardNeighborhood: {
    fontSize: 11,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.concrete,
  },

  /* ── Lists ── */
  listsContainer: {
    marginTop: theme.spacing[4],
    paddingHorizontal: theme.spacing[4],
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 72,
    paddingVertical: theme.spacing[4],
    gap: theme.spacing[4],
  },
  listRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.hairline,
  },
  listAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listAvatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.mist,
    borderWidth: 2,
    borderColor: theme.colors.chalk,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listAvatarText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.concrete,
  },
  listRowContent: {
    flex: 1,
    gap: 2,
  },
  listRowName: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.graphite,
  },
  listRowMeta: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.concrete,
  },
  listRowDescription: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.concrete,
    marginTop: 2,
  },

  /* ── Settings ── */
  settingsSection: {
    marginTop: theme.spacing[10],
    paddingHorizontal: theme.spacing[4],
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing[4],
  },
  settingsRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.hairline,
  },
  settingsLabel: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.graphite,
  },
  settingsArrow: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.ash,
  },

  /* ── Logout ── */
  logoutButton: {
    alignItems: 'center',
    paddingVertical: theme.spacing[4],
    marginTop: theme.spacing[8],
  },
  logoutText: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.concrete,
  },

  /* ── Footer ── */
  footer: {
    alignItems: 'center',
    marginTop: theme.spacing[8],
    gap: theme.spacing[1],
  },
  footerBrand: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.graphite,
    marginTop: theme.spacing[2],
  },
  footerVersion: {
    fontSize: 11,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.ash,
  },
});
