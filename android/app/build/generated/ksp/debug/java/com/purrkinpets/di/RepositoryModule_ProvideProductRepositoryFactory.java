package com.purrkinpets.di;

import com.purrkinpets.data.repository.ProductRepository;
import dagger.internal.DaggerGenerated;
import dagger.internal.Factory;
import dagger.internal.Preconditions;
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
public final class RepositoryModule_ProvideProductRepositoryFactory implements Factory<ProductRepository> {
  private final Provider<SupabaseClient> supabaseClientProvider;

  public RepositoryModule_ProvideProductRepositoryFactory(
      Provider<SupabaseClient> supabaseClientProvider) {
    this.supabaseClientProvider = supabaseClientProvider;
  }

  @Override
  public ProductRepository get() {
    return provideProductRepository(supabaseClientProvider.get());
  }

  public static RepositoryModule_ProvideProductRepositoryFactory create(
      Provider<SupabaseClient> supabaseClientProvider) {
    return new RepositoryModule_ProvideProductRepositoryFactory(supabaseClientProvider);
  }

  public static ProductRepository provideProductRepository(SupabaseClient supabaseClient) {
    return Preconditions.checkNotNullFromProvides(RepositoryModule.INSTANCE.provideProductRepository(supabaseClient));
  }
}
