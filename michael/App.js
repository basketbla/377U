import PretendApp from "./PretendApp";
import { AuthProvider } from "./contexts/AuthContext";
import { FriendsProvider } from "./contexts/FriendsContext";

// PretendApp is replacing app so that I can use my auth context.
// Is this bad? Probably.
export default function App() {


  return (
    <AuthProvider>
      <FriendsProvider>
        <PretendApp/>
      </FriendsProvider>
    </AuthProvider>
  )
}
