// hooks
import { useReducer, useState, useEffect } from "react";
// components
import Toast from "../Toast";
import Input from "../Input";
// react icons
import { IoCloseCircleSharp } from "react-icons/io5";
import { BiEdit } from "react-icons/bi";
import { BiPlus } from "react-icons/bi";
// firebase
import { setDoc, getDoc, doc, collection } from "firebase/firestore";
import { db } from "../../firebase";
import type { Course } from "./StudnetInfo";
import type { ShowUI } from "../../pages/Dashboard";

export type oldStudentProp = {
  name: string;
  std_Id: string;
  stdBatch: string | null;
};
type NewStdFormProps = {
  closeNewStdForm: () => void;
  fetchStudents: (selectedBatchId: string | null) => void;
  selectedBatchId: string | null;
  oldStudent?: oldStudentProp | null ;
  editedId: string | null;
  setShowUI: React.Dispatch<React.SetStateAction<ShowUI>>;
  showUI: ShowUI;
};

type formDataProp = {
  stdName: string;
  stdBatch: string | null;
  std_id: string;
  stdGrade?: string; // Made optional since not always used
  stdCourse?: string; // Made optional since not always used
  stdId?: string;
  course?: Course;
};
type studentAction =
  | { type: "stdName"; newValue: string }
  | { type: "stdBatch"; newValue: string | null }
  | { type: "std_id"; newValue: string }
  | { type: "reset" };

