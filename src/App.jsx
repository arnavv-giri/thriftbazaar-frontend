import { useEffect, useState } from "react";
import { testBackend } from "./api/testApi";
import "./App.css";

function App() {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await testBackend();
        console.log("Backend response:", res);
        setStatus("ok");
      } catch (err) {
        console.error("Backend error:", err);
        setStatus("error");
      }
    };

    checkBackend();
  }, []);

  return (
    <div style={{ padding: "40px", color: "white" }}>
      <h1>ThriftBazaar Frontend Running</h1>

      {status === "loading" && <p>Checking backend...</p>}
      {status === "ok" && <p>Backend is healthy ✅</p>}
      {status === "error" && <p>Backend not reachable ❌</p>}
    </div>
  );
}

export default App;
