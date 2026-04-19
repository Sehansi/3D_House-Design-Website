# 3D House Design Web Application - System Diagrams
## PlantUML Diagrams for Interim Report

---

## 1. Entity-Relationship (ER) Diagram - Full System

### Complete ER Diagram with All Attributes (PlantUML for Draw.io)

**Instructions for Draw.io:**
1. Go to https://app.diagrams.net/
2. Click "Create New Diagram"
3. Select "Blank Diagram"
4. Go to: Arrange → Insert → Advanced → PlantUML
5. Paste the code below
6. Click "Insert"

```plantuml
@startuml Complete_ER_Diagram_3D_House_Design

!define TABLE(x) class x << (T,#FFAAAA) >>
!define PRIMARY_KEY(x) <b><color:red>x</color></b>
!define FOREIGN_KEY(x) <color:blue>x</color>

hide methods
hide stereotypes

' User Entity
entity "USER" as user {
  PRIMARY_KEY(_id) : ObjectId
  ==
  fullName : String
  email : String {unique}
  password : String {hashed, bcrypt 10 rounds}
  favorites : Array<ObjectId>
  resetPasswordToken : String {nullable}
  resetPasswordExpire : Date {nullable}
  isActive : Boolean {default: true}
  role : String {default: "user"}
  createdAt : Date {auto}
  updatedAt : Date {auto}
}

' Design Entity (Parametric Design)
entity "DESIGN" as design {
  PRIMARY_KEY(_id) : ObjectId
  FOREIGN_KEY(user) : ObjectId
  ==
  name : String {required}
  description : String {nullable}
  isPublic : Boolean {default: false}
  --Parameters--
  bedrooms : Number {1-10}
  bathrooms : Number {1-5}
  kitchen : Boolean {default: true}
  livingRoom : Boolean {default: true}
  totalArea : Number {500-10000 sq ft}
  floors : Number {1-3}
  style : String {Modern/Traditional/Minimalist/Luxury}
  --Finishes--
  wallColor : String {hex color}
  floorType : String {Tile/Wood/Marble/Carpet}
  roofType : String {Flat/Sloped/Gable}
  --Model Data--
  modelData : Object {JSON}
  rooms : Array<Object>
  dimensions : Object {width, length, height}
  --Metadata--
  viewCount : Number {default: 0}
  likeCount : Number {default: 0}
  createdAt : Date {auto}
  updatedAt : Date {auto}
}

' AI Design Entity
entity "AIDESIGN" as aidesign {
  PRIMARY_KEY(_id) : ObjectId
  FOREIGN_KEY(user) : ObjectId
  ==
  name : String {required}
  description : String {nullable}
  isPublic : Boolean {default: false}
  --Input Data--
  prompt : String {text description}
  uploadMode : String {text/pdf}
  imageUrl : String {nullable}
  pdfUrl : String {nullable}
  --Design Parameters--
  style : String {Modern/Traditional/etc}
  roomType : String {Living/Bedroom/Kitchen/etc}
  budget : String {Low/Medium/High}
  --AI Generated Data--
  detectedFeatures : Object {JSON}
  colors : Array<String> {hex colors}
  materials : Array<String>
  furniture : Array<String>
  lighting : String
  --AI Suggestions--
  suggestions : Array<String>
  styleScore : Number {0-100}
  confidenceLevel : Number {0-1}
  --Model Data--
  modelData : Object {JSON}
  generatedParameters : Object
  --Metadata--
  processingTime : Number {milliseconds}
  aiVersion : String {v1.0}
  createdAt : Date {auto}
  updatedAt : Date {auto}
}

' Furniture Layout Entity
entity "FURNITURE_LAYOUT" as furniture {
  PRIMARY_KEY(_id) : ObjectId
  FOREIGN_KEY(user) : ObjectId
  FOREIGN_KEY(design) : ObjectId {nullable}
  ==
  name : String {required}
  roomType : String {Living/Bedroom/Dining}
  --Furniture Items--
  livingRoomItems : Array<Object>
  bedroomItems : Array<Object>
  diningRoomItems : Array<Object>
  kitchenItems : Array<Object>
  --Item Structure--
  itemType : String {Sofa/Bed/Table/etc}
  position : Object {x, y, z}
  rotation : Object {x, y, z}
  scale : Object {x, y, z}
  color : String {hex}
  material : String
  --Metadata--
  totalItems : Number
  estimatedCost : Number {USD}
  createdAt : Date {auto}
  updatedAt : Date {auto}
}

' Gallery Item Entity
entity "GALLERY_ITEM" as gallery {
  PRIMARY_KEY(_id) : ObjectId
  FOREIGN_KEY(design) : ObjectId {nullable}
  FOREIGN_KEY(aidesign) : ObjectId {nullable}
  FOREIGN_KEY(user) : ObjectId
  ==
  title : String {required}
  description : String
  category : String {Modern/Traditional/etc}
  tags : Array<String>
  --Images--
  thumbnailUrl : String
  imageUrls : Array<String>
  --Engagement--
  viewCount : Number {default: 0}
  likeCount : Number {default: 0}
  favoriteCount : Number {default: 0}
  commentCount : Number {default: 0}
  --Status--
  isPublished : Boolean {default: false}
  isFeatured : Boolean {default: false}
  publishedAt : Date {nullable}
  --Metadata--
  createdAt : Date {auto}
  updatedAt : Date {auto}
}

' Contact Message Entity
entity "CONTACT_MESSAGE" as contact {
  PRIMARY_KEY(_id) : ObjectId
  FOREIGN_KEY(user) : ObjectId {nullable}
  ==
  name : String {required}
  email : String {required}
  phone : String {nullable}
  subject : String {required}
  message : String {required}
  --Status--
  status : String {New/Read/Replied/Closed}
  priority : String {Low/Medium/High}
  --Response--
  response : String {nullable}
  respondedBy : ObjectId {nullable}
  respondedAt : Date {nullable}
  --Metadata--
  ipAddress : String
  userAgent : String
  createdAt : Date {auto}
  updatedAt : Date {auto}
}

' Session Entity (for JWT tracking)
entity "SESSION" as session {
  PRIMARY_KEY(_id) : ObjectId
  FOREIGN_KEY(user) : ObjectId
  ==
  token : String {JWT token}
  refreshToken : String {nullable}
  --Device Info--
  deviceType : String {Desktop/Mobile/Tablet}
  browser : String
  os : String
  ipAddress : String
  --Status--
  isActive : Boolean {default: true}
  lastActivity : Date
  expiresAt : Date {24 hours}
  --Metadata--
  createdAt : Date {auto}
  updatedAt : Date {auto}
}

' Relationships
user ||--o{ design : "creates"
user ||--o{ aidesign : "generates"
user ||--o{ furniture : "customizes"
user ||--o{ gallery : "publishes"
user ||--o{ contact : "sends"
user ||--o{ session : "has"

design ||--o| furniture : "has layout"
design ||--o| gallery : "displayed in"
aidesign ||--o| gallery : "displayed in"

' Self-referencing relationship for favorites
user }o--o{ design : "favorites"
user }o--o{ aidesign : "favorites"

note right of user
  **User Entity**
  - Central entity for authentication
  - Password hashed with bcrypt (10 rounds)
  - JWT token-based authentication
  - Favorites stored as ObjectId array
  - Role-based access control ready
end note

note right of design
  **Parametric Design Entity**
  - User-specified parameters
  - 3-step wizard input
  - Generated 3D model data
  - Public/private visibility
  - Full CRUD operations
end note

note right of aidesign
  **AI Design Entity**
  - Text or PDF input
  - AI-generated parameters
  - Style-based recommendations
  - Confidence scoring
  - Refinement capability
end note

note right of furniture
  **Furniture Layout Entity**
  - Room-by-room customization
  - 3D position and rotation
  - Material and color selection
  - Cost estimation
  - Linked to designs
end note

note right of gallery
  **Gallery Item Entity**
  - Public showcase
  - Engagement metrics
  - Featured items
  - Category filtering
  - Links to designs
end note

note bottom of contact
  **Contact Message Entity**
  - User inquiries
  - Status tracking
  - Response management
  - Priority levels
end note

note bottom of session
  **Session Entity**
  - JWT token tracking
  - Device information
  - Activity monitoring
  - Auto-expiry (24h)
end note

@enduml
```

