import type { ReactNode } from "react";

interface buttonProp {
  onClick: () => void;
  bg?: string;
  style?:string;
  children: ReactNode;
}
export default function Button({ onClick, style, children }: buttonProp) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center w-full gap-3 cursor-pointer px-3 py-2 text-[18px] bg-sky-300  hover:bg-sky-800 hover:text-white transition-all duration-300 ease-in-out font-semibold rounded ${style}`}
    >
      {children}
    </button>
  );
}
