import PropTypes from 'prop-types';
import styled from 'styled-components';

import { styles } from 'styles';

const sizeMapping = {
  lg: styles.text.lg,
  md: styles.text.md,
  sm: styles.text.sm,
};

export const Text = styled.span`
  ${styles.text.lg}
  ${(props) => sizeMapping[props.size] || styles.text.sm}
`;
Text.propTypes = {
  size: PropTypes.oneOf(['lg', 'sm', 'md']),
};
Text.defaultProps = {
  size: 'sm',
};
