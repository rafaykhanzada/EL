import React, { Suspense } from 'react'
import { styled } from '@mui/system';
import Header from '../Components/LandingPage/Header';
import Home from '../Components/LandingPage/Home';
import { GlobalStyle } from '../styles/landingStyles'
import ProtectedRoutes from '../routes/ProtectedRoutes';
import PublicRoutes from '../routes/PublicRoutes';

const Container = styled('div')
  ` display: flex;
  flex-direction: column;
  /* position: relative; */`

const PublicMainContainer = () => {
  return (
    <Suspense fallback={null}>
      <GlobalStyle />
      <Container>
        <Header />
        <PublicRoutes />
      </Container>
    </Suspense>
  )
}

export default PublicMainContainer