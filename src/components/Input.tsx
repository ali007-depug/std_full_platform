import { useRef } from "react"

interface inputProps{
  type:string,
  id?:string,
  value:string | null,
  onChange:(value:string)=>void,
  error?:boolean,
  errorMsg?:string,
  label:string,
  customStyle?:string,
  parentStyle?:string,
  children?:React.ReactNode

}

export default function Input({type,id,value,onChange,error,errorMsg,label,customStyle,parentStyle,children}:inputProps){

const inputRef = useRef<HTMLInputElement>(null);

function handelLabelClick() {
    inputRef.current?.focus();
  }
  
    return(
        <div className={`relative flex flex-col items-center ${parentStyle}`}>
          <input
            type={type}
            ref={inputRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            name={id}
            id={id}
            placeholder=" "
            required
            className={`h-10 bg-white text-title-color font-bold w-full rounded px-2 peer placeholder-transparent not-placeholder-shown:outline-2  outline-gray-600 user-invalid:outline-red-600 user-valid:outline-green-400 focus:outline-3 focus:outline-bg-color text-center ${customStyle}`}
          />
          <label
            htmlFor={id}
            onClick={handelLabelClick}
            className="relative top-[-55px] text-base cursor-text text-title-color bg-white transition-all duration-300 ease-in-out  peer-focus:text-sm  peer-focus:top-[-55px] peer-focus:bg-white peer-placeholder-shown:bg-transparent peer-placeholder-shown:top-[-32px]"
          >
            {label}
          </label>
          {error === false && (
            <p className="text-red-500">{errorMsg}</p>
          )}
          {children}
        </div>
    )
}