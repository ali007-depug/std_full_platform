import { useEffect, useState,memo } from "react";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  doc,
  // deleteDoc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { BiDownArrowAlt, BiEdit } from "react-icons/bi";
import { TbTrash } from "react-icons/tb";
import { CgBlock } from "react-icons/cg";

const gradeOptions = ["ممتاز", "جيد جداً", "جيد", "مقبول", "راسب"];

export type Student = {
  id: string;
  name: string;
  stdId: string;
  std_Id?:string;
  stdBatch: string;
  stdCourses?: Course[];
  currentSem: string;
  suspend:boolean;
};

export type Course = {
  id:string;
  name?: string;
  grade?: string | null;
  degree?: number | null;
};

interface StudentInfoProps {
  selectedBatchId: string | null;
  showNewStdForm: () => void;
  students: Student[];
  setStudents: (students: Student[]) => void;
  fetchStudents: (batchId: string|null) => void;
  studentsLoading: boolean;
  handleEditStd: (studentId: string) => void;
  handleSuspend: (studentId: string) => void;
  handleDeleteStd: (studentId: string, currentSem: string) => void;
}

interface CourseInput {
  id:string;
  name:string;
  grade?: string;
  degree?: number;
}

export default memo( function StudentInfo({
  selectedBatchId,
  showNewStdForm,
  students,
  setStudents,
  fetchStudents,
  studentsLoading,
  handleEditStd,
  handleSuspend,
  handleDeleteStd,
}: StudentInfoProps) {


  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(
    null
  );
  const [gradeUpdateLoading, setGradeUpdateLoading] = useState(false);
  // const [updatedCourse, setUpdatedCourse] = useState("");
  const [loading, setLoading] = useState(false);
  const [courseInputs, setCourseInputs] = useState<
    Record<string, CourseInput>
  >({});

  console.log("studentInfo renderd...")

  useEffect(() => {
    let isMounted = true;
    
    if (isMounted) {
      fetchStudents(selectedBatchId);
      console.log(selectedBatchId)
      console.log("Fetch function recreated");
    }

    return () => { isMounted = false }; // Cleanup

  }, [selectedBatchId, fetchStudents]);

  const toggleExpand = (id: string, currentSem: string) => {
    setExpandedStudentId(expandedStudentId === id ? null : id);
    fetchStudentCourses(id, currentSem);
  };

  // fetch student course
  const fetchStudentCourses = async (studentId: string, currentSem: string) => {
    try {
      setLoading(true);
      const coursesRef = collection(
        db,
        `batches/${selectedBatchId}/students/${studentId}/semesters/${currentSem}/courses`
      );
      const courseSnap = await getDocs(coursesRef);
      const courses:Course[] = courseSnap.docs.map((doc) => ({
        id: doc.id,
        name:doc.data().name,
        grade:doc.data().grade,
        degree:doc.data().degree,
      }));

      const updatedStudent = students.map((student) => student.id === studentId ? {...student, stdCourses: courses} : student);

      setStudents(updatedStudent);
    } catch (err) {
      console.error("Failed to fetch courses", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAllCourses = async (studentId: string) => {
    // break func if no batch is selected
    if (!selectedBatchId) return;

    setGradeUpdateLoading(true);
    try {
      const batchRef = doc(db, "batches", selectedBatchId);
      const batchSnap = await getDoc(batchRef);
      if (!batchSnap.exists()) throw new Error("Batch not found");
      const currentSem = batchSnap.data().currentSem;

      const studentInput = courseInputs;

      const updatePromises = Object.entries(studentInput).map(
        async ([courseName, { grade, degree }]) => {
          if (!grade || degree == null || degree < 0 || degree > 100) {
            console.warn(`Invalid grade or degree for ${courseName}`);
            return;
          }

          const courseRef = doc(
            db,
            `batches/${selectedBatchId}/students/${studentId}/semesters/${currentSem}/courses/${courseName.toLowerCase()}`
          );

          await updateDoc(courseRef, { grade, degree });
          // empty the input + select
          setCourseInputs({});
        }
      );

      await Promise.all(updatePromises);

      // refresh UI
      fetchStudentCourses(studentId, currentSem);
    } catch (err) {
      console.error("Error updating courses:", err);
    } finally {
      setGradeUpdateLoading(false);
    }
  };

  return (
    <div className="w-full bg-sky-200 rounded overflow-y-scroll max-h-[90dvh] relative top-10">
      <div className="grid grid-cols-[30px_70px_1fr_70px_70px] sm:grid-cols-[repeat(2,110px)_3fr_1fr_1fr] gap-1 sm:gap-4 text-center font-bold py-2 px-4 bg-blue-300 text-gray-950 sticky top-0 z-10">
        <div>No</div>
        <div>ID</div>
        <div>Name</div>
        <div>Courses</div>
        <div>Actions</div>
      </div>

      {studentsLoading ? (
        <div className="text-center p-4 text-gray-700">Loading students...</div>
      ) : students.length === 0 ? (
        <div className="text-center p-4 text-gray-600">
          No students found in batch {selectedBatchId}
        </div>
      ) : (
        students.map((student, index) => (
          <div key={student?.id} className="border-b px-4 relative">
            <div className="grid grid-cols-[30px_70px_1fr_70px_70px] sm:grid-cols-[repeat(2,110px)_3fr_1fr_1fr] gap-1 sm:gap-4 text-center items-center py-2 text-gray-900">
              <div>{index + 1}</div>
              <div>{student.stdId}</div>
              <div>{student.name}</div>
              {/* show courses button */}
              <button
                onClick={() => toggleExpand(student.id, student.currentSem)}
                className="flex justify-center"
              >
                <BiDownArrowAlt
                  className={`size-7 text-violet-500 bg-white rounded hover:bg-gray-200 transition duration-300 cursor-pointer ${
                    expandedStudentId === student.id ? "rotate-[-180deg]" : ""
                  }`}
                />
              </button>
              {/* actions buttons */}
              <div className="flex justify-center gap-2 [&_button]:cursor-pointer">
                {/* edit action button */}
              <button
                  className="hover:bg-blue-300 p-2 rounded"
                  onClick={() => handleEditStd(student.id)}
                >
                  <BiEdit size={20} color="blue" />
                </button>
                  {/* suspend action button */}
                  <button
                  className={`hover:bg-blue-200 p-2 rounded `}
                  onClick={() => handleSuspend(student.id)}
                >
                  <CgBlock size={20} color={`${student.suspend ? `red` : `green`}`} />
                </button>

                  {/* delete action button */}
                <button
                  className="hover:bg-red-200 p-2 rounded"
                  onClick={() =>
                    handleDeleteStd(student.id, student.currentSem)
                  }
                >
                  <TbTrash size={20} color="red" />
                </button>
              </div>
            </div>
            {/* courses */}
            {expandedStudentId === student.id && (
              <div className="mt-2 mb-4 py-2 rounded-md bg-sky-100 space-y-2 [direction:rtl]">
                {!loading ? (
                  <div className="grid grid-cols-4 gap-4 p-4 items-center">
                    {/* Column Headers */}
                    <div className="font-bold text-gray-700 text-center">
                      اسم المقرر
                    </div>
                    <div className="font-bold text-gray-700 text-center">
                      التقدير الحالي
                    </div>
                    <div className="font-bold text-gray-700 text-center">
                      إضافة تقدير جديد
                    </div>
                    <div className="font-bold text-gray-700 text-center">
                      إضافة درجة جديدة
                    </div>

                    {/* Course Rows */}
                    {student.stdCourses?.map((course, i) => (
                      <>
                        <div
                          key={`${i}-name`}
                          className="font-semibold text-center"
                        >
                          {course.name}
                        </div>

                        <div
                          key={`${i}-current`}
                          className="text-center space-y-1"
                        >
                          <p className="text-sm text-gray-700">
                            {course.grade || "N/A"}
                          </p>
                          <p className="text-sm text-gray-700">
                            {course.degree ?? "N/A"}
                          </p>
                        </div>

                        <div key={`${i}-grade`} className="flex justify-center">
                          <select
                            value={course.name ? courseInputs[course?.name]?.grade || "" : ""}
                            onChange={(e) =>{
                              if(!course?.name) return;
                              const courseName = course.name;
                              setCourseInputs((prev) => ({
                                ...prev,
                                [courseName]: {
                                  ...prev[courseName],
                                  grade: e.target.value,
                                },
                              }))
                            }
                            }
                            className="border px-2 py-1 rounded w-full max-w-[120px]"
                          >
                            <option value="">التقدير</option>
                            {gradeOptions.map((grade) => (
                              <option key={grade} value={grade}>
                                {grade}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div
                          key={`${i}-degree`}
                          className="flex justify-center"
                        >
                          <input
                            type="number"
                            min={0}
                            max={100}
                            placeholder="الدرجة"
                            value={course.name ?  courseInputs[course.name]?.degree || "" :""}
                            onChange={(e) =>{
                              if(!course.name) return;
                              const courseName = course.name;
                              setCourseInputs((prev) => ({
                                ...prev,
                                [courseName]: {
                                  ...prev[courseName],
                                  degree: Number(e.target.value),
                                },
                              }))
                            }
                            }
                            className="border px-2 py-1 rounded w-full max-w-[100px] text-center"
                          />
                        </div>
                      </>
                    ))}

                    {/* Submit Button - spans all columns */}
                    <div className="col-span-4 flex justify-center mt-4">
                      <button
                        className="bg-green-700 text-white px-6 py-2 rounded cursor-pointer"
                        onClick={() => handleAddAllCourses(student.id)}
                        disabled={gradeUpdateLoading}
                      >
                        {gradeUpdateLoading
                          ? "جاري التحديث..."
                          : "حفظ البيانات"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-center py-4">
                    جاري تحميل بيانات الطالب...
                  </p>
                )}
              </div>
            )}{" "}
          </div>
        ))
      )}

      <div className="text-center fixed bottom-0 right-80 my-8">
        <button
          className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2 rounded cursor-pointer"
          onClick={showNewStdForm}
        >
          + إضافة طالب جديد
        </button>
      </div>
    </div>
  );
},areEqual)


function areEqual(prevProps: StudentInfoProps, nextProps: StudentInfoProps) {
  return (
    prevProps.selectedBatchId === nextProps.selectedBatchId &&
    prevProps.showNewStdForm === nextProps.showNewStdForm &&
    prevProps.students === nextProps.students &&
    prevProps.studentsLoading === nextProps.studentsLoading &&
    // Compare function references by their stringified version
    prevProps.handleEditStd.toString() === nextProps.handleEditStd.toString() &&
    prevProps.handleSuspend.toString() === nextProps.handleSuspend.toString() &&
    prevProps.handleDeleteStd.toString() === nextProps.handleDeleteStd.toString()
  );
}

