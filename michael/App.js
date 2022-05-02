import PretendApp from "./PretendApp";
import { AuthProvider } from "./contexts/AuthContext";

// PretendApp is replacing app so that I can use my auth context.
// Is this bad? Probably.
export default function App() {
  return (
    <AuthProvider>
      <PretendApp/>
    </AuthProvider>
  )
}