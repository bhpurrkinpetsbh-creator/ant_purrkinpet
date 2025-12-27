package com.purrkinpets

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.navigation.compose.rememberNavController
import com.purrkinpets.ui.navigation.PurrkinNavGraph
import com.purrkinpets.ui.theme.PurrkinPetsTheme
import dagger.hilt.android.AndroidEntryPoint

/**
 * Main Activity - Single Activity architecture host.
 * 
 * This is the single entry point for the app. All screens are
 * implemented as Compose destinations within the NavHost.
 */
@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        
        setContent {
            PurrkinPetsTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val navController = rememberNavController()
                    PurrkinNavGraph(navController = navController)
                }
            }
        }
    }
}
