import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors } from '../../constants/colors';

interface EditAccountModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: EditAccountData) => Promise<void>;
  initialData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    homeCity: string;
  };
}

export interface EditAccountData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  homeCity: string;
}

export default function EditAccountModal({
  visible,
  onClose,
  onSave,
  initialData,
}: EditAccountModalProps) {
  const [formData, setFormData] = useState<EditAccountData>(initialData);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: keyof EditAccountData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Modal
      visible={visible}
      presentationStyle="pageSheet"
      animationType="slide"
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoid}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Edit account information</Text>
            <Text style={styles.subtitle}>
              We will not share or show your email or phone number to anyone.
            </Text>
          </View>

          <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>First name</Text>
                <TextInput
                  style={styles.input}
                  value={formData.firstName}
                  onChangeText={(text) => updateField('firstName', text)}
                  placeholder="First name"
                  placeholderTextColor={colors.neutral.gray400}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Last name</Text>
                <TextInput
                  style={styles.input}
                  value={formData.lastName}
                  onChangeText={(text) => updateField('lastName', text)}
                  placeholder="Last name"
                  placeholderTextColor={colors.neutral.gray400}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Home city</Text>
                <TouchableOpacity style={styles.dropdownInput}>
                  <Text style={styles.dropdownText}>{formData.homeCity}</Text>
                  <Text style={styles.dropdownArrow}>▼</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Email</Text>
                  <Text style={styles.redDot}>●</Text>
                  <TouchableOpacity>
                    <Text style={styles.verifyButton}>Verify</Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(text) => updateField('email', text)}
                  placeholder="Email"
                  placeholderTextColor={colors.neutral.gray400}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <Text style={styles.helperText}>Please verify your email</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Student email</Text>
                <TouchableOpacity style={styles.addButton}>
                  <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
                <Text style={styles.helperText}>
                  Provide your student email for discounts
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Phone number</Text>
                  <TouchableOpacity>
                    <Text style={styles.editButton}>Edit</Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={styles.input}
                  value={formData.phone}
                  onChangeText={(text) => updateField('phone', text)}
                  placeholder="Phone number"
                  placeholderTextColor={colors.neutral.gray400}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Account status</Text>
                  <TouchableOpacity>
                    <Text style={styles.editButton}>Edit</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.statusRow}>
                  <View style={styles.statusIndicator} />
                  <Text style={styles.statusText}>Active</Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={isLoading}
            >
              <Text style={styles.saveButtonText}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray200,
  },
  closeButton: {
    alignSelf: 'flex-end',
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: colors.neutral.gray600,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.neutral.gray900,
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.neutral.gray600,
    lineHeight: 22,
  },
  content: {
    flex: 1,
  },
  form: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.gray900,
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  redDot: {
    color: colors.error,
    fontSize: 8,
    marginLeft: 4,
    marginRight: 8,
  },
  verifyButton: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary.purple,
  },
  editButton: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary.purple,
    marginLeft: 'auto',
  },
  addButton: {
    alignSelf: 'flex-start',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary.purple,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.neutral.gray300,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.neutral.gray900,
    backgroundColor: colors.neutral.gray100,
  },
  dropdownInput: {
    borderWidth: 1,
    borderColor: colors.neutral.gray300,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.neutral.gray100,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 16,
    color: colors.neutral.gray900,
  },
  dropdownArrow: {
    fontSize: 12,
    color: colors.neutral.gray600,
  },
  helperText: {
    fontSize: 14,
    color: colors.neutral.gray600,
    marginTop: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    color: colors.neutral.gray900,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.gray200,
  },
  saveButton: {
    backgroundColor: colors.primary.purple,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: colors.primary.lightPurple,
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.neutral.white,
  },
});