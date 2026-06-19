import React, { useState, useRef, useCallback } from "react";
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
  Animated,
  Dimensions,
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

const NOISE_BAR_HEIGHTS = [12, 16, 20, 24, 28];

export default function AddReelScreen() {
  const [step, setStep] = useState<1 | 2>(1);
  const [showSuccess, setShowSuccess] = useState(false);

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

  const checkmarkOpacity = useRef(new Animated.Value(0)).current;
  const checkmarkScale = useRef(new Animated.Value(0.5)).current;

  const handlePasteArea = () => {
    setLink("https://www.tiktok.com/@example/video/123456");
  };

  const handleContinue = useCallback(() => {
    if (!link.trim()) {
      Alert.alert("Hata", "Lütfen bir link yapıştırın.");
      return;
    }

    setShowSuccess(true);

    Animated.parallel([
      Animated.timing(checkmarkOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(checkmarkScale, {
        toValue: 1,
        friction: 4,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      setShowSuccess(false);
      checkmarkOpacity.setValue(0);
      checkmarkScale.setValue(0.5);
      setStep(2);
    }, 800);
  }, [link, checkmarkOpacity, checkmarkScale]);

  const toggleVibe = (vibe: string) => {
    setSelectedVibes((prev) =>
      prev.includes(vibe) ? prev.filter((v) => v !== vibe) : [...prev, vibe]
    );
  };

  const handleSubmit = () => {
    Alert.alert("Başarılı", "Mekan başarıyla eklendi!");
  };

  // ── Step 1: Link paste ──────────────────────────────────────────────
  const renderStep1 = () => (
    <View style={styles.step1Container}>
      <View style={styles.step1Inner}>
        {/* Paste area */}
        <TouchableOpacity
          style={[
            styles.pasteArea,
            showSuccess && styles.pasteAreaSuccess,
          ]}
          onPress={handlePasteArea}
          activeOpacity={0.7}
          disabled={showSuccess}
        >
          {showSuccess ? (
            <Animated.View
              style={{
                opacity: checkmarkOpacity,
                transform: [{ scale: checkmarkScale }],
              }}
            >
              <Text style={styles.checkmark}>✓</Text>
            </Animated.View>
          ) : (
            <>
              <Text style={styles.pastePlus}>+</Text>
              <Text style={styles.pasteText}>Link yapıştır</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Link input */}
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

        {/* Continue button */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Devam →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ── Step 2: Form ────────────────────────────────────────────────────
  const renderStep2 = () => (
    <View style={styles.step2Container}>
      {/* Header */}
      <View style={styles.formHeader}>
        <Text style={styles.formTitle}>Mekan Bilgileri</Text>
        <Text style={styles.formSubtitle}>Mekanın vibe'ını tanımla</Text>
      </View>

      {/* Venue Name */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>MEKAN ADI</Text>
        <TextInput
          style={styles.input}
          value={venueName}
          onChangeText={setVenueName}
          placeholderTextColor={theme.colors.ash}
        />
      </View>

      {/* Neighborhood */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>SEMT / MAHALLE</Text>
        <TextInput
          style={styles.input}
          value={neighborhood}
          onChangeText={setNeighborhood}
          placeholderTextColor={theme.colors.ash}
        />
      </View>

      {/* Address */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>ADRES</Text>
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
        <Text style={styles.label}>ORTAM</Text>
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
        <Text style={styles.label}>DRESS CODE</Text>
        <View style={styles.dressCodeRow}>
          {DRESS_CODES.map((code) => {
            const selected = dressCode === code;
            return (
              <TouchableOpacity
                key={code}
                style={[
                  styles.dressCodeCard,
                  selected
                    ? styles.dressCodeCardSelected
                    : styles.dressCodeCardUnselected,
                ]}
                onPress={() => setDressCode(code)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.dressCodeText,
                    selected
                      ? styles.dressCodeTextSelected
                      : styles.dressCodeTextUnselected,
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
        <Text style={styles.label}>GÜRÜLTÜ SEVİYESİ</Text>
        <View style={styles.noiseContainer}>
          <Text style={styles.noiseLabel}>Sessiz</Text>
          <View style={styles.noiseBarsRow}>
            {NOISE_BAR_HEIGHTS.map((height, index) => {
              const level = index + 1;
              const filled = noiseLevel >= level;
              return (
                <TouchableOpacity
                  key={level}
                  style={styles.noiseBarTouchable}
                  onPress={() => setNoiseLevel(level)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.noiseBar,
                      {
                        height,
                        backgroundColor: filled
                          ? theme.colors.graphite
                          : theme.colors.hairline,
                      },
                    ]}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={styles.noiseLabel}>Gürültülü</Text>
        </View>
      </View>

      {/* Price Range */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>FİYAT ARALIĞI</Text>
        <View style={styles.priceRow}>
          {PRICE_LABELS.map((label, index) => {
            const level = index + 1;
            const selected = priceRange === level;
            return (
              <TouchableOpacity
                key={label}
                style={[
                  styles.priceCard,
                  selected
                    ? styles.priceCardSelected
                    : styles.priceCardUnselected,
                ]}
                onPress={() => setPriceRange(level)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.priceText,
                    selected
                      ? styles.priceTextSelected
                      : styles.priceTextUnselected,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Submit button */}
      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        activeOpacity={0.8}
      >
        <Text style={styles.primaryButtonText}>Mekan Oluştur</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={
          step === 1 ? styles.contentStep1 : styles.contentStep2
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {step === 1 ? renderStep1() : renderStep2()}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: theme.colors.chalk,
  },
  scrollView: {
    flex: 1,
    backgroundColor: theme.colors.chalk,
  },

  // ── Step 1 layout: centered vertically ────────────────────────────
  contentStep1: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  step1Container: {
    alignItems: "center",
    justifyContent: "center",
  },
  step1Inner: {
    width: "100%",
    gap: 16,
  },

  // ── Paste area ────────────────────────────────────────────────────
  pasteArea: {
    height: 160,
    borderWidth: 1.5,
    borderColor: "#d0d0d0",
    borderStyle: "dashed",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  pasteAreaSuccess: {
    borderColor: theme.colors.graphite,
    backgroundColor: theme.colors.mist,
  },
  pastePlus: {
    fontSize: 40,
    color: theme.colors.ash,
    fontWeight: theme.typography.weights.regular,
    lineHeight: 44,
  },
  pasteText: {
    fontSize: 14,
    color: theme.colors.concrete,
    marginTop: 4,
  },
  checkmark: {
    fontSize: 36,
    color: theme.colors.graphite,
    fontWeight: theme.typography.weights.semibold,
  },

  // ── Link input ────────────────────────────────────────────────────
  linkInput: {
    height: 48,
    backgroundColor: theme.colors.mist,
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 14,
    color: theme.colors.graphite,
  },

  // ── Primary button (shared) ───────────────────────────────────────
  primaryButton: {
    height: 48,
    backgroundColor: theme.colors.graphite,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: theme.colors.chalk,
    fontSize: 15,
    fontWeight: theme.typography.weights.semibold,
  },

  // ── Step 2 layout ─────────────────────────────────────────────────
  contentStep2: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 48,
  },
  step2Container: {
    gap: 24,
  },

  // ── Form header ───────────────────────────────────────────────────
  formHeader: {
    gap: 4,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.graphite,
    letterSpacing: -0.5,
  },
  formSubtitle: {
    fontSize: 14,
    color: theme.colors.concrete,
  },

  // ── Field groups ──────────────────────────────────────────────────
  fieldGroup: {
    gap: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.ash,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  input: {
    height: 48,
    backgroundColor: theme.colors.mist,
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 14,
    color: theme.colors.graphite,
  },
  multilineInput: {
    height: undefined,
    minHeight: 80,
    paddingTop: 14,
    paddingBottom: 14,
  },

  // ── Vibe chips ────────────────────────────────────────────────────
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    height: 34,
    paddingHorizontal: 16,
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
  },
  chipSelected: {
    backgroundColor: theme.colors.graphite,
    borderWidth: 1,
    borderColor: theme.colors.graphite,
  },
  chipUnselected: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: theme.colors.hairline,
  },
  chipText: {
    fontSize: 14,
  },
  chipTextSelected: {
    color: theme.colors.chalk,
  },
  chipTextUnselected: {
    color: theme.colors.graphite,
  },

  // ── Dress code cards ──────────────────────────────────────────────
  dressCodeRow: {
    flexDirection: "row",
    gap: 8,
  },
  dressCodeCard: {
    flex: 1,
    height: 60,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  dressCodeCardSelected: {
    backgroundColor: theme.colors.graphite,
  },
  dressCodeCardUnselected: {
    backgroundColor: theme.colors.mist,
  },
  dressCodeText: {
    fontSize: 14,
  },
  dressCodeTextSelected: {
    color: theme.colors.chalk,
    fontWeight: theme.typography.weights.semibold,
  },
  dressCodeTextUnselected: {
    color: theme.colors.concrete,
  },

  // ── Noise level equalizer ─────────────────────────────────────────
  noiseContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 12,
  },
  noiseLabel: {
    fontSize: 10,
    color: theme.colors.ash,
    marginBottom: 0,
  },
  noiseBarsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
  },
  noiseBarTouchable: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  noiseBar: {
    width: 6,
    borderRadius: 3,
  },

  // ── Price range cards ─────────────────────────────────────────────
  priceRow: {
    flexDirection: "row",
    gap: 8,
  },
  priceCard: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  priceCardSelected: {
    backgroundColor: theme.colors.graphite,
  },
  priceCardUnselected: {
    backgroundColor: theme.colors.mist,
  },
  priceText: {
    fontSize: 14,
  },
  priceTextSelected: {
    color: theme.colors.chalk,
  },
  priceTextUnselected: {
    color: theme.colors.graphite,
  },

  // ── Submit button ─────────────────────────────────────────────────
  submitButton: {
    height: 48,
    backgroundColor: theme.colors.graphite,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 32,
  },
});
