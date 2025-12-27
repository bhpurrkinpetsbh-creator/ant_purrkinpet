package com.purrkinpets.ui.screens.home

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.LocalShipping
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import coil.compose.AsyncImage
import com.google.accompanist.pager.ExperimentalPagerApi
import com.google.accompanist.pager.HorizontalPager
import com.google.accompanist.pager.HorizontalPagerIndicator
import com.google.accompanist.pager.rememberPagerState
import com.purrkinpets.domain.model.Category
import com.purrkinpets.domain.model.Product
import com.purrkinpets.ui.components.ProductCard
import com.purrkinpets.ui.components.SearchBar
import com.purrkinpets.ui.theme.GradientBirds
import com.purrkinpets.ui.theme.GradientCats
import com.purrkinpets.ui.theme.GradientDogs
import com.purrkinpets.ui.theme.GradientFish
import com.purrkinpets.ui.theme.GradientRabbits
import com.purrkinpets.ui.theme.GradientSmallPets
import com.purrkinpets.ui.theme.GradientTurtles
import com.purrkinpets.ui.theme.PrimaryOrange
import com.purrkinpets.ui.theme.PrimaryOrangeGradientEnd
import com.purrkinpets.ui.theme.SecondaryGreen
import com.purrkinpets.ui.theme.SecondaryTeal
import com.purrkinpets.util.Resource
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

/**
 * Home screen matching website design.
 * Features: Welcome badge, hero carousel, Shop by Pet with images, products, features.
 */
@OptIn(ExperimentalPagerApi::class)
@Composable
fun HomeScreen(
    onProductClick: (String) -> Unit,
    onCategoryClick: (String) -> Unit,
    onViewAllClick: () -> Unit,
    onAuthRequired: () -> Unit = {},
    isAuthenticated: Boolean = true,
    viewModel: HomeViewModel = hiltViewModel()
) {
    val featuredProducts by viewModel.featuredProducts.collectAsState()
    val offerProducts by viewModel.offerProducts.collectAsState()
    val categories by viewModel.categories.collectAsState()
    val addToCartState by viewModel.addToCartState.collectAsState()
    
    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()
    
    // Handle add to cart feedback
    LaunchedEffect(addToCartState) {
        when (addToCartState) {
            is Resource.Success -> {
                scope.launch {
                    snackbarHostState.showSnackbar("Added to cart!")
                }
                viewModel.clearAddToCartState()
            }
            is Resource.Error -> {
                scope.launch {
                    snackbarHostState.showSnackbar((addToCartState as Resource.Error).message ?: "Error")
                }
                viewModel.clearAddToCartState()
            }
            else -> {}
        }
    }
    
    Box(modifier = Modifier.fillMaxSize()) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
        ) {
            // Welcome Header with Animated Badge
            WelcomeHeader(onViewAllClick = onViewAllClick)
            
            Spacer(modifier = Modifier.height(20.dp))
            
            // Hero Carousel
            HeroCarousel()
            
            Spacer(modifier = Modifier.height(32.dp))
            
            // Shop by Pet section - With real pet images
            ShopByPetSection(onCategoryClick = onCategoryClick)
            
            Spacer(modifier = Modifier.height(32.dp))
            
            // Featured Favourites
            SectionHeader(
                title = "Featured Favourites",
                onViewAllClick = onViewAllClick
            )
            
            when (val result = featuredProducts) {
                is Resource.Loading -> {
                    ProductRowPlaceholder()
                }
                is Resource.Success -> {
                    ProductRow(
                        products = result.data ?: emptyList(),
                        onProductClick = onProductClick,
                        onAddToCartClick = { 
                            if (isAuthenticated) viewModel.addToCart(it) else onAuthRequired()
                        }
                    )
                }
                is Resource.Error -> {
                    Text(
                        text = "Failed to load products",
                        modifier = Modifier.padding(16.dp)
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(32.dp))
            
            // Paw-some Deals
            SectionHeader(
                title = "🎉 Paw-some Deals",
                onViewAllClick = onViewAllClick
            )
            
            when (val result = offerProducts) {
                is Resource.Loading -> {
                    ProductRowPlaceholder()
                }
                is Resource.Success -> {
                    ProductRow(
                        products = result.data ?: emptyList(),
                        onProductClick = onProductClick,
                        onAddToCartClick = { 
                            if (isAuthenticated) viewModel.addToCart(it) else onAuthRequired()
                        }
                    )
                }
                is Resource.Error -> {
                    Text(
                        text = "Failed to load deals",
                        modifier = Modifier.padding(16.dp)
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(32.dp))
            
            // Features Section (matching website)
            FeaturesSection()
            
            Spacer(modifier = Modifier.height(100.dp))
        }
        
        SnackbarHost(
            hostState = snackbarHostState,
            modifier = Modifier.align(Alignment.BottomCenter)
        )
    }
}

@Composable
private fun WelcomeHeader(onViewAllClick: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Animated Welcome Badge with Gradient Border
        Box(
            modifier = Modifier
                .border(
                    width = 3.dp,
                    brush = Brush.sweepGradient(
                        listOf(
                            PrimaryOrange,
                            PrimaryOrangeGradientEnd,
                            PrimaryOrange
                        )
                    ),
                    shape = RoundedCornerShape(50)
                )
                .background(
                    color = Color(0xFFFDF0E7),
                    shape = RoundedCornerShape(50)
                )
                .padding(horizontal = 24.dp, vertical = 12.dp)
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(text = "🐾", fontSize = 28.sp)
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Welcome to ",
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.ExtraBold
                )
                Text(
                    text = "PURRKIN PETS",
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.ExtraBold,
                    color = PrimaryOrange
                )
            }
        }
        
        Spacer(modifier = Modifier.height(8.dp))
        
        Text(
            text = "Your One Stop Pet Paradise",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Text(
            text = "Everything Your Pet Needs & Loves",
            style = MaterialTheme.typography.headlineMedium,
            fontWeight = FontWeight.Bold,
            textAlign = TextAlign.Center
        )
        
        Spacer(modifier = Modifier.height(8.dp))
        
        Text(
            text = "Discover premium pet products and get expert care - all in one place.",
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(horizontal = 16.dp)
        )
        
        Spacer(modifier = Modifier.height(20.dp))
        
        // Shop Now Button
        Button(
            onClick = onViewAllClick,
            colors = ButtonDefaults.buttonColors(
                containerColor = PrimaryOrange
            ),
            shape = RoundedCornerShape(28.dp),
            modifier = Modifier
                .height(52.dp)
                .shadow(8.dp, RoundedCornerShape(28.dp))
        ) {
            Text(
                text = "Shop Now",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold
            )
            Spacer(modifier = Modifier.width(8.dp))
            Icon(
                imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                contentDescription = null,
                modifier = Modifier.size(20.dp)
            )
        }
    }
}

