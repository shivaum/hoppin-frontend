import React, { useState, useEffect } from 'react'
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native'

interface RideRequestModalProps {
  isOpen: boolean
  defaultMessage?: string
  onClose: () => void
  onConfirm: (message: string) => void
  loading: boolean;
}

export default function RideRequestModal({
  isOpen,
  defaultMessage = 'Hey! Can I hoppin your ride?',
  onClose,
  onConfirm,
}: RideRequestModalProps) {
  const [message, setMessage] = useState(defaultMessage)

  // reset message when reopening
  useEffect(() => {
    if (isOpen) {
      setMessage(defaultMessage)
    }
  }, [isOpen, defaultMessage])

  const handleConfirm = () => {
    onConfirm(message)
    onClose()
  }

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <View style={styles.container}>
            <Text style={styles.title}>Send a Message</Text>
            <TextInput
              style={styles.textarea}
              multiline
              numberOfLines={4}
              value={message}
              onChangeText={setMessage}
              placeholder={defaultMessage}
              textAlignVertical="top"
            />

            <View style={styles.footer}>
              <TouchableOpacity
                onPress={onClose}
                style={[styles.button, styles.cancel]}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirm}
                style={[styles.button, styles.send]}
              >
                <Text style={styles.sendText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  textarea: {
    height: 100,
    borderColor: '#D1D5DB',
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginBottom: 16,
    fontSize: 14,
    backgroundColor: '#F9FAFB',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginLeft: 8,
  },
  cancel: {
    backgroundColor: '#E5E7EB',
  },
  send: {
    backgroundColor: '#3B82F6',
  },
  cancelText: {
    color: '#374151',
    fontWeight: '500',
  },
  sendText: {
    color: '#FFF',
    fontWeight: '500',
  },
})