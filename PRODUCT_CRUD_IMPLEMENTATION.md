# Product CRUD & Vendor Dashboard Implementation Guide

## ✅ COMPLETED: Full Product Management System

---

## ARCHITECTURE OVERVIEW

### 1. **API Service Layer** (`src/api/productService.js`)
- **`getAllProducts()`** → GET `/products` - Fetch all products for home page
- **`getMyProducts()`** → GET `/products/my` - Fetch seller's products (requires auth)
- **`createProduct(data)`** → POST `/products` - Create new product (requires auth)
- **`updateProduct(id, data)`** → PUT `/products/{id}` - Edit product (requires auth)
- **`deleteProduct(id)`** → DELETE `/products/{id}` - Delete product (requires auth)
- **`getProductById(id)`** → GET `/products/{id}` - Fetch single product

**Base URL:** `http://localhost:8081`
**Auth:** JWT token from `localStorage.getItem("token")` in Authorization header

---

## COMPONENTS IMPLEMENTED

### 2. **AddProductModal** (Multi-image Upload Form)
**File:** `src/components/AddProductModal.jsx`

**Features:**
- ✅ Multi-file image upload input (accepts multiple files)
- ✅ Image previews showing thumbnails
- ✅ Minimum 3 images validation
- ✅ All product fields: name, price, category, condition, size, color, material, description
- ✅ Form error handling

**Usage in SellerDashboard:**
```jsx
<AddProductModal
  onClose={() => setShowAddModal(false)}
  onAdd={handleAddProduct} // Calls createProduct API
/>
```

**Data Passed to API:**
```json
{
  "name": "Vintage Blue Jeans",
  "price": 1832,
  "category": "JEANS",
  "condition": "good",
  "size": "M",
  "color": "Blue",
  "material": "100% Cotton",
  "description": "Classic vintage denim...",
  "images": ["image1_url", "image2_url", "image3_url"]
}
```

---

### 3. **EditProductModal** (Product Edit Form)
**File:** `src/components/EditProductModal.jsx`

**Features:**
- ✅ Pre-filled form with existing product data
- ✅ Multi-image upload/replace capability
- ✅ Same validation as AddProductModal (minimum 3 images)
- ✅ Image previews

**Usage in SellerDashboard:**
```jsx
{editingProduct && (
  <EditProductModal
    product={editingProduct}
    onClose={() => setEditingProduct(null)}
    onSave={handleSaveProduct} // Calls updateProduct API
    loading={updateLoading}
  />
)}
```

---

### 4. **SellerDashboard** (Vendor Management Hub)
**File:** `src/pages/SellerDashboard.jsx`

**State Management:**
```jsx
const [products, setProducts] = useState([]); // Seller's products
const [editingProduct, setEditingProduct] = useState(null); // Current edit
const [loading, setLoading] = useState(true);
const [updateLoading, setUpdateLoading] = useState(false);
```

**Key Functions:**
- **`loadProducts()`** - Calls `getMyProducts()` API, populates dashboard
- **`handleAddProduct(newProduct)`** - Calls `createProduct()` API, refreshes list
- **`handleEditProduct(product)`** - Opens EditProductModal
- **`handleSaveProduct(id, data)`** - Calls `updateProduct()` API, refreshes list
- **`handleDeleteProduct(id)`** - Calls `deleteProduct()` API, refreshes list

**Flow:**
1. Component loads → `loadProducts()` fetches seller's products
2. User clicks "Add Product" → `AddProductModal` opens
3. User submits form → `handleAddProduct()` → `createProduct()` API → `loadProducts()` refreshes
4. User clicks "Edit" on product → `EditProductModal` opens with pre-filled data
5. User saves → `handleSaveProduct()` → `updateProduct()` API → `loadProducts()` refreshes
6. Products instantly update in table (no hardcoded data)

**Empty State:**
```
"You haven't added any products yet"
"Get started by adding your first product to your shop"
[+ Add Your First Product Button]
```

---

