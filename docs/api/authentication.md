# Note Weaver Authentication

This document provides detailed information about the authentication system used in Note Weaver, including authentication flows, security considerations, and best practices.

## Authentication Provider

Note Weaver uses Supabase Auth for authentication, which provides a secure, scalable, and feature-rich authentication system. Supabase Auth supports various authentication methods, including:

- Email and password
- Magic link (passwordless)
- OAuth providers (Google, GitHub, etc.)
- Phone authentication

## Authentication Flows

### Email and Password Authentication

1. **Sign Up**:
   - User provides email and password
   - Supabase validates the email and password
   - Supabase creates a new user record
   - Supabase sends a confirmation email (if email confirmation is enabled)
   - User confirms their email by clicking the link in the email
   - User is now registered and can sign in

2. **Sign In**:
   - User provides email and password
   - Supabase validates the credentials
   - If valid, Supabase returns a JWT token
   - The JWT token is stored in the browser's local storage
   - User is now authenticated and can access protected resources

3. **Sign Out**:
   - User requests to sign out
   - The JWT token is removed from local storage
   - User is now signed out and cannot access protected resources

### Magic Link Authentication

1. **Request Magic Link**:
   - User provides email
   - Supabase sends a magic link to the email
   - User clicks the magic link in the email
   - Supabase validates the link and creates a session
   - User is now authenticated and can access protected resources

## JWT Tokens

Supabase Auth uses JWT (JSON Web Tokens) for authentication. JWT tokens are secure, stateless, and can contain claims about the user.

### Token Structure

A JWT token consists of three parts:

1. **Header**: Contains the token type and signing algorithm
2. **Payload**: Contains claims about the user, such as user ID, email, and expiration time
3. **Signature**: Used to verify that the token has not been tampered with

### Token Lifecycle

- **Access Token**: Short-lived token (1 hour by default) used to access protected resources
- **Refresh Token**: Long-lived token (1 week by default) used to obtain a new access token when the current one expires

### Token Storage

JWT tokens are stored in the browser's local storage. This allows the tokens to persist across page refreshes and browser sessions.

## Security Considerations

### HTTPS

All communication between the client and server should be over HTTPS to prevent man-in-the-middle attacks and eavesdropping.

### CORS

Cross-Origin Resource Sharing (CORS) is configured to allow only specific origins to access the API. This prevents unauthorized websites from making requests to the API.

### XSS Protection

To protect against Cross-Site Scripting (XSS) attacks, the application:

- Uses React's built-in XSS protection
- Sanitizes user input before rendering
- Sets appropriate Content Security Policy (CSP) headers

### CSRF Protection

To protect against Cross-Site Request Forgery (CSRF) attacks, the application:

- Uses JWT tokens for authentication, which are not vulnerable to CSRF
- Implements proper CORS configuration
- Uses SameSite cookies for additional protection

## Best Practices

### Token Handling

- Store tokens securely in local storage or HTTP-only cookies
- Include tokens in the Authorization header for API requests
- Refresh tokens before they expire
- Remove tokens when the user signs out

### Error Handling

- Provide clear error messages for authentication failures
- Do not reveal sensitive information in error messages
- Log authentication errors for monitoring and debugging

### Rate Limiting

- Implement rate limiting for authentication endpoints to prevent brute force attacks
- Use exponential backoff for repeated failed authentication attempts

## API Endpoints

### Sign Up

```
POST /auth/v1/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

### Sign In

```
POST /auth/v1/token
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

### Sign Out

```
POST /auth/v1/logout
Authorization: Bearer <access_token>
```

### Refresh Token

```
POST /auth/v1/token
Content-Type: application/json

{
  "refresh_token": "<refresh_token>"
}
```

## Example: Authentication Flow in React

```javascript
import { supabase } from '../config/supabase'

// Sign up
const signUp = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    
    if (error) {
      throw error
    }
    
    return data
  } catch (error) {
    console.error('Error signing up:', error)
    throw error
  }
}

// Sign in
const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      throw error
    }
    
    return data
  } catch (error) {
    console.error('Error signing in:', error)
    throw error
  }
}

// Sign out
const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      throw error
    }
  } catch (error) {
    console.error('Error signing out:', error)
    throw error
  }
}

// Get current session
const getSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      throw error
    }
    
    return data.session
  } catch (error) {
    console.error('Error getting session:', error)
    throw error
  }
}

// Listen for auth changes
const onAuthStateChange = (callback) => {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session)
  })
  
  return data.subscription
}
```

## Troubleshooting

### Common Issues

1. **Invalid Credentials**:
   - Ensure the email and password are correct
   - Check if the user has confirmed their email (if email confirmation is enabled)

2. **Token Expired**:
   - Refresh the token using the refresh token
   - If the refresh token is also expired, the user needs to sign in again

3. **CORS Errors**:
   - Ensure the client's origin is allowed in the CORS configuration
   - Check if the request includes the correct headers

4. **Network Errors**:
   - Check the network connection
   - Ensure the API server is running and accessible

### Debugging

- Check the browser console for error messages
- Use the network tab in the browser's developer tools to inspect API requests and responses
- Enable debug mode in Supabase for more detailed error messages

