import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Header, BottomCharacterMenu } from "./components";
import { Login, Signup, CardList } from "./pages";
import "./App.css";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Header />
      <main>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/cardList" element={<CardList />} />
        </Routes>
      </main>
      <BottomCharacterMenu />
    </BrowserRouter>
  );
};

export default App;