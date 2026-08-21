import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const MOCK_SLOTS = [
  { id: '1', time: '10:00 AM', status: 'available' },
  { id: '2', time: '11:00 AM', status: 'booked' },
  { id: '3', time: '02:00 PM', status: 'available' },
  { id: '4', time: '04:00 PM', status: 'available' },
];

export default function StudentCalendarScreen() {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [receiptImage, setReceiptImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permiso denegado", "Necesitamos acceso a tus fotos para subir el comprobante de Nequi.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
      base64: true, // Necesario para mandar a la API de Next.js
    });

    if (!result.canceled) {
      setReceiptImage(result.assets[0]);
    }
  };

  const handleBookClass = async () => {
    if (!selectedSlot || !receiptImage) return;

    setIsUploading(true);
    
    // Aquí iría el POST a http://localhost:3000/api/checkout/verify-payment
    // Simularemos la llamada para ver la UI
    try {
      setTimeout(() => {
        setIsUploading(false);
        Alert.alert(
          "¡Recibo procesado!",
          "Nuestra IA revisó tu pago. Tu clase está agendada en Google Calendar.",
          [{ text: "OK", onPress: () => { setSelectedSlot(null); setReceiptImage(null); } }]
        );
      }, 2500);
    } catch (error) {
      setIsUploading(false);
      Alert.alert("Error", "No se pudo procesar el pago");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>Reserva tu Clase</Text>
      <Text style={styles.subtitle}>Selecciona un horario disponible:</Text>

      <View style={styles.slotsContainer}>
        {MOCK_SLOTS.map((slot) => (
          <TouchableOpacity
            key={slot.id}
            style={[
              styles.slotCard,
              slot.status === 'booked' && styles.slotBooked,
              selectedSlot?.id === slot.id && styles.slotSelected,
            ]}
            disabled={slot.status === 'booked'}
            onPress={() => setSelectedSlot(slot)}
          >
            <Text style={[styles.slotTime, slot.status === 'booked' && styles.textBooked]}>
              {slot.time}
            </Text>
            <Text style={[styles.slotStatus, slot.status === 'booked' && styles.textBooked]}>
              {slot.status === 'available' ? 'Libre' : 'Ocupado'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedSlot && (
        <View style={styles.paymentSection}>
          <Text style={styles.paymentTitle}>Validación de Pago</Text>
          <Text style={styles.paymentDesc}>
            Transfiere $50,000 a nuestro Nequi/Bre-B y adjunta el pantallazo para confirmar tu clase a las {selectedSlot.time}.
          </Text>

          {receiptImage ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: receiptImage.uri }} style={styles.imagePreview} />
              <TouchableOpacity style={styles.repickButton} onPress={handlePickImage}>
                <Text style={styles.repickText}>Cambiar foto</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.uploadButton} onPress={handlePickImage}>
              <Text style={styles.uploadButtonText}>📸 Subir Comprobante</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.confirmButton, (!receiptImage || isUploading) && styles.buttonDisabled]}
            disabled={!receiptImage || isUploading}
            onPress={handleBookClass}
          >
            {isUploading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.confirmButtonText}>Confirmar y Agendar</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000F11', // Fondo oscuro MPS
    padding: 20,
  },
  title: {
    color: '#00DE85',
    fontSize: 28,
    fontWeight: '900',
    marginTop: 40,
    marginBottom: 5,
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 16,
    marginBottom: 20,
  },
  slotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 30,
  },
  slotCard: {
    width: '48%',
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  slotBooked: {
    backgroundColor: '#0f172a',
    opacity: 0.5,
  },
  slotSelected: {
    borderColor: '#00DE85',
    backgroundColor: 'rgba(0, 222, 133, 0.1)',
  },
  slotTime: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  slotStatus: {
    color: '#00DE85',
    fontSize: 14,
  },
  textBooked: {
    color: '#64748b',
  },
  paymentSection: {
    backgroundColor: '#0f172a',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  paymentTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  paymentDesc: {
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  uploadButton: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#475569',
    marginBottom: 20,
  },
  uploadButtonText: {
    color: '#cbd5e1',
    fontSize: 16,
    fontWeight: '600',
  },
  imagePreviewContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  imagePreview: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  repickButton: {
    marginTop: 10,
  },
  repickText: {
    color: '#3b82f6',
    fontWeight: 'bold',
  },
  confirmButton: {
    backgroundColor: '#00DE85',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  confirmButtonText: {
    color: '#000F11',
    fontSize: 18,
    fontWeight: '900',
  }
});
