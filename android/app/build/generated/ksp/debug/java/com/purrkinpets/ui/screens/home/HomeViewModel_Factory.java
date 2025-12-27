package com.purrkinpets.ui.screens.home;

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
public final class HomeViewModel_Factory implements Factory<HomeViewModel> {
  private final Provider<ProductRepository> productRepositoryProvider;

  private final Provider<CartRepository> cartRepositoryProvider;

  public HomeViewModel_Factory(Provider<ProductRepository> productRepositoryProvider,
      Provider<CartRepository> cartRepositoryProvider) {
    this.productRepositoryProvider = productRepositoryProvider;
    this.cartRepositoryProvider = cartRepositoryProvider;
  }

  @Override
  public HomeViewModel get() {
    return newInstance(productRepositoryProvider.get(), cartRepositoryProvider.get());
  }

  public static HomeViewModel_Factory create(Provider<ProductRepository> productRepositoryProvider,
      Provider<CartRepository> cartRepositoryProvider) {
    return new HomeViewModel_Factory(productRepositoryProvider, cartRepositoryProvider);
  }

  public static HomeViewModel newInstance(ProductRepository productRepository,
      CartRepository cartRepository) {
    return new HomeViewModel(productRepository, cartRepository);
  }
}
