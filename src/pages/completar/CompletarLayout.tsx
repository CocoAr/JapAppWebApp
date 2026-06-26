import { Outlet } from "react-router-dom";
import { CompletarProgressProvider } from "../../context/CompletarProgressContext";

export function CompletarLayout() {
  return (
    <CompletarProgressProvider>
      <Outlet />
    </CompletarProgressProvider>
  );
}
