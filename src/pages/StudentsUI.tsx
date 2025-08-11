// hooks
import { useCallback, useState } from "react";
// components
import SearchForm from "../components/StudentsUIComponents/SearchForm";
import ResultCard from "../components/StudentsUIComponents/ResultCard";
import Header from "../components/Header";
import { FiCopy } from 'react-icons/fi';


// firebase
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";

type course = {
id:string;
name:string;
degree:number;
grade:string;
}

export type studentResult = {
  name?:string;
  stdId?:string;
  currentSem?:string;
  suspend?:boolean;
  courses?:course[];
}
export default function StudentsUI() {
  const [result, setResult] = useState<studentResult>(); // student grades
  const [loading, setloading] = useState(false); // loading
  const [errorMSg, setErrorMsg] = useState(""); // error state
  const [showResult, setShowResult] = useState(true); // student result
  
  //   func for searcing in Fire Store Database
  const searchInFireStore = useCallback(async (stdId:string,stdBatch:string|null) => {
      // init state
      setloading(true);
      setErrorMsg("");
      // setResult(null);
      setShowResult(true);

      // try catch block
      try {
       // Step 1: Query student with field id == studentId
    const studentsRef = collection(db, `batches/${stdBatch}/students`);
    const studentQuery = query(studentsRef, where("stdId", "==", stdId));
    const studentSnap = await getDocs(studentQuery); //the result of search
    const studentDoc = studentSnap.docs[0]; // First match

    const studentData = studentDoc.data();
    if(studentData.suspend) {
      setErrorMsg("عذراً،تم حجب النتيجة لعدم إكمال إجراء التسجيل");
      return;
    }else{

    const studentDocId = studentDoc.id;

    const currentSemester = studentData.currentSem;

    // Step 2: Get courses from current semester
    const coursesRef = collection(
      db,
      `batches/${stdBatch}/students/${studentDocId}/semesters/${currentSemester}/courses`
    );
    const courseSnap = await getDocs(coursesRef);

    const courses = courseSnap.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name || "",
      degree: doc.data().degree || 0,
      grade: doc.data().grade || "",
    }));

    setResult({name:studentData.name,stdId:studentData.stdId,currentSem:studentData.currentSem,courses})
  }
      } catch {
        setErrorMsg("حدث خطأ أثناء البحث");
      } finally {
        setloading(false);
      }
      // ==== End try catch block ===
  }, []);

  return (
    <div className="w-full min-h-[100dvh] bg-[url('https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center bg-no-repeat min-h-[100dvh]">

    <Header/>

    <Info/>

    <div className=" bg-blue-300  shadow-md shadow-white p-5 rounded w-[min(95%,550px)] sticky mt-10  top-50 left-1/2 -translate-x-1/2 -translate-y-1/">
      {/* title */}
      <h1 className="text-center font-extrabold text-3xl mt-3 mb-10 text-title-color">
        نتائج الطلاب
      </h1>

      <SearchForm onSearch={searchInFireStore} />
      {/* if it's not loading ====> show the result ---- if it's loading show (Loading...) */}
      {showResult && (
        <ResultCard result={result} error={errorMSg} loading={loading} />
      )}
    </div>
    </div>

  );
}

const Info = () => {
  const [copiedId, setCopiedId] = useState("");

  const students = [
    { id: '018/M/40319',name:"عنادل علي عبد الباقي", batch: 28 },
    { id: '018/M/40320',name:"محمد علي عبد الباقي", batch: 28 },
    { id: '019/M/41319',name:"غسان علي عبد الباقي", batch: 29 }
  ];

  const copyToClipboard = (text:string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(""), 2000);
  };

  return (
    <div className="w-[400px] mx-auto p-6 bg-white rounded-lg shadow-md absolute">
      <h2 className="text-xl font-bold text-gray-800 mb-6">بيانات بعض الطلاب لغرض الشرح</h2>
      
      <div className="space-y-4">
        {students.map((student, index) => (
          <div key={index} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-base font-medium text-gray-800">{student.name}</p>
                <p className="text-sm font-medium text-gray-500">Batch {student.batch}</p>
                <p className="text-lg font-semibold text-gray-800">{student.id}</p>
              </div>
              <button
                onClick={() => copyToClipboard(student.id)}
                className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                aria-label="Copy ID"
              >
                <FiCopy className={`h-5 w-5 ${copiedId === student.id ? 'text-green-500' : 'text-gray-400'}`} />
              </button>
            </div>
            {copiedId === student.id && (
              <p className="text-xs text-green-500 mt-1 animate-pulse">Copied!</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

