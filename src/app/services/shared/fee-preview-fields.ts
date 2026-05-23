import type { ConfirmationField } from '../../core/modals/confirmation/confirmation-modal.component';
import type { FeeOutput } from '../onchain/contracts/fee-manager-contract.service';

export type FeePreviewFormatters = {
  tokenLabel: (token: string | null | undefined) => string;
  formatTokenAmount: (amount: bigint, token: string | null | undefined) => string;
};

function zeroFeeValue(label: string): string {
  return `0 ${label} (no fee configured)`;
}

export function appendFeePreviewFields(
  fields: ConfirmationField[],
  args: {
    context: string;
    preferredFeeToken: string;
    fee: FeeOutput | null;
    format: FeePreviewFormatters;
    unavailableLabel?: string;
    roleLabel?: string;
  },
): ConfirmationField[] {
  const next: ConfirmationField[] = [
    ...fields,
    { label: 'Fee context', value: args.context, tone: 'system' },
    {
      label: 'Preferred fee token',
      value: args.format.tokenLabel(args.preferredFeeToken),
      tone: 'system',
    },
  ];

  if (args.roleLabel) {
    next.push({ label: 'Fee role', value: args.roleLabel, tone: 'system' });
  }

  if (!args.fee) {
    next.push({
      label: 'Fee quote',
      value: args.unavailableLabel ?? 'FeeManager quote unavailable.',
      tone: 'warn',
    });
    return next;
  }

  const fixedLabel = args.format.tokenLabel(args.fee.fixedToken);
  const pctLabel = args.format.tokenLabel(args.fee.percentageToken);

  next.push({
    label: 'Fixed fee',
    value:
      args.fee.fixedAmount > 0n
        ? args.format.formatTokenAmount(args.fee.fixedAmount, args.fee.fixedToken)
        : zeroFeeValue(fixedLabel),
    tone: 'system',
  });

  next.push({
    label: 'Percentage fee',
    value:
      args.fee.percentageAmount > 0n
        ? args.format.formatTokenAmount(args.fee.percentageAmount, args.fee.percentageToken)
        : zeroFeeValue(pctLabel),
    tone: 'system',
  });

  return next;
}
