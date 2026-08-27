import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, ActivityIndicator } from 'react-native';

import { auth, db } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// Import Screens
import LoginScreen from '../screens/Auth/LoginScreen';
import StudentCalendarScreen from '../screens/Student/StudentCalendarScreen';
import StudentGradesScreen from '../screens/Student/StudentGradesScreen';
import StudentProfileScreen from '../screens/Student/StudentProfileScreen';

import TeacherCalendarScreen from '../screens/Teacher/TeacherCalendarScreen';
import TeacherAttendanceScreen from '../screens/Teacher/TeacherAttendanceScreen';
import TeacherGradesScreen from '../screens/Teacher/TeacherGradesScreen';
import TeacherProfileScreen from '../screens/Teacher/TeacherProfileScreen';

import AdminAgendaScreen from '../screens/Admin/AdminAgendaScreen';
import AdminProfileScreen from '../screens/Admin/AdminProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- Student Tabs ---
function StudentTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerTitleAlign: 'center', tabBarActiveTintColor: '#00DE85' }}>
      <Tab.Screen name="Calendario" component={StudentCalendarScreen} />
      <Tab.Screen name="Notas" component={StudentGradesScreen} />
      <Tab.Screen name="Perfil" component={StudentProfileScreen} />
    </Tab.Navigator>
  );
}

// --- Teacher Tabs ---
function TeacherTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerTitleAlign: 'center', tabBarActiveTintColor: '#00DE85' }}>
      <Tab.Screen name="Clases" component={TeacherCalendarScreen} />
      <Tab.Screen name="Asistencia" component={TeacherAttendanceScreen} />
      <Tab.Screen name="Notas" component={TeacherGradesScreen} />
      <Tab.Screen name="Perfil" component={TeacherProfileScreen} />
    </Tab.Navigator>
  );
}

// --- Admin Tabs ---
function AdminTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerTitleAlign: 'center', tabBarActiveTintColor: '#00DE85' }}>
      <Tab.Screen name="Agenda MPS" component={AdminAgendaScreen} />
      <Tab.Screen name="Perfil" component={AdminProfileScreen} />
    </Tab.Navigator>
  );
}

// --- Main App Navigator ---
export default function AppNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role);
          } else {
            console.warn("Usuario no encontrado en Firestore");
            await auth.signOut();
            setUserRole(null);
          }
        } catch (error) {
          console.error("Error al obtener rol:", error);
          setUserRole(null);
        }
      } else {
        setUserRole(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F7FA' }}>
        <ActivityIndicator size="large" color="#00DE85" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userRole === null ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : userRole === 'student' ? (
          <Stack.Screen name="StudentDashboard" component={StudentTabs} />
        ) : userRole === 'teacher' ? (
          <Stack.Screen name="TeacherDashboard" component={TeacherTabs} />
        ) : (
          <Stack.Screen name="AdminDashboard" component={AdminTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
