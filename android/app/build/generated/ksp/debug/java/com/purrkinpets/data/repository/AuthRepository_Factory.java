package com.purrkinpets.data.repository;

import androidx.credentials.CredentialManager;
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
public final class AuthRepository_Factory implements Factory<AuthRepository> {
  private final Provider<SupabaseClient> supabaseClientProvider;

  private final Provider<CredentialManager> credentialManagerProvider;

  public AuthRepository_Factory(Provider<SupabaseClient> supabaseClientProvider,
      Provider<CredentialManager> credentialManagerProvider) {
    this.supabaseClientProvider = supabaseClientProvider;
    this.credentialManagerProvider = credentialManagerProvider;
  }

  @Override
  public AuthRepository get() {
    return newInstance(supabaseClientProvider.get(), credentialManagerProvider.get());
  }

  public static AuthRepository_Factory create(Provider<SupabaseClient> supabaseClientProvider,
      Provider<CredentialManager> credentialManagerProvider) {
    return new AuthRepository_Factory(supabaseClientProvider, credentialManagerProvider);
  }

  public static AuthRepository newInstance(SupabaseClient supabaseClient,
      CredentialManager credentialManager) {
    return new AuthRepository(supabaseClient, credentialManager);
  }
}
