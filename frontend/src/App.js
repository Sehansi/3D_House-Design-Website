import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/common/Home";
import SignIn from "./pages/auth/SignIn";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Profile from "./pages/architect/Profile";
import CustomerProfile from "./pages/customer/CustomerProfile";
import About from "./pages/common/About";
import Contact from "./pages/common/Contact";
import Gallery from "./pages/common/Gallery";
import Services from "./pages/common/Services";
import Viewer3D from "./pages/common/Viewer3D";
import AIDesigner from "./pages/common/AIDesigner";
import FurnitureCustomizer from "./pages/common/FurnitureCustomizer";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ConstructorDashboard from "./pages/constructor/ConstructorDashboard";
import ArchitectDashboard from "./pages/architect/ArchitectDashboard";
import Workstation from "./pages/architect/Workstation";
import Meetings from "./pages/architect/Meetings";
import ConstructorRequests from "./pages/constructor/ConstructorRequests";
import ConstructorAccepted from "./pages/constructor/ConstructorAccepted";
import ConstructorProfile from "./pages/constructor/ConstructorProfile";
import ArchitectsList from "./pages/customer/ArchitectsList";
import ArchitectProfile from "./pages/customer/ArchitectProfile";
import Constructors from "./pages/customer/Constructors";
import { useAuth } from "./context/AuthContext";

const ProfileRouter = () => {
  const { user } = useAuth();
  if (user?.role === 'Architect') {
    return <Profile />;
  }
  return <CustomerProfile />;
};

function App() {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || "12345-mock-id.apps.googleusercontent.com"}>
      <AuthProvider>
        <Router>
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/profile" element={<ProtectedRoute allowedRoles={['Customer', 'Architect']}><ProfileRouter /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['Customer']}><CustomerProfile /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute allowedRoles={['Admin']}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/architects" element={<ProtectedRoute allowedRoles={['Admin']}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/constructors" element={<ProtectedRoute allowedRoles={['Admin']}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/admins" element={<ProtectedRoute allowedRoles={['Admin']}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/constructor" element={<ProtectedRoute allowedRoles={['Constructor']}><ConstructorRequests /></ProtectedRoute>} />
              <Route path="/constructor/accepted" element={<ProtectedRoute allowedRoles={['Constructor']}><ConstructorAccepted /></ProtectedRoute>} />
              <Route path="/constructor/profile" element={<ProtectedRoute allowedRoles={['Constructor']}><ConstructorProfile /></ProtectedRoute>} />
              <Route path="/architect" element={<ProtectedRoute allowedRoles={['Architect']}><ArchitectDashboard /></ProtectedRoute>} />
              <Route path="/architect/workstation" element={<ProtectedRoute allowedRoles={['Architect']}><Workstation /></ProtectedRoute>} />
              <Route path="/architect/meetings" element={<ProtectedRoute allowedRoles={['Architect']}><Meetings /></ProtectedRoute>} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/services" element={<Services />} />
              <Route path="/viewer" element={<Viewer3D />} />
              <Route path="/ai-designer" element={<AIDesigner />} />
              <Route path="/furniture-customizer" element={<FurnitureCustomizer />} />
              <Route path="/architects" element={<ProtectedRoute allowedRoles={['Customer']}><ArchitectsList /></ProtectedRoute>} />
              <Route path="/architect/:id" element={<ProtectedRoute allowedRoles={['Customer']}><ArchitectProfile /></ProtectedRoute>} />
              <Route path="/constructors" element={<ProtectedRoute allowedRoles={['Customer']}><Constructors /></ProtectedRoute>} />
            </Routes>
            <Footer />
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
