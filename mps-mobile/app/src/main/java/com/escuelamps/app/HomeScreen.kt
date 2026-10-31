package com.escuelamps.app

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    isDarkMode: Boolean = true,
    onToggleDarkMode: () -> Unit = {},
    onLogout: () -> Unit,
    onOpenGame: () -> Unit = {},
    onOpenProfile: () -> Unit = {},
    onOpenAgenda: () -> Unit = {},
    onOpenDirectory: () -> Unit = {},
    onOpenAccounting: () -> Unit = {},
    onOpenPlanillas: () -> Unit = {},
    onOpenNewPlanilla: () -> Unit = {},
    onOpenClasesMps: () -> Unit = {}
) {
    val auth = FirebaseAuth.getInstance()
    val db = FirebaseFirestore.getInstance()
    val currentUser = auth.currentUser

    var userName by remember { mutableStateOf("Laura Pineda") }
    var userRole by remember { mutableStateOf("Directora General / Docente") }
    var email by remember { mutableStateOf(currentUser?.email ?: "lpineda@escuelamps.com") }

    val drawerState = rememberDrawerState(initialValue = DrawerValue.Closed)
    val scope = rememberCoroutineScope()

    // Consultar datos reales de Firestore si están disponibles
    LaunchedEffect(currentUser?.uid) {
        currentUser?.uid?.let { uid ->
            db.collection("users").document(uid).get()
                .addOnSuccessListener { doc ->
                    if (doc != null && doc.exists()) {
                        val nameFromDb = doc.getString("name") ?: doc.getString("username")
                        val roleFromDb = doc.getString("role")
                        if (!nameFromDb.isNullOrBlank()) {
                            userName = nameFromDb
                        }
                        if (!roleFromDb.isNullOrBlank()) {
                            userRole = when (roleFromDb) {
                                "admin" -> "Directora / Administradora"
                                "teacher" -> "Docente"
                                "student" -> "Estudiante"
                                else -> roleFromDb.replaceFirstChar { it.uppercase() }
                            }
                        }
                    }
                }
        }
    }

    ModalNavigationDrawer(
        drawerState = drawerState,
        drawerContent = {
            ModalDrawerSheet(
                modifier = Modifier.width(310.dp),
                drawerContainerColor = MaterialTheme.colorScheme.surface
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(16.dp)
                ) {
                    // 1. Cabecera del Menú (Perfil de Laura / Usuario)
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(12.dp))
                            .clickable {
                                scope.launch { drawerState.close() }
                                onOpenProfile()
                            }
                            .padding(vertical = 12.dp, horizontal = 8.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(54.dp)
                                    .clip(CircleShape)
                                    .background(Color(0xFF00DE85)),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = userName.take(1).uppercase(),
                                    color = Color(0xFF111111),
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 22.sp
                                )
                            }
                            Spacer(modifier = Modifier.width(14.dp))
                            Column {
                                Text(
                                    text = userName,
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.Bold
                                )
                                Text(
                                    text = userRole,
                                    style = MaterialTheme.typography.bodySmall,
                                    color = Color(0xFF00DE85),
                                    fontWeight = FontWeight.SemiBold
                                )
                                Text(
                                    text = email,
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }
                    }

                    HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.4f))

                    Spacer(modifier = Modifier.height(12.dp))

                    // 2. Módulos de Navegación
                    NavigationDrawerItem(
                        icon = { Icon(Icons.Filled.CalendarMonth, contentDescription = null, tint = Color(0xFF3B82F6)) },
                        label = { Text("Agenda de Clases") },
                        selected = false,
                        onClick = {
                            scope.launch { drawerState.close() }
                            onOpenAgenda()
                        }
                    )

                    NavigationDrawerItem(
                        icon = { Icon(Icons.Filled.People, contentDescription = null, tint = Color(0xFF10B981)) },
                        label = { Text("Estudiantes y Profesores") },
                        selected = false,
                        onClick = {
                            scope.launch { drawerState.close() }
                            onOpenDirectory()
                        }
                    )

                    NavigationDrawerItem(
                        icon = { Icon(Icons.Filled.PointOfSale, contentDescription = null, tint = Color(0xFF8B5CF6)) },
                        label = { Text("Contabilidad y Matrículas") },
                        selected = false,
                        onClick = {
                            scope.launch { drawerState.close() }
                            onOpenAccounting()
                        }
                    )

                    NavigationDrawerItem(
                        icon = { Icon(Icons.Filled.AssignmentTurnedIn, contentDescription = null, tint = Color(0xFF00DE85)) },
                        label = { Text("Planillas Docentes (Firmas)") },
                        selected = false,
                        onClick = {
                            scope.launch { drawerState.close() }
                            onOpenPlanillas()
                        }
                    )

                    NavigationDrawerItem(
                        icon = { Icon(Icons.Filled.School, contentDescription = null, tint = Color(0xFF0284C7)) },
                        label = { Text("Clases MPS (Procesos)") },
                        selected = false,
                        onClick = {
                            scope.launch { drawerState.close() }
                            onOpenClasesMps()
                        }
                    )

                    NavigationDrawerItem(
                        icon = { Text("🎹", fontSize = 20.sp) },
                        label = { Text("MPS: Master Piano Series") },
                        selected = false,
                        onClick = {
                            scope.launch { drawerState.close() }
                            onOpenGame()
                        }
                    )

                    // Empujar lo siguiente hacia la parte inferior
                    Spacer(modifier = Modifier.weight(1f))

                    HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.4f))

                    Spacer(modifier = Modifier.height(12.dp))

                    // 3. PARTE INFERIOR: Switch de Modo Oscuro / Claro
                    Surface(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(12.dp))
                            .clickable { onToggleDarkMode() },
                        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 14.dp, vertical = 10.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    imageVector = if (isDarkMode) Icons.Filled.DarkMode else Icons.Filled.LightMode,
                                    contentDescription = null,
                                    tint = if (isDarkMode) Color(0xFF00DE85) else Color(0xFFF59E0B)
                                )
                                Spacer(modifier = Modifier.width(12.dp))
                                Text(
                                    text = if (isDarkMode) "Modo Oscuro" else "Modo Claro",
                                    style = MaterialTheme.typography.bodyMedium,
                                    fontWeight = FontWeight.SemiBold
                                )
                            }
                            Switch(
                                checked = isDarkMode,
                                onCheckedChange = { onToggleDarkMode() },
                                colors = SwitchDefaults.colors(
                                    checkedThumbColor = Color(0xFF00DE85),
                                    checkedTrackColor = Color(0xFF00DE85).copy(alpha = 0.3f)
                                )
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    // 4. Botón Cerrar Sesión
                    NavigationDrawerItem(
                        icon = {
                            Icon(
                                imageVector = Icons.Filled.ExitToApp,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.error
                            )
                        },
                        label = {
                            Text(
                                text = "Cerrar Sesión",
                                color = MaterialTheme.colorScheme.error,
                                fontWeight = FontWeight.Bold
                            )
                        },
                        selected = false,
                        onClick = {
                            scope.launch { drawerState.close() }
                            auth.signOut()
                            onLogout()
                        }
                    )
                }
            }
        }
    ) {
        Scaffold(
            topBar = {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        IconButton(onClick = { scope.launch { drawerState.open() } }) {
                            Icon(
                                imageVector = Icons.Filled.Menu,
                                contentDescription = "Abrir Menú",
                                modifier = Modifier.size(28.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "MPS",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF00DE85)
                        )
                    }

                    Box(
                        modifier = Modifier
                            .size(38.dp)
                            .clip(CircleShape)
                            .background(Color(0xFF00DE85))
                            .clickable { onOpenProfile() },
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = userName.take(1).uppercase(),
                            color = Color(0xFF111111),
                            fontWeight = FontWeight.Bold,
                            fontSize = 16.sp
                        )
                    }
                }
            }
        ) { innerPadding ->
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding)
                    .padding(horizontal = 20.dp)
                    .verticalScroll(rememberScrollState())
            ) {
                // Tarjeta de Perfil / Rol
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 12.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.surfaceVariant
                    ),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Column(modifier = Modifier.padding(18.dp)) {
                        Text(
                            text = "¡Hola, $userName!",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Surface(
                            color = Color(0xFF00DE85).copy(alpha = 0.2f),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Text(
                                text = userRole,
                                color = Color(0xFF00DE85),
                                fontWeight = FontWeight.SemiBold,
                                fontSize = 12.sp,
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                            )
                        }
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = email,
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Tarjeta Destacada del Juego
                ElevatedCard(
                    onClick = onOpenGame,
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.elevatedCardColors(
                        containerColor = Color(0xFF00DE85).copy(alpha = 0.15f)
                    )
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(18.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(52.dp)
                                .clip(RoundedCornerShape(14.dp))
                            .background(Color(0xFF00DE85)),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("🎹", fontSize = 26.sp)
                    }

                    Spacer(modifier = Modifier.width(16.dp))

                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "MPS: Master Piano Series 🏆",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF00DE85)
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Toca al ritmo de las canciones, compite con tus amigos y disfruta grandes beneficios en la escuela.",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            Text(
                text = "Módulos Principales",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Tarjetas de Opciones
            DashboardCard(
                title = "Agenda de Clases",
                description = "Consulta y organiza horarios de estudiantes y salas.",
                icon = Icons.Filled.CalendarMonth,
                iconColor = Color(0xFF3B82F6),
                onClick = onOpenAgenda
            )

            Spacer(modifier = Modifier.height(12.dp))

            DashboardCard(
                title = "Estudiantes y Profesores",
                description = "Directorio activo de alumnos matriculados y docentes.",
                icon = Icons.Filled.People,
                iconColor = Color(0xFF10B981),
                onClick = onOpenDirectory
            )

            Spacer(modifier = Modifier.height(12.dp))

            DashboardCard(
                title = "Contabilidad y Matrículas",
                description = "Reportes financieros, nómina y registros.",
                icon = Icons.Filled.PointOfSale,
                iconColor = Color(0xFF8B5CF6),
                onClick = onOpenAccounting
            )

            Spacer(modifier = Modifier.height(12.dp))

            DashboardCard(
                title = "Planillas Docentes (Firmas)",
                description = "Registro pedagógico de clases y firma digital con el dedo.",
                icon = Icons.Filled.AssignmentTurnedIn,
                iconColor = Color(0xFF00DE85),
                onClick = onOpenNewPlanilla
            )

            Spacer(modifier = Modifier.height(12.dp))

            DashboardCard(
                title = "Clases MPS (Procesos)",
                description = "Procesos formativos y enlace a Google Classroom.",
                icon = Icons.Filled.School,
                iconColor = Color(0xFF0284C7),
                onClick = onOpenClasesMps
            )

            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}
}

@Composable
fun DashboardCard(
    title: String,
    description: String,
    icon: ImageVector,
    iconColor: Color,
    onClick: () -> Unit
) {
    ElevatedCard(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.elevatedCardColors(
            containerColor = MaterialTheme.colorScheme.surface
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(18.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(iconColor.copy(alpha = 0.15f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = iconColor,
                    modifier = Modifier.size(26.dp)
                )
            }

            Spacer(modifier = Modifier.width(16.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = description,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}