### Alternative: Simplified Version for Better Rendering

```plantuml
@startuml Simple_ER_Diagram

entity USER {
  * _id : ObjectId <<PK>>
  --
  * fullName : String
  * email : String
  * password : String
  favorites : Array
  createdAt : Date
  updatedAt : Date
}

entity DESIGN {
  * _id : ObjectId <<PK>>
  --
  * user : ObjectId <<FK>>
  * name : String
  bedrooms : Number
  bathrooms : Number
  totalArea : Number
  floors : Number
  style : String
  wallColor : String
  floorType : String
  roofType : String
  modelData : Object
  createdAt : Date
  updatedAt : Date
}

entity AIDESIGN {
  * _id : ObjectId <<PK>>
  --
  * user : ObjectId <<FK>>
  * name : String
  * prompt : String
  * style : String
  roomType : String
  budget : String
  imageUrl : String
  colors : Array
  materials : Array
  furniture : Array
  suggestions : Array
  createdAt : Date
  updatedAt : Date
}

entity FURNITURE_LAYOUT {
  * _id : ObjectId <<PK>>
  --
  * user : ObjectId <<FK>>
  design : ObjectId <<FK>>
  * name : String
  * roomType : String
  items : Array
  totalItems : Number
  createdAt : Date
  updatedAt : Date
}

entity GALLERY_ITEM {
  * _id : ObjectId <<PK>>
  --
  * user : ObjectId <<FK>>
  design : ObjectId <<FK>>
  aidesign : ObjectId <<FK>>
  * title : String
  description : String
  category : String
  viewCount : Number
  likeCount : Number
  createdAt : Date
  updatedAt : Date
}

entity CONTACT_MESSAGE {
  * _id : ObjectId <<PK>>
  --
  user : ObjectId <<FK>>
  * name : String
  * email : String
  * subject : String
  * message : String
  status : String
  createdAt : Date
  updatedAt : Date
}

entity SESSION {
  * _id : ObjectId <<PK>>
  --
  * user : ObjectId <<FK>>
  * token : String
  deviceType : String
  ipAddress : String
  isActive : Boolean
  expiresAt : Date
  createdAt : Date
}

USER ||--o{ DESIGN : creates
USER ||--o{ AIDESIGN : generates
USER ||--o{ FURNITURE_LAYOUT : customizes
USER ||--o{ GALLERY_ITEM : publishes
USER ||--o{ CONTACT_MESSAGE : sends
USER ||--o{ SESSION : has

DESIGN ||--o| FURNITURE_LAYOUT : "has layout"
DESIGN ||--o| GALLERY_ITEM : "displayed in"
AIDESIGN ||--o| GALLERY_ITEM : "displayed in"

USER }o--o{ DESIGN : favorites
USER }o--o{ AIDESIGN : favorites

@enduml
```

