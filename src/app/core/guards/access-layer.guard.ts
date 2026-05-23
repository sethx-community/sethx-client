import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';

import { AccessLayerService, AccessTier } from '../../services/shared/access/access-layer.service';

function blockedTree(router: Router, reason: string): UrlTree {
  return router.createUrlTree(['/assets'], { queryParams: { reason } });
}

async function requireAccess(tier: AccessTier): Promise<true | UrlTree> {
  const router = inject(Router);
  const access = inject(AccessLayerService);
  return (await access.waitForTier(tier)) ? true : blockedTree(router, `requires-${tier}`);
}

export const walletAccessGuard: CanActivateFn = () => requireAccess('wallet');
export const treasuryAccessGuard: CanActivateFn = () => requireAccess('treasury');
