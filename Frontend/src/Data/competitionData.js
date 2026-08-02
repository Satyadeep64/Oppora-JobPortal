import competitionsList from './competitions.json';

// Refactored data structure normalizing all 25 mandatory competition properties
export const competitionData = competitionsList.map((item) => {
  const slug = item.slug || item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  return {
    ...item,
    id: item.id,
    slug: slug,
    title: item.title,
    organization: item.organization,
    logo: item.logo,
    banner: item.banner || item.logo,
    category: item.category,
    subcategory: item.subcategory || item.tags?.[0] || 'General',
    description: item.description,
    overview: item.overview || item.description,
    importantDates: item.importantDates || [],
    rounds: item.rounds || item.timeline || [],
    eligibility: item.eligibility || [],
    prizes: item.prizes || [],
    rules: item.rules || [],
    judgingCriteria: item.judgingCriteria || [],
    faqs: item.faqs || [],
    registrationFee: item.registrationFee || 'Free',
    deadline: item.deadline,
    mode: item.mode || 'Online',
    location: item.location || 'Online',
    teamSize: item.teamSize || '1 - 4 Members',
    difficulty: item.difficulty || 'Intermediate',
    officialRegistrationUrl: item.officialRegistrationUrl,
    contactEmail: item.contactEmail || `contact@${slug.slice(0, 15)}.org`,
    website: item.website || item.officialRegistrationUrl,
    socialLinks: item.socialLinks || {
      twitter: `https://twitter.com/${slug.slice(0, 12)}`,
      linkedin: `https://linkedin.com/company/${slug.slice(0, 12)}`,
      github: `https://github.com/${slug.slice(0, 12)}`
    },
    tags: item.tags || [item.category],

    // Statistics & Metadata properties
    postedDate: item.postedDate || 'Posted recently',
    registeredCount: item.registeredCount || '1,200+ Registered',
    views: item.views || 15000,
    bookmarkCount: item.bookmarkCount || 1200,
    closingInDays: item.closingInDays || 14,
    status: item.status || 'Open',
    difficulty: item.difficulty || 'Intermediate',
    popularityBadge: item.popularityBadge || 'Featured',

    // UI Backward-Compatibility properties
    members: item.members || item.teamSize,
    daysLeft: item.daysLeft || item.deadline,
    categories: item.tags || item.categories || [item.category],
    subtitle: item.subtitle || `${item.organization?.split('&')[0]?.trim()} • ${item.prizes?.[0]?.reward || 'Prizes & Rewards'}`
  };
});

/**
 * Get all competitions
 */
export const getAllCompetitions = () => competitionData;

/**
 * Get featured competitions (or top prominent real competitions)
 */
export const getFeaturedCompetitions = () => {
  const featured = competitionData.filter((item) => item.featured === true);
  return featured.length >= 3 ? featured : competitionData.slice(0, 5);
};

/**
 * Get single competition by ID or Slug
 */
export const getCompetitionById = (idOrSlug) => 
  competitionData.find((item) => String(item.id) === String(idOrSlug) || item.slug === String(idOrSlug));

/**
 * Filter & Search competitions with real-time case-insensitive matching across Title, Organization, Category, Subcategory, Tags, Payment, and Team Size
 */
