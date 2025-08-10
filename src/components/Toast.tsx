import { MdDone } from "react-icons/md";

export default function Toast({msg}){

    return(
        <div className="flex items-center gap-2 bg-green-500  w-fit  rounded px-3 py-2 absolute bottom-[-50px] left-0 ">
            <MdDone size={25} color="black"/>
           {msg}
        </div>
    )
}