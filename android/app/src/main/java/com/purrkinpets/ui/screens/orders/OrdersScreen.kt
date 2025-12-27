package com.purrkinpets.ui.screens.orders

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Receipt
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.purrkinpets.domain.model.Order
import com.purrkinpets.domain.model.OrderStatus
import com.purrkinpets.ui.components.EmptyState
import com.purrkinpets.ui.components.LoadingScreen
import com.purrkinpets.ui.theme.FreeShippingGreen
import com.purrkinpets.ui.theme.PrimaryOrange
import com.purrkinpets.ui.theme.WarningYellow
import com.purrkinpets.util.Resource
import com.purrkinpets.util.toBHD
import java.text.SimpleDateFormat
import java.util.Locale

/**
 * Orders screen showing user's order history.
 */
@Composable
fun OrdersScreen(
    onOrderClick: (String) -> Unit,
    viewModel: OrdersViewModel = hiltViewModel()
) {
    val ordersState by viewModel.orders.collectAsState()
    
    Column(
        modifier = Modifier.fillMaxSize()
    ) {
        Text(
            text = "My Orders",
            style = MaterialTheme.typography.headlineMedium,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(16.dp)
        )
        
        when (val state = ordersState) {
            is Resource.Loading -> {
                LoadingScreen(message = "Loading orders...")
            }
            is Resource.Error -> {
                EmptyState(
                    icon = { Icon(Icons.Filled.Receipt, null, modifier = Modifier.size(64.dp)) },
                    title = "Error loading orders",
                    description = state.message ?: "Please try again"
                )
            }
            is Resource.Success -> {
                val orders = state.data ?: emptyList()
                if (orders.isEmpty()) {
                    EmptyState(
                        icon = { 
                            Icon(
                                Icons.Filled.Receipt, 
                                null, 
                                modifier = Modifier.size(80.dp),
                                tint = MaterialTheme.colorScheme.onSurfaceVariant
                            ) 
                        },
                        title = "No orders yet",
                        description = "Your order history will appear here"
                    )
                } else {
                    LazyColumn(
                        contentPadding = PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        items(orders, key = { it.id }) { order ->
                            OrderCard(
                                order = order,
                                onClick = { onOrderClick(order.id) }
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun OrderCard(
    order: Order,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        onClick = onClick
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Order #${order.orderNumber}",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                OrderStatusBadge(status = order.statusColor)
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = formatDate(order.createdAt),
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "${order.items?.size ?: 0} items",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Text(
                    text = order.total.toBHD(),
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = PrimaryOrange
                )
            }
        }
    }
}

@Composable
private fun OrderStatusBadge(status: OrderStatus) {
    val (color, bgColor) = when (status) {
        OrderStatus.PENDING -> PrimaryOrange to PrimaryOrange.copy(alpha = 0.1f)
        OrderStatus.CONFIRMED, OrderStatus.PROCESSING -> WarningYellow to WarningYellow.copy(alpha = 0.1f)
        OrderStatus.SHIPPED -> MaterialTheme.colorScheme.primary to MaterialTheme.colorScheme.primaryContainer
        OrderStatus.DELIVERED -> FreeShippingGreen to FreeShippingGreen.copy(alpha = 0.1f)
        OrderStatus.CANCELLED -> MaterialTheme.colorScheme.error to MaterialTheme.colorScheme.errorContainer
    }
    
    Surface(
        shape = RoundedCornerShape(16.dp),
        color = bgColor
    ) {
        Text(
            text = status.displayName,
            style = MaterialTheme.typography.labelMedium,
            color = color,
            fontWeight = FontWeight.SemiBold,
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp)
        )
    }
}

private fun formatDate(dateString: String): String {
    return try {
        val inputFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault())
        val outputFormat = SimpleDateFormat("MMM dd, yyyy • hh:mm a", Locale.getDefault())
        val date = inputFormat.parse(dateString)
        date?.let { outputFormat.format(it) } ?: dateString
    } catch (e: Exception) {
        dateString
    }
}