---

## 2. Use Case Diagram

### PlantUML Code:

```plantuml
@startuml UseCase_Diagram_3D_House_Design

left to right direction
skinparam packageStyle rectangle

actor "Guest User" as guest
actor "Registered User" as user
actor "System" as system

rectangle "3D House Design System" {
    
    ' Guest User Use Cases
    usecase "View Home Page" as UC1
    usecase "Browse Gallery" as UC2
    usecase "View Services" as UC3
    usecase "Register Account" as UC4
    usecase "Sign In" as UC5
    usecase "View About" as UC6
    usecase "Contact Us" as UC7
    
    ' Registered User Use Cases
    usecase "Create Parametric Design" as UC8
    usecase "Upload Image/PDF for AI Design" as UC9
    usecase "View 3D Models" as UC10
    usecase "Customize Furniture" as UC11
    usecase "Save Designs" as UC12
    usecase "Update Designs" as UC13
    usecase "Delete Designs" as UC14
    usecase "Add to Favorites" as UC15
    usecase "View Profile" as UC16
    usecase "Manage Account" as UC17
    usecase "Generate 3D Preview" as UC18
    usecase "Refine AI Design" as UC19
    usecase "Export Design" as UC20
    
    ' System Use Cases
    usecase "Authenticate Users" as UC21
    usecase "Generate 3D Models" as UC22
    usecase "Process AI Requests" as UC23
    usecase "Store Designs in Database" as UC24
    usecase "Render 3D Visualizations" as UC25
    usecase "Send Email Notifications" as UC26
}

' Guest User Relationships
guest --> UC1
guest --> UC2
guest --> UC3
guest --> UC4
guest --> UC5
guest --> UC6
guest --> UC7

' Registered User Relationships
user --> UC8
user --> UC9
user --> UC10
user --> UC11
user --> UC12
user --> UC13
user --> UC14
user --> UC15
user --> UC16
user --> UC17
user --> UC18
user --> UC19
user --> UC20

' User inherits Guest capabilities
user --|> guest

' System Relationships
UC5 ..> UC21 : <<includes>>
UC8 ..> UC22 : <<includes>>
UC9 ..> UC23 : <<includes>>
UC12 ..> UC24 : <<includes>>
UC10 ..> UC25 : <<includes>>
UC4 ..> UC26 : <<includes>>

note right of UC8
  **3-Step Wizard:**
  1. Parameters
  2. Finishes
  3. Preview
end note

note right of UC9
  **AI Features:**
  - Text description input
  - PDF floor plan upload
  - Automatic feature detection
  - Style recommendations
end note

@enduml
```

