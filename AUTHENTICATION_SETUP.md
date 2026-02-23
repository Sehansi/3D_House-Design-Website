# Authentication & Authorization Setup

## Backend Implementation

### 1. Authentication Middleware (`backend/middleware/auth.js`)
- **auth**: Requires valid JWT token, adds user to request
- **optionalAuth**: Checks for token but doesn't fail if missing

### 2. Auth Routes (`backend/routes/auth.js`)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)
- `POST /api/auth/verify` - Verify JWT token
- `POST /api/auth/logout` - Logout user (Protected)
- `POST /api/auth/forgot-password` - Request password reset

### 3. Protected Design Routes (`backend/routes/designs.js`)
All design routes now require authentication:
- `POST /api/designs/create` - Create design (Protected)
- `GET /api/designs/my-designs` - Get current user's designs (Protected)
- `GET /api/designs/user/:userId` - Get user designs (Protected, own only)
- `GET /api/designs/:id` - Get single design (Protected, own only)
- `PUT /api/designs/:id` - Update design (Protected, own only)
- `DELETE /api/designs/:id` - Delete design (Protected, own only)
- `POST /api/designs/preview` - Generate preview (Public)

## Frontend Implementation

### 1. Auth Context (`frontend/src/context/AuthContext.js`)
Provides global authentication state:
- `user` - Current user object
- `token` - JWT token
- `loading` - Loading state
- `isAuthenticated` - Boolean auth status
- `login(email, password)` - Login function
- `register(fullName, email, password)` - Register function
- `logout()` - Logout function

### 2. Protected Route Component (`frontend/src/components/ProtectedRoute.js`)
Wrapper component that:
- Shows loading spinner while checking auth
- Redirects to /signin if not authenticated
- Renders children if authenticated

### 3. Updated Pages
- **SignIn.js** - Uses `useAuth()` hook for login
- **Register.js** - Uses `useAuth()` hook for registration
- **App.js** - Wrapped with `<AuthProvider>`

## Usage Examples

### Backend - Protecting a Route
```javascript
const { auth } = require('../middleware/auth');

router.get('/protected-route', auth, async (req, res) => {
  // req.user contains user data
  // req.userId contains user ID
  res.json({ user: req.user });
});
```

### Frontend - Using Auth Context
```javascript
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();
  
  return (
    <div>
      {isAuthenticated ? (
        <>
          <p>Welcome {user.fullName}</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <p>Please login</p>
      )}
    </div>
  );
}
```

### Frontend - Protected Route
```javascript
import ProtectedRoute from './components/ProtectedRoute';

<Route 
  path="/profile" 
  element={
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  } 
/>
```

### Frontend - API Call with Token
```javascript
const { token } = useAuth();

const response = await fetch('http://localhost:5000/api/designs/my-designs', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

## Security Features

1. **JWT Token Authentication** - Secure token-based auth
2. **Password Hashing** - Bcrypt password encryption
3. **Token Expiration** - 7-day token validity
4. **Authorization Checks** - Users can only access their own data
5. **Input Validation** - All inputs validated before processing
6. **Error Handling** - Proper error messages without exposing sensitive info

## Token Storage

- Tokens stored in `localStorage`
- Automatically included in API requests
- Removed on logout
- Verified on app load

## Next Steps

To use protected routes in your app:

1. Wrap routes with `<ProtectedRoute>` component
2. Use `useAuth()` hook to access user data
3. Include token in API requests using Authorization header
4. Handle logout by calling `logout()` from context
