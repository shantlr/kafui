import { css } from 'styled-components';

const spaces = css`
  --space-sm: 4px;
  --space-md: 8px;
  --space-lg: 12px;
  --space-xl: 16px;
`;

const colors = css`
  --bg-highlight: rgba(0, 0, 0, 0.1);
`;

export const texts = css`
  --text-size-lg: 22px;
  --text-size-md: 18px;
  --text-size-sm: 14px;
`;

export const themes = {
  main: css`
    ${spaces}
    ${colors}
    ${texts}
  `,
};
