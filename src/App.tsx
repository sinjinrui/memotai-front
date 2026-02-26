import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Header } from "./components";
import { Login, Signup } from "./pages";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Header />
      <main>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
};

export default App;