@OptIn(ExperimentalPagerApi::class)
@Composable
private fun HeroCarousel() {
    val pagerState = rememberPagerState()
    
    // Carousel slides matching website
    val slides = listOf(
        CarouselSlide(
            title = "🐕 Pet Paradise",
            subtitle = "Everything your pets need",
            color = PrimaryOrange,
            imageUrl = null
        ),
        CarouselSlide(
            title = "🚚 Free Delivery",
            subtitle = "On orders over 20 BHD",
            color = SecondaryGreen,
            imageUrl = null
        ),
        CarouselSlide(
            title = "🛡️ Premium Brands",
            subtitle = "Royal Canin, Whiskas & more",
            color = SecondaryTeal,
            imageUrl = null
        ),
        CarouselSlide(
            title = "🏷️ Special Offers",
            subtitle = "Up to 30% off selected items",
            color = Color(0xFF8B5CF6),
            imageUrl = null
        )
    )
    
    // Auto-scroll
    LaunchedEffect(pagerState) {
        while (true) {
            delay(4000)
            val nextPage = (pagerState.currentPage + 1) % slides.size
            pagerState.animateScrollToPage(nextPage)
        }
    }
    
    Column(modifier = Modifier.fillMaxWidth()) {
        HorizontalPager(
            count = slides.size,
            state = pagerState,
            modifier = Modifier
                .fillMaxWidth()
                .height(180.dp)
                .padding(horizontal = 16.dp)
        ) { page ->
            CarouselCard(slide = slides[page])
        }
        
        Spacer(modifier = Modifier.height(12.dp))
        
        HorizontalPagerIndicator(
            pagerState = pagerState,
            modifier = Modifier.align(Alignment.CenterHorizontally),
            activeColor = PrimaryOrange,
            inactiveColor = MaterialTheme.colorScheme.outlineVariant
        )
    }
}

@Composable
private fun CarouselCard(slide: CarouselSlide) {
    Card(
        modifier = Modifier
            .fillMaxSize()
            .padding(4.dp),
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = slide.color),
        elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            contentAlignment = Alignment.CenterStart
        ) {
            Column {
                Text(
                    text = slide.title,
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = slide.subtitle,
                    style = MaterialTheme.typography.bodyLarge,
                    color = Color.White.copy(alpha = 0.9f)
                )
            }
        }
    }
}

data class CarouselSlide(
    val title: String,
    val subtitle: String,
    val color: Color,
    val imageUrl: String?
)

