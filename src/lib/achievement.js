'use strict'
/**
 * Schema.org: Action.
 */
module.exports = class Achievement {
  /**
   * Constructor.
   *
   * @param {string} subject of the achievement
   */
  constructor (subject = false) {
    this.subject = (subject !== false) ? subject : {}
    this.subject['@type'] = 'Achievement'
  }

  /**
   * Set the title
   *
   * @param {string} title of the achievement
   */
  title (title) {
    this.subject.title = title
  }

  /**
   * Set the description
   *
   * @param {string} description Full Name in ine string
   */
  description (description) {
    this.subject.description = description
  }

  /**
   * Sets the url of the Achievement for the credential.
   *
   * @param {string} url URL of the Achievement
   */
  url (url) {
    this.subject.url = url
  }

  /**
   * Sets the issuer of the Achievement for the credential.
   *
   * @param {string} did of issuer
   */
  issuer (did) {
    this.subject.issuer = did
  }

  /**
   * Sets the Location for this Achievement.
   *
   * @param {object} location Location Object
   */
  location (location) {
    this.subject.location = location.subject
  }

  /**
   * Sets the agent of the Action for the credential.
   *
   * @param {*} agent Person/Organization Object
   */
  agent (agent) {
    this.subject.agent = agent.subject
  }

  /**
   * Sets the issuance date
   *
   * @param {*} issuanceDate of the achievement
   */
  issuanceDate (issuanceDate) {
    this.subject.issuanceDate = issuanceDate
  }

  /**
   * Sets the ending time.
   *
   * @param {string} expirationDate of the achievement
   */
  expirationDate (expirationDate) {
    this.subject.expirationDate = expirationDate
  }

  /**
   * Sets the title of the learning achievement
   *
   * @param {string} learningAchievement title to set
   */
  learningAchievement (learningAchievement) {
    this.subject.learningAchievement = {
      title: learningAchievement
    }
  }

  /**
   * Sets the course id.
   *
   * @param {string} course identifier
   */
  course (course) {
    this.subject.course = {
      id: course
    }
  }

  /**
   * Return a signe credential for Action
   *
   * @param {string} issuer DID of the signer
   * @param {object} signer Key Pair
   * @returns {object} Signed credential
   */
  sign (signer, issuer) {
    // return signCredential(this.subject, signer, issuer)
  }
}
