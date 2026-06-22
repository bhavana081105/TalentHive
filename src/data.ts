import { WorkerProfile, Booking } from './types';

export const INITIAL_WORKERS: WorkerProfile[] = [
  {
    id: 'w1',
    name: 'Alex Mercer',
    email: 'alex.mercer@example.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    profession: 'Full-Stack Developer',
    category: 'Developer',
    bio: 'I am a senior frontend and backend developer with 6+ years of experience building modern React and Tailwind apps. Working with local clients to automate systems and scale startup ventures.',
    rating: 4.9,
    pricePerHour: 45,
    materialCosts: 0,
    location: 'San Francisco, CA',
    earnings: 3240,
    workingHours: 72,
    completedJobs: 18,
    paymentDetails: {
      bankName: 'Silicon Valley Bank',
      accountNumber: '••••4820',
      routingNumber: '121000248',
      payPalEmail: 'alex.dev@paypal.com'
    },
    workSamples: [
      {
        id: 's1_1',
        title: 'E-Commerce SaaS Dashboard',
        description: 'A high-performance sales metrics and listing dashboard with real-time analytics graphs.',
        imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600'
      },
      {
        id: 's1_2',
        title: 'Collaborative Editor UI',
        description: 'Rich text team workspace with instant note synchronization & chat overlays.',
        imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600'
      }
    ],
    reviews: [
      {
        id: 'r1_1',
        customerName: 'Marcus Vance, CEO Bloom',
        rating: 5,
        content: 'Alex delivered our customer portal three days ahead of schedule. Absolute professional with deep knowledge of React and clean architectures!',
        date: '2026-05-12'
      },
      {
        id: 'r1_2',
        customerName: 'Sarah Jenkins',
        rating: 4.8,
        content: 'Excellent communication throughout. Helped optimize our load times by over 40% using server proxy rendering. Will definitely book again.',
        date: '2026-06-02'
      }
    ],
    availability: [
      { day: 'Monday', startTime: '09:00 AM', endTime: '05:00 PM', enabled: true },
      { day: 'Tuesday', startTime: '09:00 AM', endTime: '05:00 PM', enabled: false },
      { day: 'Wednesday', startTime: '09:00 AM', endTime: '05:00 PM', enabled: true },
      { day: 'Thursday', startTime: '09:00 AM', endTime: '05:00 PM', enabled: false },
      { day: 'Friday', startTime: '09:00 AM', endTime: '05:00 PM', enabled: true },
      { day: 'Saturday', startTime: '09:00 AM', endTime: '05:00 PM', enabled: false },
      { day: 'Sunday', startTime: '09:00 AM', endTime: '05:00 PM', enabled: false }
    ]
  },
  {
    id: 'w2',
    name: 'Emily Chen',
    email: 'emily.chen@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    profession: 'Graphic Designer & Illustrator',
    category: 'Student',
    bio: 'Third-year design student offering custom hand-drawn branding, vector assets, and digital UI illustrations. I help bootstrap startups with high-quality visual assets at flexible student-friendly rates.',
    rating: 4.7,
    pricePerHour: 22,
    materialCosts: 15,
    location: 'Boston, MA',
    earnings: 890,
    workingHours: 35,
    completedJobs: 9,
    paymentDetails: {
      bankName: 'Chase Bank',
      accountNumber: '••••9204',
      routingNumber: '021000021'
    },
    workSamples: [
      {
        id: 's2_1',
        title: 'Tech-Start Brand Guidelines',
        description: 'Complete brand assets, color palette, and bespoke custom sticker assets.',
        imageUrl: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=600'
      },
      {
        id: 's2_2',
        title: 'Minimalist Vector Set',
        description: 'Bespoke SVG line illustrations crafted for landing pages and presentation decks.',
        imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600'
      }
    ],
    reviews: [
      {
        id: 'r2_1',
        customerName: 'Robert Green',
        rating: 5,
        content: 'Emily is a star! Her illustration style brought our landing page to life. Fast feedback loops and fantastic energy.',
        date: '2026-05-20'
      },
      {
        id: 'r2_2',
        customerName: 'Laura Baker',
        rating: 4.5,
        content: 'Great designs and open source delivery. Modest price for a highly creative process!',
        date: '2026-06-08'
      }
    ],
    availability: [
      { day: 'Monday', startTime: '09:00 AM', endTime: '05:00 PM', enabled: false },
      { day: 'Tuesday', startTime: '01:00 PM', endTime: '06:00 PM', enabled: true },
      { day: 'Wednesday', startTime: '09:00 AM', endTime: '05:00 PM', enabled: false },
      { day: 'Thursday', startTime: '09:00 AM', endTime: '05:00 PM', enabled: true },
      { day: 'Friday', startTime: '09:00 AM', endTime: '05:00 PM', enabled: false },
      { day: 'Saturday', startTime: '09:00 AM', endTime: '05:00 PM', enabled: false },
      { day: 'Sunday', startTime: '09:00 AM', endTime: '05:00 PM', enabled: false }
    ]
  },
  {
    id: 'w3',
    name: 'Maria Santos',
    email: 'maria.santos@example.com',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    profession: 'Home Catering & Pastry Chef',
    category: 'Housewife',
    bio: 'Dedicated stay-at-home mom & culinarian crafting premium, organic sweets, healthy keto meal plan preps, and finger-foods for company mixers or local meetups. Standard menus can serve up to 40 people.',
    rating: 5.0,
    pricePerHour: 28,
    materialCosts: 65,
    location: 'Austin, TX',
    earnings: 1540,
    workingHours: 42,
    completedJobs: 11,
    paymentDetails: {
      bankName: 'Wells Fargo',
      accountNumber: '••••7712',
      routingNumber: '111000025',
      payPalEmail: 'maria.bakes@paypal.com'
    },
    workSamples: [
      {
        id: 's3_1',
        title: 'Bespoke Micro-Bakery Box',
        description: 'Artisanal sourdough, matcha glazing pastries, and allergy-safe cookies prepared freshly.',
        imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=600'
      },
      {
        id: 's3_2',
        title: 'Startup Corporate Mixer Platter',
        description: 'Creative finger sandwiches, cold tapas, organic skewers arranged elegantly.',
        imageUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&q=80&w=600'
      }
    ],
    reviews: [
      {
        id: 'r3_1',
        customerName: 'TechHive Coworking',
        rating: 5,
        content: 'Maria catered our grand opening. Everyone could not stop talking about the pastries. The presentation was gorgeous!',
        date: '2026-06-01'
      }
    ],
    availability: [
      { day: 'Monday', startTime: '09:00 AM', endTime: '05:00 PM', enabled: false },
      { day: 'Tuesday', startTime: '08:00 AM', endTime: '05:00 PM', enabled: true },
      { day: 'Wednesday', startTime: '09:00 AM', endTime: '05:00 PM', enabled: false },
      { day: 'Thursday', startTime: '09:00 AM', endTime: '05:00 PM', enabled: false },
      { day: 'Friday', startTime: '09:00 AM', endTime: '05:00 PM', enabled: true },
      { day: 'Saturday', startTime: '09:00 AM', endTime: '05:00 PM', enabled: false },
      { day: 'Sunday', startTime: '09:00 AM', endTime: '05:00 PM', enabled: false }
    ]
  },
  {
    id: 'w4',
    name: 'Sean O\'Connor',
    email: 'sean.oc@example.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    profession: 'Data Entry & Virtual Support Specialist',
    category: 'Disabled',
    bio: 'Freelance administrative consultant with high-speed typing and database optimization backgrounds. Being wheelchair-bound allows me to focus fully on digital organization. Specialize in Excel modeling, transcriptions, customer support queues, and document auditing.',
    rating: 4.8,
    pricePerHour: 20,
    materialCosts: 0,
    location: 'Chicago, IL',
    earnings: 2150,
    workingHours: 98,
    completedJobs: 24,
    paymentDetails: {
      bankName: 'U.S. Bank',
      accountNumber: '••••1049',
      routingNumber: '071000013',
      payPalEmail: 'sean.admin@paypal.com'
    },
    workSamples: [
      {
        id: 's4_1',
        title: 'Clean CRM Database Overhaul',
        description: 'Organized and deduplicated over 12,000 lead list rows into structured Salesforce models.',
        imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600'
      }
    ],
    reviews: [
      {
        id: 'r4_1',
        customerName: 'Apex Logistics',
        rating: 4.9,
        content: 'Sean is absolutely incredible. He catalogued our warehouse sheets with impeccable precision. Fast responder and highly focused!',
        date: '2026-05-18'
      },
      {
        id: 'r4_2',
        customerName: 'Jessica Patel',
        rating: 4.7,
        content: 'Organized, meticulous, and communicates issues ahead of time. Highly recommend his virtual assistant services.',
        date: '2026-06-11'
      }
    ],
    availability: [
      { day: 'Monday', startTime: '10:00 AM', endTime: '05:00 PM', enabled: true },
      { day: 'Tuesday', startTime: '09:00 AM', endTime: '05:00 PM', enabled: false },
      { day: 'Wednesday', startTime: '09:00 AM', endTime: '05:00 PM', enabled: false },
      { day: 'Thursday', startTime: '01:00 PM', endTime: '08:00 PM', enabled: true },
      { day: 'Friday', startTime: '09:00 AM', endTime: '05:00 PM', enabled: false },
      { day: 'Saturday', startTime: '09:00 AM', endTime: '05:00 PM', enabled: false },
      { day: 'Sunday', startTime: '09:00 AM', endTime: '05:00 PM', enabled: false }
    ]
  },
  {
    id: 'w5',
    name: 'Nova Digital Systems',
    email: 'contact@novadigital.io',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
    profession: 'Startup DevOps & IT Infrastructure Support',
    category: 'Startup',
    bio: 'We are a 3-person local systems startup setup specializing in Docker container builds, AWS cloud deployments, and network configurations. We team up to handle complex custom enterprise configurations.',
    rating: 4.9,
    pricePerHour: 75,
    materialCosts: 180,
    location: 'Seattle, WA',
    earnings: 6800,
    workingHours: 85,
    completedJobs: 12,
    paymentDetails: {
      bankName: 'Bank of America',
      accountNumber: '••••3399',
      routingNumber: '026009593'
    },
    workSamples: [
      {
        id: 's5_1',
        title: 'Scalable Kubernetes Integration',
        description: 'Auto-scaling infrastructure with low-latency CDN setups built for high traffic events.',
        imageUrl: 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&q=80&w=600'
      }
    ],
    reviews: [
      {
        id: 'r5_1',
        customerName: 'Fintech Spark',
        rating: 5,
        content: 'Nova Digital migrated our systems completely safe of downtime. Outstanding engineers who go the extra mile.',
        date: '2026-05-29'
      }
    ],
    availability: [
      { day: 'Monday', startTime: '09:00 AM', endTime: '05:00 PM', enabled: false },
      { day: 'Tuesday', startTime: '09:00 AM', endTime: '05:00 PM', enabled: false },
      { day: 'Wednesday', startTime: '09:00 AM', endTime: '03:00 PM', enabled: true },
      { day: 'Thursday', startTime: '09:00 AM', endTime: '05:00 PM', enabled: false },
      { day: 'Friday', startTime: '10:00 AM', endTime: '05:00 PM', enabled: true },
      { day: 'Saturday', startTime: '09:00 AM', endTime: '05:00 PM', enabled: false },
      { day: 'Sunday', startTime: '09:00 AM', endTime: '05:00 PM', enabled: false }
    ]
  },
  {
    id: 'w6',
    name: 'Priya Sharma',
    email: 'priya.tailor@example.com',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    profession: 'Textile Artisan & Custom Tailor',
    category: 'Housewife',
    bio: 'Dedicated stay-at-home craft expert focusing on custom hand-stitched clothing, drapery modifications, cushion coverings, and traditional celebratory garments. All designs are crafted from home with high-end tools.',
    rating: 4.8,
    pricePerHour: 25,
    materialCosts: 40,
    location: 'Houston, TX',
    earnings: 1200,
    workingHours: 48,
    completedJobs: 14,
    paymentDetails: {
      bankName: 'Chase Bank',
      accountNumber: '••••6511',
      routingNumber: '021000021'
    },
    workSamples: [
      {
        id: 's6_1',
        title: 'Ethical linen upholstery sets',
        description: 'Custom organic dining cushion covers woven carefully with floral styles.',
        imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=600'
      }
    ],
    reviews: [
      {
        id: 'r6_1',
        customerName: 'Aria Thompson',
        rating: 4.9,
        content: 'Priya mended five of our wedding event dresses with breathtaking precision. Reliable, fast, and gorgeous craftsmanship.',
        date: '2026-06-10'
      }
    ],
    availability: [
      { day: 'Monday', startTime: '11:00 AM', endTime: '06:00 PM', enabled: true },
      { day: 'Tuesday', startTime: '09:00 AM', endTime: '05:00 PM', enabled: false },
      { day: 'Wednesday', startTime: '11:00 AM', endTime: '06:00 PM', enabled: true },
      { day: 'Thursday', startTime: '09:00 AM', endTime: '05:00 PM', enabled: false },
      { day: 'Friday', startTime: '09:00 AM', endTime: '05:00 PM', enabled: false },
      { day: 'Saturday', startTime: '09:00 AM', endTime: '05:00 PM', enabled: false },
      { day: 'Sunday', startTime: '09:00 AM', endTime: '05:00 PM', enabled: false }
    ]
  },
  {
    id: 'w7',
    name: 'ankith',
    email: 'ankith@example.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    profession: 'Photographer',
    category: 'Student',
    bio: 'Professional digital artist and photographer specializing in custom portraits, event shoots, and high-contrast street photography.',
    rating: 4.5,
    reviews: [],
    pricePerHour: 35,
    materialCosts: 0,
    location: 'hyderabad',
    earnings: 0,
    workingHours: 0,
    completedJobs: 0,
    paymentDetails: {
      bankName: 'State Bank of India',
      accountNumber: '••••1122',
      routingNumber: 'SBIN000123'
    },
    workSamples: [],
    availability: [
      { day: 'Monday', startTime: '09:00 AM', endTime: '05:00 PM', enabled: true },
      { day: 'Tuesday', startTime: '09:00 AM', endTime: '05:00 PM', enabled: true },
      { day: 'Wednesday', startTime: '09:00 AM', endTime: '05:00 PM', enabled: true },
      { day: 'Thursday', startTime: '09:00 AM', endTime: '05:00 PM', enabled: true },
      { day: 'Friday', startTime: '09:00 AM', endTime: '05:00 PM', enabled: true },
      { day: 'Saturday', startTime: '09:00 AM', endTime: '05:00 PM', enabled: false },
      { day: 'Sunday', startTime: '09:00 AM', endTime: '05:00 PM', enabled: false }
    ]
  },
  {
    id: 'w8',
    name: 'pavan',
    email: 'pavan@example.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    profession: 'singer',
    category: 'Housewife',
    bio: 'Vocalist and classical performer ready for virtual events, background tracks, and standard acoustic sing-alongs.',
    rating: 4.5,
    reviews: [],
    pricePerHour: 30,
    materialCosts: 0,
    location: 'hyderabad',
    earnings: 0,
    workingHours: 0,
    completedJobs: 0,
    paymentDetails: {
      bankName: 'HDFC Bank',
      accountNumber: '••••3344',
      routingNumber: 'HDFC000456'
    },
    workSamples: [],
    availability: [
      { day: 'Monday', startTime: '09:00 AM', endTime: '05:00 PM', enabled: true },
      { day: 'Tuesday', startTime: '09:00 AM', endTime: '05:00 PM', enabled: true },
      { day: 'Wednesday', startTime: '09:00 AM', endTime: '05:00 PM', enabled: true },
      { day: 'Thursday', startTime: '09:00 AM', endTime: '05:00 PM', enabled: true },
      { day: 'Friday', startTime: '09:00 AM', endTime: '05:00 PM', enabled: true },
      { day: 'Saturday', startTime: '09:00 AM', endTime: '05:00 PM', enabled: false },
      { day: 'Sunday', startTime: '09:00 AM', endTime: '05:00 PM', enabled: false }
    ]
  },
  {
    id: 'w9',
    name: 'CHANDU',
    email: 'chandu@example.com',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
    profession: 'Musician',
    category: 'Developer',
    bio: 'Classically trained pianist and keyboard player crafting custom scores and ambient lounge tracks.',
    rating: 4.5,
    reviews: [],
    pricePerHour: 50,
    materialCosts: 0,
    location: 'hyderabad,medchal-501401',
    earnings: 0,
    workingHours: 0,
    completedJobs: 0,
    paymentDetails: {
      bankName: 'ICICI Bank',
      accountNumber: '••••5566',
      routingNumber: 'ICIC000789'
    },
    workSamples: [],
    availability: [
      { day: 'Monday', startTime: '09:00 AM', endTime: '05:00 PM', enabled: true },
      { day: 'Tuesday', startTime: '09:00 AM', endTime: '05:00 PM', enabled: true },
      { day: 'Wednesday', startTime: '09:00 AM', endTime: '05:00 PM', enabled: true },
      { day: 'Thursday', startTime: '09:00 AM', endTime: '05:00 PM', enabled: true },
      { day: 'Friday', startTime: '09:00 AM', endTime: '05:00 PM', enabled: true },
      { day: 'Saturday', startTime: '09:00 AM', endTime: '05:00 PM', enabled: false },
      { day: 'Sunday', startTime: '09:00 AM', endTime: '05:00 PM', enabled: false }
    ]
  }
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'b1',
    workerId: 'w1',
    workerName: 'Alex Mercer',
    workerProfession: 'Full-Stack Developer',
    customerId: 'cust1',
    customerName: 'Marcus Vance',
    customerEmail: 'ceo.bloom@example.com',
    customerPhone: '555-019-3221',
    date: '2026-06-20',
    timeSlot: '02:00 PM - 04:00 PM',
    status: 'Pending',
    totalCost: 90,
    notes: 'Need support building a simplified Stripe callback gateway.'
  },
  {
    id: 'b2',
    workerId: 'w2',
    workerName: 'Emily Chen',
    workerProfession: 'Graphic Designer & Illustrator',
    customerId: 'cust1',
    customerName: 'Marcus Vance',
    customerEmail: 'ceo.bloom@example.com',
    customerPhone: '555-019-3221',
    date: '2026-06-22',
    timeSlot: '01:00 PM - 03:00 PM',
    status: 'Accepted',
    totalCost: 59,
    notes: 'We want a simple vector logo representing a blooming lotus flower.'
  }
];
