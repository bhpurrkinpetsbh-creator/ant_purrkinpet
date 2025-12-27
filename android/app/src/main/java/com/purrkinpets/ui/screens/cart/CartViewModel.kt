package com.purrkinpets.ui.screens.cart

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.purrkinpets.data.repository.CartRepository
import com.purrkinpets.domain.model.CartSummary
import com.purrkinpets.util.Resource
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

/**
 * ViewModel for the Cart screen.
 */
@HiltViewModel
class CartViewModel @Inject constructor(
    private val cartRepository: CartRepository
) : ViewModel() {
    
    private val _cartState = MutableStateFlow<Resource<CartSummary>>(Resource.Loading())
    val cartState: StateFlow<Resource<CartSummary>> = _cartState.asStateFlow()
    
    private val _cartCount = MutableStateFlow(0)
    val cartCount: StateFlow<Int> = _cartCount.asStateFlow()
    
    private val _actionState = MutableStateFlow<Resource<Boolean>?>(null)
    val actionState: StateFlow<Resource<Boolean>?> = _actionState.asStateFlow()
    
    init {
        loadCart()
    }
    
    fun loadCart() {
        viewModelScope.launch {
            cartRepository.getCartItems().collect { result ->
                _cartState.value = result
                if (result is Resource.Success) {
                    _cartCount.value = result.data?.itemCount ?: 0
                }
            }
        }
    }
    
    fun updateQuantity(cartItemId: String, quantity: Int) {
        viewModelScope.launch {
            cartRepository.updateQuantity(cartItemId, quantity).collect { result ->
                if (result is Resource.Success) {
                    loadCart()
                }
                _actionState.value = result
            }
        }
    }
    
    fun removeFromCart(cartItemId: String) {
        viewModelScope.launch {
            cartRepository.removeFromCart(cartItemId).collect { result ->
                if (result is Resource.Success) {
                    loadCart()
                }
                _actionState.value = result
            }
        }
    }
    
    fun clearCart() {
        viewModelScope.launch {
            cartRepository.clearCart().collect { result ->
                if (result is Resource.Success) {
                    loadCart()
                }
                _actionState.value = result
            }
        }
    }
    
    fun clearActionState() {
        _actionState.value = null
    }
}
