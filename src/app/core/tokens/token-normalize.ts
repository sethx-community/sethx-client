import { ethers } from 'ethers';
import { ETH_ADDRESS } from '../../services/shared/main.tokens';

export const norm = (a: string) => (a ?? '').trim().toLowerCase();

export function isEthLike(x: string): boolean {
  const k = norm(x);
  return (
    k === 'eth' || k === norm(ETH_ADDRESS) || k === norm(ethers.ZeroAddress)
  );
}

/**
 * Converts UI token key → contract address
 * - 'ETH' / 0x0 → ZeroAddress
 * - ERC20 → normalized address
 */
export function toAddr(x: string): string {
  const k = norm(x);
  if (!k) return '';
  return isEthLike(k) ? ethers.ZeroAddress : k;
}

export function normAddr(x: string): string {
  return String(x || '')
    .trim()
    .toLowerCase();
}
export function isEthKey(addr: string): boolean {
  const a = normAddr(addr);
  return a === 'eth' || a === normAddr(ETH_ADDRESS) || a === ethers.ZeroAddress;
}
export function shortAddr(a: string): string {
  const s = normAddr(a);
  return s.length > 10 ? `${s.slice(0, 6)}…${s.slice(-4)}` : s;
}
