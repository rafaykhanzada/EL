import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
// import Page from "../layout/Page/Page";
import PDFViewer from '../Components/PDFViewer';
import { getStatuteById, getStatuteCasesById, getStatuteFile, getStatuteSections } from '../services/statutes.service';
import { toast } from 'react-toastify';
import TopPanel from '../Components/Judgment/TopPanel';


export enum BookmarkTypes {
  CASE = "case",
  JUDGMENT = "judgement",
  STATUE = "statue",
  DEPARTMENT = "department"
};

type TStatute =
{
  id: string,
  v?: number,
  act: string,
  active?: boolean,
  cases?: Array<any>,
  categories?: Array<any>,
  createdAt?: string,
  created_on?: string,
  date?: string,
  deleted?: boolean,
  files?: Array<any>
  group?: string,
  parent_id?: any,
  pdf_file_name?: string,
  practice_areas?: Array<any>,
  sections?: Array<any>
  sql_id?: number,
  sql_parent_id?: any,
  sub_group?: string,
  title: string,
  type?: string,
  updatedAt?: string,
  word_file_name?: any
}


const Legislation = () => {
  const { id } = useParams();
  const [statute, setStatute] = useState<TStatute>({
    id: '',
    title: '',
    act: ''
  });
  const [sections, setSections] = useState([]);
  const [pdfData, setPdfData] = useState<any>(null);
  const [doc, setDoc] = useState({ highlighter: false, bookmark: false, id: String(id), type: BookmarkTypes.STATUE, header: '', detail: '' });

  const fetchPdf = async () => {

    getStatuteFile(id).then((res: any) => {
      setPdfData(res);
    }).catch((error) => {
      toast.error('Failed to fetch statute file!')
    });
  }

  const fetchSections = async () => {
    getStatuteSections(id).then((res: any) => {
      // console.log(res);
      setSections(res);
    }).catch((err: any) => {
      toast.error('Failed to fetch statute sections!');
    });
  }

  const fetchStatuteDetail = async () => {
    getStatuteById(id).then((res: any) => {
      // console.log(res);
      if (res.data) {
        setStatute(res.data);
        setDoc({...doc, header: res.data.title, detail: res.data.act})
      }
      // setSections(res);
    }).catch((err: any) => {
      toast.error('Failed to fetch statute detail!');
    });
  }

  const fetchStatuteCasesList = async () => {
    getStatuteCasesById(id, '10', '10').then((res: any) => {
      console.log(res);
      if (res.data) {
        setStatute(res.data);
      }
      // setSections(res);
    }).catch((err: any) => {
      toast.error('Failed to fetch statute cases!');
    });
  }
  useEffect(() => {
    if (id) {
      fetchPdf();
      fetchSections();
      fetchStatuteDetail();
      fetchStatuteCasesList();
    }
  }, [])

  return (
    <>
      {!statute ? (
        <div className='bg-white p-5 rounded-xl shadow-xl'>
          <p>Failed to load statute details</p>
        </div>
      ) : (
        <div className='flex flex-col w-full h-full gap-4'>
          <div className="flex flex-col bg-white p-5 rounded-xl shadow-xl">
            <TopPanel doc={doc} setDoc={setDoc}></TopPanel>
            <p className="text-2xl font-bold">{statute?.title}</p>
            <p className='text-md mt-1'>{statute?.date?.includes("Promulgation Date:")
              ? statute?.date?.split(":")[1]
              : statute?.date || '-'} - {statute?.act}</p>
          </div>
          <div className='flex flex-row gap-4 w-full h-full'>
            <div className="flex flex-col bg-white p-5 rounded-xl shadow-xl grow h-[calc(100vh-10.9rem)] overflow-auto">
              <p className='text-lg font-bold'>Statute Document</p>
              {pdfData ? <PDFViewer blob={pdfData} /> : (<p className='mt-2'>No Document found!</p>)}
            </div>
            <div className="flex flex-col w-[15rem]">
              <div className='bg-white p-5 rounded-xl shadow-xl'>
                <p className="text-lg font-bold">Statute Sections</p>
                {sections.length > 0 ? (
                  <ul className="list-disc px-5 mt-2 border-[0.5px] border-black h-[calc(100vh-15.5rem)] overflow-auto">
                    {sections.map((section: any) => {
                      return <li>{section.title}</li>;
                    })}
                  </ul>
                ) : (<p className='mt-2'>No sections found!</p>)}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Legislation