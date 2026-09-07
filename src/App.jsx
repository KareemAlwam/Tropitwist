import AnnouncementBar from './components/layout/AnnouncementBar';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Hero from './components/sections/Hero';
import Bestsellers from './components/sections/Bestsellers';
import CampaignBanner from './components/sections/CampaignBanner';
import Skincare from './components/pages/Skincare';
import ProductDetail from './components/pages/ProductDetail';
import Cart from './components/pages/Cart';
import Checkout from './components/pages/Checkout';
import BodyCare from './components/pages/BodyCare';
import Bundles from './components/pages/Bundles';
import About from './components/pages/About';
import Search from './components/pages/Search';
import { CartProvider } from './context/CartContext';
import { currentRoute } from './utils/routes';

export default function App() {
  const pathname = currentRoute(window.location.pathname);
  const isSkincarePage = pathname === '/skincare';
  const isProductPage = pathname.startsWith('/products/');
  const isCartPage = pathname === '/cart';
  const isCheckoutPage = pathname === '/checkout';
  const isBodyCarePage = pathname === '/body-care';
  const isBundlesPage = pathname === '/bundles';
  const isAboutPage = pathname === '/about';
  const isSearchPage = pathname === '/search';

  return (
    <CartProvider>
      <div className="min-h-screen bg-cream text-ink">
        <AnnouncementBar />
        <Header />
        {isCheckoutPage ? <Checkout /> : isCartPage ? <Cart /> : isProductPage ? <ProductDetail /> : isSkincarePage ? <Skincare /> : isBodyCarePage ? <BodyCare /> : isBundlesPage ? <Bundles /> : isAboutPage ? <About /> : isSearchPage ? <Search /> : (
          <main>
            <Hero />
            <Bestsellers />
            <CampaignBanner />
          </main>
        )}
        <Footer />
      </div>
    </CartProvider>
  );
}