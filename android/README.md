# Purrkin Pets Android App

Native Android application for the Purrkin Pets e-commerce platform built with Kotlin and Jetpack Compose.

## Tech Stack

- **Language**: Kotlin
- **UI Framework**: Jetpack Compose with Material 3
- **Architecture**: MVVM with Repository pattern
- **Dependency Injection**: Hilt
- **Navigation**: Jetpack Navigation Compose
- **Backend**: Supabase (Auth, Postgrest, Realtime, Storage)
- **Authentication**: Native Google Sign-In via Credential Manager
- **Image Loading**: Coil
- **Serialization**: Kotlinx Serialization

## Project Structure

```
android/
├── app/
│   ├── src/main/
│   │   ├── java/com/purrkinpets/
│   │   │   ├── di/                 # Dependency injection modules
│   │   │   ├── data/
│   │   │   │   ├── repository/     # Data repositories
│   │   │   │   ├── local/          # Room database (future)
│   │   │   │   └── remote/         # Remote data sources
│   │   │   ├── domain/model/       # Domain models
│   │   │   ├── ui/
│   │   │   │   ├── theme/          # Compose theme
│   │   │   │   ├── navigation/     # Navigation graph
│   │   │   │   ├── components/     # Reusable UI components
│   │   │   │   └── screens/        # Screen composables & ViewModels
│   │   │   └── util/               # Utility classes
│   │   └── res/                    # Android resources
│   └── build.gradle.kts
├── gradle/
├── build.gradle.kts
└── settings.gradle.kts
```

## Features

### Customer Features (Included)
- ✅ Google Sign-In & Email Authentication
- ✅ Home screen with carousel, categories, featured products
- ✅ Shop with product grid and category filters
- ✅ Product detail with add to cart
- ✅ Shopping cart with quantity management
- ✅ Free shipping progress indicator
- ✅ Checkout flow with address form
- ✅ Order history
- ✅ Wishlist
- ✅ User profile

### Admin Features (Excluded)
Admin functionality is website-exclusive and not included in the mobile app.

## Setup Instructions

### 1. Prerequisites
- Android Studio Hedgehog (2023.1.1) or later
- JDK 17+
- Android SDK 24+

### 2. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select a project
3. Enable the Google Sign-In API
4. Create OAuth 2.0 credentials:
   - **Android OAuth client**: Add your app's SHA-1 fingerprint
   - **Web client**: Required for Supabase backend integration

Get SHA-1 fingerprint:
```bash
cd android
./gradlew signingReport
```

### 3. Supabase Configuration

1. Get your Supabase credentials from your `.env` file:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

2. Update `app/build.gradle.kts`:
```kotlin
buildConfigField("String", "SUPABASE_URL", "\"YOUR_SUPABASE_URL\"")
buildConfigField("String", "SUPABASE_ANON_KEY", "\"YOUR_SUPABASE_ANON_KEY\"")
buildConfigField("String", "GOOGLE_WEB_CLIENT_ID", "\"YOUR_WEB_CLIENT_ID\"")
```

3. Enable Google OAuth in Supabase Dashboard:
   - Go to Authentication → Providers
   - Enable Google provider
   - Add your Web client ID and secret

### 4. Build & Run

```bash
cd android
./gradlew assembleDebug
```

Or open in Android Studio and run on device/emulator.

## Key Files

| File | Description |
|------|-------------|
| `PurrkinPetsApplication.kt` | Hilt application class |
| `MainActivity.kt` | Single activity host |
| `NavGraph.kt` | Navigation setup |
| `AuthRepository.kt` | Google Sign-In logic |
| `ProductRepository.kt` | Product data operations |
| `CartRepository.kt` | Cart operations |

## Currency

All prices are displayed in Bahraini Dinar (BHD) format with 3 decimal places.

## License

Proprietary - Purrkin Pets © 2024
