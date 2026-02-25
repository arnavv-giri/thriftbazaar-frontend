# Backend Implementation Complete - Frontend Integration Guide

## ✅ Backend Changes Completed

The backend developer has completed the Seller Registration API. Here's what's implemented and what the frontend needs to do.

---

## 1. New Public Registration Endpoint

**Endpoint**: `POST /vendors/register`  
**Location**: VendorController.java  
**Access**: Public (no authentication required)  
**Status Code**: 201 Created on success

---

## 2. Request Body Format (Exact)

The frontend sends this exact JSON structure:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "shopName": "My Thrift Shop",
  "description": "Optional shop description"
}
```

**Required Fields**: `name`, `email`, `password`, `shopName`  
**Optional Fields**: `description`

---

## 3. Successful Response (201 Created)

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJlbWFpbCI6ImpvaG5AZXhhbXBsZS5jb20iLCJpYXQiOjE3MDg5NDMyNDAsImV4cCI6MTcwOTU0ODAwMH0.signature...",
  "vendor": {
    "id": 123,
    "storeName": "My Thrift Shop",
    "approved": false,
    "user": {
      "id": 456,
      "email": "john@example.com",
      "role": "VENDOR"
    }
  }
}
```

**Key Point**: Store the `token` in localStorage - this is your JWT authentication token.

---

## 4. Error Responses

### Email Already Exists (409 Conflict)
```json
{
  "error": "Email already registered"
}
```
**Frontend shows**: "This email is already in use. Please use a different email or sign in."

### Missing Required Fields (400 Bad Request)
```json
{
  "error": "Missing required fields"
}
```
**Frontend shows**: "Please fill all required fields."

### Server Error (500)
```json
{
  "error": "Server error occurred"
}
```
**Frontend shows**: "Server error. Please try again later."

---

## 5. Backend Validations Implemented

✅ **Email Uniqueness Check** - Prevents duplicate registrations  
✅ **Required Field Validation** - Checks name, email, password, shopName  
✅ **Password Hashing** - Using BCrypt (never stored plain text)  
✅ **JWT Token Generation** - On successful registration  
✅ **Transaction Safety** - User + Vendor created atomically  
✅ **Default Vendor Status** - `approved: false` (pending approval)

---

## 6. Frontend Changes Made ✅

### ✅ File 1: `src/api/authApi.js`

**CHANGED**:
```javascript
// BEFORE
const res = await api.post("/vendors", vendorData);

// AFTER
const res = await api.post("/vendors/register", vendorData);
```

### ✅ File 2: `src/pages/Register.jsx`

**IMPROVED Error Handling**:
```javascript
try {
  const data = await registerVendor({...});
  
  if (data.token) {
    login(data.token);  // Store token
    navigate("/dashboard");  // Redirect
  }
} catch (err) {
  // Specific error handling for different status codes
  if (err.response?.status === 409) {
    setServerError("This email is already registered...");
  } else if (err.response?.status === 400) {
    setServerError("Please fill all required fields correctly.");
  } else if (err.response?.status === 500) {
    setServerError("Server error. Please try again later.");
  }
}
```

### ✅ File 3: `src/context/AuthContext.jsx` (No Changes Needed)

Already handles token storage correctly:
```javascript
const login = (token) => {
  localStorage.setItem("token", token);  // ✅ Stores JWT
  setIsLoggedIn(true);
};
```

### ✅ File 4: `src/utils/axios.js` (No Changes Needed)

Already sends token automatically:
```javascript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;  // ✅ Attaches JWT
  }
  return config;
});
```

---

## 7. Complete Registration Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│ 1. User fills Register form                                         │
│    (name, email, password, shopName, description)                  │
└────────────────────────┬────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 2. Frontend validates fields (Register.jsx)                         │
│    ✅ Required fields present                                       │
│    ✅ Email format valid                                            │
│    ✅ Password min 6 chars                                          │
│    ✅ Passwords match                                               │
└────────────────────────┬────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 3. Call registerVendor() (authApi.js)                              │
│    POST /vendors/register                                           │
│    Headers: Content-Type: application/json                         │
└────────────────────────┬────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 4. Axios Interceptor attaches JWT (if token exists)                │
│    Authorization: Bearer ${token}                                  │
└────────────────────────┬────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 5. Backend receives request & validates                             │
│    ✅ Email not duplicated                                          │
│    ✅ All required fields present                                   │
│    ✅ Password hashed                                               │
│    ✅ Vendor & User created                                         │
│    ✅ JWT token generated                                           │
└────────────────────────┬────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 6. Backend returns 201 with token & vendor data                    │
│    {                                                                │
│      "token": "eyJhbGciOiJIUzI1NiIs...",                           │
│      "vendor": { id, name, email, shopName, ... },                │
│      "message": "Vendor registered successfully"                  │
│    }                                                               │
└────────────────────────┬────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 7. Frontend receives response                                       │
│    ✅ Extract token from response                                  │
│    ✅ Call login(token) → stores in localStorage                   │
│    ✅ Call navigate("/dashboard")                                  │
│    ✅ Form clears automatically                                    │
└────────────────────────┬────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 8. User redirected to Dashboard                                    │
│    ✅ Token stored & isLoggedIn = true                             │
│    ✅ All subsequent requests include Authorization header         │
│    ✅ Future Navbar shows "Dashboard" & "Logout" buttons           │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 8. Testing Checklist

