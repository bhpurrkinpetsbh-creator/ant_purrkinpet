package com.purrkinpets.domain.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Domain model representing a product.
 */
@Serializable
data class Product(
    val id: String,
    val name: String,
    val description: String? = null,
    val price: Double,
    @SerialName("image_url")
    val imageUrl: String,
    @SerialName("stock_quantity")
    val stockQuantity: Int = 0,
    @SerialName("category_id")
    val categoryId: String? = null,
    @SerialName("brand_id")
    val brandId: String? = null,
    @SerialName("compare_at_price")
    val compareAtPrice: Double? = null,
    @SerialName("offer_price")
    val offerPrice: Double? = null,
    @SerialName("is_on_offer")
    val isOnOffer: Boolean = false,
    @SerialName("is_featured")
    val isFeatured: Boolean = false,
    @SerialName("is_active")
    val isActive: Boolean = true,
    val sku: String? = null,
    val slug: String = "",
    val subcategory: String? = null
) {
    /**
     * Get the effective display price (offer price if on offer, otherwise regular price).
     */
    val displayPrice: Double
        get() = if (isOnOffer && offerPrice != null) offerPrice else price
    
    /**
     * Check if product is in stock.
     */
    val isInStock: Boolean
        get() = stockQuantity > 0
    
    /**
     * Calculate discount percentage if on offer.
     */
    val discountPercentage: Int
        get() {
            if (!isOnOffer || offerPrice == null || price <= 0) return 0
            return ((price - offerPrice) / price * 100).toInt()
        }
}