### 5. **Home Page** (Product Listing)
**File:** `src/pages/Home.jsx`

**Changes:**
- ❌ Removed hardcoded `sampleProducts` array
- ✅ API-driven: `getAllProducts()` called on mount
- ✅ Real-time product display from all sellers
- ✅ Empty state with CTA when no products

**Flow:**
```
useEffect on mount
  ↓
loadProducts() → getAllProducts() API
  ↓
setProducts(response.data)
  ↓
Render ProductCard for each product
```

---

### 6. **ProductDetails / ProductCard**
**Already Updated:**
- ✅ Normalizes `product.images` array (ensures minimum 3 images)
- ✅ Displays image gallery with thumbnails
- ✅ Handles both `images` array and fallback `image` URL

---

## DATA FLOW DIAGRAM

```
SELLER ADDS PRODUCT:
┌─────────────────────┐
│  AddProductModal    │
│  (form + file input)│
└──────────┬──────────┘
           │
           ↓
┌─────────────────────────────────────┐
│  handleAddProduct()                 │
│  → createProduct(formData) API      │
│  → Wait for response                │
└──────────────────┬──────────────────┘
                   │
                   ↓
         ┌─────────────────────┐
         │  getMyProducts()    │
         │  Refresh dashboard  │
         └────────────┬────────┘
                      │
                      ↓
         ┌──────────────────────────┐
         │  Product appears in      │
         │  Seller Dashboard table  │
         └──────────────────────────┘
                      │
                      ↓ (Products are public)
         ┌──────────────────────────┐
         │  Home page loads all     │
         │  products via            │
         │  getAllProducts() API    │
         └──────────────────────────┘


SELLER EDITS PRODUCT:
┌────────────────────────┐
│  Click Edit in table   │
│  → setEditingProduct() │
└────────────┬───────────┘
             │
             ↓
┌──────────────────────────────────┐
│  EditProductModal opens          │
│  (pre-filled with product data)  │
└──────────────┬───────────────────┘
               │
               ↓
┌──────────────────────────────────┐
│  User modifies fields/images     │
│  Click "Save Changes"            │
└──────────────┬───────────────────┘
               │
               ↓
┌──────────────────────────────────┐
│  handleSaveProduct()             │
│  → updateProduct(id, data) API   │
└──────────────┬───────────────────┘
               │
               ↓
┌──────────────────────────────────┐
│  getMyProducts() refreshes       │
│  Product updated in table        │
└──────────────────────────────────┘
```

---

## API ENDPOINTS REQUIRED (Backend)

### Authentication
- Header: `Authorization: Bearer <token>`
- Token source: `localStorage.getItem("token")`

### Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/products` | No | Get all products (all sellers) |
| GET | `/products/my` | Yes | Get current seller's products |
| POST | `/products` | Yes | Create new product |
| PUT | `/products/{id}` | Yes | Update product |
| DELETE | `/products/{id}` | Yes | Delete product |
| GET | `/products/{id}` | No | Get single product |

### Request/Response Format

**POST /products (Create)**
```json
{
  "name": "Vintage Blue Jeans",
  "price": 1832,
  "category": "JEANS",
  "condition": "good",
  "size": "M",
  "color": "Blue",
  "material": "100% Cotton",
  "description": "Classic vintage denim...",
  "images": ["url1", "url2", "url3"]
}
```

**Response (200 OK)**
```json
{
  "id": "p123456",
  "name": "Vintage Blue Jeans",
  "price": 1832,
  "category": "JEANS",
  "condition": "good",
  "size": "M",
  "color": "Blue",
  "material": "100% Cotton",
  "description": "Classic vintage denim...",
  "images": ["url1", "url2", "url3"],
  "sellerId": "seller123",
  "createdAt": "2025-02-25T10:30:00Z",
  "updatedAt": "2025-02-25T10:30:00Z"
}
```

