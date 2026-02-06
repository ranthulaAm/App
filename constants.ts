import { Service } from './types';

export const SERVICES: Service[] = [
  {
    id: 's_social',
    title: 'Social Media & Visuals',
    description: 'Cinematic image manipulations, product reveals, and event teasers designed to stop the scroll.',
    price: 49,
    image: 'https://picsum.photos/600/800?random=101',
    features: ['Cinematic Manipulation', 'Product Reveal', 'Event Reveal', 'Story Adaptations']
  },
  {
    id: 's_invite',
    title: 'Invitation Cards',
    description: 'Elegant and memorable designs for weddings, corporate events, and special occasions.',
    price: 79,
    image: 'https://picsum.photos/600/800?random=102',
    features: ['Wedding Invitations', 'Event Invitations', 'Digital & Print Ready', 'Custom Typography']
  },
  {
    id: 's_banner',
    title: 'Banners',
    description: 'Impactful large-format banners for web headers, billboards, or event backdrops.',
    price: 69,
    image: 'https://picsum.photos/600/800?random=103',
    features: ['Web Headers', 'Billboard Scale', 'Event Backdrops', 'High Resolution']
  },
  {
    id: 's_flyer',
    title: 'Flyers',
    description: 'Strategic flyer designs that communicate your message clearly and convert readers into customers.',
    price: 55,
    image: 'https://picsum.photos/600/800?random=104',
    features: ['Event Promo', 'Sales Sheets', 'A4/A5 Formats', 'QR Integration']
  },
  {
    id: 's_tute',
    title: 'Tute Covers',
    description: 'Professional cover designs for educational tutorials, course modules, and academic materials.',
    price: 45,
    image: 'https://picsum.photos/600/800?random=105',
    features: ['Series Consistency', 'Subject Iconography', 'Academic Layouts', 'eBook Ready']
  },
  {
    id: 's_letterhead',
    title: 'Letter Heads',
    description: 'Official letterhead designs that reinforce your brand identity in every correspondence.',
    price: 39,
    image: 'https://picsum.photos/600/800?random=106',
    features: ['Word Doc Template', 'Print Ready PDF', 'Brand Patterns', 'Footer Design']
  },
  {
    id: 's_book',
    title: 'Book Covers',
    description: 'Captivating book cover art that tells a story and stands out on the shelf or digital store.',
    price: 129,
    image: 'https://picsum.photos/600/800?random=107',
    features: ['Front/Back/Spine', '3D Mockups', 'Typography Focus', 'Genre Specific']
  },
  {
    id: 's_businesscard',
    title: 'Business Cards',
    description: 'Premium business card designs that leave a lasting first impression during networking.',
    price: 49,
    image: 'https://picsum.photos/600/800?random=108',
    features: ['Double-sided', 'Spot UV/Foil Prep', 'Minimalist or Bold', 'Print Ready']
  }
];

// Updated to point to GitHub Raw
const REPO_URL = 'https://raw.githubusercontent.com/ranthulaAm/App/main/img';

export const PORTFOLIO_ITEMS = [
  { 
    id: 1, 
    title: 'Lewis Hamilton x Ferrari', 
    category: 'Sports Manipulation', 
    description: 'A cinematic composite announcing Lewis Hamilton\'s historic move to Scuderia Ferrari, featuring bold typography and the iconic red suit.',
    img: `${REPO_URL}/hamilton.jpg`
  },
  { 
    id: 2, 
    title: 'Black Myth: Wukong', 
    category: 'Game Art', 
    description: 'Destiny calls. A moody, atmospheric poster capturing the legend of the Monkey King with striking silhouette work.',
    img: `${REPO_URL}/wukong.jpg`
  },
  { 
    id: 3, 
    title: 'Battle of Gold & Yellow', 
    category: 'Event Poster', 
    description: 'The anticipation of the game. A dramatic back-view composition for the 2nd Battle of Gold and Yellow.',
    img: `${REPO_URL}/goldyellow.jpg`
  },
  { 
    id: 4, 
    title: 'NutNut Ceylon', 
    category: 'Product Advertising', 
    description: 'Premium cashew packaging visuals designed with freshness in mind. Highlighting the natural quality of the product.',
    img: `${REPO_URL}/nutnut.jpg`
  },
  { 
    id: 5, 
    title: 'NutNut Launch', 
    category: 'Social Media', 
    description: 'Grand opening announcement featuring dynamic effects and warm tones to signify roasted perfection.',
    img: `${REPO_URL}/nutnutlaun.jpg`
  },
  { 
    id: 6, 
    title: 'Battle Day', 
    category: 'Sports Manipulation', 
    description: 'The calm before the storm. A high-contrast, moody composition for the big match day featuring elemental effects.',
    img: `${REPO_URL}/battleday.jpg`
  },
  { 
    id: 7, 
    title: 'Wings Xmas Special', 
    category: 'Seasonal Promotion', 
    description: 'Santa\'s Mega Sale. A vibrant Christmas campaign featuring bold 3D typography and holiday elements for a clothing brand sale.',
    img: `${REPO_URL}/wings.jpg`
  },
];