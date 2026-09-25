import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { collection, query, where, getCountFromServer, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';

const EVENTS_DB = [
  { date: '2026-08-01', title: 'Open mic MPS', type: 'past', time: 'N/A' },
  { date: '2026-08-11', title: 'Noches MPS', type: 'past', time: 'N/A' },
  { date: '2026-10-04', title: 'Recitales', type: 'upcoming', time: '7:00 PM' },
  { date: '2026-10-18', title: 'Recitales', type: 'upcoming', time: '7:00 PM' },
  { date: '2026-11-01', title: 'Recitales', type: 'upcoming', time: '7:00 PM' },
];

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export default function StudentEventsScreen() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 9, 1)); // Start at Oct 2026
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  // Registration Form State
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [isFull, setIsFull] = useState(false);
  const [loadingCap, setLoadingCap] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const minDate = new Date(2026, 6, 1);
  const maxDate = new Date(2030, 11, 1);

  useEffect(() => {
    if (selectedEvent && selectedEvent.type === 'upcoming') {
      checkCapacity(selectedEvent.date);
      setSuccess(false);
      setErrorMsg('');
      setNombre('');
      setTelefono('');
    }
  }, [selectedEvent]);

  const checkCapacity = async (dateStr) => {
    setLoadingCap(true);
    try {
      const q = query(collection(db, 'recitales'), where('fecha', '==', dateStr));
      const snapshot = await getCountFromServer(q);
      setIsFull(snapshot.data().count >= 7);
    } catch (err) {
      console.error(err);
    }
    setLoadingCap(false);
  };

  const handlePrevMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev.getFullYear(), prev.getMonth() - 1, 1);
      return newDate >= minDate ? newDate : prev;
    });
    setSelectedEvent(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev.getFullYear(), prev.getMonth() + 1, 1);
      return newDate <= maxDate ? newDate : prev;
    });
    setSelectedEvent(null);
  };

  const handleSubmit = async () => {
    if (!nombre || !telefono) {
      setErrorMsg('Por favor llena todos los datos.');
      return;
    }
    setSubmitting(true);
    setErrorMsg('');
    try {
      const q = query(collection(db, 'recitales'), where('fecha', '==', selectedEvent.date));
      const snapshot = await getCountFromServer(q);
      if (snapshot.data().count >= 7) {
        setErrorMsg('¡Oh no! Justo se agotaron los cupos para esta fecha.');
        setIsFull(true);
        setSubmitting(false);
        return;
      }

      await addDoc(collection(db, 'recitales'), {
        nombre,
        telefono,
        fecha: selectedEvent.date,
        createdAt: serverTimestamp()
      });
      setSuccess(true);
    } catch (error) {
      setErrorMsg('Hubo un error al registrarte. Intenta de nuevo.');
    }
    setSubmitting(false);
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; 

  const days = Array(startDay).fill(null);
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  const getEventForDate = (dateObj) => {
    if (!dateObj) return null;
    const dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
    return EVENTS_DB.find(e => e.date === dateStr);
  };

  const isPrevDisabled = currentDate.getFullYear() === minDate.getFullYear() && currentDate.getMonth() === minDate.getMonth();
  const isNextDisabled = currentDate.getFullYear() === maxDate.getFullYear() && currentDate.getMonth() === maxDate.getMonth();

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.calendarCard}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={handlePrevMonth} disabled={isPrevDisabled} style={styles.navBtn}>
            <Text style={[styles.navBtnText, isPrevDisabled && styles.disabledText]}>{"<"}</Text>
          </TouchableOpacity>
          <Text style={styles.monthText}>{MONTHS[month]} {year}</Text>
          <TouchableOpacity onPress={handleNextMonth} disabled={isNextDisabled} style={styles.navBtn}>
            <Text style={[styles.navBtnText, isNextDisabled && styles.disabledText]}>{">"}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.daysRow}>
          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
            <Text key={i} style={styles.dayLabel}>{d}</Text>
          ))}
        </View>

        <View style={styles.gridContainer}>
          {days.map((dateObj, i) => {
            const ev = getEventForDate(dateObj);
            const isSelected = selectedEvent && dateObj && ev?.date === selectedEvent.date;
            
            return (
              <TouchableOpacity 
                key={i} 
                style={[
                  styles.dayCell, 
                  dateObj && styles.dayCellActive,
                  isSelected && styles.dayCellSelected
                ]}
                disabled={!ev}
                onPress={() => ev && setSelectedEvent(ev)}
              >
                <Text style={[styles.dayText, !dateObj && {color: 'transparent'}]}>
                  {dateObj?.getDate()}
                </Text>
                {ev && (
                  <View style={[styles.eventDot, ev.type === 'upcoming' ? {backgroundColor: '#00DE85'} : {backgroundColor: '#888'}]} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {selectedEvent && (
        <View style={styles.detailsCard}>
          <Text style={styles.eventType}>{selectedEvent.type === 'upcoming' ? 'PRÓXIMO EVENTO' : 'EVENTO PASADO'}</Text>
          <Text style={styles.eventTitle}>{selectedEvent.title}</Text>
          <Text style={styles.eventTime}>{selectedEvent.time}</Text>

          {selectedEvent.type === 'upcoming' && (
            <View style={styles.formContainer}>
              {loadingCap ? (
                <ActivityIndicator color="#00DE85" style={{ marginVertical: 20 }} />
              ) : success ? (
                <View style={styles.successBox}>
                  <Text style={styles.successTitle}>¡Cupo Reservado!</Text>
                  <Text style={styles.successDesc}>Te esperamos el {selectedEvent.date}.</Text>
                </View>
              ) : isFull ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorTitle}>¡Cupos agotados!</Text>
                  <Text style={styles.errorDesc}>Se han llenado las 7 sillas para esta fecha. Revisa el calendario para otra disponibilidad.</Text>
                </View>
              ) : (
                <>
                  <Text style={styles.label}>Nombre Completo</Text>
                  <TextInput style={styles.input} value={nombre} onChangeText={(t) => {setNombre(t); setErrorMsg('');}} placeholder="Tu nombre" placeholderTextColor="#64748B" />
                  
                  <Text style={styles.label}>Teléfono (WhatsApp)</Text>
                  <TextInput style={styles.input} value={telefono} onChangeText={(t) => {setTelefono(t); setErrorMsg('');}} placeholder="300 000 0000" keyboardType="numeric" placeholderTextColor="#64748B" />
                  
                  {errorMsg ? (
                    <Text style={styles.errorTextInline}>{errorMsg}</Text>
                  ) : null}

                  <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={submitting}>
                    {submitting ? <ActivityIndicator color="#000" /> : <Text style={styles.submitBtnText}>Reservar Cupo (Gratis)</Text>}
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}

          {selectedEvent.type === 'past' && (
            <TouchableOpacity style={styles.galleryBtn}>
              <Text style={styles.galleryBtnText}>Ver fotos del evento</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000F11', padding: 20 },
  calendarCard: { backgroundColor: '#0f172a', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#1e293b', marginBottom: 20, marginTop: 40 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1e293b', padding: 10, borderRadius: 12, marginBottom: 20 },
  navBtn: { padding: 10 },
  navBtnText: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  disabledText: { color: '#475569' },
  monthText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  daysRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  dayLabel: { flex: 1, textAlign: 'center', color: '#64748B', fontWeight: 'bold' },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.28%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', padding: 5, borderRadius: 8, borderWidth: 1, borderColor: 'transparent' },
  dayCellActive: { backgroundColor: '#1e293b' },
  dayCellSelected: { borderColor: '#00DE85', backgroundColor: 'rgba(0, 222, 133, 0.1)' },
  dayText: { color: '#FFF', fontSize: 16 },
  eventDot: { width: 6, height: 6, borderRadius: 3, marginTop: 4 },
  
  detailsCard: { backgroundColor: '#0f172a', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#1e293b' },
  eventType: { color: '#00DE85', fontSize: 12, fontWeight: 'bold', letterSpacing: 1, marginBottom: 5 },
  eventTitle: { color: '#FFF', fontSize: 22, fontWeight: 'bold', marginBottom: 5 },
  eventTime: { color: '#94a3b8', fontSize: 14, marginBottom: 20 },
  
  formContainer: { marginTop: 10 },
  label: { color: '#94a3b8', marginBottom: 5 },
  input: { backgroundColor: '#1e293b', color: '#FFF', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#334155' },
  submitBtn: { backgroundColor: '#00DE85', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  submitBtnText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
  galleryBtn: { backgroundColor: '#1e293b', padding: 15, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  galleryBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  
  successBox: { backgroundColor: 'rgba(0, 222, 133, 0.1)', padding: 20, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#00DE85' },
  successTitle: { color: '#00DE85', fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  successDesc: { color: '#FFF', textAlign: 'center' },
  
  errorBox: { backgroundColor: 'rgba(255, 105, 97, 0.1)', padding: 20, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#ff6961' },
  errorTitle: { color: '#ff6961', fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  errorDesc: { color: '#FFF', textAlign: 'center' },
  errorTextInline: { color: '#ff6961', textAlign: 'center', marginBottom: 10, fontSize: 14 }
});
