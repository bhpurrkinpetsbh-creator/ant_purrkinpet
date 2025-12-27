package com.purrkinpets.ui.screens.cart;

import com.purrkinpets.data.repository.CartRepository;
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
public final class CartViewModel_Factory implements Factory<CartViewModel> {
  private final Provider<CartRepository> cartRepositoryProvider;

  public CartViewModel_Factory(Provider<CartRepository> cartRepositoryProvider) {
    this.cartRepositoryProvider = cartRepositoryProvider;
  }

  @Override
  public CartViewModel get() {
    return newInstance(cartRepositoryProvider.get());
  }

  public static CartViewModel_Factory create(Provider<CartRepository> cartRepositoryProvider) {
    return new CartViewModel_Factory(cartRepositoryProvider);
  }

  public static CartViewModel newInstance(CartRepository cartRepository) {
    return new CartViewModel(cartRepository);
  }
}
