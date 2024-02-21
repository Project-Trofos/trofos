import React from 'react';
import Container from '../../components/layouts/Container';
import StandUpBoard from '../../components/board/StandUpBoard';

export default function StandUpBoardPage(): JSX.Element {
  return (
    <Container noGap fullWidth style={{ display: 'inline-block', minWidth: '100%', minHeight: '100%' }}>
      <StandUpBoard />
    </Container>
  );
}
