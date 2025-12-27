package com.purrkinpets.ui.screens.orders

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.purrkinpets.domain.model.Order
import com.purrkinpets.util.Resource
import dagger.hilt.android.lifecycle.HiltViewModel
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.gotrue.auth
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.query.Order as QueryOrder
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class OrdersViewModel @Inject constructor(
    private val supabaseClient: SupabaseClient
) : ViewModel() {
    
    private val _orders = MutableStateFlow<Resource<List<Order>>>(Resource.Loading())
    val orders: StateFlow<Resource<List<Order>>> = _orders.asStateFlow()
    
    init {
        loadOrders()
    }
    
    fun loadOrders() {
        viewModelScope.launch {
            _orders.value = Resource.Loading()
            try {
                val userId = supabaseClient.auth.currentUserOrNull()?.id
                    ?: throw Exception("Not authenticated")
                
                val ordersList = supabaseClient.from("orders")
                    .select {
                        filter { eq("customer_id", userId) }
                        order("created_at", QueryOrder.DESCENDING)
                    }
                    .decodeList<Order>()
                
                _orders.value = Resource.Success(ordersList)
            } catch (e: Exception) {
                _orders.value = Resource.Error(e.message ?: "Failed to load orders")
            }
        }
    }
}
