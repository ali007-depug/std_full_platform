import { IoCloseCircleSharp } from "react-icons/io5";

interface closeIcon {
closeFunc : ()=> void
}
export default function CloseIcon({closeFunc}:closeIcon){

    return(
        <>
         <IoCloseCircleSharp
          size={35}
          className="absolute top-0 right-0 cursor-pointer hover:bg-red-500 transition-all duration-300 ease-in-out  rounded"
                    onClick={closeFunc}
        />
        </>
    )
}