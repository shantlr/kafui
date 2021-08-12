import { css } from 'styled-components';

export const styles = {
  container: css`
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    overflow: hidden;
    box-sizing: border-box;
  `,

  list: css`
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: auto;
  `,

  base: {
    bgHighlight: css`
      background-color: var(--bg-highlight);
    `,
  },
  text: {
    sm: css`
      font-size: var(--text-size-sm);
    `,
    md: css`
      font-size: var(--text-size-md);
    `,
    lg: css`
      font-size: var(--text-size-lg);
    `,
  },

  transition: css`
    transition: all 0.3s;
  `,
};
