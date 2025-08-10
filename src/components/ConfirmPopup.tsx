/**
 * =============================== confirm popup  ==============================================
 * ============ a popup that has title + Yes & No buttons ========================
 * ======= if it's Yes : then remove student from fire store & Ui ============
 */
interface ConfirmPopupProps {
    yesAction?: (() => void )| undefined;
    closeConfirm:()=>void;
    confirmMsg:string;
}
export default function ConfirmPopup({yesAction,closeConfirm,confirmMsg}:ConfirmPopupProps){

    return(
        // wapper
        <div className="absolute w-[300px] rounded  top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-white flex gap-8 flex-col p-4 border-2 border-bg-color shadow-md">
            {/* title */}
            <h1 className="text-center font-semibold">هل أنت متأكد من  {confirmMsg}؟</h1>
            {/* yes & no wrapper */}
            <div className="flex justify-evenly">
                {/* yes */}
                <span className="block px-4 py-1 rounded cursor-pointer hover:bg-green-400 bg-green-800 text-white font-bold" onClick={yesAction}>نعم</span>
                {/* no */}
                <span className="block px-4 py-1 rounded cursor-pointer hover:bg-red-400 bg-red-800 text-white font-bold" onClick={closeConfirm}>لا</span>
            </div>
        </div>
    )
}