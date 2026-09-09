import Admin from './components/pages/Admin';
import StorefrontLayout from './app/StorefrontLayout';
import { resolveStorefrontPage } from './app/routes';
import { CartProvider } from './context/CartContext';
import { currentRoute } from './utils/routes';

export default function App() {
  const pathname = currentRoute(window.location.pathname);
  const isAdminPage = pathname === '/admin';
  const Page = resolveStorefrontPage(pathname);

  return (
    <CartProvider>
      <div className="min-h-screen bg-cream text-ink">
        {isAdminPage ? (
          <Admin />
        ) : (
          <StorefrontLayout>
            <Page />
          </StorefrontLayout>
        )}
      </div>
    </CartProvider>
  );
}
