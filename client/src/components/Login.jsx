import React from "react";
import axios from "axios";

function Login() {
  const handleLogin = async () => {
    try {
      const response = await axios.get("http://localhost:3000/login");
      window.location.href = response.data.loginUrl;
    } catch (error) {
      console.error("Error logging in:", error);
    }
  };
  return (
    <div className="flex w-full h-[100vh] justify-center items-center">
      <button className="btn btn-primary text-white w-64" onClick={handleLogin}>
        Login
      </button>
    </div>
  );
}

export default Login;
