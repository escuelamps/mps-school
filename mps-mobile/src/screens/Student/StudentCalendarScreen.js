import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../config/firebase';

export default function StudentCalendarScreen() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    // Escuchar la colección de horarios en tiempo real
    const qSlots = query(collection(db, 'agenda_slots'), orderBy('date', 'asc'), orderBy('time', 'asc'));
    const unsubscribe = onSnapshot(qSlots, (snapshot) => {
      const slotsData = [];
      snapshot.forEach(docSnap => {
        slotsData.push({ id: docSnap.id, ...docSnap.data() });
      });
      setSlots(slotsData);
      setLoading(false);
      
      // Si el slot seleccionado se llenó mientras estaba seleccionado, lo deseleccionamos
      if (selectedSlot) {
        const updatedSlot = slotsData.find(s => s.id === selectedSlot.id);
        if (updatedSlot && updatedSlot.booked >= updatedSlot.capacity) {
          setSelectedSlot(null);
        }
      }
    });
    return unsubscribe;
  }, [selectedSlot]);

  const handleBookClass = async () => {
    if (!selectedSlot) return;

    setIsBooking(true);
    try {
      const slotRef = doc(db, 'agenda_slots', selectedSlot.id);
      await updateDoc(slotRef, {
        booked: increment(1)
      });
      
      Alert.alert(
        "¡Reserva confirmada!",
        `Tu clase de ${selectedSlot.instrument} con ${selectedSlot.teacher} ha sido agendada con éxito.`,
        [{ text: "OK", onPress: () => setSelectedSlot(null) }]
      );
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Hubo un problema al procesar tu reserva.");
    }
    setIsBooking(false);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#00DE85" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>Agenda MPS</Text>
      <Text style={styles.subtitle}>Selecciona un horario disponible:</Text>

      {slots.length === 0 ? (
        <Text style={styles.emptyText}>Aún no hay horarios creados por el profesor.</Text>
      ) : (
        <View style={styles.slotsContainer}>
          {slots.map((slot) => {
            const isFull = slot.booked >= slot.capacity;
            const isSelected = selectedSlot?.id === slot.id;

            return (
              <TouchableOpacity
                key={slot.id}
                style={[
                  styles.slotCard,
                  isFull && styles.slotBooked,
                  isSelected && styles.slotSelected,
                ]}
                disabled={isFull}
                onPress={() => setSelectedSlot(slot)}
              >
                <View style={styles.cardHeader}>
                  <Text style={[styles.slotTime, isFull && styles.textBooked]}>
                    {slot.time}
                  </Text>
                  <Text style={[styles.slotStatus, isFull && styles.textBooked]}>
                    {isFull ? 'Agotado' : `Cupos: ${slot.capacity - slot.booked}`}
                  </Text>
                </View>
                <Text style={[styles.slotDate, isFull && styles.textBooked]}>📅 {slot.date}</Text>
                <Text style={[styles.slotDetails, isFull && styles.textBooked]}>🎸 {slot.instrument}</Text>
                <Text style={[styles.slotDetails, isFull && styles.textBooked]}>👨‍🏫 {slot.teacher}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {selectedSlot && (
        <View style={styles.paymentSection}>
          <Text style={styles.paymentTitle}>Confirmar tu clase</Text>
          <Text style={styles.paymentDesc}>
            Estás a un paso de reservar tu clase de {selectedSlot.instrument} con {selectedSlot.teacher} para el {selectedSlot.date} a las {selectedSlot.time}.
          </Text>

          <TouchableOpacity
            style={[styles.confirmButton, isBooking && styles.buttonDisabled]}
            disabled={isBooking}
            onPress={handleBookClass}
          >
            {isBooking ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.confirmButtonText}>Agendar Clase</Text>
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
    backgroundColor: '#000F11', // Dark Glass aesthetic
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
  emptyText: {
    color: '#64748B',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
  slotsContainer: {
    flexDirection: 'column',
    gap: 15,
    marginBottom: 30,
  },
  slotCard: {
    width: '100%',
    backgroundColor: '#0f172a',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  slotBooked: {
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderColor: 'transparent',
  },
  slotSelected: {
    borderColor: '#00DE85',
    backgroundColor: 'rgba(0, 222, 133, 0.05)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    paddingBottom: 10,
  },
  slotTime: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  slotStatus: {
    color: '#00DE85',
    fontSize: 14,
    fontWeight: 'bold',
  },
  slotDate: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 4,
  },
  slotDetails: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 4,
  },
  textBooked: {
    color: '#475569',
  },
  paymentSection: {
    backgroundColor: '#0f172a',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#00DE85',
    marginBottom: 40,
  },
  paymentTitle: {
    color: '#FFF',
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
