package com.purrkinpets.ui.screens.orders;

import dagger.internal.DaggerGenerated;
import dagger.internal.Factory;
import dagger.internal.QualifierMetadata;
import dagger.internal.ScopeMetadata;
import io.github.jan.supabase.SupabaseClient;
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
public final class OrdersViewModel_Factory implements Factory<OrdersViewModel> {
  private final Provider<SupabaseClient> supabaseClientProvider;

  public OrdersViewModel_Factory(Provider<SupabaseClient> supabaseClientProvider) {
    this.supabaseClientProvider = supabaseClientProvider;
  }

  @Override
  public OrdersViewModel get() {
    return newInstance(supabaseClientProvider.get());
  }

  public static OrdersViewModel_Factory create(Provider<SupabaseClient> supabaseClientProvider) {
    return new OrdersViewModel_Factory(supabaseClientProvider);
  }

  public static OrdersViewModel newInstance(SupabaseClient supabaseClient) {
    return new OrdersViewModel(supabaseClient);
  }
}
