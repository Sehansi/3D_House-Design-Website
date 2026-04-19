# 3D House Design Web Application - Code Documentation
## File Structure and Implementation Details for Interim Report

---

## 📁 Project Structure Overview

```
3D_House_Design_webapp/
├── backend/                    # Server-side application
│   ├── config/                # Configuration files
│   ├── models/                # Database schemas
│   ├── routes/                # API endpoints
│   ├── middleware/            # Authentication middleware
│   └── server.js              # Main server file
│
├── frontend/                   # Client-side application
│   ├── src/
│   │   ├── pages/            # React page components
│   │   ├── components/       # Reusable React components
│   │   ├── styles/           # CSS styling files
│   │   ├── context/          # React Context for state management
│   │   ├── services/         # API service layer
│   │   └── App.js            # Main React application
│   └── public/               # Static assets
│
└── README.md                  # Project documentation
```

---

## 🔧 Backend Files (Node.js + Express)

### 1. Server Configuration

**File:** `backend/server.js`  
**Purpose:** Main entry point for the backend server  
**Caption for Report:** "Figure X.X: Main server configuration implementing Express.js with CORS, MongoDB connection, and API route registration"

**What it does:**
- Initializes Express.js server on port 5000
- Connects to MongoDB Atlas cloud database
- Configures CORS for cross-origin requests
- Registers all API routes
- Implements fallback routes when MongoDB is unavailable

**Key Code Snippet:**
```javascript
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Register routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/designs', require('./routes/designs'));
app.use('/api/ai-designer', require('./routes/ai-designer'));
```

---

### 2. Database Configuration

**File:** `backend/config/db.js`  
**Purpose:** MongoDB Atlas connection configuration  
**Caption for Report:** "Figure X.X: MongoDB Atlas cloud database connection implementation using Mongoose ODM"

**What it does:**
- Establishes connection to MongoDB Atlas
- Handles connection errors
- Provides connection status feedback

---

### 3. Database Models

#### User Model
**File:** `backend/models/User.js`  
**Purpose:** User schema definition for authentication  
**Caption for Report:** "Figure X.X: User model schema with bcrypt password hashing and favorites array"

**What it does:**
- Defines user data structure (fullName, email, password, favorites)
- Implements password hashing using bcrypt
- Stores user creation and update timestamps

**Key Fields:**
```javascript
{
  fullName: String,
  email: String (unique, required),
  password: String (hashed with bcrypt),
  favorites: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}
```

#### Design Model
**File:** `backend/models/Design.js`  
**Purpose:** Parametric design schema  
**Caption for Report:** "Figure X.X: Design model schema storing parametric house parameters and 3D model data"

**What it does:**
- Stores parametric design parameters (bedrooms, bathrooms, area, floors)
- Stores finish selections (wall color, floor type, roof type)
- Links designs to user accounts
- Stores generated 3D model data

**Key Fields:**
```javascript
{
  user: ObjectId (reference to User),
  name: String,
  parameters: {
    bedrooms: Number,
    bathrooms: Number,
    totalArea: Number,
    floors: Number,
    style: String
  },
  finishes: {
    wallColor: String,
    floorType: String,
    roofType: String
  },
  modelData: Object
}
```

#### AI Design Model
**File:** `backend/models/AIDesign.js`  
**Purpose:** AI-generated design schema  
**Caption for Report:** "Figure X.X: AI Design model schema storing AI-generated parameters, color palettes, and design suggestions"

**What it does:**
- Stores AI-generated design data
- Stores user prompts and uploaded image URLs
- Stores AI suggestions and recommendations
- Links to user accounts


---

### 4. API Routes (Backend Endpoints)

#### Authentication Routes
**File:** `backend/routes/auth.js`  
**Purpose:** User authentication API endpoints  
**Caption for Report:** "Figure X.X: Authentication API implementation with JWT token generation and bcrypt password hashing"

**What it does:**
- POST `/api/auth/register` - User registration with password hashing
- POST `/api/auth/login` - User login with JWT token generation
- POST `/api/auth/forgot-password` - Password reset functionality

**Key Features:**
- Bcrypt password hashing (10 rounds)
- JWT token generation (24-hour expiry)
- Email validation
- Password strength validation