@Composable
private fun ShopByPetSection(onCategoryClick: (String) -> Unit) {
    // Pet categories with images (matching website)
    val petCategories = listOf(
        PetCategory("Dogs", "dogs", "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&h=200&fit=crop&crop=face", GradientDogs),
        PetCategory("Cats", "cats", "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&h=200&fit=crop&crop=face", GradientCats),
        PetCategory("Birds", "birds", "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=200&h=200&fit=crop&crop=face", GradientBirds),
        PetCategory("Fish", "fish", "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=200&h=200&fit=crop&crop=face", GradientFish),
        PetCategory("Rabbits", "rabbits", "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=200&h=200&fit=crop&crop=face", GradientRabbits),
        PetCategory("Turtles", "turtles", "https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=200&h=200&fit=crop&crop=face", GradientTurtles)
    )
    
    Column(
        modifier = Modifier.fillMaxWidth(),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Section header matching website
        Text(
            text = "Explore",
            style = MaterialTheme.typography.labelLarge,
            color = PrimaryOrange,
            fontWeight = FontWeight.Medium,
            letterSpacing = 2.sp
        )
        
        Spacer(modifier = Modifier.height(4.dp))
        
        Text(
            text = "Shop by Pet",
            style = MaterialTheme.typography.headlineMedium,
            fontWeight = FontWeight.Bold
        )
        
        Spacer(modifier = Modifier.height(4.dp))
        
        Text(
            text = "Find everything for your furry, feathered, or finned friends",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(horizontal = 32.dp)
        )
        
        Spacer(modifier = Modifier.height(24.dp))
        
        // Pet icons in horizontal scroll
        LazyRow(
            contentPadding = PaddingValues(horizontal = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(24.dp)
        ) {
            items(petCategories) { pet ->
                PetCategoryItem(
                    category = pet,
                    onClick = { onCategoryClick(pet.slug) }
                )
            }
        }
    }
}

@Composable
private fun PetCategoryItem(
    category: PetCategory,
    onClick: () -> Unit
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier
            .clickable(onClick = onClick)
            .padding(8.dp)
    ) {
        // Gradient border circle with pet image
        Box(
            modifier = Modifier
                .size(90.dp)
                .background(
                    brush = Brush.linearGradient(
                        colors = listOf(category.gradient.first, category.gradient.second)
                    ),
                    shape = CircleShape
                )
                .padding(3.dp)
        ) {
            Surface(
                shape = CircleShape,
                modifier = Modifier.fillMaxSize()
            ) {
                AsyncImage(
                    model = category.imageUrl,
                    contentDescription = category.name,
                    modifier = Modifier
                        .fillMaxSize()
                        .clip(CircleShape),
                    contentScale = ContentScale.Crop
                )
            }
        }
        
        Spacer(modifier = Modifier.height(8.dp))
        
        Text(
            text = category.name.uppercase(),
            style = MaterialTheme.typography.labelMedium,
            fontWeight = FontWeight.SemiBold,
            color = MaterialTheme.colorScheme.onSurface,
            letterSpacing = 1.sp
        )
    }
}

data class PetCategory(
    val name: String,
    val slug: String,
    val imageUrl: String,
    val gradient: Pair<Color, Color>
)

@Composable
private fun SectionHeader(
    title: String,
    onViewAllClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = title,
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold
        )
        TextButton(onClick = onViewAllClick) {
            Text("View All")
            Icon(
                imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                contentDescription = null,
                modifier = Modifier.size(16.dp)
            )
        }
    }
}

@Composable
private fun ProductRow(
    products: List<Product>,
    onProductClick: (String) -> Unit,
    onAddToCartClick: (String) -> Unit
) {
    LazyRow(
        contentPadding = PaddingValues(horizontal = 16.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        items(products) { product ->
            ProductCard(
                product = product,
                onProductClick = onProductClick,
                onAddToCartClick = onAddToCartClick,
                onWishlistClick = {},
                modifier = Modifier.width(170.dp)
            )
        }
    }
}

@Composable
private fun ProductRowPlaceholder() {
    LazyRow(
        contentPadding = PaddingValues(horizontal = 16.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        items(4) {
            Card(
                modifier = Modifier
                    .width(170.dp)
                    .height(240.dp),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant
                )
            ) {}
        }
    }
}

@Composable
private fun FeaturesSection() {
    val features = listOf(
        Feature(
            icon = Icons.Default.Star,
            title = "Quality Products",
            description = "Premium pet supplies from trusted brands"
        ),
        Feature(
            icon = Icons.Default.LocalShipping,
            title = "Fast Delivery",
            description = "Same-day delivery across Bahrain"
        ),
        Feature(
            icon = Icons.Default.Shield,
            title = "Safe & Secure",
            description = "100% authentic products guaranteed"
        )
    )
    
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp)
    ) {
        features.forEach { feature ->
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 6.dp),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surface
                ),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Surface(
                        shape = CircleShape,
                        color = PrimaryOrange.copy(alpha = 0.1f),
                        modifier = Modifier.size(48.dp)
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Icon(
                                imageVector = feature.icon,
                                contentDescription = null,
                                tint = PrimaryOrange,
                                modifier = Modifier.size(24.dp)
                            )
                        }
                    }
                    Spacer(modifier = Modifier.width(16.dp))
                    Column {
                        Text(
                            text = feature.title,
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.SemiBold
                        )
                        Text(
                            text = feature.description,
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
        }
    }
}

data class Feature(
    val icon: ImageVector,
    val title: String,
    val description: String
)
