/**
 * ====================== popup error ==============================
 * ============ to show an error with msg ==============
 */

import CloseIcon from "./CloseIcon";

interface PopupErrorProps {
  closePopupError: () => void;
  msg: string;
}
export default function PopupError({ closePopupError, msg }: PopupErrorProps) {
  return (
    // wrapper
    <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-gray-500 p-10 text-white text-center font-semibold rounded text-sm">
      {/* message */}
      <p>{msg} </p>
      {/* close icon */}
      <CloseIcon closeFunc={closePopupError} />
    </div>
  );
}
