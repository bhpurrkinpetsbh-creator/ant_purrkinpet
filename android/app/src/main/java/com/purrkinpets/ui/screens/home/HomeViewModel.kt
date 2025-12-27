package com.purrkinpets.ui.screens.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.purrkinpets.data.repository.CartRepository
import com.purrkinpets.data.repository.ProductRepository
import com.purrkinpets.domain.model.Category
import com.purrkinpets.domain.model.Product
import com.purrkinpets.util.Resource
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

/**
 * ViewModel for the Home screen.
 */
@HiltViewModel
class HomeViewModel @Inject constructor(
    private val productRepository: ProductRepository,
    private val cartRepository: CartRepository
) : ViewModel() {
    
    private val _featuredProducts = MutableStateFlow<Resource<List<Product>>>(Resource.Loading())
    val featuredProducts: StateFlow<Resource<List<Product>>> = _featuredProducts.asStateFlow()
    
    private val _offerProducts = MutableStateFlow<Resource<List<Product>>>(Resource.Loading())
    val offerProducts: StateFlow<Resource<List<Product>>> = _offerProducts.asStateFlow()
    
    private val _categories = MutableStateFlow<Resource<List<Category>>>(Resource.Loading())
    val categories: StateFlow<Resource<List<Category>>> = _categories.asStateFlow()
    
    private val _addToCartState = MutableStateFlow<Resource<Boolean>?>(null)
    val addToCartState: StateFlow<Resource<Boolean>?> = _addToCartState.asStateFlow()
    
    init {
        loadHomeData()
    }
    
    fun loadHomeData() {
        loadFeaturedProducts()
        loadOfferProducts()
        loadCategories()
    }
    
    private fun loadFeaturedProducts() {
        viewModelScope.launch {
            productRepository.getFeaturedProducts().collect { result ->
                _featuredProducts.value = result
            }
        }
    }
    
    private fun loadOfferProducts() {
        viewModelScope.launch {
            productRepository.getOfferProducts().collect { result ->
                _offerProducts.value = result
            }
        }
    }
    
    private fun loadCategories() {
        viewModelScope.launch {
            productRepository.getCategories().collect { result ->
                _categories.value = result
            }
        }
    }
    
    fun addToCart(productId: String) {
        viewModelScope.launch {
            cartRepository.addToCart(productId).collect { result ->
                _addToCartState.value = result
            }
        }
    }
    
    fun clearAddToCartState() {
        _addToCartState.value = null
    }
}
