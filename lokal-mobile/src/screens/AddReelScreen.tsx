import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { theme } from "../theme";

const VIBES = [
  "hipster",
  "lüks",
  "rahat",
  "romantik",
  "enerjik",
  "sakin",
  "retro",
  "modern",
] as const;

const DRESS_CODES = ["Casual", "Smart Casual", "Formal"] as const;

const PRICE_LABELS = ["₺", "₺₺", "₺₺₺", "₺₺₺₺"] as const;

export default function AddReelScreen() {
  // Step flow
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1
  const [link, setLink] = useState("");

  // Step 2 form
  const [venueName, setVenueName] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [address, setAddress] = useState("");
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [dressCode, setDressCode] = useState<string>("");
  const [noiseLevel, setNoiseLevel] = useState<number>(0);
  const [priceRange, setPriceRange] = useState<number>(0);

  const handlePasteArea = () => {
    setLink("https://www.tiktok.com/@example/video/123456");
  };

  const handleContinue = () => {
    if (!link.trim()) {
      Alert.alert("Hata", "Lütfen bir link yapıştırın.");
      return;
    }
    setStep(2);
  };

  const toggleVibe = (vibe: string) => {
    setSelectedVibes((prev) =>
      prev.includes(vibe) ? prev.filter((v) => v !== vibe) : [...prev, vibe]
    );
  };

  const handleSubmit = () => {
    Alert.alert("Başarılı", "Mekan başarıyla eklendi!");
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {step === 1 ? (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Mekan Ekle</Text>
            <Text style={styles.subtitle}>
              Reels veya TikTok linkini yapıştır
            </Text>

            <TouchableOpacity
              style={styles.pasteArea}
              onPress={handlePasteArea}
              activeOpacity={0.7}
            >
              <Text style={styles.pasteIcon}>📋</Text>
              <Text style={styles.pasteText}>Link yapıştır</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.linkInput}
              placeholder="https://..."
              placeholderTextColor={theme.colors.ash}
              value={link}
              onChangeText={setLink}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleContinue}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Devam</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Mekan Bilgileri</Text>

            {/* Venue Name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Mekan Adı</Text>
              <TextInput
                style={styles.input}
                value={venueName}
                onChangeText={setVenueName}
                placeholderTextColor={theme.colors.ash}
              />
            </View>

            {/* Neighborhood */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Semt / Mahalle</Text>
              <TextInput
                style={styles.input}
                value={neighborhood}
                onChangeText={setNeighborhood}
                placeholderTextColor={theme.colors.ash}
              />
            </View>

            {/* Address */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Adres</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                value={address}
                onChangeText={setAddress}
                placeholderTextColor={theme.colors.ash}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Vibe Selection */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Vibe Seç</Text>
              <View style={styles.chipGrid}>
                {VIBES.map((vibe) => {
                  const selected = selectedVibes.includes(vibe);
                  return (
                    <TouchableOpacity
                      key={vibe}
                      style={[
                        styles.chip,
                        selected ? styles.chipSelected : styles.chipUnselected,
                      ]}
                      onPress={() => toggleVibe(vibe)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          selected
                            ? styles.chipTextSelected
                            : styles.chipTextUnselected,
                        ]}
                      >
                        {vibe}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Dress Code */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Dress Code</Text>
              <View style={styles.chipRow}>
                {DRESS_CODES.map((code) => {
                  const selected = dressCode === code;
                  return (
                    <TouchableOpacity
                      key={code}
                      style={[
                        styles.chip,
                        selected ? styles.chipSelected : styles.chipUnselected,
                      ]}
                      onPress={() => setDressCode(code)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          selected
                            ? styles.chipTextSelected
                            : styles.chipTextUnselected,
                        ]}
                      >
                        {code}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Noise Level */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Gürültü Seviyesi</Text>
              <View style={styles.circleRow}>
                {[1, 2, 3, 4, 5].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.circle,
                      noiseLevel >= level
                        ? styles.circleFilled
                        : styles.circleEmpty,
                    ]}
                    onPress={() => setNoiseLevel(level)}
                    activeOpacity={0.7}
                  />
                ))}
              </View>
            </View>

            {/* Price Range */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Fiyat Aralığı</Text>
              <View style={styles.chipRow}>
                {PRICE_LABELS.map((label, index) => {
                  const level = index + 1;
                  const selected = priceRange === level;
                  return (
                    <TouchableOpacity
                      key={label}
                      style={[
                        styles.priceButton,
                        selected
                          ? styles.chipSelected
                          : styles.chipUnselected,
                      ]}
                      onPress={() => setPriceRange(level)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          selected
                            ? styles.chipTextSelected
                            : styles.chipTextUnselected,
                        ]}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleSubmit}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Mekan Oluştur</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: theme.colors.chalk,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.chalk,
  },
  content: {
    paddingHorizontal: theme.spacing[4],
    paddingTop: theme.spacing[10],
    paddingBottom: theme.spacing[10],
  },
  stepContainer: {
    gap: theme.spacing[4],
  },

  // Typography
  title: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.graphite,
    textAlign: "center",
  },
  subtitle: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.concrete,
    textAlign: "center",
  },

  // Step 1 - Paste Area
  pasteArea: {
    height: 120,
    borderWidth: 2,
    borderColor: theme.colors.hairline,
    borderStyle: "dashed",
    borderRadius: theme.radius.xl,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing[2],
  },
  pasteIcon: {
    fontSize: 28,
  },
  pasteText: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.concrete,
  },

  // Step 1 - Link Input
  linkInput: {
    backgroundColor: theme.colors.chalk,
    borderWidth: 1,
    borderColor: theme.colors.hairline,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    fontSize: theme.typography.sizes.base,
    color: theme.colors.graphite,
  },

  // Primary Button
  primaryButton: {
    backgroundColor: theme.colors.graphite,
    borderRadius: theme.radius.lg,
    paddingVertical: theme.spacing[4],
    alignItems: "center",
    justifyContent: "center",
    marginTop: theme.spacing[2],
  },
  primaryButtonText: {
    color: theme.colors.chalk,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
  },

  // Step 2 - Form
  fieldGroup: {
    gap: theme.spacing[2],
  },
  label: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.graphite,
  },
  input: {
    backgroundColor: theme.colors.chalk,
    borderWidth: 1,
    borderColor: theme.colors.hairline,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    fontSize: theme.typography.sizes.base,
    color: theme.colors.graphite,
  },
  multilineInput: {
    minHeight: 80,
    paddingTop: theme.spacing[3],
  },

  // Chips
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing[2],
  },
  chipRow: {
    flexDirection: "row",
    gap: theme.spacing[2],
  },
  chip: {
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.radius.pills,
    borderWidth: 1,
    borderColor: theme.colors.hairline,
  },
  chipSelected: {
    backgroundColor: theme.colors.graphite,
    borderColor: theme.colors.graphite,
  },
  chipUnselected: {
    backgroundColor: theme.colors.mist,
    borderColor: theme.colors.mist,
  },
  chipText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
  },
  chipTextSelected: {
    color: theme.colors.chalk,
  },
  chipTextUnselected: {
    color: theme.colors.graphite,
  },

  // Noise Level Circles
  circleRow: {
    flexDirection: "row",
    gap: theme.spacing[3],
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.hairline,
  },
  circleFilled: {
    backgroundColor: theme.colors.graphite,
    borderColor: theme.colors.graphite,
  },
  circleEmpty: {
    backgroundColor: theme.colors.mist,
  },

  // Price Buttons
  priceButton: {
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.hairline,
  },
});
