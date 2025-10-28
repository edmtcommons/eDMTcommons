import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base } from 'wagmi/chains';
import { WALLETCONNECT_PROJECT_ID, TOKEN_NAME } from './constants';

export const config = getDefaultConfig({
  appName: `${TOKEN_NAME} Gallery`,
  projectId: WALLETCONNECT_PROJECT_ID,
  chains: [base],
  ssr: true,
});


