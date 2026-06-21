import React, { useState } from 'react';
import { View, Text, Pressable, Modal, StyleSheet } from 'react-native';
import { WeightUnit } from '../types/workout';

const OPTIONS: { value: WeightUnit; label: string; hint: string }[] = [
  { value: 'lbs', label: 'lbs', hint: 'Pounds' },
  { value: 'kg', label: 'kg', hint: 'Kilograms' },
];

interface Props {
  value: WeightUnit;
  onChange: (unit: WeightUnit) => void;
}

export function UnitPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const selected = OPTIONS.find((o) => o.value === value)!;

  function selectUnit(unit: WeightUnit) {
    onChange(unit);
    setOpen(false);
  }

  return (
    <>
      <Pressable
        style={({ pressed }) => [styles.trigger, pressed && styles.triggerPressed]}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`Weight unit: ${selected.hint}. Tap to change.`}
      >
        <Text style={styles.triggerLabel}>{selected.label}</Text>
        <Text style={styles.chevron}>▾</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.menuAnchor}>
            <Pressable style={styles.menu} onPress={(e) => e.stopPropagation()}>
              <Text style={styles.menuTitle}>Weight Unit</Text>
              {OPTIONS.map((opt) => {
                const active = opt.value === value;
                return (
                  <Pressable
                    key={opt.value}
                    style={[styles.option, active && styles.optionActive]}
                    onPress={() => selectUnit(opt.value)}
                  >
                    <View style={styles.optionText}>
                      <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>
                        {opt.label}
                      </Text>
                      <Text style={styles.optionHint}>{opt.hint}</Text>
                    </View>
                    {active && <View style={styles.checkDot} />}
                  </Pressable>
                );
              })}
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3A3A3C',
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
  },
  triggerPressed: {
    backgroundColor: '#2C2C2E',
    borderColor: '#30D158',
  },
  triggerLabel: {
    color: '#30D158',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  chevron: {
    color: '#8E8E93',
    fontSize: 12,
    marginTop: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  menuAnchor: {
    position: 'absolute',
    top: 72,
    right: 20,
  },
  menu: {
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#3A3A3C',
    minWidth: 180,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  menuTitle: {
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
  },
  optionActive: {
    backgroundColor: '#30D15814',
  },
  optionText: {
    gap: 2,
  },
  optionLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  optionLabelActive: {
    color: '#30D158',
  },
  optionHint: {
    color: '#8E8E93',
    fontSize: 12,
  },
  checkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#30D158',
  },
});
