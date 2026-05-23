import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router, UrlTree } from '@angular/router';
import { WalletConnectService } from '../../wallet/wallet-connect.service';

function requireWallet(): true | UrlTree {
  const wallet = inject(WalletConnectService);
  const router = inject(Router);

  return wallet.address()
    ? true
    : router.createUrlTree(['/'], {
        queryParams: { reason: 'connect-wallet' },
      });
}

export const walletConnectedGuard: CanActivateFn = () => requireWallet();
export const walletConnectedChildGuard: CanActivateChildFn = () => requireWallet();
