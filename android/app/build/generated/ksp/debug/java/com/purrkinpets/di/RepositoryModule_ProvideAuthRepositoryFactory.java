package com.purrkinpets.di;

import androidx.credentials.CredentialManager;
import com.purrkinpets.data.repository.AuthRepository;
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
public final class RepositoryModule_ProvideAuthRepositoryFactory implements Factory<AuthRepository> {
  private final Provider<SupabaseClient> supabaseClientProvider;

  private final Provider<CredentialManager> credentialManagerProvider;

  public RepositoryModule_ProvideAuthRepositoryFactory(
      Provider<SupabaseClient> supabaseClientProvider,
      Provider<CredentialManager> credentialManagerProvider) {
    this.supabaseClientProvider = supabaseClientProvider;
    this.credentialManagerProvider = credentialManagerProvider;
  }

  @Override
  public AuthRepository get() {
    return provideAuthRepository(supabaseClientProvider.get(), credentialManagerProvider.get());
  }

  public static RepositoryModule_ProvideAuthRepositoryFactory create(
      Provider<SupabaseClient> supabaseClientProvider,
      Provider<CredentialManager> credentialManagerProvider) {
    return new RepositoryModule_ProvideAuthRepositoryFactory(supabaseClientProvider, credentialManagerProvider);
  }

  public static AuthRepository provideAuthRepository(SupabaseClient supabaseClient,
      CredentialManager credentialManager) {
    return Preconditions.checkNotNullFromProvides(RepositoryModule.INSTANCE.provideAuthRepository(supabaseClient, credentialManager));
  }
}
