import CollectionPage from '../catalog/CollectionPage';
import { CATEGORY_FILTERS } from '../../constants/catalog';

const config = { category: 'bundles', filters: CATEGORY_FILTERS.bundles, eyebrow: 'TROPITWIST BUNDLES', title: 'MORE GLOW,', accent: 'LESS GUESSING.', description: 'Curated routines that make good skin days easier, with a little extra value built in.', aside: 'Pair your essentials, save on the routine, and make gifting feel effortless.', searchPlaceholder: 'Search bundles', badge: 'BUNDLE & SAVE', cardDescription: (product) => product.description, actionLabel: 'ADD BUNDLE TO CART', emptyTitle: 'BUNDLES ARE COMING SOON.', emptyText: 'Curated glow routines are on the way.' };
export default function Bundles() { return <CollectionPage config={config} />; }