**Fallback File:** `backend/routes/auth-fallback.js` - In-memory authentication when MongoDB unavailable

---

#### Design Routes
**File:** `backend/routes/designs.js`  
**Purpose:** Parametric design CRUD operations  
**Caption for Report:** "Figure X.X: RESTful API endpoints for parametric design creation, retrieval, update, and deletion with 3D model generation algorithm"

**What it does:**
- POST `/api/designs/create` - Save parametric design to database
- POST `/api/designs/preview` - Generate 3D model preview without saving
- GET `/api/designs/my-designs` - Retrieve user's saved designs
- GET `/api/designs/:id` - Retrieve single design by ID
- PUT `/api/designs/:id` - Update existing design
- DELETE `/api/designs/:id` - Delete design

**Key Algorithm:**
```javascript
function generateModelData(parameters, finishes) {
  // Calculate room dimensions based on total area
  const areaPerFloor = totalArea / floors;
  const roomCount = bedrooms + bathrooms + kitchen + livingRoom;
  const avgRoomArea = areaPerFloor / roomCount;
  
  // Generate room layout with positions and dimensions
  // Returns 3D model data structure
}
```

---

#### AI Designer Routes
**File:** `backend/routes/ai-designer.js`  
**Purpose:** AI-powered design generation API  
**Caption for Report:** "Figure X.X: AI Designer API with PDF upload handling, feature detection simulation, and intelligent design parameter generation"

**What it does:**
- POST `/api/ai-designer/generate` - Generate design from text description
- POST `/api/ai-designer/upload-plan` - Process uploaded PDF floor plans
- POST `/api/ai-designer/save` - Save AI-generated design
- POST `/api/ai-designer/refine` - Refine existing design with AI
- GET `/api/ai-designer/my-designs` - Retrieve user's AI designs
- DELETE `/api/ai-designer/:id` - Delete AI design

**Key Features:**
- Multer file upload middleware (10MB limit, PDF validation)
- Style-based color palette generation
- Material recommendations by style
- Room-specific furniture suggestions
- AI suggestion algorithm

**AI Suggestion Algorithm:**
```javascript
function generateSuggestions(style, roomType, budget) {
  // Style-based suggestions
  if (style === 'modern') {
    suggestions.push('Use clean lines and minimal ornamentation');
    suggestions.push('Incorporate smart home technology');
  }
  
  // Room-based suggestions
  if (roomType === 'living room') {
    suggestions.push('Create focal point with artwork');
  }
  
  // Budget-based suggestions
  if (budget === 'high') {
    suggestions.push('Invest in statement pieces');
  }
  
  return suggestions;
}
```

---

#### Favorites Routes
**File:** `backend/routes/favorites.js`  
**Purpose:** User favorites management  
**Caption for Report:** "Figure X.X: Favorites system API allowing users to save and manage preferred designs"

**What it does:**
- POST `/api/favorites/toggle` - Add/remove design from favorites
- GET `/api/favorites` - Retrieve user's favorite designs

**Fallback File:** `backend/routes/favorites-fallback.js` - In-memory favorites when MongoDB unavailable

---

#### Gallery Routes
**File:** `backend/routes/gallery.js`  
**Purpose:** Public design gallery API  
**Caption for Report:** "Figure X.X: Gallery API providing public access to design showcase with filtering capabilities"

**What it does:**
- GET `/api/gallery` - Retrieve all public designs
- GET `/api/gallery/:id` - Retrieve single gallery item

---

#### Furniture Routes
**File:** `backend/routes/furniture.js`  
**Purpose:** Furniture customization API  
**Caption for Report:** "Figure X.X: Furniture management API for room-by-room furniture selection and customization"

**What it does:**
- GET `/api/furniture/rooms` - Get available room types
- GET `/api/furniture/:roomType` - Get furniture options for specific room
- POST `/api/furniture/save` - Save furniture layout

---

### 5. Middleware

**File:** `backend/middleware/auth.js`  
**Purpose:** JWT authentication middleware  
**Caption for Report:** "Figure X.X: JWT authentication middleware protecting private API endpoints"

**What it does:**
- Verifies JWT tokens from Authorization header
- Extracts user ID from token
- Protects private routes
- Returns 401 Unauthorized for invalid tokens

