import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// componetns
import PopupError from "../components/PopupError";
import Input from "../components/Input";
// react icons
import { FaEye, FaEyeSlash } from "react-icons/fa";

// fire base
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "@firebase/firestore";
import { app, db } from "../firebase";

interface userData {
  userEmail: string;
  userPassword: string;
}
export default function Login() {
  // states
  const [userData, setUserData] = useState<userData>({
    userEmail: "",
    userPassword: "",
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [validateEmail, setValidateEmail] = useState<boolean>(false); //to show the error msg below the input if it was not valid
  const [loading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>(""); // the message the in the popup
  const [showPopup, setShowPopup] = useState<boolean>(false); // the popup

  const navigate = useNavigate();
  const auth = getAuth(app);

  const closePopupError = () => {
    setShowPopup(false);
  };

  const handelUserEmailChange = (email: string) => {
    setUserData({ ...userData, userEmail: email });
  };

  const handelUserPasswordChange = (password: string) => {
    setUserData({ ...userData, userPassword: password });
  };

  // func to toggel showing password
  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  // func to handle the login
  const handelLogin = async (e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // prevent the default action
    // check if the email is valid
    const isEmailVailditon = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      userData.userEmail
    );
    // update validateEmail state
    setValidateEmail(isEmailVailditon);
    // the login code goes here
    // if the user was online
    if (navigator.onLine) {
      // if email was valid
      if (isEmailVailditon) {
        console.log("login...");

        // try catch block
        setIsLoading(true);
        try {
          // attempt login
          const userCredential = await signInWithEmailAndPassword(
            auth,
            userData.userEmail,
            userData.userPassword
          );

          const user = userCredential.user;

          // check if the user is approved
          const approvedRef = doc(db, "users", user.uid);
          const approveSnap = await getDoc(approvedRef);
          if (approveSnap.exists()) {
            // if it succeful redirect to the dashboard
            navigate("/dashboard");
          } else {
            await signOut(auth);
            setShowPopup(true);
            setErrorMsg("هذا البريد قيد التأكيد");
          }
        } catch (error) {
          // handel Login error
          if ((error as { code: string }).code === "auth/user-not-found") {
            setShowPopup(true);
            setErrorMsg("عذراً هذا المتسخدم غير موجود");
          } else if ((error as {code:string}).code === "auth/wrong-password") {
            setShowPopup(true);
            setErrorMsg("كلمة  السر التي أدخلتها غير صحيحة");
          } else if ((error as {code:string}).code === "auth/invalid-credential") {
            setShowPopup(true);
            setErrorMsg("البريد الإلكتروني غير صحيح أو كلمة المرور غير صحيحة");
          } else if ((error as {code:string}).code === "auth/network-request-failed") {
            setShowPopup(true);
            setErrorMsg("فشل الإتصال بالشبكة، حاول مجدداً");
          }
        } finally {
          setIsLoading(false);
        }
      }
    } else {
      setShowPopup(true);
      setErrorMsg("الرجاء الإتصال بالإنترنت أولاً");
    }
  };

  return (
    // wrapper
    <div className="login px-5 py-10 rounded  flex flex-col gap-5 items-center bg-sky-500 w-[min(98%,450px)] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 [direction:rtl]">
      {/* title */}
      <h1 className="text-center font-extrabold text-3xl mb-5 text-title-color">
        تسجيل دخول
      </h1>
      {/* form */}
      <form onSubmit={handelLogin} className="flex flex-col gap-5 w-full ">
        {/* input for useremail */}
        <Input
          id={"email"}
          label={"البريد الإكتروني"}
          type={"email"}
          value={userData.userEmail}
          onChange={handelUserEmailChange}
          error={validateEmail}
          errorMsg={"الرجاء كتابة بريد الكتروني صالح"}
          customStyle={"text-center"}
        />
        {/* ==== End for Email input ====== */}
        {/* input for passworkd */}
        <Input
          id={"passowrd"}
          type={showPassword ? "text" : "password"}
          value={userData.userPassword}
          label={"كلمة المرور"}
          onChange={handelUserPasswordChange}
          errorMsg={"كلمة المرور التي أدخلتها غير صالحة"}
          customStyle={"text-center"}
        >
          <div
            className="absolute left-2 top-2 cursor-pointer"
            onClick={toggleShowPassword}
          >
            {showPassword ? <FaEyeSlash size={25} /> : <FaEye size={25} />}
          </div>
        </Input>
        {/* ===== End for password input */}
        {/* login & Signup button */}
        <div className="flex justify-center gap-8">
          <button
            type="submit"
            disabled={loading}
            className={`bg-gray-500 text-white hover:text-bg2-color hover:bg-p-color/80 transition-all duration-300 ease-out px-5 py-2 rounded cursor-pointer font-semibold ${
              loading && "opacity-50"
            }`}
          >
            تسجيل دخول
          </button>
          <Link to="/signup">
            <button className="bg-white text-gray-800 hover:text-white hover:bg-gray-950 transition-all duration-300 ease-out px-5 py-2 rounded cursor-pointer font-semibold">
              تسجيل جديد
            </button>
          </Link>
        </div>
      </form>
      {/* ====== End form ==== */}
      {showPopup && (
        <PopupError closePopupError={closePopupError} msg={errorMsg} />
      )}
    </div>
  );
}
