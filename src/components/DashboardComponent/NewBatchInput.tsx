import React, { useState, memo, useCallback } from "react";
// components
import Input from "../Input";
import CloseIcon from "../CloseIcon";
import AnimatedSpin from "../AnimatedSpin";
import ListBox2 from "../ListBox2";
import PupopError from "../PopupError";
// firesotre
import { getDb } from "../../firebase";
// import { setDoc, doc, getDoc } from "firebase/firestore";

import type { ShowUI } from "../../pages/Dashboard";

interface NewBatchInputProp {
  closeNewBatchUI: () => void;
  fetchBatches: () => void;
  setShowUI: React.Dispatch<React.SetStateAction<ShowUI>>;
  setToastMsg: (toastMsg: string) => void;
}

interface Courses {
  name: string;
  grade: null;
  degree: null;
}
// current semester
const semsters = [
  "إختيار الفصل الحالي",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  // { id:0,name: "إختيار الفصل الحالي" },
  // { id:1, name: "1" },
  // { id:2 ,name: "2" },
  // { id:3,name: "3" },
  // { id:4,name: "4" },
  // { id:5,name: "5" },
  // { id:6,name: "6" },
  // { id:7,name: "7" },
  // { id:8,name: "8" },
  // { id:9,name: "9" },
  // { id:10,name: "10" },
  // { id:11,name: "11" },
  // { id:12,name: "12" },
];

export default memo( function NewBatchInput({
  closeNewBatchUI,
  fetchBatches,
  setShowUI,
  setToastMsg,
}: NewBatchInputProp) {
  console.log(`New batch input component rendered...`);

  const [newBatchName, setNewBatchName] = useState(""); // STORE : newBatch Name
  const [currentSem, setCurrentSem] = useState<string |null >(semsters[0]); // STORE : current sem
  const [courseInput, setCourseInput] = useState(""); // STORE : course Input
  const [courses, setCourses] = useState<Courses[]>([]); // SOTRE : course
  const [loading, setLoading] = useState<boolean>(false);
  const [showErrorPopup,setShowPopupError] = useState(false)

  const handleCurrentSem = useCallback((value: string) => {
    setCurrentSem(value);
  }, []);
  // function to + Course
  const addCourse = () => {
    if (
      courseInput.trim() &&
      !courses.some((c) => c.name === courseInput.trim())
    ) {
      setCourses([
        ...courses,
        { name: courseInput.trim(), grade: null, degree: null },
      ]);
      setCourseInput("");
    }
  };

  const removeCourse = (course: string) => {
    setCourses((prev) => prev.filter((c) => c.name !== course));
  };

  const handleNewBatchName = (batchName: string) => {
    setNewBatchName(batchName);
  };

  //   func to add new batch to firesotre
  const addNewBatchToFireStore = async (e: React.FormEvent) => {
    e.preventDefault();

  // ======  1- check if the new batch is not existed
  
  setLoading(true);
  try{
    const {doc, setDoc, getDoc} = await import("firebase/firestore");
              const db = await getDb();
      const batchDoc = doc(db, "batches", newBatchName);
      const batchSnap = await getDoc(batchDoc);
    if (batchSnap.exists()) {
      console.log(`Batch with name ${newBatchName} already exists.`);
      // show error popup popup
      setShowPopupError(true);
      return;

    }else{
      console.log(`${newBatchName} does not exist, proceeding to add it?`);
       try {
      await setDoc(batchDoc, {
        currentSem: currentSem,
        courses: courses,
        archived:false,
        createdAt: new Date(), // optional: metadata
      });

      setNewBatchName("");
      setCurrentSem(null);
      setCourses([]);
    } catch (error) {
      console.error("Error creating batch:", error);
    } finally {
      setLoading(false);
      setShowUI((prev) => ({ ...prev, default: true, toast: true }));
      setToastMsg("تم إضافة الدفعة بنجاح");
      setTimeout(() => {
        setToastMsg("");
        setShowUI((prev) => ({ ...prev, newBatchInput: false, toast: false }));
      }, 1500);
    }
    }
    //2- if it's exist then updateit
  }catch(error) {
    console.error("Error checking batch existence:", error);
  }finally {
    setLoading(false);
  }
    // if not then add it with success toast
   

    if (typeof fetchBatches === "function") {
      fetchBatches();
    }
  };

  return (
    <>
    <form
      onSubmit={addNewBatchToFireStore}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 [direction:rtl] bg-cyan-700 border border-white shadow shadow-white px-5 py-10 w-[min(98%,450px)]"
    >
      <CloseIcon closeFunc={closeNewBatchUI} />
      {/* batch name */}
      <Input
        type="text"
        value={newBatchName}
        onChange={handleNewBatchName}
        label="رقم الدفعة"
      />

      <ListBox2
        options={semsters}
        currentSem={currentSem}
        setCurrentSem={handleCurrentSem}
      />

      {/* courses */}
      <div>
        <label className="block font-bold my-3 text-white"> اسم المقرر:</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={courseInput}
            onChange={(e) => setCourseInput(e.target.value)}
            className="border p-2 flex-1 rounded bg-white"
            placeholder="مثال: Math"
          />
          <button
            type="button"
            onClick={addCourse}
            className="bg-green-400 font-semibold text-black hover:text-white px-4 py-2 rounded hover:bg-green-600 cursor-pointer transition-all duration-300 ease-linear"
          >
            إضافة
          </button>
        </div>
      </div>

      {/* Display added courses */}
      {courses.length > 0 && (
        <ul
          className={`mt-3 space-y-1 max-h-[200px] overflow-y-scroll ${
            courses.length >= 3 && "flex [&_li]:w-[47%]  flex-wrap gap-5"
          }`}
        >
          {courses.map((course, i) => (
            <li
              key={i}
              className={`bg-gray-100 py-1 px-3 rounded flex justify-between items-center `}
            >
              <span>{course.name}</span>
              <button
                onClick={() => removeCourse(course.name)}
                type="button"
                className="text-red-500 hover:bg-red-200 px-3  py-2 font-bold cursor-pointer transition-all duration-200 ease-out rounded"
              >
                ❌
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* End courses */}

      <button
        type="submit"
        className="cursor-pointer px-3 py-1 mt-10 rounded bg-cyan-400 w-full flex justify-center"
      >
        {loading ? (
          <AnimatedSpin loadingMsg="جار الإضافة" />
        ) : (
          "إضافة إلى قاعدة البيانات"
        )}
      </button>
    </form>

    {/* show popup error */}
    {showErrorPopup && (
    <PupopError
      closePopupError={() => setShowPopupError(false)}
      msg={`الدفعة ${newBatchName} موجودة بالفعل`}
    />      
)}
    </>

  );
})
