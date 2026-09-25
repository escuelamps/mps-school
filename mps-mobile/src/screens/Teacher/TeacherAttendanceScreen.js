import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { collection, query, where, onSnapshot, getDoc, doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';

export default function TeacherAttendanceScreen() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teacherName, setTeacherName] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState({});

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

          // Escuchar horarios del profe que tengan al menos 1 estudiante
          const qSlots = query(collection(db, 'agenda_slots'), where('teacher', '==', name));
          unsubscribeSlots = onSnapshot(qSlots, (snapshot) => {
            const slotsData = [];
            snapshot.forEach(docSnap => {
              const data = docSnap.data();
              // Solo traer clases que tengan estudiantes para llamar a lista
              if (data.students && data.students.length > 0) {
                slotsData.push({ id: docSnap.id, ...data });
              }
            });
            
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

  const markAttendance = async (slotId, studentUid, status) => {
    // status: 'present' | 'absent'
    const recordId = `${slotId}_${studentUid}`;
    
    // Optimistic UI update
    setAttendanceRecords(prev => ({
      ...prev,
      [recordId]: status
    }));

    try {
      await setDoc(doc(db, 'attendance', recordId), {
        slotId,
        studentUid,
        status,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      Alert.alert("Error", "No se pudo guardar la asistencia.");
      // Revertir
      setAttendanceRecords(prev => {
        const copy = { ...prev };
        delete copy[recordId];
        return copy;
      });
    }
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
      <Text style={styles.title}>Llamar a Lista</Text>
      <Text style={styles.subtitle}>Selecciona si el alumno asistió a tu clase.</Text>

      {slots.length === 0 ? (
        <Text style={styles.emptyText}>No tienes clases con alumnos inscritos aún.</Text>
      ) : (
        slots.map(slot => (
          <View key={slot.id} style={styles.slotCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.slotTime}>{slot.date} | {slot.time}</Text>
              <Text style={styles.slotInstrument}>🎸 {slot.instrument}</Text>
            </View>
            
            <View style={styles.studentsSection}>
              {slot.students.map((student, idx) => {
                const recordId = `${slot.id}_${student.uid}`;
                const currentStatus = attendanceRecords[recordId];

                return (
                  <View key={idx} style={styles.studentRow}>
                    <Text style={styles.studentName} numberOfLines={1}>{student.name}</Text>
                    
                    <View style={styles.actionsContainer}>
                      <TouchableOpacity 
                        style={[
                          styles.actionBtn, 
                          styles.btnAbsent,
                          currentStatus === 'absent' && styles.btnAbsentActive
                        ]}
                        onPress={() => markAttendance(slot.id, student.uid, 'absent')}
                      >
                        <Text style={[styles.actionBtnText, currentStatus === 'absent' && styles.actionBtnTextActive]}>Faltó</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={[
                          styles.actionBtn, 
                          styles.btnPresent,
                          currentStatus === 'present' && styles.btnPresentActive
                        ]}
                        onPress={() => markAttendance(slot.id, student.uid, 'present')}
                      >
                        <Text style={[styles.actionBtnText, currentStatus === 'present' && styles.actionBtnTextActive]}>Asistió</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
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
    marginBottom: 20,
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
  studentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  studentName: { 
    color: '#e2e8f0', 
    fontSize: 15, 
    fontWeight: '500',
    flex: 1,
    marginRight: 10
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionBtnTextActive: {
    color: '#000',
  },
  btnAbsent: {
    borderColor: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  btnAbsentActive: {
    backgroundColor: '#ef4444',
  },
  btnPresent: {
    borderColor: '#00DE85',
    backgroundColor: 'rgba(0, 222, 133, 0.1)',
  },
  btnPresentActive: {
    backgroundColor: '#00DE85',
  }
});
