import CollectionPage from '../catalog/CollectionPage';
import { CATEGORY_FILTERS } from '../../constants/catalog';

const config = { category: 'body', filters: CATEGORY_FILTERS.body, eyebrow: 'TROPITWIST BODY CARE', title: 'BODY,', accent: 'IN BLOOM.', description: 'Lightweight oils and everyday moisture for skin that feels as good as it looks.', aside: 'Easy body care for sunny days, after-shower rituals, and your everyday glow.', searchPlaceholder: 'Search body care', cardDescription: () => 'For your daily body ritual', actionLabel: 'ADD TO CART', emptyTitle: 'BODY CARE IS COMING SOON.', emptyText: 'New body essentials are on the way.' };
export default function BodyCare() { return <CollectionPage config={config} />; }
