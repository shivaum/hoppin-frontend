// src/screens/EditRide/components/ActionButtons.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface ActionButtonsProps {
  hasChanges: boolean;
  isSaving: boolean;
  isValid: boolean;
  onCancel: () => void;
  onSave: () => void;
}

export function ActionButtons({
  hasChanges,
  isSaving,
  isValid,
  onCancel,
  onSave,
}: ActionButtonsProps) {
  const canSave = hasChanges && !isSaving && isValid;

  return (
    <View style={styles.buttonRow}>
      <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
        <Text style={styles.cancelBtnText}>Cancel</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
        onPress={onSave}
        disabled={!canSave}
      >
        <Text style={[styles.saveBtnText, !canSave && styles.saveBtnTextDisabled]}>
          {isSaving ? 'Saving...' : 'Save changes'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonRow: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnDisabled: {
    backgroundColor: '#9CA3AF',
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  saveBtnTextDisabled: {
    color: '#D1D5DB',
  },
});