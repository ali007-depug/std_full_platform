// hooks
import { useContext, useEffect, useState } from "react";
// components
import SidePanel from "../components/DashboardComponent/SidePanel";
import BatchInfo from "../components/DashboardComponent/BatchInfo";
import NewBatchInput from "../components/DashboardComponent/NewBatchInput";
import StudentInfo from "../components/DashboardComponent/StudnetInfo";
import NewStdFrom from "../components/DashboardComponent/NewStdForm";
import ConfirmPopup from "../components/ConfirmPopup";
import PendingUsers from "../components/DashboardComponent/PendingUsers";
import Toast from "../components/Toast";
// react icons

// firebase
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";

// react router
// import { useNavigate } from "react-router-dom";
import { useCallback } from "react";

// types
// import batchesProp  from "../components/DashboardComponent/BatchInfo";
import type { Student } from "../components/DashboardComponent/StudnetInfo";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import AnimatedSpin from "../components/AnimatedSpin";
import { useBatches } from "../Contexts/BatchContext";
// UI Interface
export interface ShowUI {
  default: boolean;
  NewStdFrom: boolean;
  confirmPopup: boolean;
  batchArchPopUp: boolean;
  deleteBatchPopUp: boolean;
  pendignUsers: boolean;
  toast: boolean;
  newBatchInput: boolean;
  showBatchInfo: boolean;
  showStudnetInfo: boolean;
}
interface allStdInfo {
  id: string;
  name: string;
  stdId: string;
  stdBatch?: string;
  courses?: Course[];
  currentSem: string;
}
interface Course {
  id: string;
  name: string;
  grade: string | null;
  degree?: number | null;
}

type FlattenedCourse = {
  id: string;
  name: string;
  stdId: string;
  currentSem: string;
  courseName: string;
  degree: string | number;
  grade: string;
};

