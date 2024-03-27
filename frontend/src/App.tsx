import { useRecoilState } from "recoil";
import Chat from "./pages/Chat";
import Singin from "./pages/Singin";
import useAuthObserver from "./utils/authObserver";
import { globalUserState } from "./recoil/atoms";
import { auth } from "./firebase";
import { useEffect } from "react";

function App() {
  const [user, setGlobalUser] = useRecoilState(globalUserState);

  useEffect(() => {
    auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        console.log("changed to ", currentUser.displayName);

        setGlobalUser({
          uid: currentUser.uid,
          displayName: currentUser.displayName,
        });
      } else {
        console.log("logout");

        setGlobalUser(null);
      }
    });
  }, []);

  if (user?.uid) return <Chat />;

  return <Singin />;
}

export default App;
