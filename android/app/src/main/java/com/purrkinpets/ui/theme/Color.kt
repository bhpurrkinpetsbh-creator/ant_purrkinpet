package com.purrkinpets.ui.theme

import androidx.compose.ui.graphics.Color

// Primary Brand Colors - Matched exactly to Purrkin Pets website
// Website uses: hsl(24, 100%, 63%) = approx #FF7A42
val PrimaryOrange = Color(0xFFFF7A42)      // Main brand orange (matched to website)
val PrimaryOrangeLight = Color(0xFFFF9E6B) // Lighter variant
val PrimaryOrangeDark = Color(0xFFE56A32)  // Darker variant
val PrimaryOrangeGradientEnd = Color(0xFFFFB380) // hsl(30, 100%, 70%)

// Secondary Colors - From website CSS
val SecondaryTeal = Color(0xFF33C9B8)      // hsl(175, 60%, 55%)
val SecondaryBlue = Color(0xFF3B82F6)
val SecondaryGreen = Color(0xFF10B981)
val AccentPurple = Color(0xFF8B5CF6)       // hsl(270, 45%, 60%)

// Background Colors - Warm cream like website hsl(30, 40%, 98%)
val BackgroundWarm = Color(0xFFFDF8F4)     // Warm cream background
val BackgroundWhite = Color(0xFFFFFFFF)
val BackgroundLight = Color(0xFFF8FAFC)
val BackgroundCard = Color(0xFFFFFFFF)
val SurfaceVariant = Color(0xFFFFF4EB)     // Warmer surface variant

// Text Colors
val TextPrimary = Color(0xFF3D2A1F)        // hsl(24, 20%, 15%) - warmer
val TextSecondary = Color(0xFF6B5C52)      // hsl(24, 10%, 45%)
val TextMuted = Color(0xFF94A3B8)
val TextOnPrimary = Color(0xFFFFFFFF)

// Status Colors
val SuccessGreen = Color(0xFF22C55E)
val WarningYellow = Color(0xFFF59E0B)
val ErrorRed = Color(0xFFEF4444)
val InfoBlue = Color(0xFF3B82F6)

// Special Colors
val FreeShippingGreen = Color(0xFF16A34A)
val OfferBadgeRed = Color(0xFFDC2626)
val WishlistHeart = Color(0xFFEF4444)

// Pet Category Gradient Colors (matching website)
val GradientDogs = Pair(Color(0xFFFEF3C7), Color(0xFFFDE68A))     // Amber
val GradientCats = Pair(Color(0xFFFFEDD5), Color(0xFFFED7AA))     // Orange
val GradientBirds = Pair(Color(0xFFDCFCE7), Color(0xFFBBF7D0))    // Green
val GradientFish = Pair(Color(0xFFDBEAFE), Color(0xFFBFDBFE))     // Blue
val GradientSmallPets = Pair(Color(0xFFFCE7F3), Color(0xFFFBCFE8)) // Pink
val GradientRabbits = Pair(Color(0xFFF3E8FF), Color(0xFFE9D5FF))   // Purple
val GradientTurtles = Pair(Color(0xFFCCFBF1), Color(0xFF99F6E4))   // Teal

// Light Theme Colors
val md_theme_light_primary = PrimaryOrange
val md_theme_light_onPrimary = TextOnPrimary
val md_theme_light_primaryContainer = Color(0xFFFFE4D9)
val md_theme_light_onPrimaryContainer = Color(0xFF3A0B00)
val md_theme_light_secondary = SecondaryTeal
val md_theme_light_onSecondary = Color(0xFFFFFFFF)
val md_theme_light_secondaryContainer = Color(0xFFB8F1E9)
val md_theme_light_onSecondaryContainer = Color(0xFF00201D)
val md_theme_light_tertiary = SecondaryGreen
val md_theme_light_onTertiary = Color(0xFFFFFFFF)
val md_theme_light_tertiaryContainer = Color(0xFFB6F2C5)
val md_theme_light_onTertiaryContainer = Color(0xFF002111)
val md_theme_light_error = ErrorRed
val md_theme_light_errorContainer = Color(0xFFFFDAD6)
val md_theme_light_onError = Color(0xFFFFFFFF)
val md_theme_light_onErrorContainer = Color(0xFF410002)
val md_theme_light_background = BackgroundWarm
val md_theme_light_onBackground = TextPrimary
val md_theme_light_surface = BackgroundWhite
val md_theme_light_onSurface = TextPrimary
val md_theme_light_surfaceVariant = SurfaceVariant
val md_theme_light_onSurfaceVariant = TextSecondary
val md_theme_light_outline = Color(0xFFE2E8F0)
val md_theme_light_inverseOnSurface = Color(0xFFF1F5F9)
val md_theme_light_inverseSurface = Color(0xFF1E293B)
val md_theme_light_inversePrimary = Color(0xFFFFB59B)
val md_theme_light_surfaceTint = PrimaryOrange
val md_theme_light_outlineVariant = Color(0xFFCBD5E1)
val md_theme_light_scrim = Color(0xFF000000)

// Dark Theme Colors
val md_theme_dark_primary = Color(0xFFFFB59B)
val md_theme_dark_onPrimary = Color(0xFF5F1500)
val md_theme_dark_primaryContainer = Color(0xFF862200)
val md_theme_dark_onPrimaryContainer = Color(0xFFFFDBCF)
val md_theme_dark_secondary = Color(0xFF6EDCD2)
val md_theme_dark_onSecondary = Color(0xFF003832)
val md_theme_dark_secondaryContainer = Color(0xFF005048)
val md_theme_dark_onSecondaryContainer = Color(0xFFB8F1E9)
val md_theme_dark_tertiary = Color(0xFF9AD5AA)
val md_theme_dark_onTertiary = Color(0xFF003921)
val md_theme_dark_tertiaryContainer = Color(0xFF005231)
val md_theme_dark_onTertiaryContainer = Color(0xFFB6F2C5)
val md_theme_dark_error = Color(0xFFFFB4AB)
val md_theme_dark_errorContainer = Color(0xFF93000A)
val md_theme_dark_onError = Color(0xFF690005)
val md_theme_dark_onErrorContainer = Color(0xFFFFDAD6)
val md_theme_dark_background = Color(0xFF1A1512)
val md_theme_dark_onBackground = Color(0xFFF5EDE8)
val md_theme_dark_surface = Color(0xFF1A1512)
val md_theme_dark_onSurface = Color(0xFFF5EDE8)
val md_theme_dark_surfaceVariant = Color(0xFF2D231D)
val md_theme_dark_onSurfaceVariant = Color(0xFFD5C9C0)
val md_theme_dark_outline = Color(0xFF475569)
val md_theme_dark_inverseOnSurface = Color(0xFF1A1512)
val md_theme_dark_inverseSurface = Color(0xFFF5EDE8)
val md_theme_dark_inversePrimary = PrimaryOrange
val md_theme_dark_surfaceTint = Color(0xFFFFB59B)
val md_theme_dark_outlineVariant = Color(0xFF334155)
val md_theme_dark_scrim = Color(0xFF000000)
