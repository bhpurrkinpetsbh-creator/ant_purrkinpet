package com.purrkinpets.ui.screens.shop;

import androidx.lifecycle.SavedStateHandle;
import com.purrkinpets.data.repository.CartRepository;
import com.purrkinpets.data.repository.ProductRepository;
import dagger.internal.DaggerGenerated;
import dagger.internal.Factory;
import dagger.internal.QualifierMetadata;
import dagger.internal.ScopeMetadata;
import javax.annotation.processing.Generated;
import javax.inject.Provider;

@ScopeMetadata
@QualifierMetadata
@DaggerGenerated
@Generated(
    value = "dagger.internal.codegen.ComponentProcessor",
    comments = "https://dagger.dev"
)
@SuppressWarnings({
    "unchecked",
    "rawtypes",
    "KotlinInternal",
    "KotlinInternalInJava"
})
public final class ProductDetailViewModel_Factory implements Factory<ProductDetailViewModel> {
  private final Provider<ProductRepository> productRepositoryProvider;

  private final Provider<CartRepository> cartRepositoryProvider;

  private final Provider<SavedStateHandle> savedStateHandleProvider;

  public ProductDetailViewModel_Factory(Provider<ProductRepository> productRepositoryProvider,
      Provider<CartRepository> cartRepositoryProvider,
      Provider<SavedStateHandle> savedStateHandleProvider) {
    this.productRepositoryProvider = productRepositoryProvider;
    this.cartRepositoryProvider = cartRepositoryProvider;
    this.savedStateHandleProvider = savedStateHandleProvider;
  }

  @Override
  public ProductDetailViewModel get() {
    return newInstance(productRepositoryProvider.get(), cartRepositoryProvider.get(), savedStateHandleProvider.get());
  }

  public static ProductDetailViewModel_Factory create(
      Provider<ProductRepository> productRepositoryProvider,
      Provider<CartRepository> cartRepositoryProvider,
      Provider<SavedStateHandle> savedStateHandleProvider) {
    return new ProductDetailViewModel_Factory(productRepositoryProvider, cartRepositoryProvider, savedStateHandleProvider);
  }

  public static ProductDetailViewModel newInstance(ProductRepository productRepository,
      CartRepository cartRepository, SavedStateHandle savedStateHandle) {
    return new ProductDetailViewModel(productRepository, cartRepository, savedStateHandle);
  }
}
