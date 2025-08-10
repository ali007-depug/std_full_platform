import { memo } from "react";
// react icon
import { IoCloseCircleSharp } from "react-icons/io5";
import { MdDone } from "react-icons/md";
import { CgClose } from "react-icons/cg";
import { BiError, BiUser } from "react-icons/bi";

interface PendingUsersProps {
    allUsers: { name: string }[];
    pendingUsers: { id: string; name: string }[];
    handleApproveUser: (user: { id: string; name: string }) => void;
    handleRejectUser: (userId: string) => void;
    closePendingUsers: () => void;
}
const PendingUsers = memo(function PendingUsers({
  allUsers,
  pendingUsers,
  handleApproveUser,
  handleRejectUser,
  closePendingUsers,
}: PendingUsersProps) {

  return (
    // wrppaer
    <div className="rounded w-full bg-sky-900 text-white font-semibold min-h-[100dvh] flex flex-col  shadow-md shadow-black px-10">
      <p className="mx-auto w-fit text-4xl font-bold  p-2 rounded">
            المستخدمين
          </p>
      {/* close icon */}
      <IoCloseCircleSharp
        size={50}
        color="black"
        className="absolute top-0 right-0 cursor-pointer hover:bg-red-500 transition-all duration-300 ease-in-out p-2 rounded"
        onClick={closePendingUsers}
      />
      {/* users + pending users ==== Wrapper */}
      <div className="flex justify-between mt-30 w-full">
        {/* all users */}
        <div className="flex flex-col rounded shadow shadow-white items-center w-1/2 bg-sky-950 py-10">
        <p className="mb-15 text-xl">كل المستخدمين</p>
          {/* rendering all users */}
          {allUsers.length > 0 ? (
            allUsers.map((user, index) => (
              <div key={index} className="flex items-center w-fit h-fit">
                <p className="font-semibold text-lg">
                  {++index}- {user?.name}
                </p>
              </div>
            ))
          ) : (
            <p className=" relative flex items-center gap-3 text-gray-200 text-xl mx-auto"><BiError color="red" size={25}/> لا يوجد مستخدمين </p>
          )}
        </div>

        {/* pending users wrapper*/}
        <div className="flex flex-col rounded shadow shadow-white items-center w-1/2 bg-sky-700 py-10">
          <p className="mb-10 text-xl">
            حسابات تنتظر التأكيد
          </p>
          {/* rendering pending users */}
          {pendingUsers.length > 0 ? (
            pendingUsers.map((user, index) => (
              <div
                key={index}
                className="flex gap-2 mt-3 items-center justify-between w-fit h-fit"
              >
                <p className="font-semibold flex items-center gap-2 text-lg text-p-color"><BiUser size={25}/> {user?.name}</p>
                {/* ✅ button */}
                <p>
                  <MdDone
                    size={35}
                    color="green"
                    className="p-2 bg-white rounded hover:bg-green-200 cursor-pointer"
                    onClick={() => handleApproveUser(user)}
                  />
                </p>
                {/* ✖️ button*/}
                <p>
                  <CgClose
                    size={35}
                    color="red"
                    className="p-2 bg-white rounded hover:bg-red-200 cursor-pointer"
                    onClick={() => handleRejectUser(user.id)}
                  />
                </p>
              </div>
            ))
          ) : (
            <p className=" relative top-5 mb-10 mx-auto">
              لا يوجد حسابات تنتظر التأكيد
            </p>
          )}
        </div>
      </div>
    </div>
  );
});

export default PendingUsers;
