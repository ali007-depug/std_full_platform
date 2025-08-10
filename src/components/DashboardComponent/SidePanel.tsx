// react router
import { useNavigate } from "react-router-dom";
// import { useState } from "react";

// firebase
// import { getDocs,collection } from "firebase/firestore";
// import { db } from "../../firebase";
import { getAuth, signOut } from "firebase/auth";

import Button from "./Button";
import { BsPlus } from "react-icons/bs";
import { BiLogOut, BiUser } from "react-icons/bi";
import { UsersIcon } from "@heroicons/react/20/solid";
import { PiExamFill } from "react-icons/pi";
import { FolderIcon } from "@heroicons/react/24/solid";

interface SidePanel {
  showPendingUsers: () => void;
  showBatchesInfo: () => void;
  showNewBatchUI: () => void;
  currentUser: string;
}
export default function SidePanel({
  showPendingUsers,
  showBatchesInfo,
  showNewBatchUI,
  currentUser,
}: SidePanel) {
  const navigate = useNavigate();

  // open student UI
  const openStudentUI = () => {
    navigate("/std-UI");
  };

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.log(error);
    }
  };
  // console.log(currentUser)

  return (
    <div className="w-[300px] fixed right-0 h-[100dvh] bg-gray-800  flex flex-col  py-3 rounde px-2">
      <h1 className="text-center font-bold text-white text-3xl mb-5">
        لوحة التحكم
      </h1>
      {/* button wrapper */}
      <div className="flex flex-col gap-40">
        <div className="w-full [&_p]:min-w-40 space-y-2">
          {/* add Batch to batchList */}
          <Button onClick={showNewBatchUI} style="">
            <p> إضافة دفعة جديدة</p>
            <BsPlus size={20} />
          </Button>
          {/* show all batches */}
          <Button onClick={() => showBatchesInfo()}>
            <p> بيانات الدفعات</p>
            <FolderIcon width={25}></FolderIcon>
          </Button>
          <Button onClick={openStudentUI}>
            <p> نافذة النتيجة</p>
            <PiExamFill size={25} />
          </Button>
          {/* show users */}
          <Button onClick={showPendingUsers}>
            <p> المستخدمين</p>
            <UsersIcon width={20}></UsersIcon>
          </Button>
        </div>

        {/* user Info + Logout */}
        <div className="flex flex-col gap-4">
          {/* user Info */}
          <div className="flex justify-center gap-3 items-center">
            <p className="text-white font-bold self-center flex-wrap">
              {currentUser !== "" ? currentUser : "Unkown"}
            </p>
            <BiUser size={30} color="black" className="bg-white rounded-full" />
          </div>
          {/*  END user Info */}

          {/* logut */}
          <Button onClick={handleLogout}>
            <BiLogOut size={30} />
            تسجيل خروج
          </Button>
        </div>
      </div>
    </div>
  );
}
