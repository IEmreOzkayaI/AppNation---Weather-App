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

  const getInitial = (name: string) =>
    name.charAt(0).toUpperCase();

  // ── Saved venues grid (2 columns) ──
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
        <View style={styles.venueCardNameRow}>
          <Text style={styles.venueCardName} numberOfLines={1}>
            {venue.name}
          </Text>
          <Text style={styles.bookmarkIcon}>{'#'}</Text>
        </View>
        <Text style={styles.venueCardNeighborhood}>{venue.neighborhood}</Text>
      </View>
    </View>
  );

  // ── Lists tab ──
  const renderLists = () => (
    <View style={styles.listsContainer}>
      {MOCK_LISTS.map((list) => {
        const listVenues = MOCK_VENUES.filter((v) =>
          list.venueIds.includes(v.id),
        );
        return (
          <View key={list.id} style={styles.listItem}>
            <View style={styles.listItemHeader}>
              <Text style={styles.listItemName}>{list.name}</Text>
              <View style={styles.listBadge}>
                <Text style={styles.listBadgeText}>
                  {list.isPublic ? 'Herkese Acik' : 'Gizli'}
                </Text>
              </View>
            </View>
            <Text style={styles.listVenueCount}>
              {list.venueIds.length} mekan
            </Text>
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
          </View>
        );
      })}
    </View>
  );

  // ── Settings row helpers ──
  const renderSettingsRow = (
    label: string,
    trailing: 'arrow' | 'toggle' | React.ReactNode,
    isLast = false,
  ) => (
    <View
      style={[
        styles.settingsRow,
        !isLast && styles.settingsRowBorder,
      ]}
    >
      <Text style={styles.settingsLabel}>{label}</Text>
      {trailing === 'arrow' && (
        <Text style={styles.settingsArrow}>{'>'}</Text>
      )}
      {trailing === 'toggle' && (
        <View style={styles.toggleTrack}>
          <View style={styles.toggleThumb} />
        </View>
      )}
      {typeof trailing !== 'string' && trailing}
    </View>
  );

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
        {user.bio ? <Text style={styles.userBio}>{user.bio}</Text> : null}

        <Text style={styles.statsRow}>
          <Text style={styles.statNumber}>{user.followers}</Text>
          <Text style={styles.statLabel}> Takipci</Text>
          <Text style={styles.statLabel}> {'  '}  </Text>
          <Text style={styles.statNumber}>{user.following}</Text>
          <Text style={styles.statLabel}> Takip</Text>
          <Text style={styles.statLabel}> {'  '}  </Text>
          <Text style={styles.statNumber}>{savedMekanCount}</Text>
          <Text style={styles.statLabel}> Mekan</Text>
        </Text>
      </View>

      {/* ── Action Buttons ── */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.outlinedButton} activeOpacity={0.7}>
          <Text style={styles.outlinedButtonText}>Profili Duzenle</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.outlinedButton} activeOpacity={0.7}>
          <Text style={styles.outlinedButtonText}>Paylas</Text>
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
      <View style={styles.settingsDivider} />
      <View style={styles.settingsSection}>
        {renderSettingsRow('Bildirimler', 'toggle')}
        {renderSettingsRow('Gizlilik', 'arrow')}
        {renderSettingsRow('Yardim', 'arrow')}
        {renderSettingsRow(
          'Hakkinda',
          <View style={styles.aboutTrailing}>
            <LokalMascot size={32} />
            <Text style={styles.settingsArrow}>{'>'}</Text>
          </View>,
          true,
        )}
      </View>

      <TouchableOpacity style={styles.logoutButton} activeOpacity={0.7}>
        <Text style={styles.logoutText}>Cikis Yap</Text>
      </TouchableOpacity>

      {/* ── Footer ── */}
      <View style={styles.footer}>
        <LokalMascot size={48} />
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
    paddingHorizontal: theme.spacing['4'],
    paddingTop: theme.spacing['10'],
    paddingBottom: theme.spacing['10'],
  },

  // ── Header ──
  header: {
    alignItems: 'center',
    gap: theme.spacing['1'],
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.mist,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing['2'],
  },
  avatarInitial: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.graphite,
  },
  userName: {
    fontSize: theme.typography.sizes.lg,
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
    marginTop: theme.spacing['1'],
  },
  statsRow: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.concrete,
    marginTop: theme.spacing['2'],
  },
  statNumber: {
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.graphite,
  },
  statLabel: {
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.concrete,
  },

  // ── Action Buttons ──
  actionRow: {
    flexDirection: 'row',
    gap: theme.spacing['3'],
    marginTop: theme.spacing['5'],
  },
  outlinedButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.hairline,
    borderRadius: theme.radius.lg,
    paddingVertical: theme.spacing['3'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlinedButtonText: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.graphite,
  },

  // ── Tab Switcher ──
  tabBar: {
    flexDirection: 'row',
    marginTop: theme.spacing['6'],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.hairline,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: theme.spacing['3'],
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

  // ── Saved Grid ──
  gridContainer: {
    marginTop: theme.spacing['4'],
    gap: theme.spacing['3'],
  },
  gridRow: {
    flexDirection: 'row',
    gap: theme.spacing['3'],
  },
  gridCardSpacer: {
    flex: 1,
  },
  venueCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.hairline,
    borderRadius: theme.radius.xl,
    overflow: 'hidden',
  },
  venueCardImage: {
    width: '100%',
    height: 100,
    backgroundColor: theme.colors.mist,
    alignItems: 'center',
    justifyContent: 'center',
  },
  venueCardInitial: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.ash,
  },
  venueCardBody: {
    padding: theme.spacing['3'],
    gap: theme.spacing['1'],
  },
  venueCardNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  venueCardName: {
    flex: 1,
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.graphite,
  },
  bookmarkIcon: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.ash,
    marginLeft: theme.spacing['1'],
  },
  venueCardNeighborhood: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.concrete,
  },

  // ── Lists ──
  listsContainer: {
    marginTop: theme.spacing['4'],
    gap: theme.spacing['3'],
  },
  listItem: {
    borderWidth: 1,
    borderColor: theme.colors.hairline,
    borderRadius: theme.radius.xl,
    padding: theme.spacing['4'],
    gap: theme.spacing['2'],
  },
  listItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listItemName: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.graphite,
  },
  listBadge: {
    borderWidth: 1,
    borderColor: theme.colors.hairline,
    borderRadius: theme.radius.badges,
    paddingHorizontal: theme.spacing['2'],
    paddingVertical: theme.spacing['1'],
  },
  listBadgeText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.concrete,
  },
  listVenueCount: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.concrete,
  },
  listAvatars: {
    flexDirection: 'row',
    marginTop: theme.spacing['1'],
  },
  listAvatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.mist,
    borderWidth: 1,
    borderColor: theme.colors.chalk,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listAvatarText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.ash,
  },

  // ── Settings ──
  settingsDivider: {
    height: 1,
    backgroundColor: theme.colors.hairline,
    marginTop: theme.spacing['8'],
  },
  settingsSection: {
    marginTop: theme.spacing['4'],
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing['4'],
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
  toggleTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.mist,
    borderWidth: 1,
    borderColor: theme.colors.hairline,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleThumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.colors.chalk,
    borderWidth: 1,
    borderColor: theme.colors.hairline,
  },
  aboutTrailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing['2'],
  },

  // ── Logout ──
  logoutButton: {
    marginTop: theme.spacing['6'],
    alignItems: 'center',
    paddingVertical: theme.spacing['3'],
  },
  logoutText: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.concrete,
  },

  // ── Footer ──
  footer: {
    alignItems: 'center',
    marginTop: theme.spacing['8'],
    gap: theme.spacing['1'],
  },
  footerBrand: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.graphite,
    marginTop: theme.spacing['2'],
  },
  footerVersion: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.ash,
  },
});
