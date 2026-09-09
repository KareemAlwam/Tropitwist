import AnnouncementBar from '../components/layout/AnnouncementBar';
import CartToast from '../components/layout/CartToast';
import Footer from '../components/layout/Footer';
import Header from '../components/layout/Header';

export default function StorefrontLayout({ children }) {
  return <><AnnouncementBar /><Header />{children}<Footer /><CartToast /></>;
}
