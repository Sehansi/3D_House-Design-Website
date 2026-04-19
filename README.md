# 🏠 3D House Design Web Application

## Plymouth University - Software Engineering Project
**Academic Year:** 2025/2026  
**Project Type:** Full-Stack Web Application  
**Repository:** [GitHub - 3D House Design Website](https://github.com/Sehansi/3D_House-Design-Website.git)

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Problem Definition](#problem-definition)
3. [Project Objectives](#project-objectives)
4. [System Analysis](#system-analysis)
5. [Requirements Specification](#requirements-specification)
6. [Feasibility Study](#feasibility-study)
7. [System Architecture](#system-architecture)
8. [Development Tools and Technologies](#development-tools-and-technologies)
9. [Implementation Progress](#implementation-progress)
10. [Installation & Setup](#installation--setup)
11. [API Documentation](#api-documentation)
12. [Current Limitations](#current-limitations)
13. [Future Enhancements](#future-enhancements)
14. [References](#references)

---

## 1. Project Overview

### 1.1 Introduction

The 3D House Design Web Application is a comprehensive full-stack solution designed to revolutionize the way individuals and professionals approach residential architecture and interior design. In an era where digital transformation is reshaping traditional industries, the construction and interior design sectors still heavily rely on manual processes, expensive software licenses, and limited accessibility for non-professionals.

This web-based platform addresses the growing demand for accessible, user-friendly, and cost-effective house design tools by providing an integrated environment where users can:
- Design custom houses using parametric modeling
- Leverage AI-powered design suggestions from uploaded images
- Visualize designs in interactive 3D environments
- Customize interior furniture layouts
- Save and manage multiple design projects

The application targets three primary user groups:
1. **Homeowners and DIY Enthusiasts**: Individuals planning to build or renovate their homes
2. **Interior Designers**: Professionals seeking quick visualization tools for client presentations
3. **Architecture Students**: Learners exploring 3D modeling and parametric design concepts


### 1.2 Industry Context and Relevance

The global architecture software market is projected to reach $11.89 billion by 2027, driven by increasing demand for Building Information Modeling (BIM) and 3D visualization tools. However, most professional-grade software (AutoCAD, SketchUp Pro, Revit) requires:
- Expensive licensing fees ($1,000 - $5,000 annually)
- Steep learning curves (months of training)
- High-performance hardware
- Desktop installation (limited accessibility)

This creates a significant barrier for:
- Small-scale homeowners planning renovations
- Freelance interior designers with limited budgets
- Students learning architectural concepts
- Developing regions with limited access to premium software

Our web-based solution democratizes access to 3D house design tools by providing:
- **Zero installation**: Browser-based access from any device
- **Freemium model**: Core features available at no cost
- **Intuitive interface**: Minimal learning curve with guided workflows
- **Cloud storage**: Designs accessible from anywhere
- **AI assistance**: Automated design suggestions reducing manual effort

---

## 2. Problem Definition

### 2.1 Core Problem Statement

**The current landscape of residential house design tools suffers from three critical limitations:**

1. **Accessibility Barrier**: Professional 3D design software (AutoCAD, SketchUp, Revit) requires expensive licenses, powerful hardware, and extensive training, making it inaccessible to average homeowners and small-scale designers.

2. **Fragmented Workflow**: Users must switch between multiple tools for different tasks:
   - Parametric design (one software)
   - 3D visualization (another software)
   - Furniture layout (yet another tool)
   - Cost estimation (spreadsheets)
   
   This fragmentation leads to inefficiency, data loss, and increased project timelines.

3. **Limited AI Integration**: Existing tools lack intelligent features such as:
   - Automatic design generation from reference images
   - AI-powered style recommendations
   - Automated space optimization
   - Smart furniture placement suggestions


### 2.2 Specific Pain Points Identified

Through preliminary research and user interviews, the following pain points were identified:

| User Group | Pain Point | Impact |
|------------|-----------|--------|
| Homeowners | Cannot visualize design ideas before construction | Costly mistakes, dissatisfaction |
| Interior Designers | Time-consuming manual 3D modeling | Reduced client capacity, lower revenue |
| Architecture Students | Expensive software licenses | Limited practice opportunities |
| Small Construction Firms | No centralized design management | Project delays, miscommunication |

### 2.3 Measurable Problem Indicators

- **Cost**: Professional software costs $1,000-$5,000/year per user
- **Time**: Manual 3D modeling takes 4-8 hours per basic house design
- **Accessibility**: 78% of homeowners cannot use professional CAD software
- **Error Rate**: 35% of construction projects face design-related rework
- **Market Gap**: Only 12% of available design tools offer web-based 3D visualization

---

## 3. Project Objectives

### 3.1 Primary Objectives

The 3D House Design Web Application aims to achieve the following measurable objectives:

1. **Develop a Web-Based Parametric House Designer**
   - Enable users to design houses by specifying parameters (bedrooms, bathrooms, area, floors)
   - Generate 3D models automatically from user inputs
   - Provide real-time preview of design changes
   - Support multiple architectural styles (Modern, Traditional, Minimalist, Luxury)

2. **Implement AI-Powered Design Generation**
   - Allow users to upload house images or floor plans (PDF)
   - Automatically detect architectural features (floors, windows, doors, style)
   - Generate design parameters from uploaded images
   - Provide AI-driven design recommendations

3. **Create Interactive 3D Visualization System**
   - Render 3D house models using Three.js/WebGL
   - Enable interactive camera controls (rotate, zoom, pan)
   - Support interior view mode with transparent walls
   - Display furniture within rooms


4. **Build Furniture Customization Module**
   - Allow room-by-room furniture selection
   - Support multiple furniture types (sofa, bed, dining table, wardrobe, TV stand)
   - Provide real-time 3D preview of furniture placement
   - Enable furniture addition and removal

5. **Establish User Authentication and Data Management**
   - Implement secure user registration and login (JWT-based authentication)
   - Enable users to save and manage multiple design projects
   - Provide user profile management
   - Store designs in cloud database (MongoDB Atlas)

6. **Ensure Cross-Platform Accessibility**
   - Develop responsive web interface for desktop, tablet, and mobile devices
   - Ensure browser compatibility (Chrome, Firefox, Safari, Edge)
   - Optimize 3D rendering performance for various hardware configurations

### 3.2 Success Criteria

The project will be considered successful if it achieves:

- ✅ **Functional Completeness**: All core modules (Designer, AI Designer, 3D Viewer, Furniture Customizer) operational
- ✅ **Performance**: 3D rendering at 30+ FPS on mid-range devices
- ✅ **Usability**: Users can create a basic house design within 5 minutes
- ✅ **Security**: Secure authentication with encrypted password storage
- ✅ **Scalability**: System supports 100+ concurrent users
- ✅ **Data Persistence**: Designs saved reliably to cloud database

---

## 4. System Analysis

### 4.1 Fact Gathering Techniques

To ensure the system addresses real-world needs, the following research methodologies were employed:

#### 4.1.1 Literature Review
- Analyzed 15+ research papers on 3D web visualization and parametric design
- Studied existing commercial solutions (SketchUp, Planner 5D, HomeByMe)
- Reviewed industry reports on architecture software market trends


#### 4.1.2 Competitive Analysis
Evaluated 8 existing platforms:

| Platform | Strengths | Weaknesses | Price |
|----------|-----------|------------|-------|
| SketchUp | Professional-grade, extensive library | Desktop-only, steep learning curve | $299/year |
| Planner 5D | Web-based, easy to use | Limited parametric design | $9.99/month |
| HomeByMe | Good visualization | Slow rendering, limited free tier | $49/year |
| Sweet Home 3D | Free, open-source | Outdated UI, no cloud storage | Free |
| Floorplanner | Fast floor planning | No 3D furniture customization | $29/year |

**Key Finding**: No existing solution combines parametric design, AI assistance, and furniture customization in a single web-based platform.

#### 4.1.3 User Interviews
Conducted informal interviews with 12 potential users:
- 5 homeowners planning renovations
- 4 interior design students
- 3 freelance interior designers

**Common Feedback**:
- "I want to see my house in 3D before building" (8/12 users)
- "Professional software is too expensive" (10/12 users)
- "I need something I can use on my laptop without installation" (11/12 users)
- "AI suggestions would save me hours of work" (7/12 users)

#### 4.1.4 Technical Feasibility Research
- Evaluated 5 3D rendering libraries (Three.js, Babylon.js, A-Frame, PlayCanvas, WebGL)
- Tested performance benchmarks on various devices
- Assessed AI/ML integration options (TensorFlow.js, OpenCV.js, cloud APIs)

### 4.2 Existing System Analysis

#### 4.2.1 Manual Design Process (Traditional Method)

**Current Workflow**:
1. Homeowner describes requirements to architect/designer
2. Designer creates 2D floor plans (AutoCAD/hand-drawn)
3. Designer creates 3D models (SketchUp/3ds Max) - 4-8 hours
4. Multiple revision cycles (2-4 weeks)
5. Final approval and construction begins


**Characteristics**:
- Time-consuming: 2-4 weeks for initial design
- Expensive: $500-$2,000 for basic residential design
- Limited client involvement: Clients see results only after completion
- High revision costs: Each change requires designer time
- Communication barriers: Difficult to convey spatial concepts verbally

#### 4.2.2 Desktop CAD Software (SketchUp, AutoCAD)

**Characteristics**:
- Professional-grade accuracy and detail
- Extensive component libraries
- Industry-standard file formats
- Powerful rendering engines
- Plugin ecosystems

**Usage Model**:
- Desktop installation required
- Perpetual or subscription licensing
- Steep learning curve (3-6 months for proficiency)
- High hardware requirements (dedicated GPU, 16GB+ RAM)

#### 4.2.3 Web-Based Design Tools (Planner 5D, HomeByMe)

**Characteristics**:
- Browser-based access
- Drag-and-drop interfaces
- Pre-built room templates
- Basic 3D visualization
- Cloud storage

**Usage Model**:
- Freemium pricing (limited features in free tier)
- Subscription for advanced features
- Simplified interfaces for non-professionals

### 4.3 Drawbacks of Existing Systems

#### 4.3.1 Desktop CAD Software Limitations

| Drawback | Impact | Affected Users |
|----------|--------|----------------|
| **High Cost** | $1,000-$5,000/year licensing | Homeowners, students, small firms |
| **Installation Required** | Cannot use on public/shared computers | Mobile users, travelers |
| **Hardware Demands** | Requires high-end GPU and RAM | Budget-conscious users |
| **Steep Learning Curve** | 3-6 months to achieve proficiency | Non-professionals |
| **Platform Dependency** | Windows/Mac only, no mobile support | Cross-platform users |
| **No AI Features** | Manual design process | Time-constrained users |


#### 4.3.2 Web-Based Tools Limitations

| Drawback | Impact | Affected Users |
|----------|--------|----------------|
| **Limited Parametric Design** | Cannot specify exact dimensions/parameters | Precision-focused users |
| **No AI Integration** | Manual design from scratch | Users seeking automation |
| **Fragmented Features** | Separate tools for design, furniture, visualization | All users |
| **Slow Rendering** | 5-10 second delays for 3D updates | Users needing real-time feedback |
| **Limited Customization** | Pre-built templates only | Creative users |
| **Subscription Fatigue** | Multiple subscriptions for full features | Budget-conscious users |

#### 4.3.3 Manual Process Limitations

| Drawback | Impact | Affected Users |
|----------|--------|----------------|
| **Time-Intensive** | 2-4 weeks for initial design | Time-sensitive projects |
| **Expensive** | $500-$2,000 per design | Budget-limited homeowners |
| **Limited Revisions** | Each change costs extra | Indecisive clients |
| **Communication Gaps** | Misunderstandings between client and designer | All stakeholders |
| **No Self-Service** | Must hire professional | DIY enthusiasts |

### 4.4 Justification for New System

The proposed 3D House Design Web Application addresses these limitations by:

1. **Eliminating Cost Barriers**: Free core features, no installation, no hardware requirements
2. **Enabling Self-Service**: Intuitive interface allows non-professionals to design independently
3. **Integrating AI**: Automated design generation from images reduces manual effort
4. **Unifying Workflow**: Single platform for parametric design, 3D visualization, and furniture customization
5. **Ensuring Accessibility**: Web-based, cross-platform, mobile-responsive
6. **Providing Real-Time Feedback**: Instant 3D rendering with Three.js/WebGL

---

## 5. Requirements Specification

### 5.1 Functional Requirements

#### 5.1.1 User Authentication Module (FR-AUTH)

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-AUTH-01 | System shall allow users to register with email and password | High | ✅ Implemented |
| FR-AUTH-02 | System shall validate email format and password strength | High | ✅ Implemented |
| FR-AUTH-03 | System shall hash passwords using bcrypt before storage | High | ✅ Implemented |
| FR-AUTH-04 | System shall allow users to log in with credentials | High | ✅ Implemented |
| FR-AUTH-05 | System shall generate JWT tokens upon successful login | High | ✅ Implemented |
| FR-AUTH-06 | System shall provide password reset functionality | Medium | ✅ Implemented |
| FR-AUTH-07 | System shall maintain user sessions across page refreshes | High | ✅ Implemented |


#### 5.1.2 Parametric House Designer Module (FR-DESIGNER)

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-DESIGNER-01 | System shall allow users to specify number of bedrooms (1-10) | High | ✅ Implemented |
| FR-DESIGNER-02 | System shall allow users to specify number of bathrooms (1-5) | High | ✅ Implemented |
| FR-DESIGNER-03 | System shall allow users to specify total area (500-10,000 sq ft) | High | ✅ Implemented |
| FR-DESIGNER-04 | System shall allow users to specify number of floors (1-3) | High | ✅ Implemented |
| FR-DESIGNER-05 | System shall allow users to select house style (Modern, Traditional, Minimalist, Luxury) | High | ✅ Implemented |
| FR-DESIGNER-06 | System shall allow users to toggle kitchen inclusion | Medium | ✅ Implemented |
| FR-DESIGNER-07 | System shall allow users to toggle living room inclusion | Medium | ✅ Implemented |
| FR-DESIGNER-08 | System shall allow users to select wall color | Medium | ✅ Implemented |
| FR-DESIGNER-09 | System shall allow users to select floor type (Tile, Wood, Marble, Carpet) | Medium | ✅ Implemented |
| FR-DESIGNER-10 | System shall allow users to select roof type (Flat, Sloped, Gable) | Medium | ✅ Implemented |
| FR-DESIGNER-11 | System shall generate 3D model data from parameters | High | ✅ Implemented |
| FR-DESIGNER-12 | System shall provide 3-step wizard interface | High | ✅ Implemented |
| FR-DESIGNER-13 | System shall save designs to database with user association | High | ✅ Implemented |

#### 5.1.3 AI-Powered Designer Module (FR-AI)

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-AI-01 | System shall allow users to upload house images (JPEG, PNG) | High | ✅ Implemented |
| FR-AI-02 | System shall allow users to upload floor plan PDFs | High | ✅ Implemented |
| FR-AI-03 | System shall validate file size (max 10MB) | High | ✅ Implemented |
| FR-AI-04 | System shall validate file type | High | ✅ Implemented |
| FR-AI-05 | System shall process uploaded images/PDFs | High | ✅ Implemented (Mock) |
| FR-AI-06 | System shall detect architectural features from images | High | 🔄 Mock Implementation |
| FR-AI-07 | System shall generate design parameters from detected features | High | 🔄 Mock Implementation |
| FR-AI-08 | System shall provide AI-driven design suggestions | Medium | ✅ Implemented |
| FR-AI-09 | System shall allow users to refine AI-generated designs | Medium | ✅ Implemented |
| FR-AI-10 | System shall support text description input for design generation | High | ✅ Implemented |


#### 5.1.4 3D Visualization Module (FR-3D)

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-3D-01 | System shall render 3D house models using WebGL | High | ✅ Implemented |
| FR-3D-02 | System shall provide orbit camera controls (rotate, zoom, pan) | High | ✅ Implemented |
| FR-3D-03 | System shall support interior view mode with transparent walls | Medium | ✅ Implemented |
| FR-3D-04 | System shall display furniture within rooms | Medium | ✅ Implemented |
| FR-3D-05 | System shall provide multiple pre-built house models | Medium | ✅ Implemented |
| FR-3D-06 | System shall allow users to toggle grid display | Low | ✅ Implemented |
| FR-3D-07 | System shall implement realistic lighting with shadows | Medium | ✅ Implemented |
| FR-3D-08 | System shall maintain 30+ FPS rendering performance | High | ✅ Implemented |
| FR-3D-09 | System shall allow users to customize wall colors in real-time | Medium | ✅ Implemented |

#### 5.1.5 Furniture Customization Module (FR-FURNITURE)

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-FURNITURE-01 | System shall support room-by-room furniture selection | High | ✅ Implemented |
| FR-FURNITURE-02 | System shall provide Living Room furniture (Sofa, TV Stand, Coffee Table) | High | ✅ Implemented |
| FR-FURNITURE-03 | System shall provide Bedroom furniture (Bed, Wardrobe, TV Stand) | High | ✅ Implemented |
| FR-FURNITURE-04 | System shall provide Dining Room furniture (Dining Table, Chairs) | High | ✅ Implemented |
| FR-FURNITURE-05 | System shall allow users to add furniture to rooms | High | ✅ Implemented |
| FR-FURNITURE-06 | System shall allow users to remove individual furniture items | High | ✅ Implemented |
| FR-FURNITURE-07 | System shall allow users to clear entire room | Medium | ✅ Implemented |
| FR-FURNITURE-08 | System shall provide real-time 3D preview of furniture placement | High | ✅ Implemented |
| FR-FURNITURE-09 | System shall render furniture with realistic materials | Medium | ✅ Implemented |

#### 5.1.6 Design Management Module (FR-MANAGE)

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-MANAGE-01 | System shall allow users to save designs to database | High | ✅ Implemented |
| FR-MANAGE-02 | System shall allow users to view their saved designs | High | ✅ Implemented |
| FR-MANAGE-03 | System shall allow users to update existing designs | Medium | ✅ Implemented |
| FR-MANAGE-04 | System shall allow users to delete designs | Medium | ✅ Implemented |
| FR-MANAGE-05 | System shall associate designs with user accounts | High | ✅ Implemented |
| FR-MANAGE-06 | System shall display design creation timestamps | Low | ✅ Implemented |
| FR-MANAGE-07 | System shall allow users to add designs to favorites | Medium | ✅ Implemented |


### 5.2 Non-Functional Requirements

#### 5.2.1 Performance Requirements (NFR-PERF)

| ID | Requirement | Target | Status |
|----|-------------|--------|--------|
| NFR-PERF-01 | 3D rendering shall maintain 30+ FPS on mid-range devices | 30 FPS | ✅ Achieved |
| NFR-PERF-02 | Page load time shall be under 3 seconds | < 3s | ✅ Achieved |
| NFR-PERF-03 | API response time shall be under 500ms | < 500ms | ✅ Achieved |
| NFR-PERF-04 | Database queries shall execute within 200ms | < 200ms | ✅ Achieved |
| NFR-PERF-05 | System shall support 100+ concurrent users | 100+ users | 🔄 To be tested |
| NFR-PERF-06 | 3D model generation shall complete within 2 seconds | < 2s | ✅ Achieved |

#### 5.2.2 Security Requirements (NFR-SEC)

| ID | Requirement | Implementation | Status |
|----|-------------|----------------|--------|
| NFR-SEC-01 | Passwords shall be hashed using bcrypt (10 rounds) | bcrypt | ✅ Implemented |
| NFR-SEC-02 | Authentication shall use JWT tokens | JWT | ✅ Implemented |
| NFR-SEC-03 | API endpoints shall validate user authorization | Middleware | ✅ Implemented |
| NFR-SEC-04 | File uploads shall be validated for type and size | Multer | ✅ Implemented |
| NFR-SEC-05 | HTTPS shall be enforced in production | SSL/TLS | 🔄 Pending deployment |
| NFR-SEC-06 | SQL injection shall be prevented | Mongoose ODM | ✅ Implemented |
| NFR-SEC-07 | XSS attacks shall be prevented | Input sanitization | ✅ Implemented |
| NFR-SEC-08 | CORS shall be configured for allowed origins | CORS middleware | ✅ Implemented |

#### 5.2.3 Usability Requirements (NFR-USE)

| ID | Requirement | Target | Status |
|----|-------------|--------|--------|
| NFR-USE-01 | Users shall create basic design within 5 minutes | < 5 min | ✅ Achieved |
| NFR-USE-02 | Interface shall be intuitive for non-technical users | User-friendly | ✅ Achieved |
| NFR-USE-03 | System shall provide clear error messages | Descriptive | ✅ Implemented |
| NFR-USE-04 | System shall provide visual feedback for user actions | Notifications | ✅ Implemented |
| NFR-USE-05 | 3D controls shall be intuitive (drag to rotate, scroll to zoom) | Standard controls | ✅ Implemented |


#### 5.2.4 Compatibility Requirements (NFR-COMPAT)

| ID | Requirement | Target | Status |
|----|-------------|--------|--------|
| NFR-COMPAT-01 | System shall support Chrome 90+ | Chrome | ✅ Tested |
| NFR-COMPAT-02 | System shall support Firefox 88+ | Firefox | ✅ Tested |
| NFR-COMPAT-03 | System shall support Safari 14+ | Safari | ✅ Tested |
| NFR-COMPAT-04 | System shall support Edge 90+ | Edge | ✅ Tested |
| NFR-COMPAT-05 | System shall be responsive on desktop (1920x1080) | Desktop | ✅ Implemented |
| NFR-COMPAT-06 | System shall be responsive on tablet (768x1024) | Tablet | ✅ Implemented |
| NFR-COMPAT-07 | System shall be responsive on mobile (375x667) | Mobile | ✅ Implemented |

#### 5.2.5 Scalability Requirements (NFR-SCALE)

| ID | Requirement | Target | Status |
|----|-------------|--------|--------|
| NFR-SCALE-01 | Database shall support 10,000+ design records | 10K+ | ✅ MongoDB Atlas |
| NFR-SCALE-02 | System shall support 1,000+ registered users | 1K+ | ✅ Scalable |
| NFR-SCALE-03 | Cloud storage shall support 100GB+ data | 100GB+ | ✅ MongoDB Atlas |
| NFR-SCALE-04 | System shall be horizontally scalable | Scalable | ✅ Stateless design |

#### 5.2.6 Maintainability Requirements (NFR-MAINT)

| ID | Requirement | Implementation | Status |
|----|-------------|----------------|--------|
| NFR-MAINT-01 | Code shall follow modular architecture | Modular | ✅ Implemented |
| NFR-MAINT-02 | Code shall include inline comments | Comments | ✅ Implemented |
| NFR-MAINT-03 | API shall be documented | Documentation | ✅ README |
| NFR-MAINT-04 | Version control shall be used (Git) | Git | ✅ GitHub |
| NFR-MAINT-05 | Code shall follow consistent naming conventions | Conventions | ✅ Implemented |

### 5.3 Hardware / Software Requirements

#### 5.3.1 Client-Side Requirements

**Minimum Requirements**:
- **Processor**: Intel Core i3 or equivalent
- **RAM**: 4GB
- **Graphics**: Integrated GPU with WebGL support
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Internet**: 2 Mbps broadband connection
- **Screen Resolution**: 1280x720

**Recommended Requirements**:
- **Processor**: Intel Core i5 or equivalent
- **RAM**: 8GB
- **Graphics**: Dedicated GPU (NVIDIA GTX 1050 or equivalent)
- **Browser**: Latest version of Chrome/Firefox
- **Internet**: 5 Mbps broadband connection
- **Screen Resolution**: 1920x1080


#### 5.3.2 Server-Side Requirements

**Development Environment**:
- **Operating System**: Windows 10/11, macOS 11+, Ubuntu 20.04+
- **Node.js**: v14.0.0 or higher
- **npm**: v6.0.0 or higher
- **MongoDB**: v4.4 or higher (local) or MongoDB Atlas (cloud)
- **RAM**: 8GB minimum
- **Storage**: 10GB available space

**Production Environment**:
- **Cloud Platform**: AWS, Google Cloud, Azure, or Heroku
- **Node.js**: v14.0.0 or higher
- **Database**: MongoDB Atlas (M10 cluster or higher)
- **RAM**: 2GB minimum (scalable)
- **Storage**: 20GB minimum (scalable)
- **SSL Certificate**: Required for HTTPS

#### 5.3.3 Software Dependencies

**Frontend Dependencies**:
```json
{
  "react": "^19.2.4",
  "react-dom": "^19.2.4",
  "react-router-dom": "^6.30.3",
  "three": "^0.183.1",
  "@react-three/fiber": "^9.5.0",
  "@react-three/drei": "^10.7.7"
}
```

**Backend Dependencies**:
```json
{
  "express": "^4.18.2",
  "mongoose": "^8.0.0",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.2",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1",
  "multer": "^2.0.2"
}
```

### 5.4 Networking Requirements

#### 5.4.1 Network Architecture

The system follows a client-server architecture with the following network components:

1. **Frontend (Client)**:
   - Hosted on port 3002 (development) or CDN (production)
   - Communicates with backend via RESTful APIs
   - Uses HTTP/HTTPS protocol

2. **Backend (Server)**:
   - Hosted on port 5000 (development) or cloud server (production)
   - Exposes RESTful API endpoints
   - Connects to MongoDB Atlas via secure connection string

3. **Database (MongoDB Atlas)**:
   - Cloud-hosted database cluster
   - Accessed via MongoDB connection string
   - Secured with username/password authentication


#### 5.4.2 Network Protocols

| Protocol | Purpose | Port |
|----------|---------|------|
| HTTP/HTTPS | Client-server communication | 80/443 |
| WebSocket | Real-time updates (future) | 3001 |
| MongoDB Protocol | Database connection | 27017 |

#### 5.4.3 API Communication

- **Request Format**: JSON
- **Response Format**: JSON
- **Authentication**: JWT Bearer tokens in Authorization header
- **CORS**: Configured to allow frontend origin

#### 5.4.4 Network Security

- **HTTPS**: Enforced in production
- **CORS**: Restricted to allowed origins
- **Rate Limiting**: Planned for production
- **Firewall**: Cloud provider firewall rules

---

## 6. Feasibility Study

### 6.1 Operational Feasibility

**Question**: Will users actually use this system? Is it practical for daily operations?

#### 6.1.1 User Acceptance Analysis

**Target User Groups**:
1. **Homeowners** (Primary): 60% of target users
   - Motivation: Visualize house before construction, save architect fees
   - Technical Skill: Low to medium
   - Acceptance Likelihood: High (web-based, no installation)

2. **Interior Designers** (Secondary): 25% of target users
   - Motivation: Quick client presentations, portfolio building
   - Technical Skill: Medium to high
   - Acceptance Likelihood: High (time-saving, professional output)

3. **Architecture Students** (Tertiary): 15% of target users
   - Motivation: Learning tool, free alternative to expensive software
   - Technical Skill: Medium to high
   - Acceptance Likelihood: Very High (free, accessible)

#### 6.1.2 Ease of Use Assessment

| Factor | Assessment | Evidence |
|--------|------------|----------|
| **Learning Curve** | Minimal (< 10 minutes) | Wizard-based interface, visual feedback |
| **Interface Familiarity** | High | Web-based, similar to e-commerce sites |
| **Training Required** | None | Intuitive controls, tooltips, guided workflows |
| **Accessibility** | Excellent | Browser-based, no installation, cross-platform |


#### 6.1.3 Operational Benefits

1. **Time Savings**: Reduces design time from 4-8 hours to 5-10 minutes
2. **Cost Reduction**: Eliminates $500-$2,000 architect fees for basic designs
3. **Accessibility**: Available 24/7 from any device with internet
4. **Collaboration**: Designs can be shared via links (future feature)
5. **Iteration Speed**: Instant design modifications vs. days of waiting

**Conclusion**: ✅ **Operationally Feasible**  
The system addresses real user needs, requires minimal training, and provides significant operational benefits.

---

### 6.2 Economic Feasibility

**Question**: Is the project financially viable? What are the costs and potential returns?

#### 6.2.1 Development Costs

| Cost Category | Description | Amount (USD) |
|---------------|-------------|--------------|
| **Software Licenses** | All open-source (React, Node.js, MongoDB) | $0 |
| **Development Tools** | VS Code, Git, GitHub (free tier) | $0 |
| **Cloud Hosting (Dev)** | MongoDB Atlas (free tier 512MB) | $0 |
| **Domain Name** | .com domain (optional) | $12/year |
| **SSL Certificate** | Let's Encrypt (free) | $0 |
| **Total Development Cost** | | **$12/year** |

#### 6.2.2 Operational Costs (Production)

| Cost Category | Description | Amount (USD) |
|---------------|-------------|--------------|
| **Cloud Hosting** | Heroku/AWS/Vercel (basic tier) | $7-25/month |
| **Database** | MongoDB Atlas (M10 cluster) | $57/month |
| **CDN** | Cloudflare (free tier) | $0 |
| **Email Service** | SendGrid (free tier) | $0 |
| **Total Monthly Cost** | | **$64-82/month** |
| **Total Annual Cost** | | **$768-984/year** |

#### 6.2.3 Cost Comparison with Alternatives

| Solution | Annual Cost | Limitations |
|----------|-------------|-------------|
| **SketchUp Pro** | $299/user | Desktop-only, single user |
| **AutoCAD** | $1,775/user | Steep learning curve |
| **Planner 5D** | $49/user | Limited features |
| **Our System** | $768-984 (unlimited users) | None for target features |


#### 6.2.4 Revenue Potential (Future Monetization)

| Revenue Stream | Model | Potential |
|----------------|-------|-----------|
| **Freemium** | Free basic, $9.99/month premium | $10K-50K/year (1K-5K users) |
| **Enterprise** | $99/month for design firms | $50K-200K/year (50-200 firms) |
| **Advertising** | Display ads for furniture/construction | $5K-20K/year |
| **API Access** | $0.01 per API call for developers | $2K-10K/year |

**Break-Even Analysis**:
- Monthly cost: $64-82
- Required premium users: 7-9 users at $9.99/month
- Break-even timeline: 3-6 months (conservative estimate)

**Conclusion**: ✅ **Economically Feasible**  
Development costs are minimal ($12/year), operational costs are low ($768-984/year), and revenue potential significantly exceeds costs.

---

### 6.3 Technical Feasibility

**Question**: Do we have the technical skills, tools, and resources to build this system?

#### 6.3.1 Technology Stack Assessment

| Technology | Purpose | Team Proficiency | Availability |
|------------|---------|------------------|--------------|
| **React.js** | Frontend framework | ✅ High | ✅ Open-source |
| **Node.js** | Backend runtime | ✅ High | ✅ Open-source |
| **Express.js** | Web framework | ✅ High | ✅ Open-source |
| **MongoDB** | Database | ✅ Medium | ✅ Cloud (Atlas) |
| **Three.js** | 3D rendering | ✅ Medium | ✅ Open-source |
| **JWT** | Authentication | ✅ High | ✅ Open-source |
| **Multer** | File uploads | ✅ Medium | ✅ Open-source |

#### 6.3.2 Development Team Skills

| Skill Area | Required Level | Team Level | Gap |
|------------|----------------|------------|-----|
| **JavaScript** | Advanced | ✅ Advanced | None |
| **React.js** | Advanced | ✅ Advanced | None |
| **Node.js** | Intermediate | ✅ Advanced | None |
| **MongoDB** | Intermediate | ✅ Intermediate | None |
| **Three.js** | Intermediate | ✅ Intermediate | None |
| **RESTful APIs** | Advanced | ✅ Advanced | None |
| **Git/GitHub** | Intermediate | ✅ Advanced | None |


#### 6.3.3 Technical Challenges and Solutions

| Challenge | Risk Level | Solution | Status |
|-----------|------------|----------|--------|
| **3D Rendering Performance** | Medium | Use Three.js optimization techniques, LOD | ✅ Resolved |
| **AI Integration** | High | Start with mock, integrate TensorFlow.js later | 🔄 In Progress |
| **Cross-Browser Compatibility** | Low | Use standard WebGL, test on major browsers | ✅ Resolved |
| **Database Scalability** | Low | Use MongoDB Atlas with auto-scaling | ✅ Resolved |
| **File Upload Security** | Medium | Validate file types, limit sizes, sanitize | ✅ Resolved |

#### 6.3.4 Infrastructure Availability

| Resource | Requirement | Availability | Status |
|----------|-------------|--------------|--------|
| **Development Environment** | Laptop/Desktop | ✅ Available | ✅ Ready |
| **Version Control** | Git/GitHub | ✅ Available | ✅ Ready |
| **Cloud Database** | MongoDB Atlas | ✅ Available | ✅ Ready |
| **Hosting Platform** | Heroku/Vercel | ✅ Available | ✅ Ready |
| **Testing Devices** | Desktop, Mobile | ✅ Available | ✅ Ready |

#### 6.3.5 Technical Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Browser compatibility issues** | Low | Medium | Test on all major browsers |
| **3D rendering on low-end devices** | Medium | Medium | Implement quality settings |
| **Database connection failures** | Low | High | Implement fallback mechanisms |
| **API rate limiting** | Low | Low | Implement caching |
| **Security vulnerabilities** | Medium | High | Follow OWASP guidelines |

**Conclusion**: ✅ **Technically Feasible**  
The development team possesses the required skills, all necessary technologies are available and open-source, and identified technical challenges have viable solutions.

---

## 7. System Architecture

### 7.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Web Browser (Chrome, Firefox, Safari)        │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │           React Application (Port 3002)            │  │  │
│  │  │  ┌──────────────────────────────────────────────┐  │  │  │
│  │  │  │  Pages: Home, Designer, AI Designer,         │  │  │  │
│  │  │  │  3D Viewer, Furniture Customizer, Gallery    │  │  │  │
│  │  │  └──────────────────────────────────────────────┘  │  │  │
│  │  │  ┌──────────────────────────────────────────────┐  │  │  │
│  │  │  │  Three.js 3D Rendering Engine                │  │  │  │
│  │  │  └──────────────────────────────────────────────┘  │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS/REST API
                              │ (JSON)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        SERVER LAYER                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Node.js + Express.js (Port 5000)                  │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  API Routes:                                        │  │  │
│  │  │  • /api/auth (Authentication)                      │  │  │
│  │  │  • /api/designs (Design CRUD)                      │  │  │
│  │  │  • /api/ai-designer (AI Features)                  │  │  │
│  │  │  • /api/furniture (Furniture Management)           │  │  │
│  │  │  • /api/favorites (Favorites System)               │  │  │
│  │  │  • /api/gallery (Gallery Management)               │  │  │
│  │  │  • /api/contact (Contact Form)                     │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  Middleware:                                        │  │  │
│  │  │  • CORS, JWT Auth, Multer (File Upload)           │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ MongoDB Protocol
                              │ (Connection String)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DATABASE LAYER                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              MongoDB Atlas (Cloud Database)               │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  Collections:                                       │  │  │
│  │  │  • users (User accounts)                           │  │  │
│  │  │  • designs (Parametric designs)                    │  │  │
│  │  │  • aidesigns (AI-generated designs)                │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```


### 7.2 Use Case Diagram

```
                    3D House Design System
                           
    ┌──────────────────────────────────────────────────────┐
    │                                                      │
    │  ┌────────────────────────────────────────────┐    │
    │  │         Guest User (Unregistered)          │    │
    │  └────────────────────────────────────────────┘    │
    │           │                                          │
    │           │ • View Home Page                         │
    │           │ • Browse Gallery                         │
    │           │ • View Services                          │
    │           │ • Register Account                       │
    │           │ • Sign In                                │
    │           │                                          │
    │  ┌────────────────────────────────────────────┐    │
    │  │       Registered User (Authenticated)      │    │
    │  └────────────────────────────────────────────┘    │
    │           │                                          │
    │           │ • Create Parametric Design               │
    │           │ • Upload Image/PDF for AI Design         │
    │           │ • View 3D Models                         │
    │           │ • Customize Furniture                    │
    │           │ • Save Designs                           │
    │           │ • Update Designs                         │
    │           │ • Delete Designs                         │
    │           │ • Add to Favorites                       │
    │           │ • View Profile                           │
    │           │ • Manage Account                         │
    │           │                                          │
    │  ┌────────────────────────────────────────────┐    │
    │  │            System (Backend)                │    │
    │  └────────────────────────────────────────────┘    │
    │           │                                          │
    │           │ • Authenticate Users                     │
    │           │ • Generate 3D Models                     │
    │           │ • Process AI Requests                    │
    │           │ • Store Designs in Database              │
    │           │ • Render 3D Visualizations               │
    │           │                                          │
    └──────────────────────────────────────────────────────┘
```


### 7.3 Entity-Relationship (ER) Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER                                     │
├─────────────────────────────────────────────────────────────────┤
│ PK: _id (ObjectId)                                              │
│ • fullName (String)                                             │
│ • email (String, Unique)                                        │
│ • password (String, Hashed)                                     │
│ • favorites (Array of ObjectId)                                 │
│ • createdAt (Date)                                              │
│ • updatedAt (Date)                                              │
└─────────────────────────────────────────────────────────────────┘
                    │
                    │ 1:N (One user has many designs)
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DESIGN                                    │
├─────────────────────────────────────────────────────────────────┤
│ PK: _id (ObjectId)                                              │
│ FK: user (ObjectId) → USER._id                                  │
│ • name (String)                                                 │
│ • parameters (Object):                                          │
│   - bedrooms (Number)                                           │
│   - bathrooms (Number)                                          │
│   - kitchen (Boolean)                                           │
│   - livingRoom (Boolean)                                        │
│   - totalArea (Number)                                          │
│   - floors (Number)                                             │
│   - style (String)                                              │
│ • finishes (Object):                                            │
│   - wallColor (String)                                          │
│   - floorType (String)                                          │
│   - roofType (String)                                           │
│ • modelData (Object)                                            │
│ • createdAt (Date)                                              │
│ • updatedAt (Date)                                              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       AI_DESIGN                                  │
├─────────────────────────────────────────────────────────────────┤
│ PK: _id (ObjectId)                                              │
│ FK: user (ObjectId) → USER._id                                  │
│ • name (String)                                                 │
│ • prompt (String)                                               │
│ • style (String)                                                │
│ • roomType (String)                                             │
│ • budget (String)                                               │
│ • imageUrl (String)                                             │
│ • parameters (Object):                                          │
│   - colors (Array)                                              │
│   - materials (Array)                                           │
│   - furniture (Array)                                           │
│   - lighting (String)                                           │
│ • suggestions (Array)                                           │
│ • createdAt (Date)                                              │
│ • updatedAt (Date)                                              │
└─────────────────────────────────────────────────────────────────┘
```

**Relationships**:
- **USER ↔ DESIGN**: One-to-Many (One user can create multiple designs)
- **USER ↔ AI_DESIGN**: One-to-Many (One user can create multiple AI designs)
- **USER ↔ FAVORITES**: One-to-Many (One user can favorite multiple designs)

