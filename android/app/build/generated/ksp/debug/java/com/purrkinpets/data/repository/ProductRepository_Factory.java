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
public final class ProductRepository_Factory implements Factory<ProductRepository> {
  private final Provider<SupabaseClient> supabaseClientProvider;

  public ProductRepository_Factory(Provider<SupabaseClient> supabaseClientProvider) {
    this.supabaseClientProvider = supabaseClientProvider;
  }

  @Override
  public ProductRepository get() {
    return newInstance(supabaseClientProvider.get());
  }

  public static ProductRepository_Factory create(Provider<SupabaseClient> supabaseClientProvider) {
    return new ProductRepository_Factory(supabaseClientProvider);
  }

  public static ProductRepository newInstance(SupabaseClient supabaseClient) {
    return new ProductRepository(supabaseClient);
  }
}