export const filterCompetitions = (filters = {}) => {
  const query = (filters.searchTerm || filters.title || filters.q || '').trim().toLowerCase();
  const category = (filters.category || '').trim().toLowerCase();
  const payment = (filters.payment || '').trim().toLowerCase();
  const teamSize = (filters.teamSize || '').trim().toLowerCase();
  const mode = (filters.mode || '').trim().toLowerCase();
  const location = (filters.location || '').trim().toLowerCase();

  return competitionData.filter((item) => {
    // 1. Keyword search (Title, Organization, Category, Subcategory, Tags)
    if (query) {
      const titleMatch = item.title?.toLowerCase().includes(query);
      const orgMatch = item.organization?.toLowerCase().includes(query);
      const catMatch = item.category?.toLowerCase().includes(query);
      const subCatMatch = item.subcategory?.toLowerCase().includes(query);
      const tagsMatch = Array.isArray(item.tags) && item.tags.some((tag) => tag.toLowerCase().includes(query));

      if (!titleMatch && !orgMatch && !catMatch && !subCatMatch && !tagsMatch) {
        return false;
      }
    }

    // 2. Category Filter (9 Supported Categories)
    if (category && category !== 'all' && category !== 'all categories') {
      if (category !== 'competitions') {
        const itemCat = item.category?.toLowerCase() || '';
        const itemSubCat = item.subcategory?.toLowerCase() || '';
        const itemTitle = item.title?.toLowerCase() || '';
        const itemTags = Array.isArray(item.tags) ? item.tags.map((t) => t.toLowerCase()) : [];

        // Match category terms flexibly across categories, subcategories, tags, and title keywords
        let categoryMatches = 
          itemCat === category ||
          itemCat.includes(category) ||
          itemSubCat.includes(category) ||
          itemTags.some((t) => t === category || t.includes(category));

        // Alias & synonym matching for specific categories
        if (!categoryMatches) {
          if (category === 'coding contest') {
            categoryMatches = itemCat.includes('coding') || itemSubCat.includes('coding') || itemSubCat.includes('competitive') || itemTitle.includes('code') || itemTags.some((t) => t.includes('coding') || t.includes('c++'));
          } else if (category === 'innovation challenge') {
            categoryMatches = itemSubCat.includes('innovation') || itemTitle.includes('innovation') || itemTitle.includes('challenge') || itemTags.some((t) => t.includes('innovation'));
          } else if (category === 'cultural events') {
            categoryMatches = itemCat.includes('cultural') || itemTitle.includes('fest') || itemTags.some((t) => t.includes('fest') || t.includes('cultural'));
          } else if (category === 'conferences') {
            categoryMatches = itemCat.includes('conference') || itemSubCat.includes('community') || itemTags.some((t) => t.includes('community') || t.includes('global'));
          } else if (category === 'workshops') {
            categoryMatches = itemCat.includes('workshop') || itemSubCat.includes('learning') || itemTags.some((t) => t.includes('learning') || t.includes('mentorship'));
          } else if (category === 'quizzes') {
            categoryMatches = itemCat.includes('quiz') || itemTitle.includes('quiz') || itemSubCat.includes('analytics');
          }
        }

        if (!categoryMatches) {
          return false;
        }
      }
    }

    // 3. Payment Filter (Free, Paid, Sponsored, Scholarship)
    if (payment && payment !== 'all' && payment !== 'all types') {
      const fee = (item.registrationFee || '').toLowerCase();
      const cat = (item.category || '').toLowerCase();
      const desc = (item.description || '').toLowerCase();
      const pType = (item.payment || '').toLowerCase();

      if (payment === 'free') {
        if (!fee.includes('free') && !pType.includes('free') && fee.includes('paid')) {
          return false;
        }
      } else if (payment === 'paid') {
        if (!fee.includes('paid') && !fee.includes('₹') && !fee.includes('$') && !pType.includes('paid')) {
          return false;
        }
      } else if (payment === 'sponsored') {
        if (!fee.includes('sponsor') && !desc.includes('sponsor') && !pType.includes('sponsor')) {
          return false;
        }
      } else if (payment === 'scholarship') {
        if (!fee.includes('scholar') && !cat.includes('scholar') && !desc.includes('scholar') && !pType.includes('scholar')) {
          return false;
        }
      }
    }

    // 4. Team Size Filter
    if (teamSize && teamSize !== 'any size' && teamSize !== 'all team sizes') {
      const itemTeam = (item.teamSize || item.members || '').toLowerCase();
      if (teamSize.includes('1') || teamSize.includes('solo') || teamSize.includes('individual')) {
        if (!itemTeam.includes('1') && !itemTeam.includes('solo') && !itemTeam.includes('individual')) {
          return false;
        }
      } else if (teamSize.includes('2') || teamSize.includes('4')) {
        if (!itemTeam.includes('2') && !itemTeam.includes('3') && !itemTeam.includes('4')) {
          return false;
        }
      } else if (teamSize.includes('5')) {
        if (!itemTeam.includes('5') && !itemTeam.includes('6') && !itemTeam.includes('7')) {
          return false;
        }
      }
    }

    // 5. Mode Filter
    if (mode && mode !== 'all') {
      if (item.mode?.toLowerCase() !== mode) {
        return false;
      }
    }

    // 6. Location Filter
    if (location) {
      if (!item.location?.toLowerCase().includes(location)) {
        return false;
      }
    }

    return true;
  });
};

export default competitionData;
