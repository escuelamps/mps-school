package com.escuelamps.app

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable

@Composable
fun NavigationGraph(
    navController: NavHostController,
    isDarkMode: Boolean = true,
    onToggleDarkMode: () -> Unit = {}
) {
    NavHost(navController = navController, startDestination = "login") {
        composable("login") {
            LoginScreen(
                onLoginSuccess = {
                    navController.navigate("home") {
                        popUpTo("login") { inclusive = true }
                    }
                }
            )
        }
        composable("home") {
            HomeScreen(
                isDarkMode = isDarkMode,
                onToggleDarkMode = onToggleDarkMode,
                onLogout = {
                    navController.navigate("login") {
                        popUpTo("home") { inclusive = true }
                    }
                },
                onOpenGame = {
                    navController.navigate("song_select")
                },
                onOpenProfile = {
                    navController.navigate("profile")
                },
                onOpenAgenda = {
                    navController.navigate("agenda")
                },
                onOpenDirectory = {
                    navController.navigate("directory")
                },
                onOpenAccounting = {
                    navController.navigate("accounting")
                },
                onOpenPlanillas = {
                    navController.navigate("planillas_list")
                },
                onOpenNewPlanilla = {
                    navController.navigate("teacher_worksheet")
                },
                onOpenClasesMps = {
                    navController.navigate("clases_mps")
                }
            )
        }
        composable("agenda") {
            AgendaScreen(
                onBack = { navController.popBackStack() }
            )
        }
        composable("directory") {
            DirectoryScreen(
                onBack = { navController.popBackStack() }
            )
        }
        composable("accounting") {
            AccountingScreen(
                onBack = { navController.popBackStack() }
            )
        }
        composable("teacher_worksheet") {
            TeacherWorksheetScreen(
                onBack = { navController.popBackStack() },
                onViewList = { navController.navigate("planillas_list") }
            )
        }
        composable("planillas_list") {
            PlanillasListScreen(
                onBack = { navController.popBackStack() },
                onCreateNew = { navController.navigate("teacher_worksheet") }
            )
        }
        composable("clases_mps") {
            ClasesMpsScreen(
                onBack = { navController.popBackStack() }
            )
        }
        composable("song_select") {
            com.escuelamps.app.games.ui.SongSelectScreen(
                onSelectSong = { selectedSong ->
                    navController.navigate("piano_game/${selectedSong.id}")
                },
                onBack = {
                    navController.popBackStack()
                }
            )
        }
        composable("piano_game/{songId}") { backStackEntry ->
            val songId = backStackEntry.arguments?.getString("songId") ?: "twinkle"
            val song = com.escuelamps.app.games.engine.SongsCatalog.getById(songId)
            com.escuelamps.app.games.ui.PianoGameScreen(
                song = song,
                onBack = {
                    navController.popBackStack()
                }
            )
        }
        composable("profile") {
            ProfileScreen(
                onBack = {
                    navController.popBackStack()
                }
            )
        }
    }
}
