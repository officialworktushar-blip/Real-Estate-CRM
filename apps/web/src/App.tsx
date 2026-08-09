import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./routes";
import { Toast } from "@/components/common/Toast";

export default function App() {
  return (
    <BrowserRouter>
      <Toast />
      <AppRoutes />
    </BrowserRouter>
  );
}
