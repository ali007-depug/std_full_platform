import { useState,memo } from "react";
// import {
//   collection,
//   setDoc,
//   getDocs,
//   doc,
//   updateDoc,
// } from "firebase/firestore";
import { getDb } from "../../firebase";
import CloseIcon from "../CloseIcon";
import { BiError } from "react-icons/bi";
import AnimatedSpin from "../AnimatedSpin";
import  type { batchProp } from "../../Contexts/BatchContext";

interface batchInfo {
  batches: batchProp[] | null;
  batchLoading: boolean;
  fetchBatches: () => void;
  closeBatchInfo: () => void;
  setShowToast: (toast: boolean) => void;
  setToastMsg: (msg: string) => void;
  handleSelectedBatchId: (batchId: string) => void;
  deleteBatch: (batchId: string) => void;
  handleArchiveBatch: (batchId: string) => void;
}

export default memo( function BatchInfo({
  batches,
  fetchBatches,
  batchLoading,
  closeBatchInfo,
  handleSelectedBatchId,
  // setShowToast,
  // setToastMsg,
  deleteBatch,
  handleArchiveBatch
}: batchInfo) {
  const [editedBatchId, setEditedBatchId] = useState<string | null>(null); // STORE : Edit batch ID
  const [newSem, setNewSem] = useState(""); // STORE : New Semeter
  const [newCourses, setNewCourses] = useState(""); // STORE :  New Courses

  // handle batches update from firesotre
  async function handleUpdate(batchName: string) {
    try {
      const {doc, collection, updateDoc, setDoc, getDocs} = await import("firebase/firestore");
      const db = await getDb();

      const batchRef = doc(db, "batches", batchName);

      // 1. Prepare new courses
      const courseList = newCourses
        .split(",")
        .map((c) => ({ name: c.trim(), grade: null }))
        .filter((c) => c.name);

      // 2. Update batch document
      await updateDoc(batchRef, {
        currentSem: newSem,
        courses: courseList,
      });

      // 3. Get all students in the batch
      const studentsRef = collection(db, `batches/${batchName}/students`);
      const studentSnap = await getDocs(studentsRef);

      const updateTasks = studentSnap.docs.map(async (studentDoc) => {
        const studentId = studentDoc.id;

        // a. Update student's currentSem field
        const studentRef = doc(
          db,
          `batches/${batchName}/students/${studentId}`
        );
        await updateDoc(studentRef, { currentSem: newSem });

        // b. Add new semester with copied courses
        const coursesRef = collection(
          db,
          `batches/${batchName}/students/${studentId}/semesters/${newSem}/courses`
        );

        const courseAdditions = courseList.map((course) => {
          const courseRef = doc(coursesRef, course.name.toLowerCase());
          return setDoc(courseRef, course);
        });

        await Promise.all(courseAdditions);
      });

      await Promise.all(updateTasks);

      setEditedBatchId(null);
      setNewSem("");
      setNewCourses("");
      fetchBatches();
    } catch (err) {
      console.error("Update failed:", err);
    }
  }

  
  return (
    <div
      className={`relative flex flex-col h-full p-4 text-white bg-sky-900 rounded  overflow-y-auto [direction:rtl]  ${
        batches?.length === 0 && "justify-center"
      }`}
    >
      <CloseIcon closeFunc={closeBatchInfo} />

      {/* title */}
      <div className="text-center">
        <h1
          className={`text-2xl font-bold mb-4 ${
            batches?.length === 0 && "hidden"
          }`}
        >
          إدارة الدفعات
        </h1>
      </div>

      {/* render batches */}
      {!batchLoading ? (
        batches?.length !== 0 ? (
          <div className="flex flex-wrap gap-4 ">
            {batches?.map((batch) => (
              <div
                key={batch?.id}
                className="bg-gray-800 p-4 rounded mb-4 shadow-lg w-full min-h-[190px] relative flex flex-col items-center"
              >
                {/* batch info */}
                <div className="items-center space-y-2 [&_p]:grid [&_p]:grid-cols-[100px_1fr] [&_p]:gap-3 [&_strong]:col-start-1 [&_span]:col-start-2 [&_span]:font-semibold">
                  <p className="">
                    <strong>الدفعة:</strong>
                    <span>{batch.id}</span>
                  </p>
                  <p>
                    <strong>الفصل الحالي:</strong>
                    <span>{batch.currentSem}</span>
                  </p>
                  <p>
                    <strong>المقررات:</strong>
                    <span className="flex gap-4">
                      {batch.courses?.map((course, i) => (
                        <span key={i} className="">
                          {course?.name}
                        </span>
                      )) || "لا توجد مقررات"}
                    </span>
                  </p>
                  <p>
                    <strong>تمت أرشفتها؟</strong>
                    <span>{batch.archived ? "نعم" : "لا"}</span>
                  </p>
                </div>

                {editedBatchId === batch?.id ? (
                  // wrapper new semester and courses
                  <div className="mt-4 w-fit">
                    {/* new semester */}
                    <input
                      type="text"
                      placeholder="الفصل الحالي الجديد"
                      value={newSem}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setNewSem(e.target.value)
                      }
                      className="mb-2 p-2 rounded w-full bg-white text-black"
                    />
                    {/* course */}
                    <input
                      type="text"
                      placeholder="مقررات مفصولة بفاصلة"
                      value={newCourses}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setNewCourses(e.target.value)
                      }
                      className="mb-2 p-2 rounded w-full bg-white text-black"
                    />
                    {/* button */}
                    <div className="flex gap-3 [&_button]:cursor-pointer [&_button]:transition-all [&_button]:duration-300 [&_button]:ease-in-out ">
                      <button
                        className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded mr-2"
                        onClick={() => handleUpdate(batch?.id)}
                      >
                        حفظ
                      </button>
                      <button
                        className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded"
                        onClick={() => setEditedBatchId(null)}
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex mt-4 gap-2 justify-around relative bottom-5 flex-wrap [&_button]:transition-all [&_button]:duration-300 [&_button]:ease-in-out">
                    <button
                      className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded cursor-pointer"
                      onClick={() => setEditedBatchId(batch?.id)}
                    >
                      تعديل الفصل والمقررات
                    </button>
                    {/* students btn */}
                    <button
                      onClick={() => handleSelectedBatchId(batch?.id)}
                      className="mt-4 bg-sky-500 hover:bg-sky-600 px-4 py-2 rounded cursor-pointer"
                    >
                      عرض طلاب الدفعة {batch.id}
                    </button>

                    <button
                      onClick={() => deleteBatch(batch?.id)}
                      className="mt-4 bg-red-600 hover:bg-red-500 px-4 py-2 rounded cursor-pointer"
                    >
                      حذف الدفعة
                    </button>
                    <button
                      onClick={() => handleArchiveBatch(batch?.id)}
                      className="mt-4 bg-green-600 hover:bg-green-700 px-4 py-2 rounded cursor-pointer"
                    >
                      أرشفة الدفعة
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <h2 className="text-gray-400 flex items-center gap-2 self-center text-2xl">
            لا توجد دفعات لعرضها
            <BiError color="red" />
          </h2>
        )
      ) : (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <AnimatedSpin loadingMsg="جار تحميل البيانات..." textSize="text-xl" />
        </div>
      )}
    </div>
  );
})
