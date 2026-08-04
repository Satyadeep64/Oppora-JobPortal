/**
 * @typedef {Object} MeetingDetails
 * @property {number} id
 * @property {number} interviewRoundId
 * @property {string} provider
 * @property {string} meetingUrl
 * @property {string} meetingId
 * @property {number} durationMinutes
 * @property {string} timeZone
 * @property {string} scheduledStartTime
 * @property {string} scheduledEndTime
 * @property {boolean} isActive
 */

/**
 * @typedef {Object} InterviewRound
 * @property {number} id
 * @property {number} interviewId
 * @property {number} roundNumber
 * @property {string} title
 * @property {string} agenda
 * @property {string} scheduledTime
 * @property {number} durationMinutes
 * @property {string} status
 * @property {MeetingDetails} [meetingDetails]
 */

/**
 * @typedef {Object} Interview
 * @property {number} id
 * @property {number} applicationId
 * @property {number} recruiterId
 * @property {string} recruiterName
 * @property {number} candidateId
 * @property {string} candidateName
 * @property {string} candidateEmail
 * @property {number} opportunityId
 * @property {string} opportunityTitle
 * @property {string} companyName
 * @property {string} overallStatus
 * @property {string} specialInstructions
 * @property {InterviewRound[]} rounds
 * @property {string} createdAt
 */

export {};
