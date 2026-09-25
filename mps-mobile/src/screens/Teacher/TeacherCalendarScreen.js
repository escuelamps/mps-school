import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { collection, query, where, orderBy, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';

export default function TeacherCalendarScreen() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teacherName, setTeacherName] = useState('');

  useEffect(() => {
    let unsubscribeSlots = () => {};

    const fetchTeacherData = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists() && userDoc.data().name) {
          const name = userDoc.data().name;
          setTeacherName(name);

          // Escuchar los horarios que le pertenecen a este profe
          const qSlots = query(
            collection(db, 'agenda_slots'),
            where('teacher', '==', name)
          );
          
          unsubscribeSlots = onSnapshot(qSlots, (snapshot) => {
            const slotsData = [];
            snapshot.forEach(docSnap => slotsData.push({ id: docSnap.id, ...docSnap.data() }));
            
            // Firebase no deja usar where() y orderBy() en distintos campos sin índice, 
            // así que ordenamos localmente por fecha y hora
            slotsData.sort((a, b) => {
              if (a.date === b.date) return a.time.localeCompare(b.time);
              return a.date.localeCompare(b.date);
            });
            
            setSlots(slotsData);
            setLoading(false);
          });
        }
      } catch (error) {
        console.error("Error fetching teacher data:", error);
        setLoading(false);
      }
    };

    fetchTeacherData();
    return () => unsubscribeSlots();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#00DE85" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>Mis Clases</Text>
      <Text style={styles.subtitle}>Hola, {teacherName || 'Profe'}. Estos son tus próximos horarios:</Text>

      {slots.length === 0 ? (
        <Text style={styles.emptyText}>No tienes clases agendadas aún.</Text>
      ) : (
        slots.map(slot => (
          <View key={slot.id} style={styles.slotCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.slotTime}>{slot.date} | {slot.time}</Text>
              <Text style={styles.slotInstrument}>🎸 {slot.instrument}</Text>
            </View>
            
            <View style={styles.studentsSection}>
              <Text style={styles.studentsTitle}>
                Estudiantes ({slot.students?.length || 0}/{slot.capacity})
              </Text>
              
              {!slot.students || slot.students.length === 0 ? (
                <Text style={styles.noStudents}>Nadie se ha matriculado todavía.</Text>
              ) : (
                slot.students.map((student, idx) => (
                  <View key={idx} style={styles.studentRow}>
                    <Text style={styles.studentName}>👤 {student.name}</Text>
                  </View>
                ))
              )}
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000F11', padding: 20 },
  title: { color: '#00DE85', fontSize: 28, fontWeight: '900', marginTop: 40, marginBottom: 5 },
  subtitle: { color: '#94a3b8', fontSize: 16, marginBottom: 20 },
  emptyText: { color: '#64748B', fontStyle: 'italic', textAlign: 'center', marginTop: 40, fontSize: 16 },
  
  slotCard: {
    backgroundColor: '#0f172a',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 15,
  },
  cardHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    paddingBottom: 12,
    marginBottom: 12,
  },
  slotTime: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  slotInstrument: { color: '#00DE85', fontSize: 14, fontWeight: 'bold' },
  
  studentsSection: { marginTop: 5 },
  studentsTitle: { color: '#94a3b8', fontSize: 14, fontWeight: 'bold', marginBottom: 10 },
  noStudents: { color: '#475569', fontStyle: 'italic', fontSize: 14 },
  studentRow: {
    backgroundColor: '#1e293b',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  studentName: { color: '#e2e8f0', fontSize: 15, fontWeight: '500' }
});