---

## 3. Class Diagram

### PlantUML Code:

```plantuml
@startuml Class_Diagram_3D_House_Design

' Styling
skinparam classAttributeIconSize 0
skinparam class {
    BackgroundColor #E8F5E9
    BorderColor #388E3C
    ArrowColor #388E3C
}

' Backend Classes

package "Backend Models" {
    class User {
        - _id: ObjectId
        - fullName: String
        - email: String
        - password: String
        - favorites: Array<ObjectId>
        - createdAt: Date
        - updatedAt: Date
        --
        + register(): Promise<User>
        + login(): Promise<Token>
        + updateProfile(): Promise<User>
        + addFavorite(designId): Promise<void>
        + removeFavorite(designId): Promise<void>
    }
    
    class Design {
        - _id: ObjectId
        - user: ObjectId
        - name: String
        - parameters: DesignParameters
        - finishes: DesignFinishes
        - modelData: Object
        - createdAt: Date
        - updatedAt: Date
        --
        + create(): Promise<Design>
        + update(): Promise<Design>
        + delete(): Promise<void>
        + generateModelData(): Object
    }
    
    class AIDesign {
        - _id: ObjectId
        - user: ObjectId
        - name: String
        - prompt: String
        - style: String
        - roomType: String
        - budget: String
        - imageUrl: String
        - parameters: AIParameters
        - suggestions: Array<String>
        - createdAt: Date
        --
        + generate(): Promise<AIDesign>
        + refine(prompt): Promise<AIDesign>
        + save(): Promise<AIDesign>
        + delete(): Promise<void>
    }
    
    class DesignParameters {
        + bedrooms: Number
        + bathrooms: Number
        + kitchen: Boolean
        + livingRoom: Boolean
        + totalArea: Number
        + floors: Number
        + style: String
    }
    
    class DesignFinishes {
        + wallColor: String
        + floorType: String
        + roofType: String
    }
    
    class AIParameters {
        + colors: Array<String>
        + materials: Array<String>
        + furniture: Array<String>
        + lighting: String
    }
}

package "Backend Routes" {
    class AuthController {
        + register(req, res): Response
        + login(req, res): Response
        + forgotPassword(req, res): Response
        + verifyToken(token): Boolean
    }
    
    class DesignController {
        + createDesign(req, res): Response
        + getDesigns(req, res): Response
        + getDesignById(req, res): Response
        + updateDesign(req, res): Response
        + deleteDesign(req, res): Response
        + previewDesign(req, res): Response
    }
    
    class AIDesignerController {
        + generateDesign(req, res): Response
        + uploadPlan(req, res): Response
        + saveDesign(req, res): Response
        + refineDesign(req, res): Response
        + getMyDesigns(req, res): Response
    }
    
    class FavoritesController {
        + toggleFavorite(req, res): Response
        + getFavorites(req, res): Response
    }
}

package "Middleware" {
    class AuthMiddleware {
        + verifyJWT(req, res, next): void
        + extractUserId(token): String
    }
    
    class FileUploadMiddleware {
        + validateFileType(file): Boolean
        + validateFileSize(file): Boolean
        + handleUpload(req, res, next): void
    }
}

' Frontend Classes

package "Frontend Components" {
    class App {
        - routes: Array<Route>
        --
        + render(): JSX.Element
        + setupRoutes(): void
    }
    
    class AuthContext {
        - user: User
        - token: String
        - isAuthenticated: Boolean
        --
        + login(email, password): Promise<void>
        + logout(): void
        + register(userData): Promise<void>
        + checkAuth(): Boolean
    }
    
    class Designer {
        - step: Number
        - parameters: DesignParameters
        - finishes: DesignFinishes
        - loading: Boolean
        --
        + handleParameterChange(): void
        + handleFinishChange(): void
        + handlePreview(): void
        + handleSave(): void
        + nextStep(): void
        + prevStep(): void
    }
    
    class AIDesigner {
        - uploadMode: String
        - prompt: String
        - style: String
        - roomType: String
        - budget: String
        - generatedDesign: AIDesign
        - uploadedFile: File
        --
        + handleGenerate(): void
        + handleFileUpload(): void
        + handleSaveDesign(): void
        + handleRefine(): void
    }
    
    class Viewer3D {
        - modelData: Object
        - cameraPosition: Vector3
        - showInterior: Boolean
        - wallColor: String
        --
        + renderModel(): JSX.Element
        + toggleInteriorView(): void
        + changeWallColor(color): void
        + resetCamera(): void
    }
    
    class FurnitureCustomizer {
        - selectedRoom: String
        - furniture: Object
        --
        + addFurniture(item): void
        + removeFurniture(item): void
        + clearRoom(): void
        + saveFurnitureLayout(): void
    }
    
    class HouseModel3D {
        - style: String
        - roomType: String
        --
        + getColorByStyle(): String
        + renderWalls(): JSX.Element
        + renderFurniture(): JSX.Element
        + renderLighting(): JSX.Element
    }
    
    class Gallery {
        - designs: Array<Design>
        - filter: String
        - favorites: Array<String>
        --
        + fetchDesigns(): void
        + filterByCategory(category): void
        + toggleFavorite(designId): void
    }
}

package "Frontend Services" {
    class APIService {
        - baseURL: String
        - token: String
        --
        + get(endpoint): Promise<Response>
        + post(endpoint, data): Promise<Response>
        + put(endpoint, data): Promise<Response>
        + delete(endpoint): Promise<Response>
        + setAuthToken(token): void
    }
}

' Relationships

' Backend Relationships
User "1" -- "0..*" Design : creates
User "1" -- "0..*" AIDesign : generates
Design *-- "1" DesignParameters
Design *-- "1" DesignFinishes
AIDesign *-- "1" AIParameters

AuthController ..> User : uses
DesignController ..> Design : uses
AIDesignerController ..> AIDesign : uses
FavoritesController ..> User : uses

AuthMiddleware ..> AuthController : protects
FileUploadMiddleware ..> AIDesignerController : validates

' Frontend Relationships
App *-- "1" AuthContext
App o-- "1..*" Designer
App o-- "1..*" AIDesigner
App o-- "1..*" Viewer3D
App o-- "1..*" FurnitureCustomizer
App o-- "1..*" Gallery

Designer ..> APIService : uses
AIDesigner ..> APIService : uses
AIDesigner *-- "1" HouseModel3D
Viewer3D *-- "1" HouseModel3D
FurnitureCustomizer *-- "1" HouseModel3D
Gallery ..> APIService : uses

' Frontend-Backend Connection
APIService ..> AuthController : HTTP
APIService ..> DesignController : HTTP
APIService ..> AIDesignerController : HTTP
APIService ..> FavoritesController : HTTP

@enduml
```