**Key Code:**
```javascript
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

---

## 🎨 Frontend Files (React.js)

### 1. Main Application

**File:** `frontend/src/App.js`  
**Purpose:** Main React application with routing  
**Caption for Report:** "Figure X.X: React application root component implementing React Router for client-side navigation"

**What it does:**
- Configures React Router with all application routes
- Wraps application with AuthContext provider
- Defines route paths for all pages
- Implements protected routes for authenticated users

**Routes:**
```javascript
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/signin" element={<SignIn />} />
  <Route path="/register" element={<Register />} />
  <Route path="/designer" element={<Designer />} />
  <Route path="/ai-designer" element={<AIDesigner />} />
  <Route path="/viewer" element={<Viewer3D />} />
  <Route path="/furniture-customizer" element={<FurnitureCustomizer />} />
  <Route path="/gallery" element={<Gallery />} />
  <Route path="/profile" element={<Profile />} />
</Routes>
```

---

### 2. Authentication Context

**File:** `frontend/src/context/AuthContext.js`  
**Purpose:** Global authentication state management  
**Caption for Report:** "Figure X.X: React Context API implementation for global authentication state management with localStorage persistence"

**What it does:**
- Manages user authentication state globally
- Stores JWT token in localStorage
- Provides login, logout, register functions
- Persists authentication across page refreshes
- Provides useAuth hook for components

**Key Functions:**
```javascript
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  
  const login = async (email, password) => {
    // API call to /api/auth/login
    // Store token in localStorage
    // Update user state
  };
  
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
  };
  
  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

---

### 3. Page Components

#### Home Page
**File:** `frontend/src/pages/Home.js`  
**Purpose:** Landing page with hero section  
**Caption for Report:** "Figure X.X: Home page component featuring hero section, feature highlights, and call-to-action buttons"

**What it does:**
- Displays hero section with background image
- Shows key features of the application
- Provides navigation to main features
- Responsive design for all devices


#### Sign In Page
**File:** `frontend/src/pages/SignIn.js`  
**Purpose:** User login interface  
**Caption for Report:** "Figure X.X: Sign In page component with form validation and JWT authentication integration"

**What it does:**
- Provides email and password input fields
- Validates user credentials
- Calls authentication API
- Stores JWT token on successful login
- Redirects to profile page after login
- Shows error messages for invalid credentials

**Key Features:**
- Form validation
- Error handling
- Loading states
- Responsive design

---

#### Register Page
**File:** `frontend/src/pages/Register.js`  
**Purpose:** User registration interface  
**Caption for Report:** "Figure X.X: Registration page component with password strength validation and email format checking"

**What it does:**
- Collects user information (full name, email, password)
- Validates email format
- Enforces password strength requirements
- Calls registration API
- Automatically logs in user after registration
- Shows success/error messages

---

#### Parametric Designer Page
**File:** `frontend/src/pages/Designer.js`  
**Purpose:** 3-step parametric house design wizard  
**Caption for Report:** "Figure X.X: Parametric Designer component implementing 3-step wizard for house parameter specification, finish selection, and design preview"

**What it does:**
- **Step 1**: Collect house parameters (bedrooms, bathrooms, area, floors, style)
- **Step 2**: Select finishes (wall color, floor type, roof type)
- **Step 3**: Review and generate 3D preview
- Saves designs to database
- Navigates to 3D viewer with generated model

**Key State Management:**
```javascript
const [parameters, setParameters] = useState({
  bedrooms: 3,
  bathrooms: 2,
  kitchen: true,
  livingRoom: true,
  totalArea: 2000,
  floors: 1,
  style: 'modern'
});

const [finishes, setFinishes] = useState({
  wallColor: '#ffffff',
  floorType: 'tile',
  roofType: 'sloped'
});
```

**API Integration:**
```javascript
const handleSave = async () => {
  const response = await fetch('http://localhost:5000/api/designs/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ name: designName, parameters, finishes })
  });
};
```

---

#### AI Designer Page
**File:** `frontend/src/pages/AIDesigner.js`  
**Purpose:** AI-powered design generation with image/PDF upload  
**Caption for Report:** "Figure X.X: AI Designer component with dual-mode input (text description and PDF upload), style selection, and real-time 3D preview using Three.js"

