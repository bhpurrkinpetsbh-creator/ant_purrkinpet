package com.purrkinpets.data.repository

import com.purrkinpets.domain.model.CartItem
import com.purrkinpets.domain.model.CartSummary
import com.purrkinpets.util.Resource
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.gotrue.auth
import io.github.jan.supabase.postgrest.from
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.serialization.Serializable
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Repository for shopping cart operations.
 */
@Singleton
class CartRepository @Inject constructor(
    private val supabaseClient: SupabaseClient
) {
    private val freeShippingThreshold = 20.0
    private val deliveryFee = 1.5
    
    /**
     * Get current user's cart items.
     */
    fun getCartItems(): Flow<Resource<CartSummary>> = flow {
        emit(Resource.Loading())
        try {
            val userId = supabaseClient.auth.currentUserOrNull()?.id
                ?: throw Exception("Not authenticated")
            
            // Fetch cart items with product details
            val cartItems = supabaseClient.from("cart_items")
                .select {
                    filter { eq("customer_id", userId) }
                }
                .decodeList<CartItemDto>()
            
            // Fetch products for cart items
            val productIds = cartItems.map { it.productId }
            val products = if (productIds.isNotEmpty()) {
                supabaseClient.from("products")
                    .select {
                        filter { isIn("id", productIds) }
                    }
                    .decodeList<com.purrkinpets.domain.model.Product>()
                    .associateBy { it.id }
            } else {
                emptyMap()
            }
            
            // Combine cart items with products
            val items = cartItems.map { dto ->
                CartItem(
                    id = dto.id,
                    productId = dto.productId,
                    quantity = dto.quantity,
                    product = products[dto.productId]
                )
            }
            
            val subtotal = items.sumOf { it.totalPrice }
            val delivery = if (subtotal >= freeShippingThreshold) 0.0 else deliveryFee
            
            emit(Resource.Success(
                CartSummary(
                    items = items,
                    subtotal = subtotal,
                    deliveryFee = delivery,
                    total = subtotal + delivery,
                    freeShippingThreshold = freeShippingThreshold
                )
            ))
        } catch (e: Exception) {
            emit(Resource.Error(e.message ?: "Failed to fetch cart"))
        }
    }
    
    /**
     * Get cart item count.
     */
    suspend fun getCartCount(): Int {
        return try {
            val userId = supabaseClient.auth.currentUserOrNull()?.id ?: return 0
            val items = supabaseClient.from("cart_items")
                .select { filter { eq("customer_id", userId) } }
                .decodeList<CartItemDto>()
            items.sumOf { it.quantity }
        } catch (e: Exception) {
            0
        }
    }
    
    /**
     * Add product to cart.
     */
    fun addToCart(productId: String, quantity: Int = 1): Flow<Resource<Boolean>> = flow {
        emit(Resource.Loading())
        try {
            val userId = supabaseClient.auth.currentUserOrNull()?.id
                ?: throw Exception("Not authenticated")
            
            // Check if product already in cart
            val existing = supabaseClient.from("cart_items")
                .select {
                    filter {
                        eq("customer_id", userId)
                        eq("product_id", productId)
                    }
                }
                .decodeList<CartItemDto>()
            
            if (existing.isNotEmpty()) {
                // Update quantity
                supabaseClient.from("cart_items")
                    .update({
                        set("quantity", existing.first().quantity + quantity)
                    }) {
                        filter { eq("id", existing.first().id) }
                    }
            } else {
                // Insert new item
                supabaseClient.from("cart_items")
                    .insert(CartItemInsert(
                        customerId = userId,
                        productId = productId,
                        quantity = quantity
                    ))
            }
            
            emit(Resource.Success(true))
        } catch (e: Exception) {
            emit(Resource.Error(e.message ?: "Failed to add to cart"))
        }
    }
    
    /**
     * Update cart item quantity.
     */
    fun updateQuantity(cartItemId: String, quantity: Int): Flow<Resource<Boolean>> = flow {
        emit(Resource.Loading())
        try {
            if (quantity < 1) {
                emit(Resource.Error("Quantity must be at least 1"))
                return@flow
            }
            
            supabaseClient.from("cart_items")
                .update({ set("quantity", quantity) }) {
                    filter { eq("id", cartItemId) }
                }
            
            emit(Resource.Success(true))
        } catch (e: Exception) {
            emit(Resource.Error(e.message ?: "Failed to update quantity"))
        }
    }
    
    /**
     * Remove item from cart.
     */
    fun removeFromCart(cartItemId: String): Flow<Resource<Boolean>> = flow {
        emit(Resource.Loading())
        try {
            supabaseClient.from("cart_items")
                .delete {
                    filter { eq("id", cartItemId) }
                }
            emit(Resource.Success(true))
        } catch (e: Exception) {
            emit(Resource.Error(e.message ?: "Failed to remove from cart"))
        }
    }
    
    /**
     * Clear entire cart.
     */
    fun clearCart(): Flow<Resource<Boolean>> = flow {
        emit(Resource.Loading())
        try {
            val userId = supabaseClient.auth.currentUserOrNull()?.id
                ?: throw Exception("Not authenticated")
            
            supabaseClient.from("cart_items")
                .delete {
                    filter { eq("customer_id", userId) }
                }
            
            emit(Resource.Success(true))
        } catch (e: Exception) {
            emit(Resource.Error(e.message ?: "Failed to clear cart"))
        }
    }
}

@Serializable
private data class CartItemDto(
    val id: String,
    @kotlinx.serialization.SerialName("product_id")
    val productId: String,
    val quantity: Int,
    @kotlinx.serialization.SerialName("customer_id")
    val customerId: String
)

@Serializable
private data class CartItemInsert(
    @kotlinx.serialization.SerialName("customer_id")
    val customerId: String,
    @kotlinx.serialization.SerialName("product_id")
    val productId: String,
    val quantity: Int
)
