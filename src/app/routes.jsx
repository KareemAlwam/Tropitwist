import About from '../components/pages/About';
import Account from '../components/pages/Account';
import BodyCare from '../components/pages/BodyCare';
import Bundles from '../components/pages/Bundles';
import Cart from '../components/pages/Cart';
import Checkout from '../components/pages/Checkout';
import Home from '../components/pages/Home';
import NotFound from '../components/pages/NotFound';
import ProductDetail from '../components/pages/ProductDetail';
import Search from '../components/pages/Search';
import Skincare from '../components/pages/Skincare';
import Wishlist from '../components/pages/Wishlist';

const storefrontRoutes = {
  '/': Home,
  '/about': About,
  '/account': Account,
  '/body-care': BodyCare,
  '/bundles': Bundles,
  '/cart': Cart,
  '/checkout': Checkout,
  '/search': Search,
  '/skincare': Skincare,
  '/wishlist': Wishlist,
};

export function resolveStorefrontPage(pathname) {
  if (pathname.startsWith('/products/')) return ProductDetail;
  return storefrontRoutes[pathname] ?? NotFound;
}
