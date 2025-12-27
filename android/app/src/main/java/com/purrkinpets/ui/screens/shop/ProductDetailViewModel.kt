package com.purrkinpets.ui.screens.shop

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.purrkinpets.data.repository.CartRepository
import com.purrkinpets.data.repository.ProductRepository
import com.purrkinpets.domain.model.Product
import com.purrkinpets.util.Resource
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ProductDetailViewModel @Inject constructor(
    private val productRepository: ProductRepository,
    private val cartRepository: CartRepository,
    savedStateHandle: SavedStateHandle
) : ViewModel() {
    
    private val productId: String = savedStateHandle.get<String>("productId") ?: ""
    
    private val _product = MutableStateFlow<Resource<Product>>(Resource.Loading())
    val product: StateFlow<Resource<Product>> = _product.asStateFlow()
    
    private val _addToCartState = MutableStateFlow<Resource<Boolean>?>(null)
    val addToCartState: StateFlow<Resource<Boolean>?> = _addToCartState.asStateFlow()
    
    init {
        loadProduct()
    }
    
    private fun loadProduct() {
        viewModelScope.launch {
            productRepository.getProductById(productId).collect { result ->
                _product.value = result
            }
        }
    }
    
    fun addToCart(productId: String, quantity: Int) {
        viewModelScope.launch {
            cartRepository.addToCart(productId, quantity).collect { result ->
                _addToCartState.value = result
            }
        }
    }
}
