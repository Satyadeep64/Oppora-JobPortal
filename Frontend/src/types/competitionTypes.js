/**
 * Competition Module Types & Schemas (JSDoc Type Definitions)
 * Provides strict type safety and documentation across the Competition module.
 */

/**
 * @typedef {Object} EligibilityDto
 * @property {string} [degreeRequirement]
 * @property {string} [batchRequirement]
 * @property {string} [domainSpecialization]
 * @property {number} [minAge]
 * @property {number} [maxAge]
 */

/**
 * @typedef {Object} TimelineRoundDto
 * @property {number} roundNumber
 * @property {string} roundTitle
 * @property {string} [description]
 * @property {string} roundDate
 */

/**
 * @typedef {Object} PrizeDto
 * @property {number} rank
 * @property {string} positionName
 * @property {string} [rewardDescription]
 * @property {number} amount
 */

/**
 * @typedef {Object} CompetitionListDto
 * @property {number} id
 * @property {string} title
 * @property {string} organization
 * @property {string} logo
 * @property {string} category
 * @property {string} location
 * @property {string} mode
 * @property {string} teamSize
 * @property {string} registrationFee
 * @property {string} deadline
 * @property {string} daysLeft
 * @property {string} status
 * @property {string} [popularityBadge]
 * @property {number} registeredCount
 * @property {boolean} isFeatured
 * @property {string[]} tags
 */

/**
 * @typedef {Object} CompetitionDetailDto
 * @property {number} id
 * @property {string} title
 * @property {string} description
 * @property {string} organization
 * @property {string} logo
 * @property {string} [banner]
 * @property {string} category
 * @property {string} location
 * @property {string} mode
 * @property {string} teamSize
 * @property {string} registrationFee
 * @property {string} deadline
 * @property {string} daysLeft
 * @property {string} status
 * @property {string} officialRegistrationUrl
 * @property {boolean} isFeatured
 * @property {number} registeredCount
 * @property {EligibilityDto} [eligibility]
 * @property {TimelineRoundDto[]} [timeline]
 * @property {PrizeDto[]} [prizes]
 * @property {string[]} [rules]
 * @property {string[]} [tags]
 */

/**
 * @typedef {Object} PagedResult
 * @template T
 * @property {T[]} items
 * @property {number} totalCount
 * @property {number} currentPage
 * @property {number} pageSize
 * @property {boolean} hasNext
 * @property {boolean} hasPrevious
 */

export {};
