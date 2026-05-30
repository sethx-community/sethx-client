import { Routes } from "@angular/router";

import { ShellComponent } from "./layout/shell/shell.component";
import { treasuryAccessGuard } from "./core/guards/access-layer.guard";
import { HomeComponent } from "./features/home/home.component";
import { AccountsComponent } from "./features/accounts/accounts.component";
import { RightPanelAccountsComponent } from "./features/accounts/right-panel-accounts/right-panel-accounts.component";
import { PortfolioComponent } from "./features/portfolio/portfolio.component";
import { RightPanelPortfolioComponent } from "./features/portfolio/right-panel-portfolio/right-panel-portfolio.component";
import { Erc20TradeComponent } from "./features/trade/spot-erc20/erc20-trade.component";
import { RightPanelErc20TradeComponent } from "./features/trade/spot-erc20/right-panel-erc20-trade/right-panel-erc20-trade.component";
import { OptionsTradeComponent } from "./features/trade/options/options-trade.component";
import { RightPanelOptionsComponent } from "./features/trade/options/right-panel-options/right-panel-options.component";
import { FuturesTradeComponent } from "./features/trade/futures/futures-trade.component";
import { RightPanelFuturesComponent } from "./features/trade/futures/right-panel-futures/right-panel-futures.component";
import { NftSpotTradeComponent } from "./features/trade/nft-spot/nft-spot-trade.component";
import { RightPanelNftSpotComponent } from "./features/trade/nft-spot/right-panel-nft-spot/right-panel-nft-spot.component";
import { BinaryOptionsTradeComponent } from "./features/trade/binary-options/binary-options-trade.component";
import { RightPanelBinaryOptionsComponent } from "./features/trade/binary-options/right-panel-binary-options/right-panel-binary-options.component";
import { MarginOptionsTradeComponent } from "./features/trade/margin-options/margin-options-trade.component";
import { RightPanelMarginOptionsComponent } from "./features/trade/margin-options/right-panel-margin-options/right-panel-margin-options.component";
import { LendingObComponent } from "./features/trade/lending-ob/lending-ob.component";
import { LendingRpComponent } from "./features/trade/lending-ob/lending-rp/lending-rp.component";
import { TreasuryComponent } from "./features/treasury/treasury.component";
import { RightPanelTreasuryComponent } from "./features/treasury/right-panel-treasury/right-panel-treasury.component";
import { ProtocolInfoComponent } from "./features/info/protocol/protocol-info.component";
import { FeeRatesComponent } from "./features/info/fees/fee-rates.component";
import { OraclesComponent } from "./features/info/oracles/oracles.component";
import { WarningsComponent } from "./features/info/warnings/warnings.component";

export const routes: Routes = [
  {
    path: "",
    component: ShellComponent,
    children: [
      { path: "", pathMatch: "full", redirectTo: "home" },
      { path: "home", component: HomeComponent },
      { path: "accounts", component: AccountsComponent },
      {
        path: "accountsRightPanel",
        component: RightPanelAccountsComponent,
        outlet: "right-panel",
      },
      { path: "assets", component: PortfolioComponent },
      {
        path: "assetsRightPanel",
        component: RightPanelPortfolioComponent,
        outlet: "right-panel",
      },
      { path: "erc20trade", component: Erc20TradeComponent },
      {
        path: "erc20tradeRightPanel",
        component: RightPanelErc20TradeComponent,
        outlet: "right-panel",
      },
      { path: "optionstrade", component: OptionsTradeComponent },
      {
        path: "optionstradeRightPanel",
        component: RightPanelOptionsComponent,
        outlet: "right-panel",
      },
      { path: "nftspottrade", component: NftSpotTradeComponent },
      {
        path: "nftspottradeRightPanel",
        component: RightPanelNftSpotComponent,
        outlet: "right-panel",
      },
      { path: "binaryoptionstrade", component: BinaryOptionsTradeComponent },
      {
        path: "binaryoptionstradeRightPanel",
        component: RightPanelBinaryOptionsComponent,
        outlet: "right-panel",
      },
      { path: "marginoptionstrade", component: MarginOptionsTradeComponent },
      {
        path: "marginoptionstradeRightPanel",
        component: RightPanelMarginOptionsComponent,
        outlet: "right-panel",
      },
      { path: "futurestrade", component: FuturesTradeComponent },
      {
        path: "futurestradeRightPanel",
        component: RightPanelFuturesComponent,
        outlet: "right-panel",
      },
      { path: "lending-ob", component: LendingObComponent },
      {
        path: "lendingObRightPanel",
        component: LendingRpComponent,
        outlet: "right-panel",
      },
      {
        path: "treasury",
        component: TreasuryComponent,
        canActivate: [treasuryAccessGuard],
      },
      {
        path: "treasuryRightPanel",
        component: RightPanelTreasuryComponent,
        outlet: "right-panel",
        canActivate: [treasuryAccessGuard],
      },
      { path: "protocol", component: ProtocolInfoComponent },
      { path: "fees", component: FeeRatesComponent },
      { path: "oracles", component: OraclesComponent },
      { path: "warnings", component: WarningsComponent },
    ],
  },
  { path: "**", redirectTo: "home" },
];