**What it does:**
- **Text Mode**: Generate design from text description
- **PDF Mode**: Upload floor plan PDF for automatic feature detection
- Style selection (Modern, Traditional, Minimalist, Luxury, etc.)
- Room type selection (Living Room, Bedroom, Kitchen, etc.)
- Budget range selection (Low, Medium, High)
- Real-time 3D preview with Three.js
- AI-generated color palettes, materials, and furniture suggestions
- Design refinement with AI feedback
- Save designs to database

**Key Features:**
```javascript
const [uploadMode, setUploadMode] = useState('text'); // 'text' or 'pdf'
const [prompt, setPrompt] = useState('');
const [uploadedFile, setUploadedFile] = useState(null);
const [generatedDesign, setGeneratedDesign] = useState(null);

const handleGenerate = async () => {
  const response = await fetch('http://localhost:5000/api/ai-designer/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, style, roomType, budget })
  });
  const data = await response.json();
  setGeneratedDesign(data.data);
};
```

**PDF Upload Handling:**
```javascript
const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  const formData = new FormData();
  formData.append('pdf', file);
  formData.append('style', style);
  
  const response = await fetch('http://localhost:5000/api/ai-designer/upload-plan', {
    method: 'POST',
    body: formData
  });
};
```

---

#### 3D Viewer Page
**File:** `frontend/src/pages/Viewer3D.js`  
**Purpose:** Interactive 3D house model visualization  
**Caption for Report:** "Figure X.X: 3D Viewer component using Three.js and React Three Fiber for interactive house model rendering with orbit controls and interior view mode"

**What it does:**
- Renders 3D house models using Three.js
- Provides orbit camera controls (rotate, zoom, pan)
- Interior view mode with transparent walls
- Displays furniture within rooms
- Multiple pre-built house models (Basic, Modern Villa, Garden House)
- Customizable wall colors
- Grid toggle option
- Advanced lighting with shadows

**Three.js Integration:**
```javascript
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';

<Canvas shadows>
  <PerspectiveCamera makeDefault position={[15, 10, 15]} />
  <OrbitControls enableDamping dampingFactor={0.05} />
  
  <ambientLight intensity={0.5} />
  <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
  
  {/* 3D House Model */}
  <HouseModel modelData={modelData} />
</Canvas>
```

---

#### Furniture Customizer Page
**File:** `frontend/src/pages/FurnitureCustomizer.js`  
**Purpose:** Room-by-room furniture selection and placement  
**Caption for Report:** "Figure X.X: Furniture Customizer component enabling room-specific furniture selection with real-time 3D preview"

**What it does:**
- Select room type (Living Room, Bedroom, Dining Room)
- Add furniture items to rooms:
  - Living Room: Sofa, TV Stand, Coffee Table
  - Bedroom: Bed, Wardrobe, TV Stand
  - Dining Room: Dining Table with Chairs
- Remove individual furniture items
- Clear entire room
- Real-time 3D preview with Three.js
- Save furniture layouts

**State Management:**
```javascript
const [selectedRoom, setSelectedRoom] = useState('living');
const [furniture, setFurniture] = useState({
  living: [],
  bedroom: [],
  dining: []
});

const addFurniture = (item) => {
  setFurniture(prev => ({
    ...prev,
    [selectedRoom]: [...prev[selectedRoom], item]
  }));
};
```

---

#### Gallery Page
**File:** `frontend/src/pages/Gallery.js`  
**Purpose:** Browse and filter design projects  
**Caption for Report:** "Figure X.X: Gallery component displaying design showcase with category filtering and favorites system"

**What it does:**
- Display grid of design projects
- Filter by category (All, Modern, Traditional, etc.)
- Add designs to favorites (heart button)
- View design details
- Responsive grid layout

**Favorites Integration:**
```javascript
const handleToggleFavorite = async (designId) => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:5000/api/favorites/toggle', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ designId })
  });
};
```

---

#### Profile Page
**File:** `frontend/src/pages/Profile.js`  
**Purpose:** User profile and saved designs management  
**Caption for Report:** "Figure X.X: Profile page component displaying user information and saved design projects with CRUD operations"

**What it does:**
- Display user information
- Show saved parametric designs
- Show saved AI designs
- Delete designs
- View design details
- Navigate to design editor

---