// reducer function
const reducerFunc = (state: formDataProp, action: studentAction) => {
  switch (action.type) {
    case "stdName": {
      return { ...state, stdName: action.newValue };
    }
    case "stdBatch": {
      return { ...state, stdBatch: action.newValue };
    }
    case "std_id": {
      return { ...state, std_id: action.newValue };
    }
    case "reset": {
      return {
        stdName: "",
        std_id: "",
        stdBatch: null,
        stdGrade: "",
        stdCourse: "",
      };
    }
    default:
      return state;
  }
};
// ====== End reducer function =====
export default function NewStdForm({
  closeNewStdForm,
  fetchStudents,
  selectedBatchId,
  oldStudent,
  editedId,
  setShowUI,
}: NewStdFormProps) {
  const initialState: formDataProp = {
    stdName: "",
    stdBatch: selectedBatchId || null,
    std_id: "",
    stdGrade: "",
    stdCourse: "",
  };

  const student = oldStudent
    ? {
        stdName: oldStudent.name,
        stdBatch: oldStudent.stdBatch,
        std_id: oldStudent.std_Id,
        stdGrade: "",
        stdCourse: "",
      }
    : initialState;

  // the form state
  const [formData, dispatch] = useReducer(reducerFunc, student);
  // state for toast to show that it's done succefully
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(false);

  // =============================== functions =================================

  useEffect(() => {
    if (oldStudent) {
      dispatch({ type: "stdName", newValue: oldStudent.name });
      dispatch({ type: "stdBatch", newValue: selectedBatchId });
      dispatch({ type: "std_id", newValue: oldStudent.std_Id });
    }
  }, [selectedBatchId, oldStudent]);

  const handelStdName = (newValue: string) => {
    dispatch({ type: "stdName", newValue: newValue });
  };
  const handelStdBatch = (newValue: string) => {
    dispatch({ type: "stdBatch", newValue: newValue });
  };
  const handelStdId = (newValue: string) => {
    dispatch({ type: "std_id", newValue: newValue });
  };
  /* ======================== student course Input Function ======================= */

  // const handelStdCourse = (newValue) => {
  //   dispatch({ type: "stdCourse", newValue: newValue });
  // };
  /* ======================== student course Input Function ======================= */

  //   add new std to firesotre
  const handelAddNewStd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editedId) {
      // ✅ EDIT EXISTING STUDENT
      try {
        setLoading(true);

        if (formData.stdBatch !== null) {
          const batchRef = doc(db, "batches", formData.stdBatch);
          const batchSnap = await getDoc(batchRef);

          if (!batchSnap.exists()) {
            throw new Error("Batch does not exist");
          }

          const batchData = batchSnap.data();
          const currentSem = batchData.currentSem;

          // Step: Update existing student
          const studentRef = doc(
            db,
            `batches/${formData.stdBatch}/students/${editedId}`
          );
          await setDoc(
            studentRef,
            {
              name: formData.stdName,
              stdId: formData.std_id,
              currentSem: currentSem,
            },
            { merge: true }
          ); // ✅ merge to preserve other fields
        }
      } catch (error) {
        console.error("❌ Error updating student:", error);
      } finally {
        setLoading(false);
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
          setShowUI(prev => ({
            ...prev,
            NewStdFrom: false
          }));
        }, 1000);
      }
    } else {
      // ✅ ADD NEW STUDENT
      try {
        setLoading(true);

        if (formData.stdBatch !== null) {
          const batchRef = doc(db, "batches", formData.stdBatch);
          const batchSnap = await getDoc(batchRef);

          if (!batchSnap.exists()) {
            throw new Error("Batch does not exist");
          }

          const batchData = batchSnap.data();
          const currentSem = batchData.currentSem;
          const courses = batchData.courses || [];

          const studentRef = doc(
            collection(db, `batches/${formData.stdBatch}/students`)
          );
          await setDoc(studentRef, {
            name: formData.stdName,
            stdId: formData.std_id,
            currentSem: currentSem,
            suspend: false, // ✅ default value
          });

          const semesterCoursesRef = collection(
            db,
            `batches/${formData.stdBatch}/students/${studentRef.id}/semesters/${currentSem}/courses`
          );

          for (const course of courses) {
            const courseRef = doc(
              semesterCoursesRef,
              course.name.toLowerCase()
            );
            await setDoc(courseRef, {
              name: course.name,
              grade: null,
              degree: null,
            });
          }
        }
      } catch (error) {
        console.error("❌ Error adding student:", error);
      } finally {
        setLoading(false);
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 1500);
      }
    }

    // add new student
    dispatch({ type: "reset" });

    if (typeof fetchStudents == "function") {
      fetchStudents(selectedBatchId);
    }
  };

  // =============================== End functions ===================================
  return (
    // form
    <form
      onSubmit={handelAddNewStd}
      className="fixed z-10 w-[min(80%,550px)] [direction:rtl] flex flex-col gap-3 px-5 py-15 bg-gray-500 border-2 border-white rounded top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]"
    >
      {/* close icon */}
      <IoCloseCircleSharp
        size={50}
        color="white"
        className="absolute top-0 right-0 cursor-pointer hover:bg-red-500 transition-all duration-300 ease-in-out p-2 rounded"
        onClick={closeNewStdForm}
      />
      {/* end close icon */}
      {/* student name input */}
      <Input
        type={"text"}
        label={"اسم الطالب"}
        value={formData.stdName}
        onChange={handelStdName}
        customStyle={"text-center"}
      />
      {/* End student name */}
      {/* student grade */}
      <Input
        type={"text"}
        label={"الدفعة"}
        value={formData.stdBatch}
        onChange={handelStdBatch}
        customStyle={"text-center ![direction:ltr]"}
      />
      {/* End student Grade */}

      {/* student id */}
      <Input
        type={"text"}
        label={"رقم التسجيل"}
        value={formData.std_id}
        onChange={handelStdId}
        customStyle={"text-center [direction:ltr]"}
      />
      {/* End student id */}
      {/* Add and Edit button */}
      <button
        type="submit"
        disabled={loading}
        className={`flex justify-center items-center font-bold  px-3 py-2 w-full rounded cursor-pointer bg-teal-400 hover:bg-teal-600 text-title-color hover:text-white transition duration-300 ease-in-out ${
          loading && "opacity-50"
        }`}
      >
        {editedId ? (
          <>
            <BiEdit size={25} />
            تعديل{" "}
          </>
        ) : (
          <>
            <BiPlus size={25} />
            إضافة
          </>
        )}
      </button>
      {/* toast componet */}
      {showToast && <Toast msg={" تم الإضافة بنجاح"} />}
    </form>
    // end form
  );
}
