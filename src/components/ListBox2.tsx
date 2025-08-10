import { memo } from "react";
interface ListBoxProps {
  options:  string[];
  currentSem: string;
//   setCurrentSem: React.Dispatch<React.SetStateAction<(string)>>;
setCurrentSem:(value:string) => void
}
export default memo(function ListBox2({ options,currentSem, setCurrentSem }: ListBoxProps) {
  console.log(`##list box rendered...`);
  return (
    <div className="w-full">
      <select
        name="semesters"
        value={currentSem}
        onChange={(e) => setCurrentSem(e.target.value)}
        className="w-full p-2 bg-white rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center font-semibold"
      >
        {options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
})