#### Contact Page
**File:** `frontend/src/pages/Contact.js`  
**Purpose:** Contact form for user inquiries  
**Caption for Report:** "Figure X.X: Contact page component with form validation and email submission"

**What it does:**
- Collect user inquiries (name, email, message)
- Validate form inputs
- Submit to backend API
- Show success/error messages

---

### 4. Reusable Components

#### 3D House Model Component
**File:** `frontend/src/components/HouseModel3D.js`  
**Purpose:** Reusable 3D house model component  
**Caption for Report:** "Figure X.X: HouseModel3D component implementing Three.js geometry for walls, floors, roof, windows, doors, and furniture with style-based color customization"

**What it does:**
- Renders 3D house structure (walls, floor, roof)
- Adds windows and doors
- Places furniture based on room type
- Applies style-based colors
- Implements lighting
- Optimized for performance

**Three.js Geometry:**
```javascript
function HouseModel3D({ style, roomType }) {
  const wallColor = getColorByStyle(style);
  
  return (
    <group>
      {/* Floor */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[8, 0.1, 8]} />
        <meshStandardMaterial color="#d4a574" />
      </mesh>
      
      {/* Walls */}
      <mesh position={[0, 2, -4]} castShadow>
        <boxGeometry args={[8, 4, 0.2]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>
      
      {/* Furniture based on room type */}
      {roomType === 'living room' && (
        <mesh position={[-2, 0.4, 0]} castShadow>
          <boxGeometry args={[2, 0.8, 1]} />
          <meshStandardMaterial color="#4a4a4a" />
        </mesh>
      )}
    </group>
  );
}
```

---

### 5. API Service Layer

**File:** `frontend/src/services/api.js`  
**Purpose:** Centralized API communication service  
**Caption for Report:** "Figure X.X: API service module providing centralized HTTP request handling with authentication token management"

**What it does:**
- Centralizes all API calls
- Manages authentication tokens
- Handles errors consistently
- Provides reusable API functions

**Key Functions:**
```javascript
const API_URL = 'http://localhost:5000/api';

export const authAPI = {
  login: (email, password) => fetch(`${API_URL}/auth/login`, {...}),
  register: (userData) => fetch(`${API_URL}/auth/register`, {...}),
};

export const designAPI = {
  create: (designData, token) => fetch(`${API_URL}/designs/create`, {...}),
  getMyDesigns: (token) => fetch(`${API_URL}/designs/my-designs`, {...}),
};
```


---

## 🎨 Styling Files (CSS)

### 1. Common Styles
**File:** `frontend/src/styles/Common.css`  
**Purpose:** Shared CSS variables and utility classes  
**Caption for Report:** "Figure X.X: Common CSS file defining global color scheme, typography, and reusable utility classes"

