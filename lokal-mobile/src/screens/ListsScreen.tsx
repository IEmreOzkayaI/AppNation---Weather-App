import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  Modal,
  TextInput,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { theme } from '../theme';
import { MOCK_VENUES, MOCK_LISTS, MOCK_USER } from '../data/mockData';
import type { Venue, VenueList } from '../types';

/* ── Helpers ──────────────────────────────────────── */

function getInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

/* ── Saved Venue Mini Card ────────────────────────── */

function SavedVenueMiniCard({ venue }: { venue: Venue }) {
  return (
    <View style={styles.miniCard}>
      <View style={styles.miniCardImage}>
        <Text style={styles.miniCardInitial}>{getInitial(venue.name)}</Text>
      </View>
      <Text style={styles.miniCardName} numberOfLines={2}>
        {venue.name}
      </Text>
      <Text style={styles.miniCardNeighborhood} numberOfLines={1}>
        {venue.neighborhood}
      </Text>
    </View>
  );
}

/* ── Overlapping Venue Avatars ────────────────────── */

function VenueAvatarRow({ venueIds }: { venueIds: string[] }) {
  const shown = venueIds.slice(0, 4);
  return (
    <View style={styles.avatarRow}>
      {shown.map((id, index) => {
        const venue = MOCK_VENUES.find((v) => v.id === id);
        if (!venue) return null;
        return (
          <View
            key={id}
            style={[
              styles.avatarCircle,
              { marginLeft: index === 0 ? 0 : -8 },
            ]}
          >
            <Text style={styles.avatarInitial}>{getInitial(venue.name)}</Text>
          </View>
        );
      })}
    </View>
  );
}

/* ── List Row ─────────────────────────────────────── */

function ListRow({
  list,
  onPress,
  isLast,
}: {
  list: VenueList;
  onPress: () => void;
  isLast: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.listRow, !isLast && styles.listRowBorder]}
      onPress={onPress}
      activeOpacity={0.6}
    >
      <VenueAvatarRow venueIds={list.venueIds} />

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
    </TouchableOpacity>
  );
}

/* ── Main Screen ──────────────────────────────────── */

export default function ListsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const [modalVisible, setModalVisible] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [newListPublic, setNewListPublic] = useState(true);

  const savedVenues = MOCK_VENUES.filter((v) =>
    MOCK_USER.savedVenueIds.includes(v.id),
  );

  const handleCreateList = () => {
    setModalVisible(false);
    setNewListName('');
    setNewListDescription('');
    setNewListPublic(true);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Listelerim</Text>
        <TouchableOpacity
          style={styles.newListPill}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.newListPillText}>Yeni Liste +</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Saved Venues Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>KAYDEDILENLER</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{savedVenues.length}</Text>
            </View>
          </View>

          <FlatList
            data={savedVenues}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.savedList}
            renderItem={({ item }) => <SavedVenueMiniCard venue={item} />}
          />
        </View>

        {/* Lists Section */}
        <View style={styles.listsSection}>
          {MOCK_LISTS.map((list, index) => (
            <ListRow
              key={list.id}
              list={list}
              isLast={index === MOCK_LISTS.length - 1}
              onPress={() =>
                navigation.navigate('ListDetail', { listId: list.id })
              }
            />
          ))}
        </View>
      </ScrollView>

      {/* Create New List Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalContent}
            activeOpacity={1}
            onPress={() => {}}
          >
            <View style={styles.modalHandle} />

            <Text style={styles.modalTitle}>Yeni Liste</Text>

            <View style={styles.modalField}>
              <TextInput
                style={styles.modalInput}
                value={newListName}
                onChangeText={setNewListName}
                placeholder="Liste adi"
                placeholderTextColor={theme.colors.ash}
              />
            </View>

            <View style={styles.modalField}>
              <TextInput
                style={[styles.modalInput, styles.modalInputMultiline]}
                value={newListDescription}
                onChangeText={setNewListDescription}
                placeholder="Kisa bir aciklama"
                placeholderTextColor={theme.colors.ash}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.modalToggleRow}>
              <View>
                <Text style={styles.modalToggleLabel}>
                  {newListPublic ? 'Herkese acik' : 'Gizli'}
                </Text>
                <Text style={styles.modalToggleHint}>
                  {newListPublic
                    ? 'Herkes bu listeyi gorebilir'
                    : 'Sadece sen gorebilirsin'}
                </Text>
              </View>
              <Switch
                value={newListPublic}
                onValueChange={setNewListPublic}
                trackColor={{
                  false: theme.colors.hairline,
                  true: theme.colors.graphite,
                }}
                thumbColor={theme.colors.chalk}
              />
            </View>

            <TouchableOpacity
              style={styles.modalCreateButton}
              onPress={handleCreateList}
              activeOpacity={0.8}
            >
              <Text style={styles.modalCreateButtonText}>Olustur</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
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
    paddingTop: theme.spacing[4],
    paddingBottom: theme.spacing[5],
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.graphite,
    letterSpacing: -0.5,
  },
  newListPill: {
    backgroundColor: theme.colors.graphite,
    borderRadius: theme.radius.pills,
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing['2.5'],
  },
  newListPillText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.chalk,
  },

  /* Scroll */
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.spacing[10],
  },

  /* Section */
  section: {
    paddingTop: theme.spacing[2],
    gap: theme.spacing[4],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
    paddingHorizontal: theme.spacing[4],
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.ash,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  countBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.colors.graphite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeText: {
    fontSize: 10,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.chalk,
  },

  /* Saved Venues Horizontal List */
  savedList: {
    paddingHorizontal: theme.spacing[4],
    gap: theme.spacing[3],
  },
  miniCard: {
    width: 120,
    gap: theme.spacing['1.5'],
  },
  miniCardImage: {
    width: 120,
    height: 140,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.mist,
    borderWidth: 1,
    borderColor: theme.colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniCardInitial: {
    fontSize: 28,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.ash,
  },
  miniCardName: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.graphite,
  },
  miniCardNeighborhood: {
    fontSize: 11,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.concrete,
  },

  /* Lists */
  listsSection: {
    marginTop: theme.spacing[8],
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

  /* Overlapping Avatars */
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.mist,
    borderWidth: 2,
    borderColor: theme.colors.chalk,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.concrete,
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 10, 10, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.chalk,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: theme.spacing[6],
    paddingBottom: theme.spacing[10],
    paddingTop: theme.spacing[3],
    gap: theme.spacing[5],
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.hairline,
    alignSelf: 'center',
    marginBottom: theme.spacing[2],
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.graphite,
  },
  modalField: {
    gap: theme.spacing[2],
  },
  modalInput: {
    height: 48,
    backgroundColor: theme.colors.mist,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing[4],
    fontSize: theme.typography.sizes.base,
    color: theme.colors.graphite,
  },
  modalInputMultiline: {
    height: 88,
    paddingTop: theme.spacing[3],
  },
  modalToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalToggleLabel: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.graphite,
  },
  modalToggleHint: {
    fontSize: 11,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.ash,
    marginTop: 2,
  },
  modalCreateButton: {
    height: 48,
    backgroundColor: theme.colors.graphite,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCreateButtonText: {
    color: theme.colors.chalk,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
  },
});
