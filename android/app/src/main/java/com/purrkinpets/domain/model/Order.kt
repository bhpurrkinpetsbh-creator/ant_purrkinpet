package com.purrkinpets.domain.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Domain model representing a customer order.
 */
@Serializable
data class Order(
    val id: String,
    @SerialName("order_number")
    val orderNumber: String,
    @SerialName("created_at")
    val createdAt: String,
    val status: String = "pending",
    @SerialName("payment_status")
    val paymentStatus: String = "pending",
    @SerialName("payment_method")
    val paymentMethod: String? = null,
    val subtotal: Double,
    @SerialName("delivery_fee")
    val deliveryFee: Double = 0.0,
    val total: Double,
    @SerialName("shipping_name")
    val shippingName: String,
    @SerialName("shipping_address_line1")
    val shippingAddressLine1: String,
    @SerialName("shipping_address_line2")
    val shippingAddressLine2: String? = null,
    @SerialName("shipping_city")
    val shippingCity: String,
    @SerialName("shipping_postal_code")
    val shippingPostalCode: String? = null,
    @SerialName("customer_notes")
    val customerNotes: String? = null,
    // Order items (populated via join)
    val items: List<OrderItem>? = null
) {
    /**
     * Get order status display color.
     */
    val statusColor: OrderStatus
        get() = OrderStatus.fromString(status)
}

/**
 * Order item within an order.
 */
@Serializable
data class OrderItem(
    val id: String,
    @SerialName("product_name")
    val productName: String,
    @SerialName("product_sku")
    val productSku: String? = null,
    val quantity: Int,
    @SerialName("unit_price")
    val unitPrice: Double,
    @SerialName("total_price")
    val totalPrice: Double
)

/**
 * Order status enum with display properties.
 */
enum class OrderStatus(val displayName: String) {
    PENDING("Pending"),
    CONFIRMED("Confirmed"),
    PROCESSING("Processing"),
    SHIPPED("Shipped"),
    DELIVERED("Delivered"),
    CANCELLED("Cancelled");
    
    companion object {
        fun fromString(status: String): OrderStatus {
            return when (status.lowercase()) {
                "pending" -> PENDING
                "confirmed" -> CONFIRMED
                "processing" -> PROCESSING
                "shipped" -> SHIPPED
                "delivered" -> DELIVERED
                "cancelled" -> CANCELLED
                else -> PENDING
            }
        }
    }
}
