import React from "react";
import styled from "styled-components";

const Contact = styled.section`
  width: 100vw;
  padding: calc(2.5rem + 2.5vw) 0;
  background-color: #0a0b10;
  display: flex;
  flex-direction: column;
  /* justify-content: center; */
  align-items: center;
  justify-content: center;
`;

const Title = styled.h1`
  color: var(--white);
  width: 80%
  display: inline-block;
  font-size: 2rem;
  margin-bottom: 3rem;
  position: relative;
  &::before {
    content: "";
    height: 1px;
    width: 100%;
    position: absolute;
    left: 50%;
    bottom: 0;
    transform: translate(-50%, 0.5rem);
    /* or 100px */
    border-bottom: 2px solid var(--pink);
  }
`;

const SubTitle = styled.h2`
  color: var(--white);
  display: inline-block;
  width: 50%;
  font-size: 1.5rem;
  margin-bottom: 2rem;
  position: relative;
`;

const Icons = styled.div`
  display: flex;
  margin-bottom: 3rem;
  a {
    &:hover {
      img {
        filter: invert(20%) sepia(100%) saturate(500%) hue-rotate(580deg)
          brightness(100%) contrast(97%);
      }
    }
    &:not(:last-child) {
      margin-right: 2rem;
    }
    img {
      width: 3rem;
      height: 3rem;
    }
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: start;
  input {
    padding: 1rem calc(0.5rem + 1vw);
    margin-bottom: 1rem;
    background-color: var(--nav2);
    border: none;
    border-radius: 4px;
    color: #eff7f8;
    &:active,
    &:focus {
      border: none;
      outline: none;
      background-color: var(--nav);
    }
    &::placeholder {
      color: #eff7f8;
      opacity: 0.6;
    }
    &[name="name"] {
      margin-right: 2rem;
    }
  }
  textarea {
    padding: 1rem calc(0.5rem + 1vw);
    margin-bottom: 1rem;
    width: 100%;
    background-color: var(--nav2);
    border: none;
    border-radius: 4px;
    color: #eff7f8;
    margin-bottom: 2rem;
    &:focus,
    &:active {
      background-color: var(--nav);
    }
    &::placeholder {
      color: #eff7f8;
      opacity: 0.6;
    }
  }
  button {
    padding: 0.8rem 2rem;
    background-color: var(--white);
    border-radius: 20px;
    font-size: 1.2rem;
    color: #0a0b10;
    cursor: pointer;
    transition: transform 0.3s;
    &:hover {
      transform: scale(1.1);
    }
    &:active {
      transform: scale(0.9);
    }
  }
`;

const Row = styled.div`
  @media only Screen and (max-width: 40em) {
    display: flex;
    flex-direction: column;
    input {
      &[name="name"] {
        margin-right: 0;
      }
    }
  }
`;

const ContactSection = () => {
  const Facebook = require("../../assets/landing/facebook-square-brands.svg").default
  const LinkedId = require("../../assets/landing/linkedin-brands.svg").default
  const Twitter = require("../../assets/landing/twitter-square-brands.svg").default
  const Instagram = require("../../assets/landing/instagram-square-brands.svg").default
  return (
    <>
      <Contact id="contact">
        <Title>Get in touch</Title>
        <SubTitle>
          {/* Todo: Update email and phone number */}
          <p className="text-lg text-center">
            If you have any questions or inquiries about our Legal & Business Research Solutions, please don't hesitate to get in touch with us. You can reach us by phone at <a className="font-bold text-[#6c5dd3] cursor-pointer hover:underline">+92 304 1116670</a> or by email at <a className="font-bold text-[#6c5dd3] cursor-pointer hover:underline">info@eastlaw.pk</a>. Our team of experts is ready to assist you with any queries you may have, whether it's about our product features, pricing, or technical support. We value your feedback and suggestions, so feel free to share them with us.<br />Thank you for considering Eastlaw for your legal research needs.
          </p>
        </SubTitle>
        <Icons>
          <a href="https://www.facebook.com/eastlaw.pk">
            <img src={Facebook} alt="Facebook" />
          </a>
          <a href="https://pk.linkedin.com/in/east-law-506aaa148">
            <img src={LinkedId} alt="LinkedId" />
          </a>
          <a href="https://twitter.com/EastLawpk">
            <img src={Twitter} alt="Twitter" />
          </a>
          <a href="https://www.instagram.com/eastlaw.pk/">
            <img src={Instagram} alt="Instagram" />
          </a>
        </Icons>
        {/* <Form>
        <Row>
          <input name="name" type="text" placeholder="your name" />
          <input
            name="email"
            type="email"
            placeholder="enter working email id"
            />
        </Row>
        <textarea
          name=""
          id=""
          cols={30}
          rows={2}
          placeholder="your message"
          ></textarea>
        <div style={{ margin: "0 auto" }}>
          <button
            onClick={(e) => {
              e.preventDefault();
              // TODO:SHAHEER add API Call for contact US for email
            }}
            >
            Submit
          </button>
        </div>
      </Form> */}
      </Contact>
    </>
  )
}

export default ContactSection