package com.purrkinpets.ui.screens.shop;

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
public final class ShopViewModel_Factory implements Factory<ShopViewModel> {
  private final Provider<ProductRepository> productRepositoryProvider;

  private final Provider<CartRepository> cartRepositoryProvider;

  public ShopViewModel_Factory(Provider<ProductRepository> productRepositoryProvider,
      Provider<CartRepository> cartRepositoryProvider) {
    this.productRepositoryProvider = productRepositoryProvider;
    this.cartRepositoryProvider = cartRepositoryProvider;
  }

  @Override
  public ShopViewModel get() {
    return newInstance(productRepositoryProvider.get(), cartRepositoryProvider.get());
  }

  public static ShopViewModel_Factory create(Provider<ProductRepository> productRepositoryProvider,
      Provider<CartRepository> cartRepositoryProvider) {
    return new ShopViewModel_Factory(productRepositoryProvider, cartRepositoryProvider);
  }

  public static ShopViewModel newInstance(ProductRepository productRepository,
      CartRepository cartRepository) {
    return new ShopViewModel(productRepository, cartRepository);
  }
}