---

## 4. High-Level System Architecture Diagram

### PlantUML Code:

```plantuml
@startuml System_Architecture_3D_House_Design

!define RECTANGLE class

skinparam component {
    BackgroundColor #FFF9C4
    BorderColor #F57C00
    ArrowColor #F57C00
}

skinparam database {
    BackgroundColor #E1F5FE
    BorderColor #0277BD
}

' Client Layer
package "Client Layer (Browser)" {
    [Web Browser] as browser
    
    package "React Application (Port 3002)" {
        [Home Page] as home
        [Authentication] as auth
        [Parametric Designer] as designer
        [AI Designer] as aidesigner
        [3D Viewer] as viewer
        [Furniture Customizer] as furniture
        [Gallery] as gallery
        [Profile] as profile
        
        package "Three.js Engine" {
            [3D Renderer] as renderer
            [Camera Controls] as camera
            [Lighting System] as lighting
        }
        
        package "State Management" {
            [Auth Context] as authcontext
            [Local Storage] as localstorage
        }
    }
}

' Server Layer
package "Server Layer" {
    package "Node.js + Express (Port 5000)" {
        [API Gateway] as api
        
        package "API Routes" {
            [/api/auth] as authroute
            [/api/designs] as designroute
            [/api/ai-designer] as airoute
            [/api/furniture] as furnitureroute
            [/api/favorites] as favroute
            [/api/gallery] as galleryroute
        }
        
        package "Middleware" {
            [CORS] as cors
            [JWT Auth] as jwt
            [Multer Upload] as multer
            [Error Handler] as errorhandler
        }
        
        package "Business Logic" {
            [3D Model Generator] as modelgen
            [AI Suggestion Engine] as aiengine
            [Password Hasher] as hasher
        }
    }
}

' Database Layer
package "Database Layer" {
    database "MongoDB Atlas\n(Cloud Database)" as mongodb {
        [users collection] as usercol
        [designs collection] as designcol
        [aidesigns collection] as aidesigncol
    }
}

' External Services
cloud "External Services" {
    [Email Service] as email
    [Cloud Storage] as storage
}

' Relationships - Client to Server
browser --> home
browser --> auth
browser --> designer
browser --> aidesigner
browser --> viewer
browser --> furniture
browser --> gallery
browser --> profile

home ..> api : HTTPS/REST
auth ..> api : HTTPS/REST
designer ..> api : HTTPS/REST
aidesigner ..> api : HTTPS/REST
viewer ..> api : HTTPS/REST
furniture ..> api : HTTPS/REST
gallery ..> api : HTTPS/REST
profile ..> api : HTTPS/REST

renderer --> viewer
renderer --> aidesigner
renderer --> furniture
camera --> renderer
lighting --> renderer

authcontext --> localstorage
auth --> authcontext
profile --> authcontext

' Server Internal
api --> cors
api --> jwt
api --> multer
api --> errorhandler

api --> authroute
api --> designroute
api --> airoute
api --> furnitureroute
api --> favroute
api --> galleryroute

authroute --> hasher
designroute --> modelgen
airoute --> aiengine
airoute --> multer

' Server to Database
authroute --> usercol : MongoDB Protocol
designroute --> designcol : MongoDB Protocol
airoute --> aidesigncol : MongoDB Protocol
favroute --> usercol : MongoDB Protocol
galleryroute --> designcol : MongoDB Protocol

' Server to External
authroute ..> email : SMTP
airoute ..> storage : HTTP

note right of browser
  **Client Requirements:**
  - Modern browser (Chrome 90+)
  - WebGL support
  - JavaScript enabled
  - 4GB RAM minimum
end note

note right of api
  **API Features:**
  - RESTful architecture
  - JSON request/response
  - JWT authentication
  - CORS enabled
  - Rate limiting (planned)
end note

note right of mongodb
  **Database:**
  - Cloud-hosted (Atlas)
  - Auto-scaling
  - Automatic backups
  - 512MB free tier
end note

@enduml
```

