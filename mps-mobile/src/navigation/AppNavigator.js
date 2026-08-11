import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, ActivityIndicator } from 'react-native';

// Import Screens (to be created)
import LoginScreen from '../screens/Auth/LoginScreen';
import StudentCalendarScreen from '../screens/Student/StudentCalendarScreen';
import StudentGradesScreen from '../screens/Student/StudentGradesScreen';
import StudentProfileScreen from '../screens/Student/StudentProfileScreen';

import TeacherCalendarScreen from '../screens/Teacher/TeacherCalendarScreen';
import TeacherAttendanceScreen from '../screens/Teacher/TeacherAttendanceScreen';
import TeacherGradesScreen from '../screens/Teacher/TeacherGradesScreen';
import TeacherProfileScreen from '../screens/Teacher/TeacherProfileScreen';

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

// --- Main App Navigator ---
export default function AppNavigator() {
  const [isLoading, setIsLoading] = useState(false); // TODO: Hook to Firebase Auth
  const [userRole, setUserRole] = useState(null); // 'student', 'teacher', or null

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#00DE85" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userRole === null ? (
          // User is not logged in
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : userRole === 'student' ? (
          // User is a Student
          <Stack.Screen name="StudentDashboard" component={StudentTabs} />
        ) : (
          // User is a Teacher
          <Stack.Screen name="TeacherDashboard" component={TeacherTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
