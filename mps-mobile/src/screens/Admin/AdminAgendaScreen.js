import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';

export default function AdminAgendaScreen() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [teacher, setTeacher] = useState('');
  const [instrument, setInstrument] = useState('');
  const [capacity, setCapacity] = useState('1');

  useEffect(() => {
    const qSlots = query(collection(db, 'agenda_slots'), orderBy('date', 'asc'), orderBy('time', 'asc'));
    const unsubscribe = onSnapshot(qSlots, (snapshot) => {
      const slotsData = [];
      snapshot.forEach(doc => slotsData.push({ id: doc.id, ...doc.data() }));
      setSlots(slotsData);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleAddSlot = async () => {
    if (!date || !time || !teacher || !instrument || !capacity) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }
    try {
      await addDoc(collection(db, 'agenda_slots'), {
        date,
        time,
        teacher,
        instrument,
        capacity: parseInt(capacity, 10) || 1,
        booked: 0,
        createdAt: new Date().toISOString()
      });
      setDate('');
      setTime('');
      setTeacher('');
      setInstrument('');
      setCapacity('1');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'agenda_slots', id));
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Agenda MPS</Text>
      
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Nuevo Horario</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Fecha (YYYY-MM-DD)</Text>
          <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="2026-09-01" />
          
          <Text style={styles.label}>Hora (HH:MM AM/PM)</Text>
          <TextInput style={styles.input} value={time} onChangeText={setTime} placeholder="04:00 PM" />
          
          <Text style={styles.label}>Profesor</Text>
          <TextInput style={styles.input} value={teacher} onChangeText={setTeacher} placeholder="Profe Test" />
          
          <Text style={styles.label}>Instrumento</Text>
          <TextInput style={styles.input} value={instrument} onChangeText={setInstrument} placeholder="Guitarra" />
          
          <Text style={styles.label}>Cupos</Text>
          <TextInput style={styles.input} value={capacity} onChangeText={setCapacity} keyboardType="numeric" />
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleAddSlot}>
          <Text style={styles.submitBtnText}>Crear Horario</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>Horarios Activos</Text>
      
      {loading ? (
        <ActivityIndicator color="#00DE85" />
      ) : slots.length === 0 ? (
        <Text style={styles.emptyText}>No hay horarios creados.</Text>
      ) : (
        slots.map(slot => (
          <View key={slot.id} style={styles.slotCard}>
            <View>
              <Text style={styles.slotTime}>{slot.date} | {slot.time}</Text>
              <Text style={styles.slotDetails}>{slot.teacher} - {slot.instrument}</Text>
              <Text style={styles.slotCapacity}>Cupos: {slot.booked}/{slot.capacity}</Text>
            </View>
            <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(slot.id)}>
              <Text style={styles.deleteBtnText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
      <View style={{height: 100}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA', padding: 20 },
  title: { color: '#00DE85', fontSize: 24, fontWeight: '900', marginTop: 40, marginBottom: 20 },
  subtitle: { color: '#1e293b', fontSize: 20, fontWeight: 'bold', marginBottom: 15, marginTop: 20 },
  formCard: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  formTitle: { color: '#1e293b', fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  label: { color: '#64748B', fontSize: 14, marginBottom: 5 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', padding: 12, borderRadius: 8, marginBottom: 15, color: '#1e293b' },
  submitBtn: { backgroundColor: '#00DE85', padding: 15, borderRadius: 8, alignItems: 'center' },
  submitBtnText: { color: '#000F11', fontWeight: 'bold', fontSize: 16 },
  slotCard: { backgroundColor: '#FFFFFF', padding: 15, borderRadius: 12, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  slotTime: { color: '#1e293b', fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  slotDetails: { color: '#64748B', fontSize: 14, marginBottom: 2 },
  slotCapacity: { color: '#3b82f6', fontSize: 14, fontWeight: 'bold' },
  deleteBtn: { backgroundColor: '#ef4444', padding: 10, borderRadius: 6 },
  deleteBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 },
  emptyText: { color: '#64748B', fontStyle: 'italic' }
});