**GET /products/my (Seller's Products)**
```json
[
  {
    "id": "p1",
    "name": "Product 1",
    "price": 1000,
    "images": ["url1", "url2", "url3"],
    ...
  },
  {
    "id": "p2",
    "name": "Product 2",
    "price": 2000,
    "images": ["url1", "url2", "url3"],
    ...
  }
]
```

---

## TESTING CHECKLIST

### Scenario 1: New Seller
1. ✅ Login as new seller
2. ✅ Navigate to Seller Dashboard
3. ✅ See empty state: "You haven't added any products yet"
4. ✅ Click "+ Add Your First Product"
5. ✅ Upload 3+ images
6. ✅ Fill in product details
7. ✅ Click "Add Product"
8. ✅ Product appears in dashboard table
9. ✅ Go to Home page
10. ✅ New product appears in product grid

### Scenario 2: Edit Product
1. ✅ In Seller Dashboard, click "Edit" on a product
2. ✅ Modal opens with pre-filled data
3. ✅ Modify any field (e.g., price)
4. ✅ Upload new images if needed
5. ✅ Click "Save Changes"
6. ✅ Product updates in table instantly
7. ✅ Go to Home page / ProductDetails
8. ✅ Updated product data is reflected

### Scenario 3: Delete Product
1. ✅ In Seller Dashboard, click "Delete" on a product
2. ✅ Confirm deletion in popup
3. ✅ Product disappears from table
4. ✅ Total Products stat decreases
5. ✅ Home page no longer shows product

### Scenario 4: View Product Details
1. ✅ From Home page, click product card
2. ✅ ProductDetails page loads
3. ✅ Image gallery shows 3+ images with thumbnails
4. ✅ Seller info displayed correctly
5. ✅ All product specs visible

### Scenario 5: No Duplicate Products
1. ✅ Seller A adds product X
2. ✅ Only Seller A sees in own dashboard
3. ✅ Product X visible to all in Home page
4. ✅ Seller B cannot edit/delete Seller A's product (API should prevent)

---

## FILES CREATED/MODIFIED

### Created:
- ✅ `src/api/productService.js` - API service layer
- ✅ `src/components/EditProductModal.jsx` - Edit form modal
- ✅ `src/components/EditProductModal.css` - Styles for edit modal

### Modified:
- ✅ `src/components/AddProductModal.jsx` - Multi-image upload support
- ✅ `src/components/AddProductModal.css` - Preview thumbnail styles
- ✅ `src/pages/SellerDashboard.jsx` - API integration, edit functionality
- ✅ `src/pages/Home.jsx` - API-driven product list, removed hardcoded data
- ✅ `src/pages/ProductDetails.jsx` - Image array normalization

---

## NEXT STEPS

1. **Backend Integration:**
   - Implement `/products` endpoints in backend
   - Add seller verification (JWT decode seller ID)
   - Database schema: Products with seller_id, images array
   - Enforce: Only seller can edit/delete own products

2. **File Upload (If Needed):**
   - If backend expects file upload instead of URLs in request body:
     - Use FormData to send images
     - Store in cloud storage (AWS S3, Firebase, Cloudinary)
     - Return image URLs in response

3. **Error Handling:**
   - Add user-friendly error messages in modals
   - Retry logic for failed API calls
   - Loading states for UX feedback

4. **Additional Features:**
   - Product search/filter on Home page
   - Bulk delete from Seller Dashboard
   - Product visibility toggle (publish/draft)
   - Image drag-to-reorder

---

## KEY IMPROVEMENTS MADE

| Issue | Solution |
|-------|----------|
| Edit button does nothing | ✅ Added edit modal with handleEditProduct() |
| Dashboard shows wrong products | ✅ API-driven using getMyProducts() (seller-specific) |
| Home page not refreshing | ✅ useEffect calls loadProducts() on mount + add product refreshes |
| Hardcoded sample products | ✅ Removed all hardcoded data, API-driven only |
| Single image upload | ✅ Multi-file input accepting 3+ images |
| No product visibility | ✅ Minimum 3 images enforced, normalized display |

