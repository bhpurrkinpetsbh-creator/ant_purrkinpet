package com.purrkinpets.util

import java.text.NumberFormat
import java.util.Locale

/**
 * Extension functions for various types used throughout the app.
 */

/**
 * Format a Double as Bahraini Dinar currency.
 */
fun Double.toBHD(): String {
    return String.format(Locale.US, "BD %.3f", this)
}

/**
 * Format a Double as Bahraini Dinar without the currency suffix.
 */
fun Double.formatPrice(): String {
    return String.format(Locale.US, "%.3f", this)
}

/**
 * Capitalize the first letter of the string.
 */
fun String.capitalizeFirst(): String {
    return this.replaceFirstChar { 
        if (it.isLowerCase()) it.titlecase(Locale.getDefault()) 
        else it.toString() 
    }
}

/**
 * Truncate a string to a maximum length with ellipsis.
 */
fun String.truncate(maxLength: Int): String {
    return if (this.length > maxLength) {
        this.take(maxLength - 3) + "..."
    } else {
        this
    }
}

/**
 * Check if a string is a valid email format.
 */
fun String.isValidEmail(): Boolean {
    return android.util.Patterns.EMAIL_ADDRESS.matcher(this).matches()
}

/**
 * Calculate discount percentage.
 */
fun calculateDiscount(originalPrice: Double, offerPrice: Double): Int {
    if (originalPrice <= 0) return 0
    return ((originalPrice - offerPrice) / originalPrice * 100).toInt()
}
