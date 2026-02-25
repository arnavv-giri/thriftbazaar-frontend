# Backend API Requirements - Quick Reference

## 🎯 Essential Endpoints

### 1️⃣ GET `/products`
**Get all products from all sellers (homepage)**
- No authentication required
- Query params: `?category=JEANS&page=1&limit=20` (optional)
- Response:
```json
[
  {
    "id": "p1",
    "name": "Vintage Jeans",
    "price": 1832,
    "category": "JEANS",
    "condition": "good",
    "size": "M",
    "color": "Blue",
    "material": "100% Cotton",
    "description": "...",
    "images": ["url1", "url2", "url3"],
    "sellerId": "vendor123",
    "seller": "VintageMart Store",
    "rating": 4.8,
    "reviews": 142,
    "isVerified": true,
    "createdAt": "2025-02-25T10:30:00Z"
  }
]
```

---

### 2️⃣ GET `/products/my`
**Get current seller's products (seller dashboard)**
- **Required:** `Authorization: Bearer {token}` header
- Extract `sellerId` from JWT token
- Response: Same as above, but ONLY this seller's products

---

### 3️⃣ POST `/products`
**Create new product (seller)**
- **Required:** `Authorization: Bearer {token}` header
- Extract `sellerId` from JWT token
- Content-Type: `application/json`

**Request Body:**
```json
{
  "name": "Vintage Blue Jeans",
  "price": 1832,
  "category": "JEANS",
  "condition": "good",
  "size": "M",
  "color": "Blue",
  "material": "100% Cotton",
  "description": "Classic vintage...",
  "images": ["image_url1", "image_url2", "image_url3"]
}
```

**Requirements:**
- ✅ Must include at least 3 image URLs
- ✅ price must be > 0
- ✅ sellerId auto-set from token
- ✅ Generate unique product ID
- ✅ Add timestamps: `createdAt`, `updatedAt`

**Response (201 Created):**
```json
{
  "id": "p1234567890",
  "name": "Vintage Blue Jeans",
  "price": 1832,
  "category": "JEANS",
  "condition": "good",
  "size": "M",
  "color": "Blue",
  "material": "100% Cotton",
  "description": "Classic vintage...",
  "images": ["image_url1", "image_url2", "image_url3"],
  "sellerId": "seller123",
  "createdAt": "2025-02-25T10:30:00Z",
  "updatedAt": "2025-02-25T10:30:00Z"
}
```

---

### 4️⃣ PUT `/products/:id`
**Update product (seller only)**
- **Required:** `Authorization: Bearer {token}` header
- Only product owner can update
- All fields optional (only send changed fields)

**Request Body (same as POST, but all fields optional):**
```json
{
  "name": "Vintage Blue Jeans (Updated)",
  "price": 1500,
  "images": ["new_url1", "new_url2", "new_url3"]
}
```

**Business Rules:**
- ✅ Verify sellerID from token matches product.sellerId
- ✅ Return 403 Forbidden if not owner
- ✅ Always update `updatedAt` timestamp
- ✅ Keep original `createdAt`

**Response (200 OK):**
```json
{ "id": "p1", "name": "...", "updatedAt": "2025-02-25T11:00:00Z" }
```

**Error Responses:**
```json
{ "status": 403, "message": "Unauthorized to update this product" }
{ "status": 404, "message": "Product not found" }
```

---

### 5️⃣ DELETE `/products/:id`
**Delete product (seller only)**
- **Required:** `Authorization: Bearer {token}` header
- Only product owner can delete
- Soft delete or hard delete (your choice)

**Business Rules:**
- ✅ Verify sellerID from token matches product.sellerId
- ✅ Return 403 Forbidden if not owner
- ✅ Return 200 OK on success

**Response (200 OK):**
```json
{ "status": "success", "message": "Product deleted" }
```

**Error Responses:**
```json
{ "status": 403, "message": "Unauthorized to delete this product" }
{ "status": 404, "message": "Product not found" }
```

---

### 6️⃣ GET `/products/:id`
**Get single product (OPTIONAL - used in ProductDetails)**
- No authentication required
- Return single product with all details

**Response:**
```json
{
  "id": "p1",
  "name": "Vintage Blue Jeans",
  "price": 1832,
  "images": ["url1", "url2", "url3"],
  ...
}
```

---

## 📋 Database Schema (Suggested)

```sql
CREATE TABLE products (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(50) NOT NULL,
  condition VARCHAR(20) NOT NULL,
  size VARCHAR(10),
  color VARCHAR(100),
  material VARCHAR(100),
  description TEXT,
  images JSON NOT NULL, -- Array of image URLs
  seller_id VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_id) REFERENCES users(id)
);
```

---

## 🔒 Authentication Implementation

**Token Format:** JWT
**Storage:** Frontend stores in `localStorage.getItem("token")`
**Header Format:** `Authorization: Bearer <your_jwt_token>`

**JWT Payload should include:**
```json
{
  "id": "seller123",
  "email": "seller@example.com",
  "role": "seller",
  "iat": 1234567890,
  "exp": 1234571490
}
```

---

## ✅ Validation Rules

| Field | Rules |
|-------|-------|
| `name` | Required, min 3 chars, max 255 |
| `price` | Required, > 0, decimal number |
| `category` | Required, must be in: TSHIRTS, JEANS, SHIRTS, JACKETS, DRESSES, SHOES, ACCESSORIES |
| `condition` | Required, must be: excellent, good, fair |
| `size` | Optional, valid: XS, S, M, L, XL, XXL |
| `images` | Required, minimum 3 URLs, each valid URL |
| `description` | Optional, max 2000 chars |
| `color` | Optional, max 100 chars |
| `material` | Optional, max 100 chars |

---

## 🚀 Test Cases for Backend

### Test 1: Create Product (Success)
```bash
curl -X POST http://localhost:8081/products \
  -H "Authorization: Bearer valid_token" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Jeans",
    "price": 1500,
    "category": "JEANS",
    "condition": "good",
    "size": "M",
    "images": ["url1", "url2", "url3"]
  }'
```
Expected: 201, product created

---

### Test 2: Get Seller's Products
```bash
curl -X GET http://localhost:8081/products/my \
  -H "Authorization: Bearer seller_token"
```
Expected: 200, array of seller's products only

---

### Test 3: Get All Products
```bash
curl -X GET http://localhost:8081/products
```
Expected: 200, array of all products from all sellers

---

### Test 4: Update Product (Not Owner)
```bash
curl -X PUT http://localhost:8081/products/p1 \
  -H "Authorization: Bearer other_seller_token" \
  -H "Content-Type: application/json" \
  -d '{"price": 500}'
```
Expected: 403 Forbidden

---

### Test 5: Delete Product (Owner)
```bash
curl -X DELETE http://localhost:8081/products/p1 \
  -H "Authorization: Bearer seller_token"
```
Expected: 200 OK

---

## 📌 Integration Checkpoint

Frontend is **ready** when backend provides these endpoints at `http://localhost:8081`:
- ✅ GET `/products` (no auth)
- ✅ GET `/products/my` (auth required)
- ✅ POST `/products` (auth required)
- ✅ PUT `/products/:id` (auth required, owner only)
- ✅ DELETE `/products/:id` (auth required, owner only)

Once backend is ready, frontend will:
1. ✅ Load all products on Home page
2. ✅ Show seller-specific dashboard (empty if no products)
3. ✅ Allow add/edit/delete with instant refresh
4. ✅ Display multi-image gallery for each product
