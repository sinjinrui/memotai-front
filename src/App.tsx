import Header from "./components/Header";

const App: React.FC = () => {
  return (
    <>
      <Header />
      <main style={{ paddingTop: "80px" }}>
        <h1>コンテンツエリア</h1>
      </main>
    </>
  );
};

export default App;