import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import { useTelemetrySocket } from "@/hooks/useTelemetrySocket";
import ErrorBoundary from "./components/ErrorBoundary";
import { WalletButton } from "./components/wallet-button";

import { ThemeProvider } from "./contexts/ThemeContext";

import Home from "./pages/Home";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/404"} component={NotFound} />

      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style
// - Then change color palette in index.css
// - If you want theme switching:
//   pass `switchable` to ThemeProvider
//   and use the `useTheme` hook

function App() {

 // Initialize global telemetry websocket
  useTelemetrySocket();

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />

          {/* Global Wallet Connection UI */}
          <div className="fixed right-4 top-4 z-50">
            <WalletButton />
          </div>

          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

