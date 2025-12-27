package com.purrkinpets.domain.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Domain model representing a user/customer.
 */
@Serializable
data class User(
    val id: String,
    val email: String,
    @SerialName("full_name")
    val fullName: String? = null,
    val phone: String? = null,
    @SerialName("avatar_url")
    val avatarUrl: String? = null
)

/**
 * Domain model representing a customer address.
 */
@Serializable
data class Address(
    val id: String,
    val label: String,
    @SerialName("full_name")
    val fullName: String,
    val phone: String,
    @SerialName("address_line1")
    val addressLine1: String,
    @SerialName("address_line2")
    val addressLine2: String? = null,
    val city: String = "Bahrain",
    val country: String = "Bahrain",
    @SerialName("postal_code")
    val postalCode: String? = null,
    @SerialName("is_default")
    val isDefault: Boolean = false
) {
    /**
     * Format address as a single line for display.
     */
    val formattedAddress: String
        get() = buildString {
            append(addressLine1)
            if (!addressLine2.isNullOrBlank()) {
                append(", ")
                append(addressLine2)
            }
            append(", ")
            append(city)
        }
}
