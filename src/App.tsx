// import { Toaster } from "@/components/ui/toaster";
// import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";

import Index from "./pages/Index";
// import Auth from "./pages/Auth";
import Buscar from "./pages/Buscar";
import DetalleProf from "./pages/DetalleProf";
import ProfessionalOnboarding from "./pages/ProfessionalOnboarding";
import ProfessionalIntro from "./pages/ProfessionalIntro";
import SpecialtySelection from "./pages/SpecialtySelection";
import PhotoGuidelines from "./pages/PhotoGuidelines";
import PhotoUpload from "./pages/PhotoUpload";
import PersonalData from "./pages/PersonalData";
import Completion from "./pages/Completion";
import Publicar from "./pages/Publicar";
import Perfil from "./pages/Perfil";
import MisPublicaciones from "./pages/MisPublicaciones";
import UserTypeSelection from "./pages/UserTypeSelection";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        {/* <Toaster />
        <Sonner /> */}
        <BrowserRouter>
          <div className='md:pb-0'>
            <Routes>
              <Route path='/' element={<Index />} />
              {/* <Route path='/auth' element={<Auth />} /> */}
              <Route path='/buscar' element={<Buscar />} />
              <Route path='/profesional' element={<DetalleProf />} />
              <Route
                path='/professional-intro'
                element={<ProfessionalIntro />}
              />
              <Route
                path='/specialty-selection'
                element={<SpecialtySelection />}
              />
              <Route
                path='/photo-guidelines'
                element={<PhotoGuidelines />}
              />
              <Route
                path='/photo-upload'
                element={<PhotoUpload />}
              />
              <Route
                path='/personal-data'
                element={<PersonalData />}
              />
              <Route
                path='/completion'
                element={<Completion />}
              />
              <Route path='/onboarding' element={<ProfessionalOnboarding />} />
              <Route
                path='/user-type-selection'
                element={<UserTypeSelection />}
              />
              <Route path='/publicar' element={<Publicar />} />
              <Route path='/perfil' element={<Perfil />} />
              <Route path='/mis-publicaciones' element={<MisPublicaciones />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path='*' element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
