import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import axios from "axios";

const token = localStorage.getItem("token");
if (token) {
	axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}
axios.defaults.withCredentials = true;

createRoot(document.getElementById("root")!).render(<App />);
