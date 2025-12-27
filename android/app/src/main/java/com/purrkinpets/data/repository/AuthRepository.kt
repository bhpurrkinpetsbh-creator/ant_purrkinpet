package com.purrkinpets.data.repository

import android.content.Context
import androidx.credentials.CredentialManager
import androidx.credentials.CustomCredential
import androidx.credentials.GetCredentialRequest
import androidx.credentials.exceptions.GetCredentialException
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import com.purrkinpets.BuildConfig
import com.purrkinpets.domain.model.User
import com.purrkinpets.util.Resource
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.gotrue.auth
import io.github.jan.supabase.gotrue.providers.Google
import io.github.jan.supabase.gotrue.providers.builtin.Email
import io.github.jan.supabase.gotrue.providers.builtin.IDToken
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Repository for authentication operations.
 * 
 * Handles Google Sign-In via Android Credential Manager and email/password auth via Supabase.
 */
@Singleton
class AuthRepository @Inject constructor(
    private val supabaseClient: SupabaseClient,
    private val credentialManager: CredentialManager
) {
    /**
     * Check if user is currently authenticated.
     */
    val isAuthenticated: Boolean
        get() = supabaseClient.auth.currentSessionOrNull() != null
    
    /**
     * Get current user info.
     */
    fun getCurrentUser(): User? {
        val session = supabaseClient.auth.currentSessionOrNull() ?: return null
        return User(
            id = session.user?.id ?: "",
            email = session.user?.email ?: "",
            fullName = session.user?.userMetadata?.get("full_name")?.toString()
        )
    }
    
    /**
     * Sign in with Google using Android Credential Manager.
     */
    suspend fun signInWithGoogle(context: Context): Flow<Resource<User>> = flow {
        emit(Resource.Loading())
        
        try {
            // Configure Google ID request
            val googleIdOption = GetGoogleIdOption.Builder()
                .setFilterByAuthorizedAccounts(false)
                .setServerClientId(BuildConfig.GOOGLE_WEB_CLIENT_ID)
                .setAutoSelectEnabled(true)
                .build()
            
            val request = GetCredentialRequest.Builder()
                .addCredentialOption(googleIdOption)
                .build()
            
            // Get credential from Credential Manager
            val result = credentialManager.getCredential(
                request = request,
                context = context
            )
            
            // Extract Google ID token
            val credential = result.credential
            if (credential is CustomCredential &&
                credential.type == GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL
            ) {
                val googleIdTokenCredential = GoogleIdTokenCredential.createFrom(credential.data)
                val idToken = googleIdTokenCredential.idToken
                
                // Sign in to Supabase with the ID token
                supabaseClient.auth.signInWith(IDToken) {
                    this.provider = Google
                    this.idToken = idToken
                }
                
                val user = getCurrentUser()
                if (user != null) {
                    emit(Resource.Success(user))
                } else {
                    emit(Resource.Error("Failed to get user after sign in"))
                }
            } else {
                emit(Resource.Error("Invalid credential type"))
            }
        } catch (e: GetCredentialException) {
            emit(Resource.Error(e.message ?: "Google Sign-In failed"))
        } catch (e: Exception) {
            emit(Resource.Error(e.message ?: "Authentication failed"))
        }
    }
    
    /**
     * Sign in with email and password.
     */
    suspend fun signInWithEmail(email: String, password: String): Flow<Resource<User>> = flow {
        emit(Resource.Loading())
        
        try {
            supabaseClient.auth.signInWith(Email) {
                this.email = email
                this.password = password
            }
            
            val user = getCurrentUser()
            if (user != null) {
                emit(Resource.Success(user))
            } else {
                emit(Resource.Error("Failed to get user after sign in"))
            }
        } catch (e: Exception) {
            emit(Resource.Error(e.message ?: "Sign in failed"))
        }
    }
    
    /**
     * Sign up with email and password.
     */
    suspend fun signUpWithEmail(email: String, password: String): Flow<Resource<Boolean>> = flow {
        emit(Resource.Loading())
        
        try {
            supabaseClient.auth.signUpWith(Email) {
                this.email = email
                this.password = password
            }
            emit(Resource.Success(true))
        } catch (e: Exception) {
            emit(Resource.Error(e.message ?: "Sign up failed"))
        }
    }
    
    /**
     * Sign out current user.
     */
    suspend fun signOut() {
        try {
            supabaseClient.auth.signOut()
        } catch (e: Exception) {
            // Ignore sign out errors
        }
    }
}
