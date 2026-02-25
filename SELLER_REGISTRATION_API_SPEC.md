# Seller Registration API Specification

This document contains the frontend implementation details for seller registration. Share this with your backend developer to ensure compatibility.

---

## 1. FRONTEND REGISTRATION REQUEST

### Endpoint Called
```
POST http://localhost:8081/vendors/register
```

### Request Headers
```javascript
{
  "Content-Type": "application/json",
  "Authorization": "Bearer ${token}" // Only if token exists (for subsequent requests)
}
```

### Request Body (JSON)
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "shopName": "My Thrift Shop",
  "description": "Optional shop description"
}
```

### Request Method
```javascript
const res = await api.post("/vendors/register", vendorData);
// Where vendorData contains: { name, email, password, shopName, description }
```

---

## 2. FRONTEND CODE - Registration Form

### File: `src/pages/Register.jsx`

The frontend sends this data:
```javascript
const data = await registerVendor({
  name: formData.name,           // Full name (required)
  email: formData.email,         // Email (required, validated)
  password: formData.password,   // Password (required, min 6 chars)
  shopName: formData.shopName,   // Shop name (required)
  description: formData.description  // Shop description (optional)
});
```

### Validation Rules (Frontend)
- **name**: Required, non-empty
- **email**: Required, valid email format (regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)
- **password**: Required, minimum 6 characters
- **confirmPassword**: Must match password
- **shopName**: Required, non-empty

---

## 3. AXIOS CONFIGURATION & INTERCEPTORS

### File: `src/utils/axios.js`

```javascript
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8081",
  headers: {
    "Content-Type": "application/json",
  },
});

// REQUEST INTERCEPTOR - Automatically attaches JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR - Handles 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## 4. AUTH API FUNCTION

### File: `src/api/authApi.js`

```javascript
import api from "../utils/axios";

export async function registerVendor(vendorData) {
  try {
    const res = await api.post("/vendors/register", vendorData);
    return res.data;
  } catch (error) {
    throw error;
  }
}
```

---

## 5. AUTH UTILITIES

### File: `src/utils/auth.js`

```javascript
export function getToken() {
  return localStorage.getItem("token");
}

export function isLoggedIn() {
  return !!localStorage.getItem("token");
}

export function setToken(token) {
  localStorage.setItem("token", token);
}

export function logout() {
  localStorage.removeItem("token");
  window.location.href = "/login";
}

export function getAuthHeader() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
```

---

## 6. AUTH CONTEXT - Token Storage

### File: `src/context/AuthContext.jsx`

```javascript
export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const login = (token) => {
    localStorage.setItem("token", token);  // Store token here
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

---

## 7. EXPECTED BACKEND RESPONSE

### Success Response (Status: 201 or 200)
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "vendor": {
    "id": "vendor_id_123",
    "name": "John Doe",
    "email": "john@example.com",
    "shopName": "My Thrift Shop",
    "description": "Optional shop description",
    "createdAt": "2024-02-25T10:00:00Z"
  }
}
```

### Error Response (Status: 400, 409, 500)
```json
{
  "message": "Email already registered",
  "error": "DUPLICATE_EMAIL"
}
```

---

## 8. BACKEND IMPLEMENTATION CHECKLIST

What Backend Needs to Implement:

- [ ] **POST /vendors/register** endpoint
  - Accept: `name`, `email`, `password`, `shopName`, `description`
  - Validate required fields
  - Check if email already exists (prevent duplicates)
  - Hash password (bcrypt recommended)
  - Create vendor record in database
  - Generate JWT token
  - Return token + vendor data

- [ ] **Password Requirements**
  - Minimum 6 characters
  - Consider adding strength validation

- [ ] **Email Validation**
  - Check valid email format
  - Check for duplicates before saving

- [ ] **JWT Authentication**
  - Generate token on successful registration
  - Token should contain vendor ID and email
  - Token expiry (recommend 7-30 days)

- [ ] **Error Handling**
  - Return meaningful error messages
  - Proper HTTP status codes (201 for success, 400 for validation, 409 for conflicts)

---

## 9. TESTING THE REGISTRATION

### Test with cURL
```bash
curl -X POST http://localhost:8081/vendors/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Vendor",
    "email": "vendor@test.com",
    "password": "password123",
    "shopName": "Test Shop",
    "description": "Test shop description"
  }'
```

### Test with Postman
1. Set Method: `POST`
2. URL: `http://localhost:8081/vendors/register`
3. Headers: `Content-Type: application/json`
4. Body (raw):
```json
{
  "name": "Test Vendor",
  "email": "vendor@test.com",
  "password": "password123",
  "shopName": "Test Shop",
  "description": "Test shop description"
}
```

---

## 10. COMMON ISSUES & SOLUTIONS

| Issue | Frontend Shows | Backend Should Check |
|-------|--------|--------|
| Email already exists | "Registration failed" | Check for duplicate emails before insert |
| Missing required fields | Validation error on frontend | Return 400 with field name |
| Password too short | User can't submit | Validate min length = 6 |
| Server returns 401 | Auto redirects to /login | Check token generation |
| CORS error | Network error in console | Add CORS headers to backend |

---

## 11. FLOW DIAGRAM

```
User fills form (Register.jsx)
        ↓
Frontend validates all fields
        ↓
Calls registerVendor() → POST /vendors
        ↓
Axios interceptor adds headers
        ↓
Backend receives request
        ↓
Backend validates & saves vendor
        ↓
Backend generates JWT token
        ↓
Backend returns { token, vendor }
        ↓
Frontend stores token in localStorage
        ↓
Frontend calls login() → sets isLoggedIn = true
        ↓
Frontend redirects to /dashboard
```

---

## 12. KEY POINTS FOR BACKEND DEVELOPER

1. **Token Generation**: After successful registration, generate and send a JWT token
2. **CORS**: Ensure backend allows requests from frontend origin (http://localhost:3000 or your frontend port)
3. **Content-Type**: Always accept and return `application/json`
4. **Error Messages**: Send meaningful error messages in response body
5. **Validation**: Validate on backend (don't rely only on frontend validation)
6. **Security**: Hash passwords using bcrypt or similar, never store plain text
7. **Duplicate Prevention**: Check email exists before creating vendor
8. **HTTP Status Codes**:
   - 201 or 200: Success
   - 400: Bad Request (validation error)
   - 409: Conflict (email already exists)
   - 500: Server Error

---

## Contact Points

- Frontend base URL: `http://localhost:8081` (configured in `src/utils/axios.js`)
- Frontend port: Usually 5173 (Vite dev server)
- Expected response format: JSON with `token` and optional `vendor` object
