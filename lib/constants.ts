import { base } from 'viem/chains';
import configData from '@/data/config.json';

export const TOKEN_NAME = configData.tokenName;
export const EDMT_TOKEN_ADDRESS = configData.tokenAddress as `0x${string}`;
export const EDMT_MIN_BALANCE = BigInt(configData.minimumTokenBalance);
export const BASE_CHAIN = base;
export const WALLETCONNECT_PROJECT_ID = 'd06eb4d17620a3c3f24d2ca8c45d6b31';

// Export config for use in components
export const GALLERY_CONFIG = {
  tokenName: configData.tokenName,
  minimumTokenBalance: configData.minimumTokenBalance,
  tokenAddress: configData.tokenAddress,
  chainId: configData.chainId,
  chainName: configData.chainName,
};

// Export admin whitelist
export const ADMIN_WHITELIST = (configData.adminWhitelist || []) as string[];


