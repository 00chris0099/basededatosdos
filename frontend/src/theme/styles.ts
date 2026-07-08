import { CSSProperties } from 'react';

export const page: CSSProperties = {
  padding: 28,
};

export const pageHead: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 16,
  marginBottom: 22,
};

export const pageTitle: CSSProperties = {
  fontSize: 27,
  letterSpacing: '-0.03em',
  margin: 0,
};

export const grid4: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: 18,
};

export const grid3: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 18,
};

export const grid2: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: 18,
};

export const formGrid: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1.4fr .8fr',
  gap: 20,
};

export const formTwo: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: 14,
};
