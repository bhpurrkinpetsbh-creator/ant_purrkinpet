package com.purrkinpets.util

/**
 * A generic class that holds a value with its loading status.
 * 
 * Used to represent the state of data fetching operations.
 */
sealed class Resource<T>(
    val data: T? = null,
    val message: String? = null
) {
    class Success<T>(data: T) : Resource<T>(data)
    class Error<T>(message: String, data: T? = null) : Resource<T>(data, message)
    class Loading<T>(data: T? = null) : Resource<T>(data)
}

/**
 * UI state wrapper for screens.
 */
data class UiState<T>(
    val isLoading: Boolean = false,
    val data: T? = null,
    val error: String? = null
) {
    val isSuccess: Boolean get() = data != null && error == null && !isLoading
    val isError: Boolean get() = error != null
}
