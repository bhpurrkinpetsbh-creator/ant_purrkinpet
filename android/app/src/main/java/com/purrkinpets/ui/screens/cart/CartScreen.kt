package com.purrkinpets.ui.screens.cart

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material.icons.filled.ShoppingBag
import androidx.compose.material.icons.outlined.LocalShipping
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import coil.compose.AsyncImage
import com.purrkinpets.domain.model.CartItem
import com.purrkinpets.domain.model.CartSummary
import com.purrkinpets.ui.components.EmptyState
import com.purrkinpets.ui.components.LoadingScreen
import com.purrkinpets.ui.theme.FreeShippingGreen
import com.purrkinpets.ui.theme.PrimaryOrange
import com.purrkinpets.util.Resource
import com.purrkinpets.util.toBHD

/**
 * Shopping cart screen.
 */
@Composable
fun CartScreen(
    onCheckoutClick: () -> Unit,
    onContinueShoppingClick: () -> Unit,
    viewModel: CartViewModel = hiltViewModel()
) {
    val cartState by viewModel.cartState.collectAsState()
    
    when (val state = cartState) {
        is Resource.Loading -> {
            LoadingScreen(message = "Loading cart...")
        }
        is Resource.Error -> {
            EmptyState(
                icon = { Icon(Icons.Filled.ShoppingBag, null, modifier = Modifier.size(64.dp)) },
                title = "Something went wrong",
                description = state.message ?: "Failed to load cart",
                action = {
                    Button(onClick = { viewModel.loadCart() }) {
                        Text("Try Again")
                    }
                }
            )
        }
        is Resource.Success -> {
            val cart = state.data
            if (cart == null || cart.items.isEmpty()) {
                EmptyState(
                    icon = { 
                        Icon(
                            Icons.Filled.ShoppingBag, 
                            null, 
                            modifier = Modifier.size(80.dp),
                            tint = MaterialTheme.colorScheme.onSurfaceVariant
                        ) 
                    },
                    title = "Your cart is empty",
                    description = "Add some products to get started",
                    action = {
                        Button(onClick = onContinueShoppingClick) {
                            Text("Continue Shopping")
                        }
                    }
                )
            } else {
                CartContent(
                    cart = cart,
                    onQuantityChange = { id, qty -> viewModel.updateQuantity(id, qty) },
                    onRemoveItem = { viewModel.removeFromCart(it) },
                    onClearCart = { viewModel.clearCart() },
                    onCheckoutClick = onCheckoutClick,
                    onContinueShoppingClick = onContinueShoppingClick
                )
            }
        }
    }
}

@Composable
private fun CartContent(
    cart: CartSummary,
    onQuantityChange: (String, Int) -> Unit,
    onRemoveItem: (String) -> Unit,
    onClearCart: () -> Unit,
    onCheckoutClick: () -> Unit,
    onContinueShoppingClick: () -> Unit
) {
    Column(
        modifier = Modifier.fillMaxSize()
    ) {
        LazyColumn(
            modifier = Modifier.weight(1f),
            contentPadding = androidx.compose.foundation.layout.PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Header
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Shopping Cart (${cart.itemCount} items)",
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold
                    )
                    TextButton(onClick = onClearCart) {
                        Icon(Icons.Default.Delete, null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Clear Cart")
                    }
                }
            }
            
            // Free Shipping Progress
            item {
                FreeShippingBanner(cart = cart)
            }
            
            // Cart Items
            items(cart.items, key = { it.id }) { item ->
                CartItemCard(
                    item = item,
                    onQuantityChange = { onQuantityChange(item.id, it) },
                    onRemove = { onRemoveItem(item.id) }
                )
            }
        }
        
        // Order Summary
        OrderSummaryCard(
            cart = cart,
            onCheckoutClick = onCheckoutClick
        )
    }
}

