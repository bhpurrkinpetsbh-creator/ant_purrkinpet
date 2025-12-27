package com.purrkinpets.ui.components

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Receipt
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material.icons.outlined.Receipt
import androidx.compose.material.icons.outlined.Search
import androidx.compose.material.icons.outlined.ShoppingCart
import androidx.compose.material3.Badge
import androidx.compose.material3.BadgedBox
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavHostController
import com.purrkinpets.ui.navigation.BottomNavItem
import com.purrkinpets.ui.navigation.Screen
import com.purrkinpets.ui.screens.cart.CartViewModel

/**
 * Bottom navigation bar for main app screens.
 * Supports both authenticated and unauthenticated users.
 */
@Composable
fun PurrkinBottomNavBar(
    navController: NavHostController,
    currentRoute: String?,
    isAuthenticated: Boolean = true,
    onAuthRequired: () -> Unit = {},
    cartViewModel: CartViewModel = hiltViewModel()
) {
    val cartCount by cartViewModel.cartCount.collectAsState()
    
    // Screens that require authentication
    val authRequiredScreens = listOf(
        Screen.Cart.route,
        Screen.Orders.route,
        Screen.Profile.route
    )
    
    NavigationBar(
        containerColor = MaterialTheme.colorScheme.surface,
        contentColor = MaterialTheme.colorScheme.onSurface
    ) {
        BottomNavItem.entries.forEach { item ->
            val isSelected = currentRoute == item.screen.route ||
                (item.screen == Screen.Shop && currentRoute?.startsWith(Screen.Shop.route) == true)
            
            NavigationBarItem(
                selected = isSelected,
                onClick = {
                    if (currentRoute != item.screen.route) {
                        // Check if this screen requires auth
                        if (item.screen.route in authRequiredScreens && !isAuthenticated) {
                            onAuthRequired()
                        } else {
                            navController.navigate(item.screen.route) {
                                popUpTo(Screen.Home.route) {
                                    saveState = true
                                }
                                launchSingleTop = true
                                restoreState = true
                            }
                        }
                    }
                },
                icon = {
                    val icon = getNavIcon(item, isSelected)
                    
                    if (item == BottomNavItem.CART && cartCount > 0 && isAuthenticated) {
                        BadgedBox(
                            badge = {
                                Badge(
                                    containerColor = MaterialTheme.colorScheme.primary,
                                    contentColor = MaterialTheme.colorScheme.onPrimary
                                ) {
                                    Text(
                                        text = if (cartCount > 99) "99+" else cartCount.toString(),
                                        style = MaterialTheme.typography.labelSmall
                                    )
                                }
                            }
                        ) {
                            Icon(imageVector = icon, contentDescription = item.label)
                        }
                    } else {
                        Icon(imageVector = icon, contentDescription = item.label)
                    }
                },
                label = {
                    Text(
                        text = item.label,
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = if (isSelected) FontWeight.SemiBold else FontWeight.Normal
                    )
                },
                colors = NavigationBarItemDefaults.colors(
                    selectedIconColor = MaterialTheme.colorScheme.primary,
                    selectedTextColor = MaterialTheme.colorScheme.primary,
                    unselectedIconColor = MaterialTheme.colorScheme.onSurfaceVariant,
                    unselectedTextColor = MaterialTheme.colorScheme.onSurfaceVariant,
                    indicatorColor = MaterialTheme.colorScheme.primaryContainer
                )
            )
        }
    }
}

@Composable
private fun getNavIcon(item: BottomNavItem, isSelected: Boolean): ImageVector {
    return when (item) {
        BottomNavItem.HOME -> if (isSelected) Icons.Filled.Home else Icons.Outlined.Home
        BottomNavItem.SHOP -> if (isSelected) Icons.Filled.Search else Icons.Outlined.Search
        BottomNavItem.CART -> if (isSelected) Icons.Filled.ShoppingCart else Icons.Outlined.ShoppingCart
        BottomNavItem.ORDERS -> if (isSelected) Icons.Filled.Receipt else Icons.Outlined.Receipt
        BottomNavItem.PROFILE -> if (isSelected) Icons.Filled.Person else Icons.Outlined.Person
    }
}
