import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import AnimatedSpin from "./AnimatedSpin";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

type User = {
  uid?: string;
  name?: string;
  email?: string;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [user, setUser] = useState<User | "">(""); 
  const [checking, setChecking] = useState<boolean>(true);
  const [connectionStatus, setConnectionStatus] = useState<"online" | "offline" | "no-internet">(
    navigator.onLine ? "online" : "offline"
    // "offline"
  );
  const [authError, setAuthError] = useState<string | null>(null);
  
  useEffect(() => {
    // Check real internet connection (not just network interface)
    const checkInternet = async () => {
      try {
        await fetch("https://www.google.com", { mode: "no-cors" });
        setConnectionStatus("online");
      } catch {
        setConnectionStatus("no-internet");
      // setChecking(false)

      }
    };

    // Network status listeners
    const handleOnline = () => checkInternet();
    const handleOffline = () => setConnectionStatus("offline");
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // check the internet if user connect to internet
    if(navigator.onLine){
    // Initial check
    setChecking(true)
    checkInternet();
    // console.log(connectionStatus)
    }else{
      setChecking(false);
      // console.log(connectionStatus)
    }

    // console.log(user)
    // Auth state listener
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(
      auth, 
      (currentUser) => {
        if (connectionStatus === "online") {
          setUser(currentUser);
          setChecking(false);
          setAuthError(null);
        }
      },
      (error) => {
        setAuthError(error.message);
        setChecking(false);
      }
    );

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };

  }, [connectionStatus]);

  // Loading state
  if (checking) {
    return (
      <div className="[direction:rtl] px-2 grid place-items-center h-[100dvh] bg-gray-900 text-white font-extrabold">
        <div className="flex items-center gap-2">
          <AnimatedSpin loadingMsg="جار التحقق من عملية تسجيل الدخول"/>
        </div>
      </div>
    );
  }

  // No internet state (connected to WiFi but no actual internet)
  if (connectionStatus === "no-internet") {
    return (
      <div className="[direction:rtl] px-2 grid place-items-center h-[100dvh] bg-gray-900 text-white font-extrabold">
        <div className="text-center">
          <h2 className="text-2xl mb-4">اتصال بالشبكة ولكن بدون إنترنت</h2>
          <p>يوجد اتصال بالشبكة ولكن لا يوجد اتصال بالإنترنت الفعلي</p>
          <p className="mt-2">الرجاء التحقق من اتصالك بالإنترنت ثم إعادة تحميل الصفحة</p>
        </div>
      </div>
    );
  }

  // Offline state
  if (connectionStatus === "offline") {
    return (
      <div className="[direction:rtl] px-2 grid place-items-center h-[100dvh] bg-gray-900 text-white font-extrabold">
        <div className="text-center">
          <h2 className="text-2xl mb-4">لا يوجد اتصال بالشبكة</h2>
          <p>الرجاء التحقق من اتصالك بالشبكة ثم إعادة تحميل الصفحة</p>
        </div>
      </div>
    );
  }

  // Authentication error state
  if (authError) {
    return (
      <div className="[direction:rtl] px-2 grid place-items-center h-[100dvh] bg-gray-900 text-white font-extrabold">
        <div className="text-center">
          <h2 className="text-2xl mb-4">خطأ في المصادقة</h2>
          <p className="mb-4">{authError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
          >
            إعادة تحميل
          </button>
        </div>
      </div>
    );
  }

  // No user - redirect to login
  if (!user) {
    return <Navigate to={"/login"} replace />;
  }

  // Authenticated user with internet - show content
  return children;
}