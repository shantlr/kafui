import styled, { keyframes } from 'styled-components';

// https://codepen.io/supah/pen/BjYLdW

const rotate = keyframes`
  100% {
    transform: rotate(360deg);
  }
`;

const dash = keyframes`
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
`;

const SpinnnerBase = styled.svg`
  animation: ${rotate} 2s linear infinite;
  width: 30px;
  height: 30px;
`;

const Circle = styled.circle`
  stroke: currentColor;
  stroke-linecap: round;
  animation: ${dash} 1.5s ease-in-out infinite;
`;

export const Spinner = () => (
  <SpinnnerBase viewBox="0 0 50 50">
    <Circle cx="25" cy="25" r="20" fill="none" strokeWidth="3" />
  </SpinnnerBase>
);
