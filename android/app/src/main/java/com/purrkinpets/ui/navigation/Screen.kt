package com.purrkinpets.ui.navigation

/**
 * Sealed class representing all navigation destinations in the app.
 */
sealed class Screen(val route: String) {
    // Auth
    object Auth : Screen("auth")
    
    // Main bottom nav destinations
    object Home : Screen("home")
    object Shop : Screen("shop")
    object Cart : Screen("cart")
    object Orders : Screen("orders")
    object Profile : Screen("profile")
    
    // Secondary screens
    object ProductDetail : Screen("product/{productId}") {
        fun createRoute(productId: String) = "product/$productId"
    }
    
    object Checkout : Screen("checkout")
    object Wishlist : Screen("wishlist")
    object OrderDetail : Screen("order/{orderId}") {
        fun createRoute(orderId: String) = "order/$orderId"
    }
    
    object Addresses : Screen("addresses")
    object About : Screen("about")
    object DeliveryInfo : Screen("delivery-info")
}

/**
 * Bottom navigation items.
 */
enum class BottomNavItem(
    val screen: Screen,
    val label: String,
    val iconName: String
) {
    HOME(Screen.Home, "Home", "home"),
    SHOP(Screen.Shop, "Shop", "search"),
    CART(Screen.Cart, "Cart", "shopping_cart"),
    ORDERS(Screen.Orders, "Orders", "receipt"),
    PROFILE(Screen.Profile, "Account", "person")
}
