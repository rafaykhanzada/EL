// Router import
import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

// Container import
import Cases from '../Containers/Cases';
import Departments from '../Containers/Departments';
import Home from '../Containers/Home';
import Judges from '../Containers/Judges';
import Legislation from '../Containers/Legislation';
import Settings from '../Containers/Settings';
import Statutes from '../Containers/Statutes';
import SearchResult from '../Containers/SearchResult';
import Judgment from '../Containers/JudgmentScreen';

const ProtectedRoutes = () => {
  return (
    <Routes>
      <Route path='/home' element={<Home />} />
      <Route path='/departments' element={<Departments />} />
      <Route path='/cases' element={<Cases />} />
      <Route path='/judges' element={<Judges />} />
      <Route path='/statutes' element={<Statutes />} />
      <Route path='/legislation/:id' element={<Legislation />} />
      {/* TODO: Reafactor the UI of component */}
      <Route path='/statutes/:id' element={<Legislation />} />
      <Route path='/profile-settings' element={<Settings />} />
      <Route path='/home/search-result' element={<SearchResult />} />
      <Route path='/cases/judgment' element={<Judgment></Judgment>} />
      <Route path='*' element={<Navigate to='/home' />} />
    </Routes>
  );
};

export default ProtectedRoutes;