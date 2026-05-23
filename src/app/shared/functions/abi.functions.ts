// abi.functions.ts
import { ethers } from 'ethers';

/**
 * For a function that returns a single output of type tuple[] (e.g. Order[]),
 * this returns the tuple field names in the correct order.
 *
 * IMPORTANT: For tuple[] outputs, the components live on outputs[0].arrayChildren.components,
 * not outputs[0].components (which will be null because baseType is "array").
 */
export function structKeysFromTupleArrayOutput(
  iface: ethers.Interface,
  fnSigOrName: string,
): string[] {
  const fn = iface.getFunction(fnSigOrName);

  const out0 = fn?.outputs?.[0];
  const comps =
    out0?.arrayChildren?.components ??
    // fallback: in case someone calls this with a non-array tuple output
    out0?.components ??
    [];

  const keys = (comps ?? []).map((c: any) => String(c?.name ?? ''));

  // keep keys aligned; ethers expects a keys array same length as items
  // (empty names are allowed; but your struct fields should be non-empty)
  return keys;
}

/**
 * Takes one array element from a tuple[] return (i.e. one struct instance),
 * and rehydrates it into a Result that supports named fields (o.user, o.askPrice, ...).
 *
 * This does NOT hardcode numeric indexes; it uses the keys you derive from ABI.
 */
export function rehydrateNamedStruct(item: any, keys: string[]): ethers.Result {
  // materialize item safely to a plain array; Result is array-like
  const items = Array.from(item ?? []);

  // ethers.Result.fromItems attaches name accessors using keys
  // NOTE: keys.length must match items.length for full naming.
  return ethers.Result.fromItems(items, keys);
}
