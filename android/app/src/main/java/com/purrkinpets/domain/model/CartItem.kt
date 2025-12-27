package com.purrkinpets.domain.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Domain model representing an item in the shopping cart.
 */
@Serializable
data class CartItem(
    val id: String,
    @SerialName("product_id")
    val productId: String,
    val quantity: Int,
    // Nested product info (populated via join)
    val product: Product? = null
) {
    /**
     * Calculate the total price for this cart item.
     */
    val totalPrice: Double
        get() = (product?.displayPrice ?: 0.0) * quantity
}

/**
 * Cart summary with totals.
 */
data class CartSummary(
    val items: List<CartItem>,
    val subtotal: Double,
    val deliveryFee: Double,
    val total: Double,
    val freeShippingThreshold: Double = 20.0
) {
    val itemCount: Int
        get() = items.sumOf { it.quantity }
    
    val remainingForFreeShipping: Double
        get() = (freeShippingThreshold - subtotal).coerceAtLeast(0.0)
    
    val hasFreeShipping: Boolean
        get() = subtotal >= freeShippingThreshold
    
    val shippingProgress: Float
        get() = (subtotal / freeShippingThreshold).coerceIn(0.0, 1.0).toFloat()
}
