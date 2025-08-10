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

// reducer function
const reducerFunc = (state, action) => {
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
      return { stdName: "", std_id: "", stdGrade: "", stdCourse: "" };
    }
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
  showUI,
}) {
  // init student [the old student use to pre fill the form fields in Editing mode]
  const student = oldStudent || {
    stdName: "",
    stdBatch: selectedBatchId || "",
    std_id: "",
  };
  // the form state
  const [formData, dispatch] = useReducer(reducerFunc, student);
  //   state to validate the form & show error msg
  const [error, setError] = useState({
    validateName: null,
    validateId: null,
    validateGrade: null,
    validateCourse: null,
  });
  // state for toast to show that it's done succefully
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(false);

  // =============================== functions =================================

  useEffect(() => {
    if (oldStudent) {
      dispatch({ type: "stdName", newValue: oldStudent.name });
      dispatch({ type: "stdBatch", newValue: selectedBatchId });
      dispatch({ type: "std_id", newValue: oldStudent.stdId });
    }
  }, [oldStudent]);

  const handelStdName = (newValue: string) => {
    dispatch({ type: "stdName", newValue: newValue });
  };
  const handelStdBatch = (newValue: string) => {
    dispatch({ type: "stdBatch", newValue: newValue });
  };
  const handelStdId = (newValue: string) => {
    dispatch({ type: "std_id", newValue: newValue });
  };
  const handelStdGrade = (newValue: string) => {
    dispatch({ type: "stdGrade", newValue: newValue });
  };
  /* ======================== student course Input Function ======================= */

  // const handelStdCourse = (newValue) => {
  //   dispatch({ type: "stdCourse", newValue: newValue });
  // };
  /* ======================== student course Input Function ======================= */

  //   add new std to firesotre
  const handelAddNewStd = async (e) => {
    e.preventDefault();

    // validtae the form fields
    // const isValidName = /^[\p{Arabic}\s\p{N}]+$/.test(formData.stdName);
    const isValidId = /^\d+$/.test(formData.std_id);
    const isValidCourse = /^[A-Za-z\s]*\d*$/.test(formData.stdCourse);
    const isValidGrade = /^(?:\d{1,3}|[A-F][+-]?)$/.test(formData.stdGrade);

    // setError({
    //     validateName: isValidName,
    //   validateId: isValidId,
    //   validateCourse: isValidCourse,
    //   validateGrade: isValidGrade,
    // });
    // update exist data
    if (editedId) {
      // ✅ EDIT EXISTING STUDENT
      try {
        setLoading(true);

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
      } catch (error) {
        console.error("❌ Error updating student:", error.message);
      } finally {
        setLoading(false);
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
          setShowUI({ ...showUI, NewStdFrom: false });
        }, 1000);
      }
    } else {
      // ✅ ADD NEW STUDENT
      try {
        setLoading(true);

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
          const courseRef = doc(semesterCoursesRef, course.name.toLowerCase());
          await setDoc(courseRef, {
            name: course.name,
            grade: null,
            degree:null,
          });
        }
      } catch (error) {
        console.error("❌ Error adding student:", error.message);
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
      {/* ======================== student course Input ======================= */}
      {/* <Input
        type={"text"}
        label={"مقرر الطالب"}
        value={formData.stdCourse}
        onChange={handelStdCourse}
        customStyle={"text-center"}
      /> */}
      {/* ========================== end student course Input ======================= */}
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
