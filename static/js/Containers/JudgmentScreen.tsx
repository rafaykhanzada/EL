import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TopPanel from '../Components/Judgment/TopPanel';
import {
  Button,
  Divider,
} from "@mui/material";
import { logout } from '../services/auth.service';
import { decryptString, isAuthorised } from '../app.utils';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowCircleLeft, ExpandLess, ExpandMore, KeyboardArrowDown, KeyboardArrowUp, RemoveRedEye, Visibility, VisibilityOff } from '@mui/icons-material';
import { BookmarkTypes } from '../app.enums';
import ContainerLoader from '../Components/extras/ContainerLoader';

const Judgment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedTab, setSelectedTab] = React.useState('statutes');
  const [doc, setDoc] = useState({ highlighter: false, bookmark: false, id: '', type: BookmarkTypes.CASE, header: '', detail: '' });
  const [judgementData, setJudgementData] = useState<any>(
    {
      id: '',
      appeal: '',
      judgment: '',
      result: '',
      case_summary: ''
    }
  );
  const [subsequentReferences, setSubsequentReferences] = useState([]);
  const [subsequentReferencesOpen, setSubsequentReferencesOpen] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const judgmentId = searchParams.get('judgmentId') || '';
    const judgmentSearchTerm = searchParams.get('searchTerm') || ''; // TODO: Send in Get Case detail request

    const getCaseDetailURL = judgmentSearchTerm === '' ? `${process.env.REACT_APP_API_NEST_URL}/case-search/search-by-id/${judgmentId}` : `${process.env.REACT_APP_API_NEST_URL}/case-search/search-by-id/${judgmentId}?searchQuery=${judgmentSearchTerm}`;
    axios
      .get(
        getCaseDetailURL, {
        headers: {
          Authorization: `Bearer ${decryptString(localStorage.getItem('token'))}`
        },
      }
      )
      .then((res) => {
        if (res.data) {
          setJudgementData(res.data)
          if (res.data.referenced_judgments) {
            getSubsequentReferences(res.data.referenced_judgments, judgmentId);
          }
          setIsLoading(false);
        }
      })
      .catch((err) => {
        setIsLoading(false);
        if (err.response.status === 401) {
          logout();
        }
      });
  }, [])

  const getSubsequentReferences = (referenced_judgments: any, judgmentId: any) => {
    setIsLoading(true);
    axios
      .post(
        `${process.env.REACT_APP_API_NEST_URL}/case-search/get-subsequent-references`, {
        judgment_ids: referenced_judgments,
        citation: judgmentId,
      }, {
        headers: {
          Authorization: `Bearer ${decryptString(localStorage.getItem('token'))}`
        },
      }
      )
      .then((res) => {
        setIsLoading(false);
        if (res.data?.length > 0) {
          setSubsequentReferences(res.data)
        }
      })
      .catch((err) => {
        setIsLoading(false);
        if (err.response.status === 401) {
          logout();
        }
      });
  }

  useEffect(() => {
    setDoc({
      ...doc,
      id: judgementData?.id,
      header: judgementData.appeallant + ' vs ' + judgementData.respondant,
      detail: judgementData.result || 'N/A'
    });
  }, [judgementData])

  const checkIfJudgeIsAuthor = (authorId: string, judgeId: string) => {
    if (authorId && judgeId !== '') {
      return authorId === judgeId;
    }
    return false;
  }

  return (
    <>
      <div className={!isAuthorised() ? "flex flex-col bg-white w-full min-h-[calc(100vh-5.5rem)] p-5 rounded-xl shadow-xl relative" : "flex flex-col bg-white w-full min-h-[calc(100vh-3.5rem)] p-5 rounded-xl shadow-xl relative"}>
        {!isLoading ? (
          <>
            <div className="flex flex-row justify-between items-center mx-1 mb-2">
              <Button
                color='primary'
                startIcon={<ArrowCircleLeft fontSize='small' />}
                onClick={() => navigate(-1)}>
                <p className='text-lg'>Back</p>
              </Button>
              <TopPanel doc={doc} setDoc={setDoc}></TopPanel>
            </div>
            <div className="px-3">
              <p className="text-2xl font-bold mb-5">{(judgementData.appeallant || 'N/A') + ' vs ' + (judgementData.respondant || 'N/A')}<br /><span className='mb-5 text-lg font-normal'>{judgementData.appeal || 'N/A'}</span></p>
              <div className='float-right flex flex-col gap-2 mb-3 ml-4 bg-stone-50 border border-slate-300 rounded-xl shadow-lg p-4 w-[26rem] h-full'>
                <p className='text-xl text-slate-500 text-center my-4'><b>Judgment</b> Details</p>
                <div className='flex flex-row gap-3 justify-between items-center mb-4 p-3 bg-slate-200 rounded-xl shadow-lg'>
                  <div className='flex flex-col bg-black text-center font-bold py-3 w-full rounded-xl'>
                    <p className='text-slate-300 font-light text-sm'>Cited by</p>
                    <p className='text-white text-2xl'>{judgementData.referenced_judgments?.length || '0'}</p>
                  </div>
                  <div className='flex flex-col bg-black text-center font-bold py-3 w-full rounded-xl'>
                    <p className='text-slate-300 font-light text-sm '>Citing</p>
                    <p className='text-white text-2xl'>{judgementData.hyperlinking?.length || '0'}</p>
                  </div>
                  <div className='flex flex-col bg-black text-center font-bold py-3 w-full rounded-xl'>
                    <p className='text-slate-300 font-light text-sm'>Coram</p>
                    <p className='text-white text-2xl'>{judgementData.judgesId?.length || '0'}</p>
                  </div>
                </div>
                <div className='flex flex-col gap-3 mb-3 text-sm'>
                  <p>
                    <b>Appeallant:</b>{" "}
                    {judgementData.appeallant || 'N/A'}
                  </p>
                  <p>
                    <b>Respondant:</b>{" "}
                    {judgementData.respondant || 'N/A'}
                  </p>
                  <p>
                    <b>Result:</b>{" "}
                    {judgementData.result || "N/A"}
                  </p>
                  <p>
                    <b>Judgment Date:</b>{" "}
                    {judgementData.judgment_date || 'N/A'}
                  </p>
                  <p>
                    <b>Court:</b>{" "} {judgementData.court || 'N/A'}
                  </p>
                </div>
                <Divider />
                <div className="flex flex-row gap-1 justify-center text-sm font-bold">
                  <span className={
                    selectedTab === 'statutes' ? "text-white py-2 px-4 rounded-md shadow cursor-pointer min-w-max text-center bg-[#6c5dd3]"
                      : "bg-stone-50 py-2 px-4 min-w-max text-center text-[#6c5dd3] cursor-pointer"}
                    onClick={() => {
                      setSelectedTab('statutes')
                    }}>
                    Statutes
                  </span>
                  <span className={
                    selectedTab === 'judges' ? "text-white py-2 px-4 rounded-md shadow cursor-pointer min-w-max text-center bg-[#6c5dd3]"
                      : "bg-stone-50 py-2 px-4 min-w-max text-center text-[#6c5dd3] cursor-pointer"}
                    onClick={() => {
                      setSelectedTab('judges')
                    }}>
                    Judges
                  </span>
                  <span className={
                    selectedTab === 'citations' ? "text-white py-2 px-4 rounded-md shadow cursor-pointer min-w-max text-center bg-[#6c5dd3]"
                      : "bg-stone-50 py-2 px-4 min-w-max text-center text-[#6c5dd3] cursor-pointer"}
                    onClick={() => {
                      setSelectedTab('citations')
                    }}>
                    Citations
                  </span>
                  <span className={
                    selectedTab === 'advocates' ? "text-white py-2 px-4 rounded-md shadow cursor-pointer min-w-max text-center bg-[#6c5dd3]"
                      : "bg-stone-50 py-2 px-4 min-w-max text-center text-[#6c5dd3] cursor-pointer"}
                    onClick={() => {
                      setSelectedTab('advocates')
                    }}>
                    Advocates
                  </span>
                </div>
                <Divider />
                {selectedTab === 'statutes' && (
                  judgementData.statutesId?.length > 0 ? judgementData.statutesId?.map((item: any) => (
                    <>
                      <p className='text-sm'>{item.title}</p>
                      <Divider />
                    </>
                  )) : (<p className='text-sm'>No statutes found.</p>)
                )}
                {selectedTab === 'judges' && (
                  judgementData.judgesId?.length ? judgementData.judgesId?.map((item: any) => (
                    <>
                      <div className='flex flex-row items-center gap-2'>
                        <p className='text-sm'>{item.name}</p>
                        {checkIfJudgeIsAuthor(judgementData.author, item.id) && (<span className='text-xs bg-[#6c5dd3] py-1 px-2 text-white font-semibold rounded-xl'>Author</span>)}
                      </div>
                      <Divider />
                    </>
                  )) : (<p>No judges found.</p>)
                )}
                {selectedTab === 'citations' && (
                  judgementData.citationsId?.length > 0 ? judgementData.citationsId?.map((item: any) => (
                    <>
                      <p className='text-sm'>{item.citation}</p>
                      <Divider />
                    </>
                  )) : (<p>No citations found.</p>)
                )}
                {selectedTab === 'advocates' && (
                  judgementData.advocate_appeallant && judgementData.advocate_respondant ? (
                    <>
                      <p className='text-sm'>{judgementData.advocate_appeallant.AdvocateName || 'N/A'}</p>
                      <Divider />
                      <p className='text-sm'>{judgementData.advocate_respondant.AdvocateName || 'N/A'}</p>
                      <Divider />
                    </>
                  ) : (<p>No advocates found.</p>)
                )}
              </div>
              <div className="item-body">
                {subsequentReferences.length > 0 && (
                  <>
                    <div className='mb-2 cursor-pointer flex flex-row items-center justify-start gap-1' onClick={() => setSubsequentReferencesOpen(!subsequentReferencesOpen)}>
                      <b className="text-xl">Subsequent References</b> {subsequentReferencesOpen ? (<ExpandLess sx={{ color: '#6c5dd3', fontSize: '1.8rem' }} />) : (<ExpandMore sx={{ color: '#6c5dd3', fontSize: '1.8rem' }} />)}
                    </div>
                    <div className='flex flex-col gap-4'>
                      {subsequentReferencesOpen && subsequentReferences.map((item: any) => (
                        <div className="flex flex-col rounded-xl gap-2 bg-stone-50 border shadow-lg p-4 text-xs border-[#6c5dd3]">
                          <p className="font-bold text-sm text-[#6c5dd3]">{item.appeal}</p>
                          <Divider />
                          <div className="max-h-[8rem] overflow-auto"
                            dangerouslySetInnerHTML={{
                              __html: item.text,
                            }}
                          ></div>
                          <Divider />

                          <div className="flex flex-row justify-between items-center text-xs">
                            <p><b>Court: </b>{item.court}</p>
                            <p><b>Date: </b>{item.date || '0'}</p>
                          </div>
                        </div>
                      ))
                      }
                    </div>
                    <div className='my-4'>
                      <Divider />
                    </div>
                  </>
                )}
                <p className='mb-2'>
                  <b className="text-xl">Summary:</b>{" "}
                  {!judgementData.case_summary && "N/A"}
                </p>
                <div className='judgment-text'
                  dangerouslySetInnerHTML={{
                    __html: judgementData.case_summary,
                  }}
                ></div>
                <div className='my-4'>
                  <Divider />
                </div>
                <p className='mb-2'>
                  <b className="text-xl">Judgment:</b>{" "}
                  {!judgementData.judgment && "N/A"}
                </p>
                <div className='judgment-text'
                  dangerouslySetInnerHTML={{ __html: judgementData.judgment }}
                ></div>
              </div>
            </div>
          </>
        ) : (
          <ContainerLoader isLoading={isLoading} />
        )}
      </div>
    </>
  );
};

export default Judgment;