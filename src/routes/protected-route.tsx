// import { jwtDecode } from "jwt-decode";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/use-auth";
import LoadingSpinner from "../components/spinner";
// import { useAuthNative } from "../hooks/use-authnative";


export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
        <LoadingSpinner fullScreen/>
    )
  };

  if (!isAuthenticated) {
    return (
        <Navigate to={"/login"} replace />
    )
  };

  // try {
  //   const decoded: any = jwtDecode(token);
  //   const currentTime = Date.now() / 1000;
  //   if (decoded.exp < currentTime) {
  //       console.warn("Token has expired, Please you are going to be redirected to log in page !");
  //       localStorage.removeItem('token');
  //       return <Navigate to={"/login"} replace />
  //   }
  // } catch (error) {
  //   console.error("Error: Unable to verify your crendentials!", error);
  //   localStorage.removeItem('token');
  //   return <Navigate to={"/login"} replace />
  // }

  return <>{children}</>
}