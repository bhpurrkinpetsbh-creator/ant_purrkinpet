package com.purrkinpets.di;

import android.content.Context;
import androidx.credentials.CredentialManager;
import dagger.internal.DaggerGenerated;
import dagger.internal.Factory;
import dagger.internal.Preconditions;
import dagger.internal.QualifierMetadata;
import dagger.internal.ScopeMetadata;
import javax.annotation.processing.Generated;
import javax.inject.Provider;

@ScopeMetadata("javax.inject.Singleton")
@QualifierMetadata("dagger.hilt.android.qualifiers.ApplicationContext")
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
public final class AppModule_ProvideCredentialManagerFactory implements Factory<CredentialManager> {
  private final Provider<Context> contextProvider;

  public AppModule_ProvideCredentialManagerFactory(Provider<Context> contextProvider) {
    this.contextProvider = contextProvider;
  }

  @Override
  public CredentialManager get() {
    return provideCredentialManager(contextProvider.get());
  }

  public static AppModule_ProvideCredentialManagerFactory create(
      Provider<Context> contextProvider) {
    return new AppModule_ProvideCredentialManagerFactory(contextProvider);
  }

  public static CredentialManager provideCredentialManager(Context context) {
    return Preconditions.checkNotNullFromProvides(AppModule.INSTANCE.provideCredentialManager(context));
  }
}
