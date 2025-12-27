package com.purrkinpets.ui.screens.shop

import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.purrkinpets.domain.model.Product
import com.purrkinpets.ui.components.LoadingScreen
import com.purrkinpets.ui.components.ProductCard
import com.purrkinpets.ui.components.SearchBar
import com.purrkinpets.util.Resource

/**
 * Shop screen with product grid and category filters.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ShopScreen(
    initialCategory: String? = null,
    onProductClick: (String) -> Unit,
    onBackClick: () -> Unit,
    onAuthRequired: () -> Unit = {},
    isAuthenticated: Boolean = true,
    viewModel: ShopViewModel = hiltViewModel()
) {
    val products by viewModel.products.collectAsState()
    val categories by viewModel.categories.collectAsState()
    val selectedCategory by viewModel.selectedCategory.collectAsState()
    val searchQuery by viewModel.searchQuery.collectAsState()
    
    LaunchedEffect(initialCategory) {
        if (initialCategory != null) {
            viewModel.setCategory(initialCategory)
        }
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Shop", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back")
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            // Search bar
            SearchBar(
                query = searchQuery,
                onQueryChange = { viewModel.search(it) },
                onSearch = { viewModel.search(it) },
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
            )
            
            // Category filters
            if (categories is Resource.Success) {
                val categoryList = (categories as Resource.Success).data ?: emptyList()
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState())
                        .padding(horizontal = 16.dp, vertical = 8.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    FilterChip(
                        selected = selectedCategory == null,
                        onClick = { viewModel.setCategory(null) },
                        label = { Text("All") },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = MaterialTheme.colorScheme.primary,
                            selectedLabelColor = MaterialTheme.colorScheme.onPrimary
                        )
                    )
                    categoryList.forEach { category ->
                        FilterChip(
                            selected = selectedCategory == category.slug,
                            onClick = { viewModel.setCategory(category.slug) },
                            label = { Text(category.name) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = MaterialTheme.colorScheme.primary,
                                selectedLabelColor = MaterialTheme.colorScheme.onPrimary
                            )
                        )
                    }
                }
            }
            
            // Products grid
            when (val state = products) {
                is Resource.Loading -> {
                    LoadingScreen(message = "Loading products...")
                }
                is Resource.Error -> {
                    Text(
                        text = state.message ?: "Error loading products",
                        modifier = Modifier.padding(16.dp)
                    )
                }
                is Resource.Success -> {
                    val productList = state.data ?: emptyList()
                    val filteredProducts = if (selectedCategory != null) {
                        productList.filter { 
                            // Simple filter - would need category lookup in production
                            true
                        }
                    } else {
                        productList
                    }
                    
                    LazyVerticalGrid(
                        columns = GridCells.Fixed(2),
                        contentPadding = PaddingValues(16.dp),
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        items(filteredProducts, key = { it.id }) { product ->
                            ProductCard(
                                product = product,
                                onProductClick = onProductClick,
                                onAddToCartClick = { 
                                    if (isAuthenticated) viewModel.addToCart(it) else onAuthRequired()
                                },
                                onWishlistClick = {}
                            )
                        }
                    }
                }
            }
        }
    }
}
