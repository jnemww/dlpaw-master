import React from "react";
import styled, { keyframes } from "styled-components";
//import logo from "./favicon.ico";
import "../App.css";

export const LoadingSpinner = ({url}) => {
  return (
    <dialog open={true} className={"spinner"}><Rotate><img src={url==""?"./favicon.ico":url} className="App-logo spinner" /></Rotate></dialog>
  );
};
// Create the keyframes
const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
`;

// Here we create a component that will rotate everything we pass in over two seconds
const Rotate = styled.div`
  display: inline-block;
  animation: ${rotate} 2s linear infinite;
  padding: 2rem 1rem;
  font-size: 1.2rem;
  background-img:url("../public/images/donkey_button.png");
`;


// const spinAnimation = keyframes`
//   to {
//     transform: rotate(360deg);
//     {/* background: url("../public/images/donkey_button.png") no-repeat center fixed;     
//     background-size:contain; */}
//   }
// `;

// const SpinnerContainer = styled.div`
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   height: 100%;
//   padding: 40px;
// `;

// const Spinner = styled.div`
//   width: 50px;
//   height: 50px;
//   border: 2px solid #ccc;
//   border-top-color: #333;
//   border-radius: 50%;
//   animation: ${spinAnimation} 1s linear infinite;
// `;
