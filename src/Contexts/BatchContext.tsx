import React, { createContext,useState,useCallback, useEffect, useContext, useMemo } from "react";
import { getDb } from "../firebase";
import { getDocs,collection } from "firebase/firestore";

export type batchProp = {
    id: string;
    currentSem: string;
    courses?: { name: string }[];
    archived?: boolean;
  };

  type BatchContextType = {
    batches:batchProp[];
    batchLoading:boolean;
    fetchBatches : ()=>Promise<void>
    setBatches: React.Dispatch<React.SetStateAction<batchProp[]>>
    setBatchLoading?: React.Dispatch<React.SetStateAction<boolean>>;

  } 

//   the context
  const BatchContext = createContext<BatchContextType>({
    batches:[],
    batchLoading:false,
    fetchBatches: async() =>{},
    setBatches: () => {},
    setBatchLoading: () => {},
  })

//   the provider
export function BatchesProvider ({children}: {children:React.ReactNode}){
      const [batches, setBatches] = useState<batchProp[]>([]); // SOTRE : all batches
      const [batchLoading, setBatchLoading] = useState(false); // STORE : batch loading status

      useEffect(()=>{
        fetchBatches();
      },[])

        // to fetch all batches from firesote
        const fetchBatches = useCallback(async () => {
          // ToDO : IF NO BATCHES THEN SHOW A MESSAGE
          const db = await getDb();

          try {
            setBatchLoading(true);
            const snapshot = await getDocs(collection(db, "batches"));
            const data = snapshot.docs.map((doc) => ({
              id: doc.id,
              currentSem: doc.data().currentSem,
              courses: doc.data().courses || [],
              archived: doc.data().archived || false,
            }));
            const sortBatches = data.sort((a, b) => {
              return parseInt(a.id) - parseInt(b.id); // sort by id in descending order
            });
            setBatches(sortBatches);
          } catch (error) {
            console.log(`the error while fetch is ${error}`);
          } finally {
            setBatchLoading(false);
          }
        }, []);
      
        
        const contextValue = useMemo(() => ({
          batches,
          batchLoading,
          fetchBatches,
          setBatches,
          setBatchLoading,
        }), [batches, batchLoading, fetchBatches]);
        return(
            <BatchContext.Provider value={contextValue}>
                {children}
            </BatchContext.Provider>
        )

}

export const useBatches = ()=> useContext(BatchContext)
