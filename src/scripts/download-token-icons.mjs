import { mkdir, writeFile } from 'node:fs/promises';

const TRUSTWALLET_ETHEREUM_ASSETS = 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum';

const tokenIconUrl = (address) => `${TRUSTWALLET_ETHEREUM_ASSETS}/assets/${address}/logo.png`;

const icons = [
  {
    symbol: 'ETH',
    file: 'src/assets/tokens/eth.png',
    url: `${TRUSTWALLET_ETHEREUM_ASSETS}/info/logo.png`,
  },
  {
    symbol: 'USDC',
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    file: 'src/assets/tokens/usdc.png',
    url: tokenIconUrl('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'),
  },
  {
    symbol: 'WETH',
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    file: 'src/assets/tokens/weth.png',
    url: tokenIconUrl('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'),
  },
  {
    symbol: 'WBTC',
    address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    file: 'src/assets/tokens/wbtc.png',
    url: tokenIconUrl('0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'),
  },
  {
    symbol: 'LINK',
    address: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
    file: 'src/assets/tokens/link.png',
    url: tokenIconUrl('0x514910771AF9Ca656af840dff83E8264EcF986CA'),
  },
  {
    symbol: 'UNI',
    address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    file: 'src/assets/tokens/uni.png',
    url: tokenIconUrl('0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984'),
  },
  {
    symbol: 'AAVE',
    address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
    file: 'src/assets/tokens/aave.png',
    url: tokenIconUrl('0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9'),
  },
  {
    symbol: 'LDO',
    address: '0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32',
    file: 'src/assets/tokens/ldo.png',
    url: tokenIconUrl('0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32'),
  },
  {
    symbol: 'DAI',
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    file: 'src/assets/tokens/dai.png',
    url: tokenIconUrl('0x6B175474E89094C44Da98b954EedeAC495271d0F'),
  },
];

await mkdir('src/assets/tokens', { recursive: true });

for (const icon of icons) {
  const response = await fetch(icon.url);
  if (!response.ok) {
    throw new Error(`Failed to download ${icon.url}: ${response.status} ${response.statusText}`);
  }

  await writeFile(icon.file, Buffer.from(await response.arrayBuffer()));
  console.log(`Downloaded ${icon.symbol} icon to ${icon.file}`);
}
