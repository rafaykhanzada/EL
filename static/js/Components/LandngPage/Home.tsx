import React, {  } from 'react'
import { styled } from '@mui/system';
import HeroSection from './HeroSection';
import AboutSection from './AboutSection';
import ContactSection from './ContactSection';

const Container = styled('div')
` display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  /* position: relative; */`

const Home = () => {
  return (
    <Container>
        <HeroSection />
        <AboutSection />
        {/* <ServicesSection /> */}
        {/* <TestimonialsSection /> */}
        <ContactSection />
    </Container>
  )
}

export default Home