import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebaseConfig";

export const handleGoogleSignIn = async (navigate, setMessage) => {
  try {
    const provider = new GoogleAuthProvider();

    provider.setCustomParameters({
      prompt: "select_account"
    });

    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log("Google user:", user);

    const googleUserData = {
      username: user.displayName,
      password: null,
      email: user.email,
    };

    await fetch("http://localhost:5000/user/register/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(googleUserData),
    });

    const loginResponse = await fetch("http://localhost:5000/user/login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(googleUserData),
    });

    const loginData = await loginResponse.json();

    if (loginResponse.ok) {
      localStorage.setItem("access_token", loginData.access_token);
      localStorage.setItem("refresh_token", loginData.refresh_token);
      navigate("/identify");
    } else {
      console.error("Backend login failed:", loginData.message);
      if (setMessage) setMessage(loginData.message);
    }
  } catch (error) {
    console.error("Error during Google sign-in:", error);
    if (setMessage) setMessage("Google sign-in failed.");
  }
};