### ✅ Test Step 1: Verify Endpoint URL
File: `src/api/authApi.js`
```javascript
// Confirm this line exists:
const res = await api.post("/vendors/register", vendorData);
```

### ✅ Test Step 2: Test with Postman
1. **Method**: POST
2. **URL**: `http://localhost:8081/vendors/register`
3. **Headers**: `Content-Type: application/json`
4. **Body** (raw JSON):
```json
{
  "name": "Test Vendor",
  "email": "test-vendor@example.com",
  "password": "password123",
  "shopName": "Test Shop",
  "description": "Test Description"
}
```
5. **Expected Response**: Status 201, with `token` in response

### ✅ Test Step 3: Test Duplicate Email
Use same email as Step 2:
- **Expected Response**: Status 409, message "Email already registered"

### ✅ Test Step 4: Test Missing Fields
Send request without `name`:
- **Expected Response**: Status 400, message "Missing required fields"

### ✅ Test Step 5: Test Frontend Registration Flow
1. Start frontend: `npm run dev`
2. Go to `/register` route
3. Fill form with new email
4. Click "Create Account"
5. **Expected**: Redirect to `/dashboard`, token stored in localStorage

### ✅ Test Step 6: Verify Token Storage
Open Browser DevTools → Application → Local Storage:
- Should see `token` key with JWT value

### ✅ Test Step 7: Verify Subsequent Requests
Check Network tab in DevTools:
- Any API request should include `Authorization: Bearer ${token}` header

---

## 9. Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| 409 Conflict Error | Email already registered | Use a different email address |
| 400 Bad Request | Missing required field | Fill all required fields (name, email, password, shopName) |
| 500 Server Error | Backend crash | Check backend logs, restart backend server |
| CORS Error | Origin mismatch | Verify backend CORS config allows frontend origin |
| Token not storing | localStorage issue | Check browser DevTools → Application → Storage |
| Token not sent in request | Interceptor not working | Verify axios interceptor in `src/utils/axios.js` |
| Still seeing error after fix | Browser cache | Clear browser cache and restart dev server |
| Redirect to /login | 401 Unauthorized | Token expired or invalid, user needs to re-register |

---

## 10. Axios Interceptor Verification

The axios interceptor automatically handles token:

```javascript
// REQUEST: Automatically adds Authorization header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;  // ✅ Attached here
  }
  return config;
});

// RESPONSE: Handles 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";  // Redirect to login
    }
    return Promise.reject(error);
  }
);
```

**Verify this is working**: Check Network tab in DevTools, any API request should have:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

## 11. Success Criteria

✅ User can fill registration form  
✅ Frontend validates all required fields  
✅ Registration POST request sent to `/vendors/register`  
✅ Backend returns 201 with token  
✅ Token stored in localStorage  
✅ AuthContext updated (isLoggedIn = true)  
✅ User redirected to dashboard  
✅ Subsequent API requests include Authorization header  
✅ Duplicate email shows 409 error with proper message  
✅ Missing fields show 400 error with proper message  

---

## 12. Next Steps After Registration Works

Once registration is complete and working:

1. **Update Login Flow**: Ensure login also returns JWT token
2. **Update Dashboard**: Add vendor-specific features
3. **Add Product Upload**: Allow vendors to add products
4. **Add Order Management**: Show vendor orders
5. **Add Seller Search**: Implement vendor search functionality
6. **Add Payment Integration**: Connect Razorpay/Stripe

---

## Quick Reference

| Item | Location | Status |
|------|----------|--------|
| Endpoint | `/vendors/register` | ✅ Live |
| Frontend API File | `src/api/authApi.js` | ✅ Updated |
| Register Form | `src/pages/Register.jsx` | ✅ Updated |
| Error Handling | `src/pages/Register.jsx` | ✅ Improved |
| Token Storage | `src/context/AuthContext.jsx` | ✅ Ready |
| Axios Interceptor | `src/utils/axios.js` | ✅ Ready |
| Spec Document | `SELLER_REGISTRATION_API_SPEC.md` | ✅ Updated |

---

## Questions?

If you encounter issues:
1. Check backend logs for server-side errors
2. Check browser DevTools → Network tab for request/response
3. Check browser DevTools → Console for JavaScript errors
4. Check browser DevTools → Application → Storage for token
5. Run Postman test to isolate frontend vs backend issue

Good luck with testing! 🚀
