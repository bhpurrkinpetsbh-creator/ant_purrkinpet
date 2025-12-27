package com.purrkinpets.di;

import com.purrkinpets.data.repository.CartRepository;
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
public final class RepositoryModule_ProvideCartRepositoryFactory implements Factory<CartRepository> {
  private final Provider<SupabaseClient> supabaseClientProvider;

  public RepositoryModule_ProvideCartRepositoryFactory(
      Provider<SupabaseClient> supabaseClientProvider) {
    this.supabaseClientProvider = supabaseClientProvider;
  }

  @Override
  public CartRepository get() {
    return provideCartRepository(supabaseClientProvider.get());
  }

  public static RepositoryModule_ProvideCartRepositoryFactory create(
      Provider<SupabaseClient> supabaseClientProvider) {
    return new RepositoryModule_ProvideCartRepositoryFactory(supabaseClientProvider);
  }

  public static CartRepository provideCartRepository(SupabaseClient supabaseClient) {
    return Preconditions.checkNotNullFromProvides(RepositoryModule.INSTANCE.provideCartRepository(supabaseClient));
  }
}
