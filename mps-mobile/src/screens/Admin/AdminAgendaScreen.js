import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, where } from 'firebase/firestore';
import { db } from '../../config/firebase';

export default function AdminAgendaScreen() {
  const [slots, setSlots] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [teacher, setTeacher] = useState('');
  const [instrument, setInstrument] = useState('');
  const [capacity, setCapacity] = useState('1');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // 1. Escuchar los horarios creados
    const qSlots = query(collection(db, 'agenda_slots'), orderBy('date', 'asc'), orderBy('time', 'asc'));
    const unsubscribeSlots = onSnapshot(qSlots, (snapshot) => {
      const slotsData = [];
      snapshot.forEach(docSnap => slotsData.push({ id: docSnap.id, ...docSnap.data() }));
      setSlots(slotsData);
      setLoading(false);
    });

    // 2. Escuchar la lista de profesores de la base de datos oficial
    const qTeachers = query(collection(db, 'users'), where('role', '==', 'teacher'));
    const unsubscribeTeachers = onSnapshot(qTeachers, (snapshot) => {
      const tData = [];
      snapshot.forEach(docSnap => tData.push({ id: docSnap.id, ...docSnap.data() }));
      setTeachers(tData);
    });

    return () => {
      unsubscribeSlots();
      unsubscribeTeachers();
    };
  }, []);

  const handleAddSlot = async () => {
    if (!date || !time || !teacher || !instrument || !capacity) {
      Alert.alert('Faltan Datos', 'Todos los campos son obligatorios. Selecciona un profe de la lista.');
      return;
    }
    setIsSubmitting(true);
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
      // Limpiar el formulario pero dejar el mismo profe seleccionado por si quiere crearle más horarios
      setDate('');
      setTime('');
      setInstrument('');
      setCapacity('1');
      Alert.alert('Éxito', 'Horario creado en Firebase.');
    } catch (error) {
      Alert.alert('Error', 'Hubo un problema de conexión.');
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'agenda_slots', id));
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>
      <Text style={styles.title}>Admin | Horarios</Text>
      
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Crear Nueva Clase</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Profesor</Text>
          {teachers.length === 0 ? (
            <Text style={styles.warningText}>No hay profesores en la base de datos.</Text>
          ) : (
            <View style={styles.chipsContainer}>
              {teachers.map(t => (
                <TouchableOpacity 
                  key={t.id} 
                  style={[styles.chip, teacher === t.name && styles.chipSelected]}
                  onPress={() => setTeacher(t.name)}
                >
                  <Text style={[styles.chipText, teacher === t.name && styles.chipTextSelected]}>
                    {t.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={styles.label}>Fecha (YYYY-MM-DD)</Text>
          <TextInput 
            style={styles.input} 
            value={date} 
            onChangeText={setDate} 
            placeholder="Ej: 2026-10-04" 
            placeholderTextColor="#64748B"
          />
          
          <Text style={styles.label}>Hora</Text>
          <TextInput 
            style={styles.input} 
            value={time} 
            onChangeText={setTime} 
            placeholder="Ej: 04:00 PM" 
            placeholderTextColor="#64748B"
          />
          
          <Text style={styles.label}>Instrumento</Text>
          <TextInput 
            style={styles.input} 
            value={instrument} 
            onChangeText={setInstrument} 
            placeholder="Ej: Piano" 
            placeholderTextColor="#64748B"
          />
          
          <Text style={styles.label}>Cupos Disponibles</Text>
          <TextInput 
            style={styles.input} 
            value={capacity} 
            onChangeText={setCapacity} 
            keyboardType="numeric" 
            placeholderTextColor="#64748B"
          />
        </View>

        <TouchableOpacity 
          style={[styles.submitBtn, isSubmitting && { opacity: 0.5 }]} 
          onPress={handleAddSlot}
          disabled={isSubmitting}
        >
          {isSubmitting ? <ActivityIndicator color="#000" /> : <Text style={styles.submitBtnText}>Publicar Horario</Text>}
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>Clases Publicadas</Text>
      
      {loading ? (
        <ActivityIndicator color="#00DE85" style={{ marginTop: 20 }} />
      ) : slots.length === 0 ? (
        <Text style={styles.emptyText}>No has creado ninguna clase aún.</Text>
      ) : (
        slots.map(slot => (
          <View key={slot.id} style={styles.slotCard}>
            <View style={styles.slotInfo}>
              <Text style={styles.slotTime}>{slot.date} | {slot.time}</Text>
              <Text style={styles.slotDetails}>👨‍🏫 {slot.teacher}</Text>
              <Text style={styles.slotDetails}>🎸 {slot.instrument}</Text>
              <Text style={styles.slotCapacity}>
                Cupos ocupados: {slot.booked}/{slot.capacity}
              </Text>
            </View>
            <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(slot.id)}>
              <Text style={styles.deleteBtnText}>Borrar</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000F11', padding: 20 },
  title: { color: '#00DE85', fontSize: 28, fontWeight: '900', marginTop: 40, marginBottom: 20 },
  subtitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 15, marginTop: 10 },
  
  formCard: { 
    backgroundColor: '#0f172a', 
    padding: 20, 
    borderRadius: 16, 
    marginBottom: 20, 
    borderWidth: 1, 
    borderColor: '#1e293b' 
  },
  formTitle: { color: '#00DE85', fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  
  label: { color: '#94a3b8', fontSize: 14, marginBottom: 8, fontWeight: '600' },
  input: { 
    backgroundColor: '#1e293b', 
    borderWidth: 1, 
    borderColor: '#334155', 
    padding: 15, 
    borderRadius: 10, 
    marginBottom: 20, 
    color: '#FFF' 
  },
  
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20
  },
  chip: {
    backgroundColor: '#1e293b',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155'
  },
  chipSelected: {
    backgroundColor: 'rgba(0, 222, 133, 0.1)',
    borderColor: '#00DE85'
  },
  chipText: {
    color: '#94a3b8',
    fontWeight: 'bold'
  },
  chipTextSelected: {
    color: '#00DE85'
  },
  warningText: {
    color: '#ff6961',
    fontStyle: 'italic',
    marginBottom: 20
  },
  
  submitBtn: { backgroundColor: '#00DE85', padding: 16, borderRadius: 10, alignItems: 'center' },
  submitBtnText: { color: '#000F11', fontWeight: '900', fontSize: 16 },
  
  slotCard: { 
    backgroundColor: '#0f172a', 
    padding: 20, 
    borderRadius: 16, 
    marginBottom: 15, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#1e293b' 
  },
  slotInfo: { flex: 1 },
  slotTime: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  slotDetails: { color: '#94a3b8', fontSize: 14, marginBottom: 4 },
  slotCapacity: { color: '#00DE85', fontSize: 14, fontWeight: 'bold', marginTop: 5 },
  
  deleteBtn: { 
    backgroundColor: 'rgba(255, 105, 97, 0.1)', 
    paddingVertical: 10, 
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ff6961'
  },
  deleteBtnText: { color: '#ff6961', fontWeight: 'bold', fontSize: 14 },
  
  emptyText: { color: '#64748B', fontStyle: 'italic', textAlign: 'center', marginTop: 20 }
});
