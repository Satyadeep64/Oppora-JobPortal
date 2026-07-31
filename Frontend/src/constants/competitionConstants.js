/**
 * Competition Module Constants
 * Clean, centralized constants for filters, categories, team sizes, payment modes, and sorting.
 */

export const DEFAULT_FILTERS = Object.freeze({
  searchTerm: '',
  title: '',
  organization: '',
  category: 'Competitions',
  minPrizeAmount: '',
  maxPrizeAmount: '',
  deadlineFrom: '',
  deadlineTo: '',
  activeOnly: false,
  location: '',
  mode: '',
  teamSize: '',
  minTeamSize: '',
  maxTeamSize: '',
  degree: '',
  batch: '',
  domain: '',
  isFree: null,
  payment: '',
  sortBy: 'popularity',
  sortOrder: 'desc'
});

export const CATEGORY_OPTIONS = Object.freeze([
  { id: 'competitions', title: 'Competitions', slug: 'competitions' },
  { id: 'hackathons', title: 'Hackathons', slug: 'hackathons' },
  { id: 'workshops', title: 'Workshops', slug: 'workshops' },
  { id: 'quizzes', title: 'Quizzes', slug: 'quizzes' },
  { id: 'scholarships', title: 'Scholarships', slug: 'scholarships' },
  { id: 'conferences', title: 'Conferences', slug: 'conferences' },
  { id: 'cultural-events', title: 'Cultural Events', slug: 'cultural-events' },
  { id: 'coding-contest', title: 'Coding Contest', slug: 'coding-contest' },
  { id: 'innovation-challenge', title: 'Innovation Challenge', slug: 'innovation-challenge' },
]);

export const TEAM_SIZE_OPTIONS = Object.freeze([
  { label: 'All Team Sizes', value: '' },
  { label: 'Individual', value: 'Individual' },
  { label: 'Team of 2', value: 'Team of 2' },
  { label: 'Team of 3', value: 'Team of 3' },
  { label: 'Team of 4+', value: 'Team of 4+' }
]);

export const PAYMENT_OPTIONS = Object.freeze([
  { label: 'All Payments', value: '' },
  { label: 'Free', value: 'Free' },
  { label: 'Paid', value: 'Paid' },
  { label: 'Sponsored', value: 'Sponsored' },
  { label: 'Scholarship', value: 'Scholarship' }
]);

export const SORT_OPTIONS = Object.freeze([
  { label: 'Popularity', value: 'popularity' },
  { label: 'Registration Deadline', value: 'deadline' },
  { label: 'Prize Amount', value: 'prize' },
  { label: 'Newest First', value: 'newest' },
  { label: 'Title (A-Z)', value: 'title' }
]);

export const BOOKMARK_STORAGE_KEY = 'oppora_bookmarked_competitions';
