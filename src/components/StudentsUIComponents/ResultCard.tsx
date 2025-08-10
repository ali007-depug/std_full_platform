import { Fragment } from "react/jsx-runtime";
import type { studentResult } from "../../pages/StudentsUI";
import { PiX } from "react-icons/pi";
type resultCardProp = {
  result: studentResult | undefined;
  error: boolean | string;
  loading: boolean;
};
export default function ResultCard({
  result = {},
  error,
  loading,
}: resultCardProp) {
  return (
    <div
      className={`bg-gray-800  text-white flex flex-col  justify-center shadow-md p-4 rounded ${
        loading || Object.keys(result).length !== 0 ? "flex" : "hidden"
      }`}
    >
      {/* when there is no match .. notfiy that there is no match */}
      {error ? (
        <p className="text-red-400 text-center text-xl flex justify-center items-center">
          {error} <PiX size={25} />
        </p>
      ) : loading ? ( // and if it's loading show loading... and when loading done get the data
        <div className="flex items-center gap-3 mx-auto">
          <span className="block size-5 border-2 border-bg2-color border-b-transparent rounded-full animate-spin  "></span>
          <p className=" text-green-600 font-bold text-xl">جاري البحث...</p>
        </div>
      ) : (
        Object.keys(result).length !== 0 && (
          //  students Info
          <div className="student-info-containe max-w-2xl mx-auto p-4">
            {/* Student Name (Centered Above Table) */}
            <div className="text-center w-fit mx-auto ">
              {/* name + id  + currentsem*/}
              <div className="flex flex-col [&_p]:font-bold">
                {/* name */}
                <div className="flex w-70 justify-between bg-rd-200">
                  <p className="text--400 mx-auto pr-1">{result?.name || "N/A"}</p>
                  <p className="min-w-20 text-right bg--200">: اسم الطالب</p>
                </div>
                {/* id */}
                <div className="flex w-70 justify-between">
                  <p className="text--400 mx-auto pr-1">{result?.stdId || "N/A"}</p>
                  <p className="min-w-20 text-right bg--200">: الرقم الجامعي</p>
                </div>
                {/* current sem */}
                <div className="flex w-70 justify-between">
                  <p className="text--400 mx-auto pr-1">
                    {result?.currentSem || "N/A"}
                  </p>
                  <p className="min-w-30 text-right bg--200">: الفصل</p>
                </div>
              </div>
            </div>

            {/* Courses Table (Column Style) */}
            <div className="grid grid-cols-2 gap-2 bg-gray-50 mt-4 text-black p-2 rounded-lg min-w-[250px]">
              {/* Column Headers */}
              <div className="font-bold  border-b border-gray-700 text-center">التقدير</div>
              <div className="font-bold  border-b border-gray-700 text-center">المادة</div>

              {/* Course Data */}
              {result.courses?.map((course) => (
                <Fragment key={course.id}>
                  <div className="text-center py-1 border-b border-gray-700 font-semibold">
                    {course.grade || "N/A"}
                  </div>
                  <div className="text-center py-1 border-b border-gray-700 font-semibold">
                    {course.name || "N/A"}
                  </div>
                </Fragment>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}

// if(error) return the <p> with red text
// else if (loading) return (loading...) else return the data
