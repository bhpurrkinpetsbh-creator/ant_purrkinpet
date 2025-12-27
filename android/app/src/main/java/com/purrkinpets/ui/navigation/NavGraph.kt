package com.purrkinpets.ui.navigation

import androidx.compose.animation.AnimatedContentTransitionScope
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.navArgument
import com.purrkinpets.ui.components.PurrkinBottomNavBar
import com.purrkinpets.ui.screens.auth.AuthScreen
import com.purrkinpets.ui.screens.auth.AuthViewModel
import com.purrkinpets.ui.screens.cart.CartScreen
import com.purrkinpets.ui.screens.checkout.CheckoutScreen
import com.purrkinpets.ui.screens.home.HomeScreen
import com.purrkinpets.ui.screens.orders.OrdersScreen
import com.purrkinpets.ui.screens.profile.ProfileScreen
import com.purrkinpets.ui.screens.shop.ProductDetailScreen
import com.purrkinpets.ui.screens.shop.ShopScreen
import com.purrkinpets.ui.screens.wishlist.WishlistScreen

/**
 * Main navigation graph for the app.
 * 
 * App is accessible without sign-in. Auth is only required for:
 * - Adding items to cart
 * - Viewing cart, checkout, orders
 * - Accessing profile
 */
@Composable
fun PurrkinNavGraph(
    navController: NavHostController,
    authViewModel: AuthViewModel = hiltViewModel()
) {
    val isAuthenticated by authViewModel.isAuthenticated.collectAsState()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route
    
    // Screens that show bottom navigation (always show for browsing)
    val bottomNavScreens = listOf(
        Screen.Home.route,
        Screen.Shop.route,
        Screen.Cart.route,
        Screen.Orders.route,
        Screen.Profile.route
    )
    
    // Show bottom nav on main screens (authenticated or not)
    val showBottomNav = currentRoute in bottomNavScreens || 
                        currentRoute?.startsWith(Screen.Shop.route) == true
    
    Scaffold(
        bottomBar = {
            if (showBottomNav) {
                PurrkinBottomNavBar(
                    navController = navController,
                    currentRoute = currentRoute,
                    isAuthenticated = isAuthenticated,
                    onAuthRequired = {
                        navController.navigate(Screen.Auth.route)
                    }
                )
            }
        }
    ) { paddingValues ->
        NavHost(
            navController = navController,
            startDestination = Screen.Home.route, // Always start at Home
            modifier = Modifier.padding(paddingValues),
            enterTransition = {
                fadeIn(animationSpec = tween(300)) + slideIntoContainer(
                    towards = AnimatedContentTransitionScope.SlideDirection.Start,
                    animationSpec = tween(300)
                )
            },
            exitTransition = {
                fadeOut(animationSpec = tween(300)) + slideOutOfContainer(
                    towards = AnimatedContentTransitionScope.SlideDirection.Start,
                    animationSpec = tween(300)
                )
            },
            popEnterTransition = {
                fadeIn(animationSpec = tween(300)) + slideIntoContainer(
                    towards = AnimatedContentTransitionScope.SlideDirection.End,
                    animationSpec = tween(300)
                )
            },
            popExitTransition = {
                fadeOut(animationSpec = tween(300)) + slideOutOfContainer(
                    towards = AnimatedContentTransitionScope.SlideDirection.End,
                    animationSpec = tween(300)
                )
            }
        ) {
            // Auth Screen
            composable(Screen.Auth.route) {
                AuthScreen(
                    onAuthSuccess = {
                        navController.popBackStack()
                    },
                    onSkip = {
                        navController.popBackStack()
                    }
                )
            }
            
            // Home Screen - Always accessible
            composable(Screen.Home.route) {
                HomeScreen(
                    onProductClick = { productId ->
                        navController.navigate(Screen.ProductDetail.createRoute(productId))
                    },
                    onCategoryClick = { categorySlug ->
                        navController.navigate("${Screen.Shop.route}?category=$categorySlug")
                    },
                    onViewAllClick = {
                        navController.navigate(Screen.Shop.route)
                    },
                    onAuthRequired = {
                        navController.navigate(Screen.Auth.route)
                    },
                    isAuthenticated = isAuthenticated
                )
            }
            
            // Shop Screen - Always accessible
            composable(
                route = "${Screen.Shop.route}?category={category}",
                arguments = listOf(
                    navArgument("category") {
                        type = NavType.StringType
                        nullable = true
                        defaultValue = null
                    }
                )
            ) { backStackEntry ->
                val category = backStackEntry.arguments?.getString("category")
                ShopScreen(
                    initialCategory = category,
                    onProductClick = { productId ->
                        navController.navigate(Screen.ProductDetail.createRoute(productId))
                    },
                    onBackClick = { navController.popBackStack() },
                    onAuthRequired = {
                        navController.navigate(Screen.Auth.route)
                    },
                    isAuthenticated = isAuthenticated
                )
            }
            
            // Product Detail Screen - Always accessible
            composable(
                route = Screen.ProductDetail.route,
                arguments = listOf(
                    navArgument("productId") { type = NavType.StringType }
                )
            ) { backStackEntry ->
                val productId = backStackEntry.arguments?.getString("productId") ?: ""
                ProductDetailScreen(
                    productId = productId,
                    onBackClick = { navController.popBackStack() },
                    onCartClick = { 
                        if (isAuthenticated) {
                            navController.navigate(Screen.Cart.route)
                        } else {
                            navController.navigate(Screen.Auth.route)
                        }
                    },
                    onAuthRequired = {
                        navController.navigate(Screen.Auth.route)
                    },
                    isAuthenticated = isAuthenticated
                )
            }
            
            // Cart Screen - Requires auth
            composable(Screen.Cart.route) {
                if (isAuthenticated) {
                    CartScreen(
                        onCheckoutClick = { navController.navigate(Screen.Checkout.route) },
                        onContinueShoppingClick = { navController.navigate(Screen.Shop.route) }
                    )
                } else {
                    // Redirect to auth
                    AuthScreen(
                        onAuthSuccess = {
                            // Stay on cart after auth
                        },
                        onSkip = {
                            navController.navigate(Screen.Home.route) {
                                popUpTo(Screen.Home.route) { inclusive = true }
                            }
                        }
                    )
                }
            }
            
            // Checkout Screen - Requires auth
            composable(Screen.Checkout.route) {
                if (isAuthenticated) {
                    CheckoutScreen(
                        onBackClick = { navController.popBackStack() },
                        onOrderSuccess = { orderId ->
                            navController.navigate(Screen.Orders.route) {
                                popUpTo(Screen.Home.route)
                            }
                        }
                    )
                } else {
                    navController.navigate(Screen.Auth.route)
                }
            }
            
            // Orders Screen - Requires auth
            composable(Screen.Orders.route) {
                if (isAuthenticated) {
                    OrdersScreen(
                        onOrderClick = { orderId ->
                            navController.navigate(Screen.OrderDetail.createRoute(orderId))
                        }
                    )
                } else {
                    AuthScreen(
                        onAuthSuccess = { },
                        onSkip = {
                            navController.navigate(Screen.Home.route) {
                                popUpTo(Screen.Home.route) { inclusive = true }
                            }
                        }
                    )
                }
            }
            
            // Profile Screen - Requires auth
            composable(Screen.Profile.route) {
                if (isAuthenticated) {
                    ProfileScreen(
                        onWishlistClick = { navController.navigate(Screen.Wishlist.route) },
                        onAddressesClick = { navController.navigate(Screen.Addresses.route) },
                        onAboutClick = { navController.navigate(Screen.About.route) },
                        onDeliveryInfoClick = { navController.navigate(Screen.DeliveryInfo.route) },
                        onLogout = {
                            authViewModel.signOut()
                            navController.navigate(Screen.Home.route) {
                                popUpTo(0) { inclusive = true }
                            }
                        }
                    )
                } else {
                    AuthScreen(
                        onAuthSuccess = { },
                        onSkip = {
                            navController.navigate(Screen.Home.route) {
                                popUpTo(Screen.Home.route) { inclusive = true }
                            }
                        }
                    )
                }
            }
            
            // Wishlist Screen
            composable(Screen.Wishlist.route) {
                WishlistScreen(
                    onProductClick = { productId ->
                        navController.navigate(Screen.ProductDetail.createRoute(productId))
                    },
                    onBackClick = { navController.popBackStack() }
                )
            }
        }
    }
}
