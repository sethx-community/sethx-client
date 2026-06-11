import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';


const RIGHT_PANEL_ROUTE_PATTERN = /\(right-panel:([^()/]+)\)/;
const VALID_RIGHT_PANEL_ROUTES = new Set([
  "accountsRightPanel",
  "assetsRightPanel",
  "tokenSpotRightPanel",
  "optionsRightPanel",
  "nftSpotRightPanel",
  "binaryOptionsRightPanel",
  "marginOptionsRightPanel",
  "futuresRightPanel",
  "lendingRightPanel",
  "treasuryRightPanel",
]);

function dropInvalidRightPanelOutlet(): void {
  const hash = window.location.hash;
  const match = hash.match(RIGHT_PANEL_ROUTE_PATTERN);
  if (!match) return;

  const rightPanelRoute = match[1];
  if (VALID_RIGHT_PANEL_ROUTES.has(rightPanelRoute)) return;

  const cleanedHash = hash.replace(RIGHT_PANEL_ROUTE_PATTERN, "");
  const cleanedUrl = `${window.location.pathname}${window.location.search}${cleanedHash}`;
  window.history.replaceState(window.history.state, document.title, cleanedUrl);
}

dropInvalidRightPanelOutlet();

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