---

## 5. Sequence Diagram - User Authentication Flow

### PlantUML Code:

```plantuml
@startuml Authentication_Sequence_Diagram

actor User
participant "SignIn Page" as signin
participant "Auth Context" as context
participant "API Service" as api
participant "Auth Controller" as controller
participant "User Model" as model
database "MongoDB" as db

User -> signin : Enter email & password
activate signin

signin -> context : login(email, password)
activate context

context -> api : POST /api/auth/login
activate api

api -> controller : authenticate(email, password)
activate controller

controller -> model : findByEmail(email)
activate model

model -> db : Query user by email
activate db
db --> model : User document
deactivate db

model --> controller : User object
deactivate model

controller -> controller : bcrypt.compare(password, hashedPassword)

alt Password Valid
    controller -> controller : jwt.sign({userId}, secret, {expiresIn: '24h'})
    controller --> api : {success: true, token, user}
    deactivate controller
    
    api --> context : {token, user}
    deactivate api
    
    context -> context : localStorage.setItem('token', token)
    context -> context : setUser(user)
    context --> signin : Success
    deactivate context
    
    signin -> signin : navigate('/profile')
    signin --> User : Redirect to Profile
    deactivate signin
    
else Password Invalid
    controller --> api : {error: 'Invalid credentials'}
    api --> context : Error response
    context --> signin : Error message
    signin --> User : Show error
end

@enduml
```

