// hooks
import { useState } from "react";
import Input from "../Input";
import { useBatches } from "../../Contexts/BatchContext";

type searchFormProps = {
  onSearch: (stdId: string, stdBatch: string|null) => void;
}
export default function SearchForm({ onSearch }:searchFormProps) {
  const {batches} = useBatches(); // get batches from context
  console.log(batches)

  const [stdIdVal, setStdIdVal] = useState<string>(""); // store Students input

  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);

  // func for handel input
  const handelStdInputVal = (inputVal: string) => {
    setStdIdVal(inputVal);
  };

  //  form submission function
  const handelFromSubmission = (e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // this comes from it's parent
    onSearch(stdIdVal.trim(), selectedBatch);
  };

  return (
    <>
      <form
        className="flex gap-1 flex-col"
        onSubmit={(e) => handelFromSubmission(e)}
      >
        {/* ==== input + select wrapper ==== */}
        <div className="flex max-sm:flex-col gap-2 justify-between">
          {/* input for search */}
          <Input
            type="text"
            value={stdIdVal}
            onChange={handelStdInputVal}
            label="رقم التسجيل"
            parentStyle="sm:w-1/2 w-full"
          />
          {/* select */}
          <div className="flex flex-col sm:w-1/2 w-full h-10  bg-white text-center rounded relative">
            {/* batch list */}
            <select
              className="w-full h-full bg-white text-center rounded outline-none"
              value={selectedBatch || ""}
              onChange={(e) => setSelectedBatch(e.target.value)}
            >
              <option value="" disabled>
                إختيار الدفعة
              </option>
              {batches.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.id}
                </option>
              ))}
            </select>
            
        </div>
        </div>

        {/* ==== End input + select wrapper ==== */}
        <button
          type="submit"
          className="cursor-pointer rounded bg-gray-800 font-bold text-white w-fit self-center px-5 py-3 my-4 hover:text-bg2-color-color hover:bg-s-color transition-all duration-300 ease-linear"
        >
          إستعلام
        </button>
      </form>
    </>
  );
}
