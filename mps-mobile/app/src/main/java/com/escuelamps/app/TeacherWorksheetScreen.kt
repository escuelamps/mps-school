package com.escuelamps.app

import android.graphics.Bitmap
import android.graphics.Paint
import android.util.Base64
import android.widget.Toast
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.asAndroidPath
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import java.io.ByteArrayOutputStream
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TeacherWorksheetScreen(
    onBack: () -> Unit,
    onViewList: () -> Unit = {}
) {
    val context = LocalContext.current
    val auth = FirebaseAuth.getInstance()
    val db = FirebaseFirestore.getInstance()
    val currentUser = auth.currentUser

    // Form states
    var profesor by remember { mutableStateOf("Laura Pineda") }
    var estudiante by remember { mutableStateOf("") }
    var fecha by remember { 
        mutableStateOf(SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())) 
    }
    var hora by remember { 
        mutableStateOf(SimpleDateFormat("HH:mm", Locale.getDefault()).format(Date())) 
    }
    var instrumento by remember { mutableStateOf("Piano") }
    var contenido by remember { mutableStateOf("") }

    // Lists & Dropdowns
    val instrumentosList = listOf(
        "Piano", "Canto", "Guitarra", "Batería", 
        "Violín", "Bajo", "Iniciación Musical", 
        "Producción Musical", "Técnica Vocal"
    )
    var profesoresList by remember { 
        mutableStateOf(listOf("Laura Pineda", "William Buitrago", "Juanse", "Jorge Garcia", "Carlos Macia", "Jenny Rojas", "Sebastian Vergara")) 
    }
    var estudiantesList by remember { mutableStateOf<List<String>>(emptyList()) }
    var estudiantesFiltrados by remember { mutableStateOf<List<String>>(emptyList()) }
    var expandedProfesor by remember { mutableStateOf(false) }
    var expandedInstrumento by remember { mutableStateOf(false) }
    var showEstudianteDropdown by remember { mutableStateOf(false) }

    // Signature state (List of strokes, each stroke is a list of points)
    val strokes = remember { mutableStateListOf<List<Offset>>() }
    var currentStroke = remember { mutableStateListOf<Offset>() }

    var isSubmitting by remember { mutableStateOf(false) }
    var showSuccessDialog by remember { mutableStateOf(false) }

    // Cargar información inicial: profesor logueado y lista de alumnos
    LaunchedEffect(currentUser?.uid) {
        currentUser?.uid?.let { uid ->
            db.collection("users").document(uid).get().addOnSuccessListener { doc ->
                if (doc != null && doc.exists()) {
                    val name = doc.getString("name") ?: doc.getString("username")
                    val email = doc.getString("email") ?: currentUser.email ?: ""
                    val resolvedName = when {
                        !name.isNullOrBlank() -> name
                        email.startsWith("lpineda") -> "Laura Pineda"
                        email.startsWith("william") -> "William Buitrago"
                        email.startsWith("juanse") -> "Juanse"
                        else -> "Profesor"
                    }
                    profesor = resolvedName
                    if (!profesoresList.contains(resolvedName)) {
                        profesoresList = listOf(resolvedName) + profesoresList
                    }
                }
            }
        }

        // Cargar estudiantes de Firestore
        db.collection("users").get().addOnSuccessListener { snap ->
            val students = snap.documents.mapNotNull { doc ->
                val name = doc.getString("name") ?: doc.getString("username")
                val role = doc.getString("role") ?: "student"
                if (role == "student" && !name.isNullOrBlank()) name.trim() else null
            }.distinct().sorted()

            if (students.isNotEmpty()) {
                estudiantesList = students
            } else {
                estudiantesList = listOf("Sofía Gómez", "Mateo Silva", "Valentina Ríos", "Daniel Castro", "Camila Restrepo")
            }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("Registro de Planilla", fontWeight = FontWeight.Bold, fontSize = 18.sp)
                        Text("Docente y Firma Digital", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Filled.ArrowBack, contentDescription = "Volver")
                    }
                },
                actions = {
                    IconButton(onClick = onViewList) {
                        Icon(Icons.Filled.History, contentDescription = "Ver Historial", tint = Color(0xFF00DE85))
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.surface)
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 20.dp, vertical = 12.dp)
        ) {
            // Header Info
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)),
                shape = RoundedCornerShape(14.dp)
            ) {
                Row(
                    modifier = Modifier.padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(44.dp)
                            .clip(RoundedCornerShape(10.dp))
                            .background(Color(0xFF00DE85).copy(alpha = 0.2f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Filled.Assignment, contentDescription = null, tint = Color(0xFF00DE85))
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text("Planilla de Seguimiento MPS", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleSmall)
                        Text("Diligencia los datos de la clase y solicita la firma", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            }

            Spacer(modifier = Modifier.height(18.dp))

            // 1. Profesor (Desplegable)
            Text("Profesor *", style = MaterialTheme.typography.labelLarge, fontWeight = FontWeight.SemiBold)
            Spacer(modifier = Modifier.height(6.dp))
            ExposedDropdownMenuBox(
                expanded = expandedProfesor,
                onExpandedChange = { expandedProfesor = !expandedProfesor },
                modifier = Modifier.fillMaxWidth()
            ) {
                OutlinedTextField(
                    value = profesor,
                    onValueChange = {},
                    readOnly = true,
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandedProfesor) },
                    modifier = Modifier.menuAnchor().fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    leadingIcon = { Icon(Icons.Filled.Person, contentDescription = null, tint = Color(0xFF00DE85)) }
                )
                ExposedDropdownMenu(
                    expanded = expandedProfesor,
                    onDismissRequest = { expandedProfesor = false }
                ) {
                    profesoresList.forEach { tName ->
                        DropdownMenuItem(
                            text = { Text(tName) },
                            onClick = {
                                profesor = tName
                                expandedProfesor = false
                            }
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // 2. Estudiante (Campo con autocompletado)
            Text("Estudiante *", style = MaterialTheme.typography.labelLarge, fontWeight = FontWeight.SemiBold)
            Spacer(modifier = Modifier.height(6.dp))
            Box(modifier = Modifier.fillMaxWidth()) {
                OutlinedTextField(
                    value = estudiante,
                    onValueChange = { query ->
                        estudiante = query
                        estudiantesFiltrados = if (query.isNotBlank()) {
                            estudiantesList.filter { it.contains(query, ignoreCase = true) }
                        } else emptyList()
                        showEstudianteDropdown = estudiantesFiltrados.isNotEmpty()
                    },
                    placeholder = { Text("Escribe o busca el nombre...") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    leadingIcon = { Icon(Icons.Filled.School, contentDescription = null, tint = Color(0xFF3B82F6)) }
                )

                if (showEstudianteDropdown) {
                    DropdownMenu(
                        expanded = showEstudianteDropdown,
                        onDismissRequest = { showEstudianteDropdown = false },
                        modifier = Modifier.fillMaxWidth(0.9f)
                    ) {
                        estudiantesFiltrados.forEach { sName ->
                            DropdownMenuItem(
                                text = { Text(sName) },
                                onClick = {
                                    estudiante = sName
                                    showEstudianteDropdown = false
                                }
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // 3. Fecha y Hora en una Fila
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                Column(modifier = Modifier.weight(1f)) {
                    Text("Fecha *", style = MaterialTheme.typography.labelLarge, fontWeight = FontWeight.SemiBold)
                    Spacer(modifier = Modifier.height(6.dp))
                    OutlinedTextField(
                        value = fecha,
                        onValueChange = { fecha = it },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        leadingIcon = { Icon(Icons.Filled.CalendarToday, contentDescription = null, tint = Color(0xFFF59E0B)) }
                    )
                }

                Column(modifier = Modifier.weight(1f)) {
                    Text("Hora *", style = MaterialTheme.typography.labelLarge, fontWeight = FontWeight.SemiBold)
                    Spacer(modifier = Modifier.height(6.dp))
                    OutlinedTextField(
                        value = hora,
                        onValueChange = { hora = it },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        leadingIcon = { Icon(Icons.Filled.AccessTime, contentDescription = null, tint = Color(0xFF8B5CF6)) }
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // 4. Asignatura / Instrumento
            Text("Asignatura / Instrumento *", style = MaterialTheme.typography.labelLarge, fontWeight = FontWeight.SemiBold)
            Spacer(modifier = Modifier.height(6.dp))
            ExposedDropdownMenuBox(
                expanded = expandedInstrumento,
                onExpandedChange = { expandedInstrumento = !expandedInstrumento },
                modifier = Modifier.fillMaxWidth()
            ) {
                OutlinedTextField(
                    value = instrumento,
                    onValueChange = {},
                    readOnly = true,
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandedInstrumento) },
                    modifier = Modifier.menuAnchor().fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    leadingIcon = { Icon(Icons.Filled.MusicNote, contentDescription = null, tint = Color(0xFFEC4899)) }
                )
                ExposedDropdownMenu(
                    expanded = expandedInstrumento,
                    onDismissRequest = { expandedInstrumento = false }
                ) {
                    instrumentosList.forEach { inst ->
                        DropdownMenuItem(
                            text = { Text(inst) },
                            onClick = {
                                instrumento = inst
                                expandedInstrumento = false
                            }
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // 5. Contenido Pedagógico / Observaciones (Opcional)
            Text("Contenido Pedagógico / Observaciones (Opcional)", style = MaterialTheme.typography.labelLarge, fontWeight = FontWeight.SemiBold)
            Spacer(modifier = Modifier.height(6.dp))
            OutlinedTextField(
                value = contenido,
                onValueChange = { contenido = it },
                placeholder = { Text("Obras, escalas, técnicas o notas de la sesión...") },
                modifier = Modifier.fillMaxWidth(),
                minLines = 3,
                shape = RoundedCornerShape(12.dp)
            )

            Spacer(modifier = Modifier.height(20.dp))

            // 6. Lienzo de Firma Digital Táctil
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Firma Digital del Estudiante *",
                    style = MaterialTheme.typography.labelLarge,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF00DE85)
                )

                TextButton(
                    onClick = {
                        strokes.clear()
                        currentStroke.clear()
                    }
                ) {
                    Icon(Icons.Filled.Refresh, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Limpiar", color = MaterialTheme.colorScheme.error, fontWeight = FontWeight.SemiBold)
                }
            }

            Text(
                text = "Firma con el dedo en el recuadro negro:",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Spacer(modifier = Modifier.height(8.dp))

            // Canvas de Firma
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(180.dp)
                    .clip(RoundedCornerShape(14.dp))
                    .background(Color(0xFF0B1416))
                    .border(1.5.dp, Color(0xFF00DE85).copy(alpha = 0.4f), RoundedCornerShape(14.dp))
                    .pointerInput(Unit) {
                        detectDragGestures(
                            onDragStart = { offset ->
                                currentStroke = mutableStateListOf(offset)
                            },
                            onDrag = { change, _ ->
                                change.consume()
                                currentStroke.add(change.position)
                            },
                            onDragEnd = {
                                if (currentStroke.isNotEmpty()) {
                                    strokes.add(currentStroke.toList())
                                    currentStroke.clear()
                                }
                            }
                        )
                    }
            ) {
                Canvas(modifier = Modifier.fillMaxSize()) {
                    // Dibujar trazos guardados
                    for (stroke in strokes) {
                        if (stroke.size > 1) {
                            val path = Path()
                            path.moveTo(stroke[0].x, stroke[0].y)
                            for (i in 1 until stroke.size) {
                                path.lineTo(stroke[i].x, stroke[i].y)
                            }
                            drawPath(
                                path = path,
                                color = Color(0xFF00DE85),
                                style = Stroke(width = 6f)
                            )
                        }
                    }

                    // Dibujar trazo actual mientras se arrastra
                    if (currentStroke.size > 1) {
                        val activePath = Path()
                        activePath.moveTo(currentStroke[0].x, currentStroke[0].y)
                        for (i in 1 until currentStroke.size) {
                            activePath.lineTo(currentStroke[i].x, currentStroke[i].y)
                        }
                        drawPath(
                            path = activePath,
                            color = Color(0xFF00DE85),
                            style = Stroke(width = 6f)
                        )
                    }
                }

                if (strokes.isEmpty() && currentStroke.isEmpty()) {
                    Text(
                        text = "✍️ Firma aquí con el dedo...",
                        color = Color.Gray.copy(alpha = 0.5f),
                        fontSize = 14.sp,
                        modifier = Modifier.align(Alignment.Center)
                    )
                }
            }

            Spacer(modifier = Modifier.height(26.dp))

            // Botón de Enviar
            Button(
                onClick = {
                    if (profesor.isBlank()) {
                        Toast.makeText(context, "Por favor selecciona el profesor", Toast.LENGTH_SHORT).show()
                        return@Button
                    }
                    if (estudiante.isBlank()) {
                        Toast.makeText(context, "Por favor indica el nombre del estudiante", Toast.LENGTH_SHORT).show()
                        return@Button
                    }
                    if (strokes.isEmpty()) {
                        Toast.makeText(context, "La firma digital del estudiante es obligatoria", Toast.LENGTH_SHORT).show()
                        return@Button
                    }

                    isSubmitting = true

                    // Convertir trazos a Bitmap y luego a Base64
                    val width = 600
                    val height = 300
                    val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
                    val canvas = android.graphics.Canvas(bitmap)
                    canvas.drawColor(android.graphics.Color.TRANSPARENT)

                    val paint = Paint().apply {
                        color = android.graphics.Color.parseColor("#00DE85")
                        strokeWidth = 8f
                        style = Paint.Style.STROKE
                        strokeJoin = Paint.Join.ROUND
                        strokeCap = Paint.Cap.ROUND
                        isAntiAlias = true
                    }

                    for (stroke in strokes) {
                        if (stroke.size > 1) {
                            val path = Path()
                            path.moveTo(stroke[0].x, stroke[0].y)
                            for (i in 1 until stroke.size) {
                                path.lineTo(stroke[i].x, stroke[i].y)
                            }
                            canvas.drawPath(path.asAndroidPath(), paint)
                        }
                    }

                    val stream = ByteArrayOutputStream()
                    bitmap.compress(Bitmap.CompressFormat.PNG, 100, stream)
                    val base64Signature = "data:image/png;base64," + Base64.encodeToString(stream.toByteArray(), Base64.NO_WRAP)

                    val docData = hashMapOf(
                        "profesor" to profesor.trim(),
                        "estudiante" to estudiante.trim(),
                        "fecha" to fecha,
                        "hora" to hora,
                        "instrumento" to instrumento.trim(),
                        "contenido" to (if (contenido.isNotBlank()) contenido.trim() else "Clase de ${estudiante.trim()} con ${profesor.trim()}"),
                        "firma" to base64Signature,
                        "createdAt" to SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.getDefault()).format(Date()),
                        "source" to "mobile_app"
                    )

                    db.collection("planillas").add(docData)
                        .addOnSuccessListener {
                            isSubmitting = false
                            showSuccessDialog = true
                        }
                        .addOnFailureListener { e ->
                            isSubmitting = false
                            Toast.makeText(context, "Error guardando planilla: ${e.message}", Toast.LENGTH_LONG).show()
                        }
                },
                enabled = !isSubmitting,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(54.dp),
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF00DE85), contentColor = Color(0xFF111111))
            ) {
                if (isSubmitting) {
                    CircularProgressIndicator(modifier = Modifier.size(24.dp), color = Color(0xFF111111), strokeWidth = 2.dp)
                    Spacer(modifier = Modifier.width(10.dp))
                    Text("Guardando Planilla...", fontWeight = FontWeight.Bold)
                } else {
                    Icon(Icons.Filled.Check, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Registrar Planilla de Clase", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                }
            }

            Spacer(modifier = Modifier.height(30.dp))
        }
    }

    if (showSuccessDialog) {
        AlertDialog(
            onDismissRequest = { showSuccessDialog = false },
            icon = { Icon(Icons.Filled.CheckCircle, contentDescription = null, tint = Color(0xFF00DE85), modifier = Modifier.size(48.dp)) },
            title = { Text("¡Planilla Registrada!", fontWeight = FontWeight.Bold, textAlign = androidx.compose.ui.text.style.TextAlign.Center) },
            text = {
                Text(
                    text = "La clase con $estudiante dictada por $profesor ($instrumento) fue registrada con éxito en Firestore.",
                    textAlign = androidx.compose.ui.text.style.TextAlign.Center
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        showSuccessDialog = false
                        estudiante = ""
                        contenido = ""
                        strokes.clear()
                        currentStroke.clear()
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF00DE85), contentColor = Color(0xFF111111))
                ) {
                    Text("Registrar Otra", fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                OutlinedButton(
                    onClick = {
                        showSuccessDialog = false
                        onViewList()
                    }
                ) {
                    Text("Ver Historial")
                }
            }
        )
    }
}
