package com.escuelamps.app

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

data class MpsCourseItem(
    val id: String,
    val name: String,
    val teacher: String,
    val description: String,
    val room: String,
    val classroomUrl: String
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ClasesMpsScreen(
    onBack: () -> Unit
) {
    val context = LocalContext.current

    val courses = listOf(
        MpsCourseItem(
            id = "1",
            name = "Piano y Teclados - Niveles 1 y 2",
            teacher = "Laura Pineda",
            description = "Técnica de escalas, lectura en pentagrama y repertorio clásico y contemporáneo.",
            room = "Aula 101",
            classroomUrl = "https://classroom.google.com/h/tv"
        ),
        MpsCourseItem(
            id = "2",
            name = "Canto y Técnica Vocal",
            teacher = "William Buitrago",
            description = "Respiración diafragmática, vocalización, afinación e interpretación en escenario.",
            room = "Aula 102",
            classroomUrl = "https://classroom.google.com/h/tv"
        ),
        MpsCourseItem(
            id = "3",
            name = "Guitarra Acústica y Eléctrica",
            teacher = "Jorge Garcia",
            description = "Acordes, digitación, ritmos modernos, improvisación y solfeo aplicado.",
            room = "Aula 103",
            classroomUrl = "https://classroom.google.com/h/tv"
        ),
        MpsCourseItem(
            id = "4",
            name = "Iniciación y Estimulación Musical",
            teacher = "Jenny Rojas",
            description = "Desarrollo rítmico, auditivo y psicomotor a través de juegos y campanas musicales.",
            room = "Aula 104",
            classroomUrl = "https://classroom.google.com/h/tv"
        ),
        MpsCourseItem(
            id = "5",
            name = "Producción y Ensamble Musical",
            teacher = "Sebastian Vergara",
            description = "Montaje de canciones en banda, microfonía y producción en software musical.",
            room = "Estudio MPS",
            classroomUrl = "https://classroom.google.com/h/tv"
        )
    )

    fun openClassroom(url: String) {
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
        context.startActivity(intent)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("Clases MPS (Procesos)", fontWeight = FontWeight.Bold, fontSize = 18.sp)
                        Text("Procesos formativos y material", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Filled.ArrowBack, contentDescription = "Volver")
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
                .padding(horizontal = 18.dp)
        ) {
            Spacer(modifier = Modifier.height(8.dp))

            // Banner Classroom Oficial
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF00DE85).copy(alpha = 0.12f))
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(46.dp)
                                .clip(RoundedCornerShape(12.dp))
                                .background(Color(0xFF00DE85)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Filled.School, contentDescription = null, tint = Color(0xFF111111), modifier = Modifier.size(26.dp))
                        }
                        Spacer(modifier = Modifier.width(14.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text("Google Classroom Oficial", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleSmall)
                            Text("Accede a las tareas, calificaciones y anuncios", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    Button(
                        onClick = { openClassroom("https://classroom.google.com/h/tv") },
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF00DE85), contentColor = Color(0xFF111111)),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Icon(Icons.Filled.OpenInNew, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Abrir Classroom Oficial", fontWeight = FontWeight.Bold)
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            Text(
                text = "Cursos y Procesos Activos",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.height(12.dp))

            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                verticalArrangement = Arrangement.spacedBy(12.dp),
                contentPadding = PaddingValues(bottom = 30.dp)
            ) {
                items(courses, key = { it.id }) { course ->
                    ElevatedCard(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.elevatedCardColors(containerColor = MaterialTheme.colorScheme.surface)
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = course.name,
                                    style = MaterialTheme.typography.titleSmall,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.weight(1f)
                                )
                                Surface(
                                    color = Color(0xFF3B82F6).copy(alpha = 0.15f),
                                    shape = RoundedCornerShape(8.dp)
                                ) {
                                    Text(
                                        text = course.room,
                                        color = Color(0xFF3B82F6),
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "Docente: ${course.teacher}",
                                style = MaterialTheme.typography.bodySmall,
                                color = Color(0xFF00DE85),
                                fontWeight = FontWeight.SemiBold
                            )

                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = course.description,
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )

                            Spacer(modifier = Modifier.height(12.dp))
                            OutlinedButton(
                                onClick = { openClassroom(course.classroomUrl) },
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Icon(Icons.Filled.Launch, contentDescription = null, modifier = Modifier.size(16.dp), tint = Color(0xFF00DE85))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Ver Proceso y Tareas", color = Color(0xFF00DE85), fontWeight = FontWeight.Bold, fontSize = 13.sp)
                            }
                        }
                    }
                }
            }
        }
    }
}
