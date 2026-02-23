import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Profile from "./pages/Profile";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Gallery from "./pages/Gallery";
import Services from "./pages/Services";
import Viewer3D from "./pages/Viewer3D";
import Designer from "./pages/Designer";
import AIDesigner from "./pages/AIDesigner";
import FurnitureCustomizer from "./pages/FurnitureCustomizer";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/services" element={<Services />} />
          <Route path="/viewer" element={<Viewer3D />} />
          <Route path="/designer" element={<Designer />} />
          <Route path="/ai-designer" element={<AIDesigner />} />
          <Route path="/furniture-customizer" element={<FurnitureCustomizer />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

