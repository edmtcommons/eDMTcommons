import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base } from 'wagmi/chains';
import { WALLETCONNECT_PROJECT_ID } from './constants';

export const config = getDefaultConfig({
  appName: 'eDMT Gallery',
  projectId: WALLETCONNECT_PROJECT_ID,
  chains: [base],
  ssr: true,
});


