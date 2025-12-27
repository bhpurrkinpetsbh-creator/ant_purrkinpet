package com.purrkinpets.ui.screens.shop

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

@HiltViewModel
class ShopViewModel @Inject constructor(
    private val productRepository: ProductRepository,
    private val cartRepository: CartRepository
) : ViewModel() {
    
    private val _products = MutableStateFlow<Resource<List<Product>>>(Resource.Loading())
    val products: StateFlow<Resource<List<Product>>> = _products.asStateFlow()
    
    private val _categories = MutableStateFlow<Resource<List<Category>>>(Resource.Loading())
    val categories: StateFlow<Resource<List<Category>>> = _categories.asStateFlow()
    
    private val _selectedCategory = MutableStateFlow<String?>(null)
    val selectedCategory: StateFlow<String?> = _selectedCategory.asStateFlow()
    
    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()
    
    init {
        loadCategories()
        loadProducts()
    }
    
    fun loadProducts() {
        viewModelScope.launch {
            productRepository.getProducts().collect { result ->
                _products.value = result
            }
        }
    }
    
    fun loadCategories() {
        viewModelScope.launch {
            productRepository.getCategories().collect { result ->
                _categories.value = result
            }
        }
    }
    
    fun setCategory(categorySlug: String?) {
        _selectedCategory.value = categorySlug
    }
    
    fun search(query: String) {
        _searchQuery.value = query
        if (query.isBlank()) {
            loadProducts()
        } else {
            viewModelScope.launch {
                productRepository.searchProducts(query).collect { result ->
                    _products.value = result
                }
            }
        }
    }
    
    fun addToCart(productId: String) {
        viewModelScope.launch {
            cartRepository.addToCart(productId).collect {}
        }
    }
}
