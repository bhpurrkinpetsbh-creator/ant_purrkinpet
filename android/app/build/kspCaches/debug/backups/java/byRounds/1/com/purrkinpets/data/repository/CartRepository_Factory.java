package com.purrkinpets.data.repository;

import dagger.internal.DaggerGenerated;
import dagger.internal.Factory;
import dagger.internal.QualifierMetadata;
import dagger.internal.ScopeMetadata;
import io.github.jan.supabase.SupabaseClient;
import javax.annotation.processing.Generated;
import javax.inject.Provider;

@ScopeMetadata("javax.inject.Singleton")
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
public final class CartRepository_Factory implements Factory<CartRepository> {
  private final Provider<SupabaseClient> supabaseClientProvider;

  public CartRepository_Factory(Provider<SupabaseClient> supabaseClientProvider) {
    this.supabaseClientProvider = supabaseClientProvider;
  }

  @Override
  public CartRepository get() {
    return newInstance(supabaseClientProvider.get());
  }

  public static CartRepository_Factory create(Provider<SupabaseClient> supabaseClientProvider) {
    return new CartRepository_Factory(supabaseClientProvider);
  }

  public static CartRepository newInstance(SupabaseClient supabaseClient) {
    return new CartRepository(supabaseClient);
  }
}