export default function Dashboard() {
  // =========== Global states ============
  const [showUI, setShowUI] = useState<ShowUI>({
    default: true, // default state
    NewStdFrom: false,
    confirmPopup: false,
    batchArchPopUp: false,
    deleteBatchPopUp: false,
    pendignUsers: false,
    toast: false,
    newBatchInput: false,
    showBatchInfo: false,
    showStudnetInfo: false,
  }); // control dashboard components
  const [toastMsg, setToastMsg] = useState(""); // Toast Message
  const [confirmMsg, setConfirmMsg] = useState<string>(""); // store the confirm message to show it in confirm popup
  // =========== End Global states =============

  // ============= students states ================
  const [students, setStudents] = useState<Student[]>([]); // STORE : the data from fire store
  const [isDeletingBatch, setIsDeletingBatch] = useState(false);
  const [archiveBatch, setArchiveBatch] = useState<FlattenedCourse[]>([]);
  const [batchLoadingArchive, setBatchLoadingArchive] = useState(false);
  const [selectedStddId, setSelectedStddId] = useState<null | number>(null); // STORE: the selected id when user want remove any studtent
  const [editStudentInfo, setEditStudentInfo] = useState([]); // STORE : student info to show it in the form when user try to edit it
  const [editedSelectedId, setEditedSelectedId] = useState<null | number>(null); // STORE the selected id when user want to edit any studtent
  const [studentLoading, setStudentLoading] = useState(false); // Fetching student Status
  // ============== End Students states ==============

  // ================= Batche states =================
  // const [batches, setBatches] = useState<batchesProp[]>([]); // SOTRE : all batches
  // const [batchLoading, setBatchLoading] = useState(true); // STORE : batch loading status
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(""); // store selected batch id
  // ================ End Batche states ====================

  // ================= Users States =======================
  const [pendingUsers, setPendingUsers] = useState([]); // STORE : peding users
  const [allUsers, setAllUsers] = useState([]); // STORE : all users
  const [currentUser, setCurrentUser] = useState<string>(""); // SOTRE : current admin

  const { batches, batchLoading, fetchBatches, setBatches } = useBatches();

  // ================= End Users states ===================

  // const navigate = useNavigate();

  // if students change then fetch thier data to update the UI
  useEffect(() => {
    // fetchStudents();
    fetchUsers();
    // if pending users change then reflect in the UI
    getPendingUsers();
    // fetchBatches();
  }, []);

  // ============================= FUNCTIONS ========================================

  // ============================= FETCH FUNCTIONS =====================================
  // function to fetch data from firebase & to update the UI
  const fetchStudents = useCallback(async (selectedBatchId: string | null) => {
    try {
      setStudentLoading(true);
      console.log("fetching students data...");

      const stdRef = collection(db, `batches/${selectedBatchId}/students`);

      const stdSnapshot = await getDocs(stdRef);
      let studentList: Student[] = [];

      studentList = await Promise.all(
        stdSnapshot.docs.map(async (docSnap) => {
          const studentData = docSnap.data();

          return {
            id: docSnap.id,
            name: studentData.name || "",
            stdId: studentData.stdId || "",
            stdBatch: studentData.stdBatch || selectedBatchId, // WHY NOT LIKE OTHER ALI??
            currentSem: studentData.currentSem || "",
            suspend: studentData.suspend || false,
          };
        })
      );
      // updata state
      const sortStudents = studentList.sort((a, b) => {
        const [aYear, , aId] = a.stdId.split("/");
        const [bYear, , bId] = b.stdId.split("/");
        return (
          parseInt(bYear) - parseInt(aYear) || parseInt(aId) - parseInt(bId)
        );
      });
      setStudents(sortStudents);
    } catch (err) {
      console.error("Error fetching students:", err.message);
    } finally {
      setStudentLoading(false);
    }
  }, []);

  const fetchAllStudentsAllSemestersWithCourses = async (
    batchId: string | null
  ) => {
    try {
      setBatchLoadingArchive(true);
      const studentsRef = collection(db, `batches/${batchId}/students`);
      const studentsSnap = await getDocs(studentsRef);

      // console.log("👨‍🎓 Students count:", studentsSnap.size);

      const allData = await Promise.all(
        studentsSnap.docs.map(async (studentDoc) => {
          const studentId = studentDoc.id;
          const studentData = studentDoc.data();
          const allCourses = [];

          // Check semesters 1 through 12 dynamically
          for (let semesterNum = 1; semesterNum <= 12; semesterNum++) {
            const semesterId = semesterNum.toString(); // Convert to string if needed
            const coursesRef = collection(
              db,
              `batches/${batchId}/students/${studentId}/semesters/${semesterId}/courses`
            );

            try {
              const coursesSnap = await getDocs(coursesRef);
              // console.log(
              //   `🎓 ${studentId} semester ${semesterId} courses:`,
              //   coursesSnap.size
              // );

              coursesSnap.docs.forEach((courseDoc) => {
                const courseData = courseDoc.data();
                allCourses.push({
                  studentId,
                  studentName: studentData.name || "",
                  stdId: studentData.stdId || "",
                  semester: semesterId,
                  courseName: courseData.name || "",
                  degree: courseData.degree || "",
                  grade: courseData.grade || "",
                });
              });
            } catch (error) {
              console.warn(
                `⚠️ Error fetching semester ${semesterId} for ${studentId}:`,
                error
              );
              // Continue to next semester even if one fails
            }
          }

          return allCourses;
        })
      );

      setArchiveBatch(allData.flat());
    } catch (error) {
      console.error("🔥 Error fetching student data:", error);
      throw error;
    } finally {
      setBatchLoadingArchive(false);
    }
  };

  // const fetchAllStudentsWithCourses = async (batchId: string) => {
  //   const studentsRef = collection(db, `batches/${batchId}/students`);
  //   const studentsSnap = await getDocs(studentsRef);

  //   const studentsWithCourses = await Promise.all(
  //     studentsSnap.docs.map(async (studentDoc) => {
  //       const student = studentDoc.data();
  //       const studentId = studentDoc.id;
  //       const currentSem = student.currentSem;

  //       const coursesRef = collection(
  //         db,
  //         `batches/${batchId}/students/${studentId}/semesters/${currentSem}/courses`
  //       );
  //       const coursesSnap = await getDocs(coursesRef);

  //       const courses = coursesSnap.docs.map((doc) => ({

  //         id: doc.id,
  //         name:doc.data().name,
  //         degree:doc.data().degree,
  //         grade:doc.data().grade
  //       }));

  //       return {
  //         id: studentId,
  //         name:student.name,
  //         stdId: student.stdId,
  //         currentSem: student.currentSem,
  //         courses,
  //       };
  //     })
  //   );

  //   return studentsWithCourses;
  // };

  // const fetchAllStudentsAllSemestersWithCourses = async (
  //   batchId: string
  // ) => {
  //   const studentsRef = collection(db, `batches/${batchId}/students`);
  //   const studentsSnap = await getDocs(studentsRef);

  //   const allData = [];

  //   for (const studentDoc of studentsSnap.docs) {
  //     const studentId = studentDoc.id;
  //     const studentData = studentDoc.data();

  //     const semestersRef = collection(
  //       db,
  //       `batches/${batchId}/students/${studentId}/semesters`
  //     );
  //     const semestersSnap = await getDocs(semestersRef);

  //     for (const semesterDoc of semestersSnap.docs) {
  //       const semesterId = semesterDoc.id;

  //       const coursesRef = collection(
  //         db,
  //         `batches/${batchId}/students/${studentId}/semesters/${semesterId}/courses`
  //       );
  //       const coursesSnap = await getDocs(coursesRef);

  //       for (const courseDoc of coursesSnap.docs) {
  //         const courseData = courseDoc.data();

  //         allData.push({
  //           studentId,
  //           studentName: studentData.name || "",
  //           stdId: studentData.stdId || "",
  //           semester: semesterId,
  //           courseName: courseData.name || "",
  //           degree: courseData.degree || "",
  //           grade: courseData.grade || "",
  //         });
  //       }
  //     }
  //   }

  //   return allData;
  // };

  // function to fetch users and show it in dashboard
  const fetchUsers = useCallback(async () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    // get current user and relfect his name in UI
    if (currentUser) {
      const docRef = doc(db, "users", currentUser.uid);
      const docSanp = await getDoc(docRef);
      if (docSanp.exists()) {
        const userData = docSanp.data();
        setCurrentUser(userData.name);
      } else {
        console.log("no teacher");
      }
    }

    try {
      // get all users and reflect them in accounts popup
      const usersCollection = collection(db, "users");
      const querySnapshot = await getDocs(usersCollection);
      const usersInfo = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAllUsers(usersInfo);
    } catch (error) {
      console.log(`all users error is : ${error}`);
    }
  }, []);

  // get pending users
  const getPendingUsers = useCallback(async () => {
    try {
      const snapshot = await getDocs(collection(db, "pending-users"));
      const pUsers = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPendingUsers(pUsers);
      console.log(`the pending users are ${pUsers}`);
    } catch (error) {
      console.log(`pending users error : ${error}`);
    }
  }, []);

  // to fetch all batches from firesote
  // const fetchBatches = useCallback(async () => {
  //   // ToDO : IF NO BATCHES THEN SHOW A MESSAGE
  //   try {
  //     setBatchLoading(true);
  //     const snapshot = await getDocs(collection(db, "batches"));
  //     const data = snapshot.docs.map((doc) => ({
  //       id: doc.id,
  //       currentSem: doc.data().currentSem,
  //       courses: doc.data().courses || [],
  //       archived: doc.data().archived || false,
  //     }));
  //     const sortBatches = data.sort((a, b) => {
  //       return parseInt(a.id) - parseInt(b.id); // sort by id in descending order
  //     });
  //     setBatches(sortBatches);
  //   } catch (error) {
  //     console.log(`the error while fetch is ${error}`);
  //   } finally {
  //     setBatchLoading(false);
  //   }
  // }, []);

  // ============================= END FETCH FUNCTION ==================================

  // ============================= USER FUNCTION ==============================

  // show pending users & cotrol them
  const handlePendingUsers = () => {
    // show users UI
    setShowUI({
      ...showUI,
      default: !showUI.default,
      pendignUsers: !showUI.pendignUsers,
    });
  };

  // when user click on ✅
  const handleApproveUser = useCallback(
    async (user: { id: string; name: string }) => {
      try {
        await setDoc(doc(db, "users", user.id), {
          name: user.name,
          email: user.email,
          approveAt: new Date(),
        });
        // remove from pending users
        await deleteDoc(doc(db, "pending-users", user.id));

        // update Pending users
        setPendingUsers((prev) => prev.filter((u) => u.id !== user.id));
        setShowUI((prev) => ({ ...prev, toast: true }));
        setToastMsg("تم القبول بنجاح");
        setTimeout(() => {
          setShowUI((prev) => ({ ...prev, toast: false }));
          setToastMsg("");
        }, 1500);
      } catch (error) {
        console.log(`approve pending error is : ${error}`);
      }
    },
    []
  );

  // when user click on ✖️
  const handleRejectUser = useCallback(async (id: string) => {
    try {
      await deleteDoc(doc(db, "pending-users", id));

      setShowUI((prev) => ({ ...prev, toast: true }));
      setToastMsg("تم الرفض بنجاح");
      setTimeout(() => {
        setShowUI((prev) => ({ ...prev, toast: false }));
        setToastMsg("");
      }, 1500);
      setPendingUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (error) {
      console.log(`reject user Error is : ${error}`);
    }
  }, []);

  // ============================= END USER FUNCTION ==============================

  // ============================= BATCH FUNCTION ==============================

  const showNewBatchUI = () => {
    setShowUI((prev) => ({
      ...prev,
      default: !prev.default,
      newBatchInput: !prev.newBatchInput,
    }));
  };
  const closeNewBatchUI = () => {
    setShowUI({ ...showUI, default: true, newBatchInput: false });
  };

  // invoke when clicked on "show batch btn" in side panel
  const showBatchesInfo = () => {
    setShowUI((prev) => ({
      ...prev,
      default: !prev.default,
      showBatchInfo: !prev.showBatchInfo,
      showStudnetInfo: false,
    }));

    // fetchBatches
    // fetchBatches();
  };

  const deleteBatch = (id: string) => {
    console.log("confirm popup for batch");
    setShowUI({ ...showUI, confirmPopup: true, deleteBatchPopUp: true });
    setConfirmMsg(" حذف هذه الدفعة");
    setSelectedBatchId(id);
  };

  async function removeBatchFromFireStore(batchId: string | null) {
    setIsDeletingBatch(true);
    try {
      const batchRef = doc(db, "batches", batchId);
      const studentsRef = collection(db, `batches/${batchId}/students`);
      const studentsSnap = await getDocs(studentsRef);

      // Loop over students
      for (const studentDoc of studentsSnap.docs) {
        const studentId = studentDoc.id;
        const semestersRef = collection(
          db,
          `batches/${batchId}/students/${studentId}/semesters`
        );
        const semestersSnap = await getDocs(semestersRef);

        // Loop over semesters
        for (const semDoc of semestersSnap.docs) {
          const semId = semDoc.id;
          const coursesRef = collection(
            db,
            `batches/${batchId}/students/${studentId}/semesters/${semId}/courses`
          );
          const coursesSnap = await getDocs(coursesRef);

          // Delete each course
          await Promise.all(
            coursesSnap.docs.map((courseDoc) => deleteDoc(courseDoc.ref))
          );

          // Delete semester document
          await deleteDoc(semDoc.ref);
        }

        // Delete student document
        await deleteDoc(studentDoc.ref);
      }

      // Finally, delete the batch itself
      await deleteDoc(batchRef);

      console.log(`✅ Batch ${batchId} and all its data deleted`);
    } catch (error) {
      console.error("❌ Error deleting batch:", error.message);
    } finally {
      setIsDeletingBatch(false);
      setShowUI({ ...showUI, toast: true, confirmPopup: false });
      setToastMsg("تم حذف الدفعة بنجاح");
      setTimeout(() => {
        setShowUI((prev) => ({ ...prev, toast: false }));
      }, 1500);
      // update The courses Array
      setBatches((prev) => prev?.filter((batch) => batch.id !== batchId));

      // console.log(batches)
      // update the UI
      // if(typeof fetchBatches === 'function'){
      //   fetchBatches();
      // }
    }
  }

  // funct to : store the selected batch ID , and show the students of that batch
  const handleSelectedBatchId = useCallback(
    (batchName: string) => {
      setShowUI((prev) => ({
        ...prev,
        showStudnetInfo: true,
        showBatchInfo: false,
      }));

      if (batchName !== selectedBatchId) {
        console.log("set New batch");
        setSelectedBatchId((prev) => (prev !== batchName ? batchName : prev));
      }
    },
    [selectedBatchId]
  );

  // func to : archive batch
  const handleArchiveBatch = async (batchid: string | null) => {
    console.log("archiving batch" + batchid);
    setShowUI({ ...showUI, confirmPopup: true, deleteBatchPopUp: false });
    setConfirmMsg("من أرشفة هذه الدفعة");
    setSelectedBatchId(batchid);
  };

  const archivingBatch = async () => {
    await fetchAllStudentsAllSemestersWithCourses(selectedBatchId);
    // update batch data - archived : true
    const batchRef = doc(db, "batches", selectedBatchId);
    await setDoc(batchRef, { archived: true }, { merge: true });
    setBatches((prevBatches) =>
      prevBatches.map((batch) =>
        batch.id === selectedBatchId ? { ...batch, archived: true } : batch
      )
    );
    exportBatchToExcel(archiveBatch, `${selectedBatchId}_students.xlsx`);
    // fetchBatches();
    setShowUI({ ...showUI, confirmPopup: false });
  };

  const exportBatchToExcel = (
    data: allStdInfo[],
    fileName = "students.xlsx"
  ) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });

    saveAs(blob, fileName);
  };

  // func to download the batch  as csv extension

  // ============================= END BATCH FUNCTION ==============================

  // ============================= STUDENT FUNCTION ==============================

  // when user click on trash icon ==> show confirm popup and store the id of selected one
  const handleDeleteStd = useCallback(
    (id: null | number) => {
      setConfirmMsg("حذف هذا الطالب");
      setShowUI({ ...showUI, confirmPopup: true });
      setSelectedStddId(id);
    },
    [showUI]
  );
  // remove student from firestore & UI
  const handleRemoveStd = useCallback(
    async (studentId: string) => {
      console.log(studentId);
      try {
        // 1. Reference to semesters collection
        const semestersRef = collection(
          db,
          `batches/${selectedBatchId}/students/${studentId}/semesters`
        );
        const semestersSnap = await getDocs(semestersRef);

        for (const semesterDoc of semestersSnap.docs) {
          const semesterId = semesterDoc.id;

          // 2. Reference to courses subcollection under this semester
          const coursesRef = collection(
            db,
            `batches/${selectedBatchId}/students/${studentId}/semesters/${semesterId}/courses`
          );
          const coursesSnap = await getDocs(coursesRef);

          // 3. Delete all course documents
          for (const courseDoc of coursesSnap.docs) {
            await deleteDoc(courseDoc.ref);
          }

          // 4. Delete the semester document itself
          await deleteDoc(
            doc(
              db,
              `batches/${selectedBatchId}/students/${studentId}/semesters/${semesterId}`
            )
          );
        }

        // 5. Finally, delete the student document
        await deleteDoc(
          doc(db, `batches/${selectedBatchId}/students/${studentId}`)
        );

        console.log(`✅ Deleted student ${studentId} and all nested data.`);
        setStudents((prev) => prev.filter((s) => s.id !== studentId));
      } catch (error) {
        console.log(`the Error while deleting is : ${error}`);
      } finally {
        // show toast
        setShowUI({ ...showUI, toast: true });
        setToastMsg("تم الحذف بنجاح");
        // close the confirm popup
        setTimeout(() => {
          setShowUI({ ...showUI, confirmPopup: false, toast: false });
          setToastMsg("");
        }, 1500);
      }
    },
    [showUI, selectedBatchId]
  );

  // Edit students data
  const handleEditStd = useCallback(
    async (id: string) => {
      const foundStudent = students.find((std) => std.id == id);
      if (foundStudent) {
        setEditedSelectedId(id);
        setShowUI({ ...showUI, NewStdFrom: true });
        setEditStudentInfo(foundStudent);
      }
    },
    [showUI, students]
  );

  // suspend student function
  const handleSuspend = useCallback(
    async (id: string) => {
      try {
        const studentRef = doc(db, `batches/${selectedBatchId}/students`, id);
        const studentSnap = await getDoc(studentRef);
        if (studentSnap.exists()) {
          const currentStatus = studentSnap.data().suspend ?? false;
          await setDoc(
            studentRef,
            { suspend: !currentStatus },
            { merge: true }
          );
          setStudents((prev) =>
            prev.map((student) =>
              student.id === id
                ? { ...student, suspend: !student.suspend }
                : student
            )
          );
        }
      } catch (error) {
        console.log(error);
      }
    },
    [selectedBatchId]
  );

  // ============================= END STUDENT FUNCTION ==============================

  // close newStdForm component
  const closeNewStdForm = () => {
    setShowUI({ ...showUI, NewStdFrom: false });
    // setShowNewStdForm(false);
    setEditStudentInfo(null);
    setEditedSelectedId(null);
  };

  const handleCloseConfirmPopup = () => {
    setShowUI((prev) => ({ ...prev, confirmPopup: false }));
  };

  const showNewStdForm = () => {
    setShowUI({ ...showUI, NewStdFrom: true });
  };

  return (
    <div className="overflow-hidden bg-bg-color min-h-[100dvh] relative">
      <p className="sr-only">Dashboard</p>

      {/* ============ header =========== */}
      {/* ============== End header =============== */}

      {/* ============= Content =============== */}
      <main className=" min-h-[100dvh] flex  bg-gray-700" role="main">
        {/* Dashboard data */}
        <div className="relative bg-gray-700 w-[calc(100%-300px)] px-3">
          {showUI.default && (
            <div className="flex items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full">
              <p className="text-gray-400 text-8xl  text-center">لوحة التحكم</p>
            </div>
          )}
          {/* Batch Info Data */}
          {showUI.showBatchInfo && (
            <BatchInfo
              batches={batches}
              fetchBatches={fetchBatches}
              closeBatchInfo={() =>
                setShowUI({ ...showUI, default: true, showBatchInfo: false })
              }
              // editedBatchId={editedBatchId}
              // newSem={newSem}
              // setNewSem={setNewSem}
              // newCourses={newCourses}
              // setNewCourses={setNewCourses}
              // setEditedBatchId={setEditedBatchId}
              batchLoading={batchLoading}
              handleSelectedBatchId={handleSelectedBatchId}
              setShowToast={(toast) => setShowUI({ ...showUI, toast: toast })}
              setToastMsg={(msg) => setToastMsg(msg)}
              deleteBatch={deleteBatch}
              handleArchiveBatch={handleArchiveBatch}
            />
          )}
          {/* show student Info */}
          {showUI.showStudnetInfo && (
            <StudentInfo
              students={students}
              setStudents={setStudents}
              fetchStudents={fetchStudents}
              selectedBatchId={selectedBatchId}
              showNewStdForm={showNewStdForm}
              studentsLoading={studentLoading}
              handleDeleteStd={handleDeleteStd}
              handleEditStd={handleEditStd}
              handleSuspend={handleSuspend}
            />
          )}
          {/* Form to add or edit student */}
          {showUI.NewStdFrom && (
            <NewStdFrom
              oldStudent={editStudentInfo}
              closeNewStdForm={closeNewStdForm}
              editedId={editedSelectedId}
              fetchStudents={fetchStudents}
              setShowUI={setShowUI}
              showUI={showUI}
              selectedBatchId={selectedBatchId}
            />
          )}
          {/* ==== New batch addition Insert ===== */}
          {showUI.newBatchInput && (
            <NewBatchInput
              fetchBatches={fetchBatches}
              closeNewBatchUI={closeNewBatchUI}
              setToastMsg={setToastMsg}
              setShowUI={setShowUI}
            />
          )}
          {/* ==== End New batch addition Insert ===== */}
          {/* Confirm popup */}
          {showUI.confirmPopup && (
            <ConfirmPopup
              yesAction={
                showUI.showStudnetInfo
                  ? () => handleRemoveStd(selectedStddId)
                  : showUI.showBatchInfo && showUI.deleteBatchPopUp
                  ? () => removeBatchFromFireStore(selectedBatchId)
                  : showUI.showBatchInfo && !showUI.deleteBatchPopUp
                  ? () => {
                      archivingBatch();
                    }
                  : undefined
              }
              closeConfirm={handleCloseConfirmPopup}
              confirmMsg={confirmMsg}
            />
          )}
          {/* ====== End confirm popup ======= */}
          {/* ====== Toast componet ====== */}
          {showUI.toast && (
            <div className="fixed bottom-[100px] left-[50px] w-[200px]">
              <Toast msg={toastMsg} />
            </div>
          )}
          {/* ======== End Toast component ======== */}
          {/* ========= delete batch loading spinner */}
          {isDeletingBatch && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] rounded shadow-md shadow-sky-200 bg-sky-800 text-white font-semibold text-2xl flex justify-center min-h-40">
              <AnimatedSpin loadingMsg="جاري حذف الدفعة" />
            </div>
          )}
          {/* ========= delete batch loading spinner */}
          {/* ========== archive loading spinner */}
          {batchLoadingArchive && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] rounded shadow-md shadow-sky-200 bg-sky-800 text-white font-semibold text-2xl flex justify-center min-h-40">
              <AnimatedSpin loadingMsg="جار تجهيز بيانات الدفعة" />
            </div>
          )}
          {/* ========== End archive loading spinner */}
          {/* ============= pending user UI ============== */}
          {showUI.pendignUsers && (
            <PendingUsers
              pendingUsers={pendingUsers}
              allUsers={allUsers}
              handleApproveUser={handleApproveUser}
              handleRejectUser={handleRejectUser}
              closePendingUsers={handlePendingUsers}
            />
          )}
          {/* ============= End pending user UI ============== */}
        </div>
        {/* End Dashboard data */}

        {/* ========== side panel component ======== */}
        <SidePanel
          showBatchesInfo={showBatchesInfo}
          showNewBatchUI={showNewBatchUI}
          showPendingUsers={handlePendingUsers}
          currentUser={currentUser}
          // showBatchInfo={showBatchInfo}
        />
        {/* ========= side panel component  ============ */}
      </main>
      {/* ============== End content  =============== */}
    </div>
  );
}
