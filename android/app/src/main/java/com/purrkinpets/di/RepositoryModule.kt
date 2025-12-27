package com.purrkinpets.di

import androidx.credentials.CredentialManager
import com.purrkinpets.data.repository.AuthRepository
import com.purrkinpets.data.repository.CartRepository
import com.purrkinpets.data.repository.ProductRepository
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import io.github.jan.supabase.SupabaseClient
import javax.inject.Singleton

/**
 * Hilt module providing repository dependencies.
 */
@Module
@InstallIn(SingletonComponent::class)
object RepositoryModule {
    
    @Provides
    @Singleton
    fun provideAuthRepository(
        supabaseClient: SupabaseClient,
        credentialManager: CredentialManager
    ): AuthRepository {
        return AuthRepository(supabaseClient, credentialManager)
    }
    
    @Provides
    @Singleton
    fun provideProductRepository(
        supabaseClient: SupabaseClient
    ): ProductRepository {
        return ProductRepository(supabaseClient)
    }
    
    @Provides
    @Singleton
    fun provideCartRepository(
        supabaseClient: SupabaseClient
    ): CartRepository {
        return CartRepository(supabaseClient)
    }
}