**What it defines:**
- CSS variables for colors (#0a0e27 background, #00d9ff accent)
- Typography settings
- Utility classes
- Responsive breakpoints

---

### 2. Page-Specific Styles

**Files:**
- `frontend/src/styles/Home.css` - Home page styling
- `frontend/src/styles/Auth.css` - Sign In/Register page styling
- `frontend/src/styles/Designer.css` - Parametric Designer styling
- `frontend/src/styles/AIDesigner.css` - AI Designer styling with animations
- `frontend/src/styles/Viewer3D.css` - 3D Viewer styling
- `frontend/src/styles/FurnitureCustomizer.css` - Furniture Customizer styling
- `frontend/src/styles/Gallery.css` - Gallery grid layout styling
- `frontend/src/styles/Profile.css` - Profile page styling
- `frontend/src/styles/Contact.css` - Contact form styling

**Common Features:**
- Dark theme (#0a0e27 background)
- Cyan accent color (#00d9ff)
- Responsive design (mobile, tablet, desktop)
- Smooth animations and transitions
- Modern card-based layouts
- Glassmorphism effects

---

## 📊 Key Algorithms and Logic

### 1. 3D Model Generation Algorithm

**Location:** `backend/routes/designs.js` - `generateModelData()` function  
**Purpose:** Generate 3D model data from parametric inputs  
**Caption for Report:** "Algorithm X.X: Parametric 3D model generation algorithm calculating room dimensions and positions based on total area and room count"

**Algorithm Steps:**
```
1. Calculate area per floor = totalArea / floors
2. Count total rooms = bedrooms + bathrooms + kitchen + livingRoom
3. Calculate average room area = areaPerFloor / roomCount
4. Calculate room dimensions = sqrt(avgRoomArea)
5. Generate room layout:
   - Place living room (1.5x size)
   - Place kitchen
   - Place bedrooms in grid pattern
   - Place bathrooms
6. Calculate positions with 0.3m spacing
7. Return room array with positions and dimensions
```

**Complexity:** O(n) where n = number of rooms

---

### 2. AI Suggestion Generation Algorithm

**Location:** `backend/routes/ai-designer.js` - `generateSuggestions()` function  
**Purpose:** Generate intelligent design suggestions based on style, room type, and budget  
**Caption for Report:** "Algorithm X.X: AI suggestion generation algorithm providing context-aware design recommendations"

**Algorithm Logic:**
```
1. Initialize empty suggestions array
2. IF style == 'modern' THEN
     Add modern-specific suggestions
3. IF style == 'traditional' THEN
     Add traditional-specific suggestions
4. IF roomType == 'living room' THEN
     Add living room suggestions
5. IF budget == 'high' THEN
     Add premium suggestions
6. Add general suggestions (plants, lighting, mirrors)
7. Return top 5 suggestions
```

---

### 3. Password Hashing Algorithm

**Location:** `backend/routes/auth.js` - Registration endpoint  
**Purpose:** Secure password storage using bcrypt  
**Caption for Report:** "Algorithm X.X: Bcrypt password hashing implementation with 10 salt rounds for secure credential storage"

**Implementation:**
```javascript
const bcrypt = require('bcryptjs');

// Hash password with 10 salt rounds
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(password, salt);

// Verify password during login
const isMatch = await bcrypt.compare(password, user.password);
```

**Security:** 10 rounds = 2^10 = 1,024 iterations

---

### 4. JWT Token Generation

**Location:** `backend/routes/auth.js` - Login endpoint  
**Purpose:** Generate secure authentication tokens  
**Caption for Report:** "Algorithm X.X: JWT token generation with 24-hour expiry for stateless authentication"

**Implementation:**
```javascript
const jwt = require('jsonwebtoken');

const token = jwt.sign(
  { userId: user._id },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);
```

---

## 📦 Dependencies and Libraries

### Backend Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| express | ^4.18.2 | Web framework for Node.js |
| mongoose | ^8.0.0 | MongoDB ODM for data modeling |
| bcryptjs | ^2.4.3 | Password hashing |
| jsonwebtoken | ^9.0.2 | JWT authentication |
| cors | ^2.8.5 | Cross-origin resource sharing |
| dotenv | ^16.3.1 | Environment variable management |
| multer | ^2.0.2 | File upload handling |

### Frontend Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^19.2.4 | UI library |
| react-dom | ^19.2.4 | React DOM rendering |
| react-router-dom | ^6.30.3 | Client-side routing |
| three | ^0.183.1 | 3D graphics library |
| @react-three/fiber | ^9.5.0 | React renderer for Three.js |
| @react-three/drei | ^10.7.7 | Helper components for Three.js |

---

## 🔐 Security Implementation

### 1. Password Security
- **Hashing:** bcrypt with 10 salt rounds
- **Strength Validation:** Minimum 8 characters, 1 uppercase, 1 number
- **Storage:** Never store plain text passwords

### 2. Authentication Security
- **JWT Tokens:** 24-hour expiry
- **Token Storage:** localStorage (client-side)
- **Protected Routes:** Middleware verification
- **Authorization Header:** Bearer token format

### 3. API Security
- **CORS:** Configured for allowed origins
- **Input Validation:** File type and size validation
- **SQL Injection Prevention:** Mongoose ODM parameterized queries
- **XSS Prevention:** Input sanitization

### 4. File Upload Security
- **File Type Validation:** Only PDF files allowed
- **File Size Limit:** Maximum 10MB
- **Multer Configuration:** Memory storage with validation

---

## 🚀 Performance Optimizations

### 1. 3D Rendering Optimization
- **Level of Detail (LOD):** Simplified geometry for distant objects
- **Frustum Culling:** Only render visible objects
- **Shadow Optimization:** Limited shadow-casting objects
- **Material Reuse:** Shared materials across meshes

### 2. API Optimization
- **Selective Field Projection:** MongoDB queries return only needed fields
- **Indexing:** Database indexes on frequently queried fields
- **Connection Pooling:** MongoDB connection reuse

### 3. Frontend Optimization
- **Code Splitting:** React lazy loading for routes
- **Asset Optimization:** Compressed images and CSS
- **Caching:** Browser caching for static assets

---

## 📝 Code Quality Standards

### 1. Naming Conventions
- **Variables:** camelCase (e.g., `userName`, `designData`)
- **Functions:** camelCase with verb prefix (e.g., `handleSubmit`, `generateModel`)
- **Components:** PascalCase (e.g., `AIDesigner`, `HouseModel3D`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `API_URL`, `MAX_FILE_SIZE`)

### 2. Code Organization
- **Modular Structure:** Separate files for routes, models, components
- **Single Responsibility:** Each file has one clear purpose
- **DRY Principle:** Reusable functions and components
- **Comments:** Inline comments for complex logic

### 3. Error Handling
- **Try-Catch Blocks:** All async operations wrapped
- **User-Friendly Messages:** Clear error messages for users
- **Console Logging:** Server-side error logging
- **HTTP Status Codes:** Proper status codes (200, 201, 400, 401, 500)

---

## 🧪 Testing Approach

### 1. Manual Testing
- **Browser Testing:** Chrome, Firefox, Safari, Edge
- **Device Testing:** Desktop, tablet, mobile
- **Feature Testing:** All CRUD operations verified
- **Performance Testing:** 3D rendering FPS monitoring

### 2. API Testing
- **Postman:** API endpoint testing
- **Authentication Flow:** Login, register, token verification
- **CRUD Operations:** Create, read, update, delete designs
- **Error Scenarios:** Invalid inputs, missing tokens

---

## 📈 Future Enhancements

### 1. Real AI Integration
- **TensorFlow.js:** Client-side image processing
- **Computer Vision:** Actual floor plan analysis
- **ML Models:** Style classification and recommendation

### 2. Advanced 3D Features
- **VR/AR Support:** WebXR integration
- **Model Export:** OBJ, FBX, GLTF formats
- **Texture Mapping:** Realistic materials
- **Lighting Presets:** Day/night modes

### 3. Collaboration Features
- **Real-Time Collaboration:** Multiple users editing
- **Design Sharing:** Public/private sharing links
- **Comments:** Design feedback system

### 4. Additional Features
- **Cost Estimation:** Material and labor cost calculator
- **Material Library:** Expanded material options
- **Drag-and-Drop Furniture:** Interactive placement
- **Mobile App:** React Native version

---

## 📚 For Interim Report

### Screenshots to Include:

1. **Home Page** - Landing page with hero section
2. **Sign In Page** - Authentication interface
3. **Parametric Designer** - 3-step wizard (all steps)
4. **AI Designer** - Text mode and PDF upload mode
5. **3D Viewer** - Interactive 3D model with controls
6. **Furniture Customizer** - Room selection and furniture placement
7. **Gallery** - Design showcase grid
8. **Profile** - User dashboard with saved designs
9. **Database Schema** - MongoDB collections in Atlas
10. **API Testing** - Postman request/response examples

### Code Snippets to Include:

1. **JWT Authentication** - Token generation code
2. **Password Hashing** - Bcrypt implementation
3. **3D Model Generation** - Algorithm code
4. **Three.js Setup** - Canvas and camera configuration
5. **API Route** - Example Express route handler
6. **React Component** - Example functional component
7. **State Management** - useState hook example
8. **API Call** - Fetch request with authentication

### Diagrams to Include:

1. **System Architecture** - Client-Server-Database diagram
2. **Use Case Diagram** - User interactions
3. **ER Diagram** - Database relationships
4. **Class Diagram** - Component structure
5. **Sequence Diagram** - Authentication flow
6. **Component Hierarchy** - React component tree

---

## 📞 Support and Documentation

**Repository:** https://github.com/Sehansi/3D_House-Design-Website.git  
**Documentation:** README.md, INTERIM_REPORT.md, CODE_DOCUMENTATION.md  
**Issue Tracking:** GitHub Issues  
**Version Control:** Git with feature branches

---

**End of Code Documentation**

