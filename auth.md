# Authentication API Guide

## Overview
This HRMS API uses token-based authentication. You need to obtain a token first, then include it in all subsequent API requests.

## Authentication Flow

### 1. Obtain Authentication Token

**Endpoint:** `POST /api-token-auth/`

**Request Body:**
```json
{
    "username": "your_username",
    "password": "your_password"
}
```

**Example using JavaScript fetch:**
```javascript
const response = await fetch('http://localhost:8000/api-token-auth/', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        username: 'your_username',
        password: 'your_password'
    })
});

const data = await response.json();
const token = data.token;
console.log('Auth Token:', token);
```

**Example using curl:**
```bash
curl -X POST http://localhost:8000/api-token-auth/ \
     -H "Content-Type: application/json" \
     -d '{"username":"your_username","password":"your_password"}'
```

**Response:**
```json
{
    "token": "your_auth_token_here"
}
```

### 2. Use Token for API Requests

Include the token in the Authorization header for all API calls:

**Header Format:**
```
Authorization: Token your_auth_token_here
```

**Example API Request:**
```javascript
const response = await fetch('http://localhost:8000/api/v1/users/profile/', {
    method: 'GET',
    headers: {
        'Authorization': 'Token your_auth_token_here',
        'Content-Type': 'application/json',
    }
});

const userData = await response.json();
```

**Example with curl:**
```bash
curl -H "Authorization: Token your_auth_token_here" \
     http://localhost:8000/api/v1/users/profile/
```

## Cross-Origin Requests (CORS)

The API is configured to allow cross-origin requests from web applications. The following headers are supported:

- `Authorization` - Required for authentication
- `Content-Type` - For JSON requests
- `Accept` - For response format
- Standard CORS headers

## Available API Endpoints

### User Management
- `GET /api/v1/users/profile/` - Get user profile
- `PUT /api/v1/users/profile/` - Update user profile

### Hotel Management
- `GET /api/v1/hotel/rooms/` - List rooms
- `POST /api/v1/hotel/rooms/` - Create room
- `GET /api/v1/hotel/bookings/` - List bookings
- `POST /api/v1/hotel/bookings/` - Create booking

### Restaurant Management
- `GET /api/v1/restaurant/menu-items/` - List menu items
- `POST /api/v1/restaurant/menu-items/` - Create menu item
- `GET /api/v1/restaurant/orders/` - List orders
- `POST /api/v1/restaurant/orders/` - Create order

For a complete list of endpoints, visit: `http://localhost:8000/swagger/`

## Error Handling

### Authentication Errors

**401 Unauthorized:**
```json
{
    "detail": "Invalid token."
}
```

**400 Bad Request (Invalid credentials):**
```json
{
    "non_field_errors": ["Unable to log in with provided credentials."]
}
```

## Complete Login Example

Here's a complete example of logging in and making an authenticated request:

```javascript
async function loginAndFetchData() {
    try {
        // Step 1: Login and get token
        const loginResponse = await fetch('http://localhost:8000/api-token-auth/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: 'admin',
                password: 'admin123'
            })
        });
        
        if (!loginResponse.ok) {
            throw new Error('Login failed');
        }
        
        const loginData = await loginResponse.json();
        const token = loginData.token;
        
        // Step 2: Use token to fetch protected data
        const dataResponse = await fetch('http://localhost:8000/api/v1/users/profile/', {
            method: 'GET',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json',
            }
        });
        
        if (!dataResponse.ok) {
            throw new Error('Failed to fetch data');
        }
        
        const userData = await dataResponse.json();
        console.log('User data:', userData);
        
    } catch (error) {
        console.error('Error:', error);
    }
}

// Call the function
loginAndFetchData();
```

## Security Notes

1. **Store tokens securely** - Use secure storage methods in your frontend application
2. **Token expiry** - Tokens don't expire by default, implement refresh logic if needed
3. **HTTPS in production** - Always use HTTPS in production environments
4. **CORS restrictions** - Restrict CORS origins in production settings

## Production Configuration

For production, update the CORS settings in `core/settings.py`:

```python
# Replace CORS_ALLOW_ALL_ORIGINS = True with:
CORS_ALLOWED_ORIGINS = [
    "https://yourdomain.com",
    "https://www.yourdomain.com",
]
```