package com.purrkinpets.domain.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Domain model representing a product category.
 */
@Serializable
data class Category(
    val id: String,
    val name: String,
    val slug: String,
    val description: String? = null,
    @SerialName("image_url")
    val imageUrl: String? = null,
    @SerialName("display_order")
    val displayOrder: Int = 0,
    @SerialName("is_active")
    val isActive: Boolean = true
)