@Composable
private fun FreeShippingBanner(cart: CartSummary) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = if (cart.hasFreeShipping) 
                FreeShippingGreen.copy(alpha = 0.1f) 
            else PrimaryOrange.copy(alpha = 0.1f)
        )
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    Icons.Outlined.LocalShipping,
                    contentDescription = null,
                    tint = if (cart.hasFreeShipping) FreeShippingGreen else PrimaryOrange
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = if (cart.hasFreeShipping) 
                        "🎉 You've unlocked Free Shipping!" 
                    else "Add ${cart.remainingForFreeShipping.toBHD()} more for Free Shipping",
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.Medium,
                    color = if (cart.hasFreeShipping) FreeShippingGreen else PrimaryOrange
                )
            }
            Spacer(modifier = Modifier.height(8.dp))
            LinearProgressIndicator(
                progress = { cart.shippingProgress },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(8.dp)
                    .clip(RoundedCornerShape(4.dp)),
                color = if (cart.hasFreeShipping) FreeShippingGreen else PrimaryOrange,
                trackColor = MaterialTheme.colorScheme.surfaceVariant
            )
        }
    }
}

@Composable
private fun CartItemCard(
    item: CartItem,
    onQuantityChange: (Int) -> Unit,
    onRemove: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp)
        ) {
            AsyncImage(
                model = item.product?.imageUrl,
                contentDescription = item.product?.name,
                modifier = Modifier
                    .size(80.dp)
                    .clip(RoundedCornerShape(8.dp)),
                contentScale = ContentScale.Crop
            )
            
            Spacer(modifier = Modifier.width(12.dp))
            
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = item.product?.name ?: "",
                    style = MaterialTheme.typography.bodyLarge,
                    fontWeight = FontWeight.Medium
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = (item.product?.displayPrice ?: 0.0).toBHD(),
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = PrimaryOrange
                )
                
                Spacer(modifier = Modifier.height(8.dp))
                
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Quantity controls
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = MaterialTheme.colorScheme.surfaceVariant
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            IconButton(
                                onClick = { if (item.quantity > 1) onQuantityChange(item.quantity - 1) },
                                modifier = Modifier.size(32.dp)
                            ) {
                                Icon(Icons.Default.Remove, null, modifier = Modifier.size(16.dp))
                            }
                            Text(
                                text = item.quantity.toString(),
                                style = MaterialTheme.typography.bodyLarge,
                                fontWeight = FontWeight.SemiBold,
                                modifier = Modifier.padding(horizontal = 8.dp)
                            )
                            IconButton(
                                onClick = { onQuantityChange(item.quantity + 1) },
                                modifier = Modifier.size(32.dp)
                            ) {
                                Icon(Icons.Default.Add, null, modifier = Modifier.size(16.dp))
                            }
                        }
                    }
                    
                    Spacer(modifier = Modifier.weight(1f))
                    
                    IconButton(onClick = onRemove) {
                        Icon(
                            Icons.Default.Delete,
                            contentDescription = "Remove",
                            tint = MaterialTheme.colorScheme.error
                        )
                    }
                }
            }
            
            // Item total
            Text(
                text = item.totalPrice.toBHD(),
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )
        }
    }
}

@Composable
private fun OrderSummaryCard(
    cart: CartSummary,
    onCheckoutClick: () -> Unit
) {
    val isMinimumMet = cart.subtotal >= 7.0
    
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shadowElevation = 16.dp
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Text(
                text = "Order Summary",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )
            
            Spacer(modifier = Modifier.height(12.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text("Subtotal", color = MaterialTheme.colorScheme.onSurfaceVariant)
                Text(cart.subtotal.toBHD(), fontWeight = FontWeight.Medium)
            }
            
            Spacer(modifier = Modifier.height(4.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text("Delivery", color = MaterialTheme.colorScheme.onSurfaceVariant)
                if (cart.hasFreeShipping) {
                    Text("Free", color = FreeShippingGreen, fontWeight = FontWeight.Medium)
                } else {
                    Text(cart.deliveryFee.toBHD(), fontWeight = FontWeight.Medium)
                }
            }
            
            HorizontalDivider(modifier = Modifier.padding(vertical = 12.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text("Total", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                Text(
                    cart.total.toBHD(), 
                    style = MaterialTheme.typography.titleMedium, 
                    fontWeight = FontWeight.Bold,
                    color = PrimaryOrange
                )
            }
            
            if (!isMinimumMet) {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Minimum order amount is BD 7.000",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.error
                )
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            Button(
                onClick = onCheckoutClick,
                enabled = isMinimumMet,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                shape = RoundedCornerShape(28.dp)
            ) {
                Text(
                    text = "Proceed to Checkout",
                    style = MaterialTheme.typography.titleMedium
                )
            }
        }
    }
}
