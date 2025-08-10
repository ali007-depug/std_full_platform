interface spinProp {
  loadingMsg: string;
  textSize?: string;
}
export default function AnimatedSpin({ loadingMsg,textSize }: spinProp) {
  return (
    <div className="flex items-center gap-3">
      <span className="block size-5 border-2 border-gray-500 border-b-transparent rounded-full animate-spin  "></span>
      <p className={`${textSize} font-semibold`}>{loadingMsg}</p>
    </div>
  );
}
