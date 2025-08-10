import AnimatedSpin from "./AnimatedSpin";

export default function Loading() {
  return (
    <div className="[direction:rtl] px-2 grid place-items-center h-[100dvh] bg-sky-200 text-gray-500 font-extrabold">
      <div className="flex items-center gap-2">
        <AnimatedSpin loadingMsg="جار التحميل..." />
      </div>
    </div>
  );
}
