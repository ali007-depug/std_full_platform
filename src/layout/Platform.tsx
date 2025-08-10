import {Outlet, ScrollRestoration} from "react-router-dom";
import Header from "../components/Header";
export default function Platform(){

    return(
        <div className="w-full h-screen bg-[url('https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe')] bg-cover bg-center bg-no-repeat">
            {/* header */}
            <Header/>
            {/* main */}
            <main>
                {/*all Routes Comes inside Outlet */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 [direction:rtl text-lg flex items-center justify-center font-bold w-[400px] h-[200px] bg-sky-200">  محتوى ثابت عن الكلية أو نافذة إعلان لاحقاً إن شاء الله</div>
                {/* <ScrollRestoration/> */}

                <Outlet />
                
            </main>
            {/* End main */}

        </div>
    )
}