import React from "react";
import styled, { keyframes } from "styled-components";

export const LoadingSpinner = () => {
  return (
    <SpinnerContainer>
      <Spinner />
    </SpinnerContainer>
  );
};

const spinAnimation = keyframes`
  to {
    transform: rotate(360deg);
    {/* background: url("../public/images/donkey_button.png") no-repeat center fixed;     
    background-size:contain; */}
  }
`;

const SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 40px;
`;

const Spinner = styled.div`
  width: 50px;
  height: 50px;
  border: 2px solid #ccc;
  border-top-color: #333;
  border-radius: 50%;
  animation: ${spinAnimation} 1s linear infinite;
`;
