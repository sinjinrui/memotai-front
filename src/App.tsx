import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Header, BottomCharacterMenu } from "./components";
import { Login, Signup, CardList, Home, PublicList } from "./pages";
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
          </Routes>
        </main>
        <BottomCharacterMenu />
      </BrowserRouter>
    </CharacterProvider>

  );
};

export default App;