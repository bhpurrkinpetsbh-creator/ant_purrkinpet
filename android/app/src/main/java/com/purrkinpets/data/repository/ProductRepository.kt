package com.purrkinpets.data.repository

import com.purrkinpets.domain.model.Category
import com.purrkinpets.domain.model.Product
import com.purrkinpets.util.Resource
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.query.Order
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Repository for product-related data operations.
 */
@Singleton
class ProductRepository @Inject constructor(
    private val supabaseClient: SupabaseClient
) {
    /**
     * Fetch all active products.
     */
    fun getProducts(): Flow<Resource<List<Product>>> = flow {
        emit(Resource.Loading())
        try {
            val products = supabaseClient.from("products")
                .select {
                    filter { eq("is_active", true) }
                    order("created_at", Order.DESCENDING)
                }
                .decodeList<Product>()
            emit(Resource.Success(products))
        } catch (e: Exception) {
            emit(Resource.Error(e.message ?: "Failed to fetch products"))
        }
    }
    
    /**
     * Fetch featured products.
     */
    fun getFeaturedProducts(): Flow<Resource<List<Product>>> = flow {
        emit(Resource.Loading())
        try {
            val products = supabaseClient.from("products")
                .select {
                    filter {
                        eq("is_active", true)
                        eq("is_featured", true)
                    }
                    limit(10)
                }
                .decodeList<Product>()
            emit(Resource.Success(products))
        } catch (e: Exception) {
            emit(Resource.Error(e.message ?: "Failed to fetch featured products"))
        }
    }
    
    /**
     * Fetch products on offer.
     */
    fun getOfferProducts(): Flow<Resource<List<Product>>> = flow {
        emit(Resource.Loading())
        try {
            val products = supabaseClient.from("products")
                .select {
                    filter {
                        eq("is_active", true)
                        eq("is_on_offer", true)
                    }
                    limit(10)
                }
                .decodeList<Product>()
            emit(Resource.Success(products))
        } catch (e: Exception) {
            emit(Resource.Error(e.message ?: "Failed to fetch offer products"))
        }
    }
    
    /**
     * Fetch products by category.
     */
    fun getProductsByCategory(categoryId: String): Flow<Resource<List<Product>>> = flow {
        emit(Resource.Loading())
        try {
            val products = supabaseClient.from("products")
                .select {
                    filter {
                        eq("is_active", true)
                        eq("category_id", categoryId)
                    }
                }
                .decodeList<Product>()
            emit(Resource.Success(products))
        } catch (e: Exception) {
            emit(Resource.Error(e.message ?: "Failed to fetch products"))
        }
    }
    
    /**
     * Search products by name.
     */
    fun searchProducts(query: String): Flow<Resource<List<Product>>> = flow {
        emit(Resource.Loading())
        try {
            val products = supabaseClient.from("products")
                .select {
                    filter {
                        eq("is_active", true)
                        ilike("name", "%$query%")
                    }
                    limit(50)
                }
                .decodeList<Product>()
            emit(Resource.Success(products))
        } catch (e: Exception) {
            emit(Resource.Error(e.message ?: "Search failed"))
        }
    }
    
    /**
     * Get product by ID.
     */
    fun getProductById(id: String): Flow<Resource<Product>> = flow {
        emit(Resource.Loading())
        try {
            val product = supabaseClient.from("products")
                .select {
                    filter { eq("id", id) }
                }
                .decodeSingle<Product>()
            emit(Resource.Success(product))
        } catch (e: Exception) {
            emit(Resource.Error(e.message ?: "Failed to fetch product"))
        }
    }
    
    /**
     * Fetch all active categories.
     */
    fun getCategories(): Flow<Resource<List<Category>>> = flow {
        emit(Resource.Loading())
        try {
            val categories = supabaseClient.from("categories")
                .select {
                    filter { eq("is_active", true) }
                    order("display_order", Order.ASCENDING)
                }
                .decodeList<Category>()
            emit(Resource.Success(categories))
        } catch (e: Exception) {
            emit(Resource.Error(e.message ?: "Failed to fetch categories"))
        }
    }
}
