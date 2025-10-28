import { createPublicClient, http, formatUnits } from 'viem';
import { base } from 'viem/chains';
import { EDMT_TOKEN_ADDRESS, EDMT_MIN_BALANCE } from './constants';
import { erc20Abi } from 'viem';

const publicClient = createPublicClient({
  chain: base,
  transport: http(),
});

export async function checkEDMTBalance(address: `0x${string}`): Promise<{
  balance: bigint;
  formatted: string;
  hasAccess: boolean;
}> {
  try {
    const balance = (await publicClient.readContract({
      address: EDMT_TOKEN_ADDRESS,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [address],
    })) as bigint;

    const decimals = (await publicClient.readContract({
      address: EDMT_TOKEN_ADDRESS,
      abi: erc20Abi,
      functionName: 'decimals',
    })) as number;

    const formatted = formatUnits(balance, decimals);
    const hasAccess = balance >= EDMT_MIN_BALANCE;

    return { balance, formatted, hasAccess };
  } catch (error) {
    console.error('Error checking eDMT balance:', error);
    return { balance: 0n, formatted: '0', hasAccess: false };
  }
}


