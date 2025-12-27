package com.purrkinpets.di

import com.purrkinpets.BuildConfig
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.gotrue.Auth
import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.realtime.Realtime
import io.github.jan.supabase.storage.Storage
import javax.inject.Singleton

/**
 * Hilt module providing network-related dependencies.
 * 
 * This module configures the Supabase client with all required plugins
 * for authentication, database access, real-time updates, and storage.
 */
@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {
    
    @Provides
    @Singleton
    fun provideSupabaseClient(): SupabaseClient {
        return createSupabaseClient(
            supabaseUrl = BuildConfig.SUPABASE_URL,
            supabaseKey = BuildConfig.SUPABASE_ANON_KEY
        ) {
            // Install authentication plugin
            install(Auth) {
                // Auth configuration can be customized here
            }
            
            // Install PostgREST for database operations
            install(Postgrest)
            
            // Install Realtime for live updates
            install(Realtime)
            
            // Install Storage for file operations
            install(Storage)
        }
    }
}
