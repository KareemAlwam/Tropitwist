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

export default function App() {
  const isSkincarePage = window.location.pathname === '/skincare';
  const isProductPage = window.location.pathname.startsWith('/products/');
  const isCartPage = window.location.pathname === '/cart';
  const isCheckoutPage = window.location.pathname === '/checkout';
  const isBodyCarePage = window.location.pathname === '/body-care';
  const isBundlesPage = window.location.pathname === '/bundles';
  const isAboutPage = window.location.pathname === '/about';
  const isSearchPage = window.location.pathname === '/search';

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