---

## 6. Sequence Diagram - Parametric Design Creation

### PlantUML Code:

```plantuml
@startuml Design_Creation_Sequence_Diagram

actor User
participant "Designer Page" as designer
participant "API Service" as api
participant "Design Controller" as controller
participant "Design Model" as model
participant "3D Generator" as generator
database "MongoDB" as db

User -> designer : Fill parameters\n(Step 1, 2, 3)
activate designer

User -> designer : Click "Save Design"

designer -> designer : Validate inputs

designer -> api : POST /api/designs/create\n{name, parameters, finishes}
activate api

api -> api : Extract JWT token

api -> controller : createDesign(req, res)
activate controller

controller -> controller : Validate parameters

controller -> generator : generateModelData(parameters, finishes)
activate generator

generator -> generator : Calculate room dimensions
generator -> generator : Generate room layout
generator -> generator : Calculate positions

generator --> controller : modelData {rooms, positions, dimensions}
deactivate generator

controller -> model : new Design({user, name, parameters, finishes, modelData})
activate model

model -> db : Insert document
activate db
db --> model : Inserted document with _id
deactivate db

model --> controller : Saved design object
deactivate model

controller --> api : {success: true, design}
deactivate controller

api --> designer : Design saved successfully
deactivate api

designer -> designer : Show success message
designer -> designer : navigate('/profile')

designer --> User : Redirect to Profile
deactivate designer

@enduml
```

---

## 7. Component Diagram

### PlantUML Code:

