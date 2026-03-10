import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Header } from "./components";
import { Login, Signup, CardList, Home, PublicList, Terms, Privacy } from "./pages";
import { CharacterProvider } from "./context/CharacterContext"
import "./App.css";

const App: React.FC = () => {
  return (
    <CharacterProvider>
      <BrowserRouter>
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/cardList" element={<CardList />} />
            <Route path="/publicList" element={<PublicList />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
          </Routes>
        </main>
      </BrowserRouter>
    </CharacterProvider>

  );
};

export default App;