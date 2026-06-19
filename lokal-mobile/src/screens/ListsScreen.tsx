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

function priceLabel(range: number): string {
  return Array(range).fill('₺').join('');
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
              { marginLeft: index === 0 ? 0 : -10 },
            ]}
          >
            <Text style={styles.avatarInitial}>{getInitial(venue.name)}</Text>
          </View>
        );
      })}
    </View>
  );
}

/* ── List Card ────────────────────────────────────── */

function ListCard({
  list,
  onPress,
}: {
  list: VenueList;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.listCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.listCardHeader}>
        <Text style={styles.listCardName}>{list.name}</Text>
        <View style={styles.listCardMeta}>
          <Text style={styles.listCardCount}>
            {list.venueIds.length} mekan
          </Text>
          <View style={styles.dot} />
          <Text style={styles.listCardVisibility}>
            {list.isPublic ? 'Herkese acik' : 'Gizli'}
          </Text>
        </View>
      </View>

      {list.description ? (
        <Text style={styles.listCardDescription} numberOfLines={2}>
          {list.description}
        </Text>
      ) : null}

      <VenueAvatarRow venueIds={list.venueIds} />
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
          onPress={() => setModalVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.newListButton}>Yeni Liste +</Text>
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
            <Text style={styles.sectionTitle}>Kaydedilenler</Text>
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
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { paddingHorizontal: theme.spacing[4] }]}>Listeler</Text>
          <View style={styles.listsContainer}>
            {MOCK_LISTS.map((list) => (
              <ListCard
                key={list.id}
                list={list}
                onPress={() =>
                  navigation.navigate('ListDetail', { listId: list.id })
                }
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Create New List Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
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
            <Text style={styles.modalTitle}>Yeni Liste</Text>

            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Ad</Text>
              <TextInput
                style={styles.modalInput}
                value={newListName}
                onChangeText={setNewListName}
                placeholder="Liste adi"
                placeholderTextColor={theme.colors.ash}
              />
            </View>

            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Aciklama</Text>
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
              <Text style={styles.modalLabel}>
                {newListPublic ? 'Herkese acik' : 'Gizli'}
              </Text>
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
    paddingVertical: theme.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.hairline,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.graphite,
  },
  newListButton: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.graphite,
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
    paddingTop: theme.spacing[5],
    gap: theme.spacing[3],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
    paddingHorizontal: theme.spacing[4],
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.graphite,
  },
  countBadge: {
    backgroundColor: theme.colors.graphite,
    borderRadius: theme.radius.badges,
    paddingHorizontal: theme.spacing[2],
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  countBadgeText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.chalk,
  },

  /* Saved Venues Horizontal List */
  savedList: {
    paddingHorizontal: theme.spacing[4],
    gap: theme.spacing[3],
  },
  miniCard: {
    width: 100,
    gap: theme.spacing[2],
  },
  miniCardImage: {
    width: 100,
    height: 100,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.mist,
    borderWidth: 1,
    borderColor: theme.colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniCardInitial: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.concrete,
  },
  miniCardName: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.graphite,
    textAlign: 'center',
  },

  /* Lists */
  listsContainer: {
    paddingHorizontal: theme.spacing[4],
    gap: theme.spacing[3],
  },
  listCard: {
    backgroundColor: theme.colors.chalk,
    borderWidth: 1,
    borderColor: theme.colors.hairline,
    borderRadius: theme.radius.xl,
    padding: theme.spacing[4],
    gap: theme.spacing[3],
  },
  listCardHeader: {
    gap: 4,
  },
  listCardName: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.graphite,
  },
  listCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  listCardCount: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.concrete,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: theme.colors.ash,
  },
  listCardVisibility: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.concrete,
  },
  listCardDescription: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.concrete,
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
    borderWidth: 1,
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
    backgroundColor: 'rgba(10, 10, 10, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing[4],
  },
  modalContent: {
    width: '100%',
    backgroundColor: theme.colors.chalk,
    borderRadius: theme.radius.xl,
    padding: theme.spacing[6],
    gap: theme.spacing[4],
  },
  modalTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.graphite,
  },
  modalField: {
    gap: theme.spacing[2],
  },
  modalLabel: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.graphite,
  },
  modalInput: {
    backgroundColor: theme.colors.chalk,
    borderWidth: 1,
    borderColor: theme.colors.hairline,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    fontSize: theme.typography.sizes.base,
    color: theme.colors.graphite,
  },
  modalInputMultiline: {
    minHeight: 72,
    paddingTop: theme.spacing[3],
  },
  modalToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalCreateButton: {
    backgroundColor: theme.colors.graphite,
    borderRadius: theme.radius.lg,
    paddingVertical: theme.spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCreateButtonText: {
    color: theme.colors.chalk,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
  },
});
