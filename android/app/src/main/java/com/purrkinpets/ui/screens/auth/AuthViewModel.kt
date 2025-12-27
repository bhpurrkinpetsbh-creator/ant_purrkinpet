package com.purrkinpets.ui.screens.auth

import android.app.Activity
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.purrkinpets.data.repository.AuthRepository
import com.purrkinpets.domain.model.User
import com.purrkinpets.util.Resource
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

/**
 * ViewModel for authentication screens.
 */
@HiltViewModel
class AuthViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {
    
    private val _authState = MutableStateFlow<AuthState>(AuthState.Idle)
    val authState: StateFlow<AuthState> = _authState.asStateFlow()
    
    private val _isAuthenticated = MutableStateFlow(authRepository.isAuthenticated)
    val isAuthenticated: StateFlow<Boolean> = _isAuthenticated.asStateFlow()
    
    private val _currentUser = MutableStateFlow(authRepository.getCurrentUser())
    val currentUser: StateFlow<User?> = _currentUser.asStateFlow()
    
    init {
        checkAuthState()
    }
    
    private fun checkAuthState() {
        _isAuthenticated.value = authRepository.isAuthenticated
        _currentUser.value = authRepository.getCurrentUser()
    }
    
    /**
     * Sign in with Google.
     */
    fun signInWithGoogle(activity: Activity) {
        viewModelScope.launch {
            authRepository.signInWithGoogle(activity).collect { result ->
                when (result) {
                    is Resource.Loading -> {
                        _authState.value = AuthState.Loading
                    }
                    is Resource.Success -> {
                        _isAuthenticated.value = true
                        _currentUser.value = result.data
                        _authState.value = AuthState.Success(result.data!!)
                    }
                    is Resource.Error -> {
                        _authState.value = AuthState.Error(result.message ?: "Authentication failed")
                    }
                }
            }
        }
    }
    
    /**
     * Sign in with email and password.
     */
    fun signInWithEmail(email: String, password: String) {
        viewModelScope.launch {
            authRepository.signInWithEmail(email, password).collect { result ->
                when (result) {
                    is Resource.Loading -> {
                        _authState.value = AuthState.Loading
                    }
                    is Resource.Success -> {
                        _isAuthenticated.value = true
                        _currentUser.value = result.data
                        _authState.value = AuthState.Success(result.data!!)
                    }
                    is Resource.Error -> {
                        _authState.value = AuthState.Error(result.message ?: "Sign in failed")
                    }
                }
            }
        }
    }
    
    /**
     * Sign up with email and password.
     */
    fun signUpWithEmail(email: String, password: String) {
        viewModelScope.launch {
            authRepository.signUpWithEmail(email, password).collect { result ->
                when (result) {
                    is Resource.Loading -> {
                        _authState.value = AuthState.Loading
                    }
                    is Resource.Success -> {
                        _authState.value = AuthState.SignUpSuccess
                    }
                    is Resource.Error -> {
                        _authState.value = AuthState.Error(result.message ?: "Sign up failed")
                    }
                }
            }
        }
    }
    
    /**
     * Sign out.
     */
    fun signOut() {
        viewModelScope.launch {
            authRepository.signOut()
            _isAuthenticated.value = false
            _currentUser.value = null
            _authState.value = AuthState.Idle
        }
    }
    
    /**
     * Reset auth state to idle.
     */
    fun resetState() {
        _authState.value = AuthState.Idle
    }
}

/**
 * Sealed class representing authentication states.
 */
sealed class AuthState {
    object Idle : AuthState()
    object Loading : AuthState()
    data class Success(val user: User) : AuthState()
    object SignUpSuccess : AuthState()
    data class Error(val message: String) : AuthState()
}
