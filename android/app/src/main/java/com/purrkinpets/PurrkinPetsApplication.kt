package com.purrkinpets

import android.app.Application
import dagger.hilt.android.HiltAndroidApp

/**
 * Main Application class for Purrkin Pets Android app.
 * 
 * This class is annotated with @HiltAndroidApp to trigger Hilt's code generation
 * and establish the application-level dependency container.
 */
@HiltAndroidApp
class PurrkinPetsApplication : Application()