```plantuml
@startuml Component_Diagram_3D_House_Design

package "Frontend Application" {
    [React Router] as router
    [Auth Context Provider] as authprovider
    
    package "Pages" {
        [Home] as home
        [SignIn/Register] as auth
        [Designer] as designer
        [AI Designer] as aidesigner
        [3D Viewer] as viewer
        [Furniture Customizer] as furniture
        [Gallery] as gallery
        [Profile] as profile
    }
    
    package "Components" {
        [HouseModel3D] as model3d
        [Navbar] as navbar
        [Footer] as footer
    }
    
    package "Services" {
        [API Service] as apiservice
    }
    
    package "3D Engine" {
        [Three.js] as threejs
        [React Three Fiber] as fiber
        [Drei Helpers] as drei
    }
}

package "Backend Application" {
    [Express Server] as express
    
    package "Routes" {
        [Auth Routes] as authroutes
        [Design Routes] as designroutes
        [AI Routes] as airoutes
        [Favorites Routes] as favroutes
    }
    
    package "Middleware" {
        [Auth Middleware] as authmw
        [CORS Middleware] as corsmw
        [Multer Middleware] as multermw
    }
    
    package "Models" {
        [User Model] as usermodel
        [Design Model] as designmodel
        [AIDesign Model] as aidesignmodel
    }
    
    package "Utils" {
        [JWT Utils] as jwtutils
        [Bcrypt Utils] as bcryptutils
        [Model Generator] as modelgen
    }
}

database "MongoDB Atlas" {
    [users] as users
    [designs] as designs
    [aidesigns] as aidesigns
}

' Frontend Internal Connections
router --> home
router --> auth
router --> designer
router --> aidesigner
router --> viewer
router --> furniture
router --> gallery
router --> profile

authprovider --> auth
authprovider --> profile

designer --> model3d
aidesigner --> model3d
viewer --> model3d
furniture --> model3d

home --> navbar
auth --> navbar
designer --> navbar

home --> footer
gallery --> footer

apiservice --> authroutes : HTTP
apiservice --> designroutes : HTTP
apiservice --> airoutes : HTTP
apiservice --> favroutes : HTTP

model3d --> threejs
model3d --> fiber
model3d --> drei

' Backend Internal Connections
express --> authroutes
express --> designroutes
express --> airoutes
express --> favroutes

express --> authmw
express --> corsmw
express --> multermw

authroutes --> usermodel
authroutes --> jwtutils
authroutes --> bcryptutils

designroutes --> designmodel
designroutes --> modelgen
designroutes --> authmw

airoutes --> aidesignmodel
airoutes --> multermw
airoutes --> authmw

favroutes --> usermodel
favroutes --> authmw

' Database Connections
usermodel --> users
designmodel --> designs
aidesignmodel --> aidesigns

@enduml
```

---

## 8. Deployment Diagram

### PlantUML Code:

```plantuml
@startuml Deployment_Diagram_3D_House_Design

node "Client Device" {
    component [Web Browser] as browser
    component [React App\n(Port 3002)] as react
    
    browser --> react
}

node "Backend Server\n(Cloud/VPS)" {
    component [Node.js Runtime] as nodejs
    component [Express Server\n(Port 5000)] as express
    
    nodejs --> express
}

node "MongoDB Atlas\n(Cloud Database)" {
    database [MongoDB Cluster] as mongodb
    database [users collection] as users
    database [designs collection] as designs
    database [aidesigns collection] as aidesigns
    
    mongodb --> users
    mongodb --> designs
    mongodb --> aidesigns
}

node "CDN\n(Optional)" {
    component [Static Assets] as cdn
}

cloud "Internet" {
}

' Connections
browser --> Internet : HTTPS
Internet --> express : REST API
Internet --> cdn : Static Files
express --> mongodb : MongoDB Protocol\n(Port 27017)
react --> cdn : Load Assets

note right of browser
  **Client Requirements:**
  - Chrome 90+, Firefox 88+
  - WebGL support
  - 4GB RAM
  - 2 Mbps internet
end note

note right of express
  **Server Specs:**
  - Node.js v14+
  - 2GB RAM minimum
  - Ubuntu 20.04+
  - SSL Certificate
end note

note right of mongodb
  **Database:**
  - M10 Cluster (Production)
  - Auto-scaling enabled
  - Daily backups
  - 99.9% uptime SLA
end note

@enduml
```

---

## How to Use These Diagrams:

### 1. Online PlantUML Editors:
- **PlantUML Web Server**: http://www.plantuml.com/plantuml/uml/
- **PlantText**: https://www.planttext.com/
- **Gravizo**: http://www.gravizo.com/

### 2. VS Code Extension:
- Install "PlantUML" extension
- Create `.puml` files
- Preview with Alt+D

### 3. Generate Images:
```bash
# Install PlantUML
npm install -g node-plantuml

# Generate PNG
puml generate diagram.puml -o output.png
```

### 4. For Your Report:
1. Copy the PlantUML code
2. Paste into online editor
3. Export as PNG/SVG
4. Insert into Word document
5. Add caption below each diagram

---

**End of Diagrams Documentation**

