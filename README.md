# 🏠 3D House Design Web Application

A full-stack web application for designing and visualizing 3D houses with AI-powered features and parametric design tools.

## 🚀 Features

### 1. **Parametric House Designer** (`/designer`)
- 3-step wizard for custom house design
- Configure parameters: bedrooms, bathrooms, kitchen, living room, total area, floors, style
- Select finishes: wall color, floor type, roof type
- Real-time 3D preview generation
- Save designs to MongoDB database

### 2. **AI-Powered Designer** (`/ai-designer`)
- Upload house images for AI analysis
- Automatic feature detection (floors, windows, doors, style, area, roof type)
- AI suggests design parameters based on image
- Generate 3D model from AI-detected features
- Mock AI implementation (ready for real AI integration)

### 3. **3D Model Viewer** (`/viewer`)
- Interactive 3D house models with Three.js
- 3 pre-built models: Basic House, Modern Villa, Garden House
- **Interior View Mode**: Transparent walls to see inside
- **Furniture Display**: View furniture in rooms (sofa, bed, kitchen counter, dining table)
- Customizable wall colors
- OrbitControls: Rotate, zoom, pan
- Grid toggle option
- Advanced lighting system with shadows

### 4. **Furniture Customizer** (`/furniture-customizer`)
- Room-by-room furniture customization
- 3 room types: Living Room, Bedroom, Dining Room
- Add furniture per room:
  - Living Room: Sofa, TV Stand, Coffee Table
  - Bedroom: Bed, Wardrobe, TV Stand
  - Dining Room: Dining Table with chairs
- Remove individual furniture items
- Clear entire room
- Real-time 3D preview with Three.js
- Interactive furniture placement

### 5. **Project Gallery** (`/gallery`)
- Browse design projects
- Filter by category
- Project showcase with images

### 6. **Additional Pages**
- **Home** (`/`): Hero section with background image, CTA buttons
- **About** (`/about`): Company information
- **Services** (`/services`): Service offerings
- **Contact** (`/contact`): Contact form
- **Profile** (`/profile`): User profile management
- **Authentication**: Sign In, Register, Forgot Password

## 🛠️ Technology Stack

### Frontend
- **React.js**: UI framework
- **React Router**: Navigation
- **Three.js**: 3D rendering engine
- **@react-three/fiber**: React renderer for Three.js
- **@react-three/drei**: Helper components for Three.js
- **CSS3**: Styling with dark theme (#0a0e27 background, #00d9ff accent)

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **MongoDB Atlas**: Cloud database
- **Mongoose**: MongoDB ODM
- **Multer**: File upload handling
- **CORS**: Cross-origin resource sharing

### 3D Libraries & Tools
- **Three.js**: Core 3D library
- **@react-three/fiber**: React integration for Three.js
- **@react-three/drei**: 
  - OrbitControls: Camera controls
  - PerspectiveCamera: 3D camera
  - Environment: Lighting presets
  - Grid: Ground grid display

## 📁 Project Structure

```
3D_House_Design_webapp/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── models/
│   │   ├── User.js               # User schema
│   │   └── Design.js             # Design schema
│   ├── routes/
│   │   ├── auth.js               # Authentication routes
│   │   └── designs.js            # Design CRUD routes
│   ├── server.js                 # Express server
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.js           # Landing page
│   │   │   ├── Designer.js       # Parametric designer
│   │   │   ├── AIDesigner.js     # AI-powered designer
│   │   │   ├── Viewer3D.js       # 3D model viewer
│   │   │   ├── FurnitureCustomizer.js  # Furniture customizer
│   │   │   ├── Gallery.js        # Project gallery
│   │   │   ├── Profile.js        # User profile
│   │   │   ├── About.js          # About page
│   │   │   ├── Services.js       # Services page
│   │   │   ├── Contact.js        # Contact page
│   │   │   ├── SignIn.js         # Sign in page
│   │   │   ├── Register.js       # Registration page
│   │   │   └── ForgotPassword.js # Password reset
│   │   ├── styles/               # CSS files for each page
│   │   ├── services/
│   │   │   └── api.js            # API service
│   │   ├── App.js                # Main app component
│   │   └── index.js              # Entry point
│   └── package.json
│
└── README.md
```

## 🎨 Design Features

### Dark Theme
- Background: `#0a0e27`
- Accent Color: `#00d9ff`
- Modern, professional UI
- Consistent navbar across all pages
- Responsive design

### 3D Visualization Features
- **Real-time rendering**: Smooth 60 FPS performance
- **Advanced lighting**: Ambient, directional, point, spot, hemisphere lights
- **Shadows**: Dynamic shadow mapping
- **Materials**: PBR materials with roughness and metalness
- **Transparency**: Interior view with transparent walls
- **Fog effects**: Depth perception enhancement
- **Environment mapping**: Realistic reflections

### Furniture 3D Models
- **Sofa**: Multi-part model with cushions and backrest
- **Bed**: Complete bed with headboard and pillows
- **Dining Table**: Round table with chairs
- **Wardrobe**: Closet with doors
- **TV Stand**: Entertainment center with TV screen
- **Kitchen Counter**: Counter with stove

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v14+)
- MongoDB Atlas account
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
# Create .env file with:
# MONGODB_URI=your_mongodb_connection_string
# PORT=5000
npm start
```

### Frontend Setup
```bash
cd frontend
npm install
# Create .env file with:
# REACT_APP_API_URL=http://localhost:5000
npm start
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Password reset

### Designs
- `POST /api/designs/preview` - Generate design preview
- `POST /api/designs/create` - Save design to database
- `GET /api/designs` - Get all designs
- `GET /api/designs/:id` - Get single design
- `PUT /api/designs/:id` - Update design
- `DELETE /api/designs/:id` - Delete design

## 📊 Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  createdAt: Date
}
```

### Design Model
```javascript
{
  name: String,
  userId: ObjectId,
  parameters: {
    bedrooms: Number,
    bathrooms: Number,
    kitchen: Boolean,
    livingRoom: Boolean,
    totalArea: Number,
    floors: Number,
    style: String
  },
  finishes: {
    wallColor: String,
    floorType: String,
    roofType: String
  },
  modelData: Object,
  createdAt: Date
}
```

## 🚀 Deployment

- **Frontend**: Port 3002
- **Backend**: Port 5000
- **Database**: MongoDB Atlas (Cloud)

## 🔐 Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
PORT=5000
JWT_SECRET=your_jwt_secret
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000
```

## 📝 Future Enhancements

- Real AI integration for image analysis
- Export 3D models (OBJ, FBX, GLTF)
- VR/AR support
- Collaborative design features
- Cost estimation
- Material library expansion
- Advanced furniture positioning (drag & drop)
- Save furniture layouts
- Multiple furniture styles (Modern, Classic, Minimal)

## 👥 Contributors

- Sehansi - Full Stack Developer

## 📄 License

This project is private and proprietary.

## 🔗 Repository

https://github.com/Sehansi/3D_House-Design-Website.git
