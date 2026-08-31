import React from 'react';
import { Composition } from 'remotion';
import { Arrival } from './Arrival';
import './index.css';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="Arrival"
      component={Arrival}
      durationInFrames={300}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="ArrivalPortrait"
      component={Arrival}
      durationInFrames={300}
      fps={30}
      width={900}
      height={1600}
    />
  </>
);
