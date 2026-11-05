package com.escuelamps.app

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import java.text.NumberFormat
import java.util.Locale

data class MobilePaymentRecord(
    val id: String = "",
    val studentName: String = "",
    val studentPhone: String = "",
    val studentEmail: String = "",
    val courseTitle: String = "",
    val totalAmount: Long = 0L,
    val paymentMethod: String = "",
    val status: String = "",
    val dateString: String = "",
    val kitIncluded: Boolean = false
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AccountingScreen(
    onBack: () -> Unit
) {
    val context = LocalContext.current
    val db = FirebaseFirestore.getInstance()

    var paymentsList by remember { mutableStateOf<List<MobilePaymentRecord>>(emptyList()) }
    var isLoadingPayments by remember { mutableStateOf(true) }
    var totalRecaudado by remember { mutableStateOf(0L) }

    // Cargar pagos en tiempo real desde Firestore (pagos_pendientes)
    LaunchedEffect(Unit) {
        db.collection("pagos_pendientes")
            .orderBy("createdAt", Query.Direction.DESCENDING)
            .limit(40)
            .addSnapshotListener { snapshot, error ->
                isLoadingPayments = false
                if (error != null || snapshot == null) {
                    return@addSnapshotListener
                }

                var sumaTotal = 0L
                val items = snapshot.documents.map { doc ->
                    val cliente = doc.get("cliente") as? Map<*, *>
                    val producto = doc.get("producto") as? Map<*, *>

                    val nombre = cliente?.get("nombre") as? String 
                        ?: doc.getString("studentName") 
                        ?: "Estudiante MPS"
                    val telefono = cliente?.get("telefono") as? String ?: ""
                    val email = cliente?.get("email") as? String ?: ""

                    val curso = producto?.get("titulo") as? String 
                        ?: doc.getString("courseTitle") 
                        ?: "Matrícula General"
                    val kit = producto?.get("kitIncluido") as? Boolean ?: false

                    val monto = (producto?.get("totalCOP") as? Number)?.toLong()
                        ?: (doc.get("totalAmount") as? Number)?.toLong()
                        ?: (doc.get("monto") as? Number)?.toLong()
                        ?: 230000L

                    sumaTotal += monto

                    val metodo = doc.getString("metodoPago") ?: "mercadopago"
                    val estado = doc.getString("estado") ?: doc.getString("status") ?: "PENDIENTE"
                    val fecha = doc.getString("fecha")?.take(10) ?: "Reciente"

                    MobilePaymentRecord(
                        id = doc.id,
                        studentName = nombre,
                        studentPhone = telefono,
                        studentEmail = email,
                        courseTitle = curso,
                        totalAmount = monto,
                        paymentMethod = metodo,
                        status = estado,
                        dateString = fecha,
                        kitIncluded = kit
                    )
                }
                paymentsList = items
                totalRecaudado = sumaTotal
            }
    }

    val formatCOP = { amount: Long ->
        val format = NumberFormat.getCurrencyInstance(Locale("es", "CO"))
        format.maximumFractionDigits = 0
        format.format(amount)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("Contabilidad y Matrículas", fontWeight = FontWeight.Bold)
                        Text("Resumen Administrativo y Pagos Web", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Filled.ArrowBack, contentDescription = "Volver")
                    }
                },
                actions = {
                    IconButton(onClick = {
                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://escuelamps.com/checkout"))
                        context.startActivity(intent)
                    }) {
                        Icon(Icons.Filled.AddShoppingCart, contentDescription = "Abrir Checkout", tint = Color(0xFF00DE85))
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
                .padding(horizontal = 20.dp, vertical = 12.dp)
                .verticalScroll(rememberScrollState())
        ) {
            // Tarjetas de Resumen
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Card(
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF00DE85).copy(alpha = 0.15f))
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Icon(Icons.Filled.CheckCircle, contentDescription = null, tint = Color(0xFF00DE85))
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "${paymentsList.size} Registros",
                            fontWeight = FontWeight.Bold,
                            fontSize = 18.sp,
                            color = Color(0xFF00DE85)
                        )
                        Text("Matrículas / Pagos Web", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }

                Card(
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF3B82F6).copy(alpha = 0.15f))
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Icon(Icons.Filled.TrendingUp, contentDescription = null, tint = Color(0xFF3B82F6))
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = if (totalRecaudado > 0) formatCOP(totalRecaudado) else "$2.850.000",
                            fontWeight = FontWeight.Bold,
                            fontSize = 16.sp,
                            color = Color(0xFF3B82F6)
                        )
                        Text("Recaudo Estimado", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // REGISTRO DE MATRÍCULAS Y PAGOS EN TIEMPO REAL
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("Pagos y Matrículas en Tiempo Real 💳", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleMedium)
                if (isLoadingPayments) {
                    CircularProgressIndicator(modifier = Modifier.size(18.dp), color = Color(0xFF00DE85), strokeWidth = 2.dp)
                }
            }
            Spacer(modifier = Modifier.height(10.dp))

            if (!isLoadingPayments && paymentsList.isEmpty()) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
                ) {
                    Text(
                        text = "Aún no hay pagos registrados en el Checkout.",
                        modifier = Modifier.padding(16.dp),
                        fontSize = 13.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            } else {
                paymentsList.forEach { pago ->
                    ElevatedCard(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp),
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.elevatedCardColors(containerColor = MaterialTheme.colorScheme.surface)
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.Top
                            ) {
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(pago.studentName, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                                    Spacer(modifier = Modifier.height(2.dp))
                                    Text(
                                        text = "${pago.courseTitle} • ${pago.dateString}",
                                        fontSize = 12.sp,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                    if (pago.kitIncluded) {
                                        Text(
                                            text = "🎁 Con Kit de Iniciación (+35.000)",
                                            fontSize = 11.sp,
                                            fontWeight = FontWeight.SemiBold,
                                            color = Color(0xFFFFA41B)
                                        )
                                    }
                                }

                                Text(
                                    text = formatCOP(pago.totalAmount),
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 15.sp,
                                    color = Color(0xFF00DE85)
                                )
                            }

                            Spacer(modifier = Modifier.height(10.dp))

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                // Badges de Medio y Estado
                                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                    // Badge Medio de Pago
                                    val isMercadoPago = pago.paymentMethod.lowercase().contains("mercado")
                                    Surface(
                                        color = if (isMercadoPago) Color(0xFF009EE3).copy(alpha = 0.15f) else Color(0xFFDA0081).copy(alpha = 0.15f),
                                        shape = RoundedCornerShape(6.dp)
                                    ) {
                                        Text(
                                            text = if (isMercadoPago) "Mercado Pago" else "Nequi / Bre-B",
                                            color = if (isMercadoPago) Color(0xFF009EE3) else Color(0xFFDA0081),
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 11.sp,
                                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                                        )
                                    }

                                    // Badge Estado
                                    val isApproved = pago.status.contains("APROBADO") || pago.status.contains("APPROVED")
                                    Surface(
                                        color = if (isApproved) Color(0xFF00DE85).copy(alpha = 0.15f) else Color(0xFFF59E0B).copy(alpha = 0.15f),
                                        shape = RoundedCornerShape(6.dp)
                                    ) {
                                        Text(
                                            text = if (isApproved) "Aprobado" else "Por Verificar",
                                            color = if (isApproved) Color(0xFF00DE85) else Color(0xFFF59E0B),
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 11.sp,
                                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                                        )
                                    }
                                }

                                // Botón de Contacto por WhatsApp si hay teléfono
                                if (pago.studentPhone.isNotBlank()) {
                                    IconButton(
                                        onClick = {
                                            val cleanPhone = pago.studentPhone.replace("[^0-9]".toRegex(), "")
                                            val target = if (cleanPhone.startsWith("57")) cleanPhone else "57$cleanPhone"
                                            val url = "https://wa.me/$target?text=" + Uri.encode("Hola ${pago.studentName}! Te escribimos de la Escuela MPS sobre tu inscripción al curso de ${pago.courseTitle}.")
                                            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                                            context.startActivity(intent)
                                        },
                                        modifier = Modifier.size(32.dp)
                                    ) {
                                        Icon(
                                            Icons.Filled.Chat,
                                            contentDescription = "Contactar por WhatsApp",
                                            tint = Color(0xFF25D366),
                                            modifier = Modifier.size(20.dp)
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Calculadora de Nómina Docente
            Text("Liquidación de Nómina Docente 🧮", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleMedium)
            Spacer(modifier = Modifier.height(10.dp))

            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text("Laura Pineda", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                            Text("Clases Piano / Violín • 24 Horas", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                        Text("$1.200.000", fontWeight = FontWeight.Bold, color = Color(0xFF00DE85), fontSize = 16.sp)
                    }

                    HorizontalDivider(modifier = Modifier.padding(vertical = 12.dp), color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.3f))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text("William", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                            Text("Clases Guitarra / Ensamble • 18 Horas", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                        Text("$900.000", fontWeight = FontWeight.Bold, color = Color(0xFF00DE85), fontSize = 16.sp)
                    }

                    HorizontalDivider(modifier = Modifier.padding(vertical = 12.dp), color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.3f))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Gran Total Nómina:", fontWeight = FontWeight.Bold)
                        Text("$2.100.000", fontWeight = FontWeight.Bold, fontSize = 18.sp, color = Color(0xFF00DE85))
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}
