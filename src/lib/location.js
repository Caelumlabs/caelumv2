'use strict'

/**
 * Schema.org : Location
 */
module.exports = class Location {
  /**
   * Constructor.
   */
  constructor () {
    this.subject = {
      '@type': 'PostalAddress'
    }
  }

  /**
   * Set the Locality
   *
   * @param {string} addressLocality Locality Name
   */
  addressLocality (addressLocality) {
    this.subject.addressLocality = addressLocality
  }

  /**
   * Set the Postal Code
   *
   * @param {string} postalCode PostalCode
   */
  postalCode (postalCode) {
    this.subject.postalCode = postalCode
  }

  /**
   * Set the Postal Code
   *
   * @param {string} neighborhood neighborhood
   */
  neighborhood (neighborhood) {
    this.subject.neighborhood = neighborhood
  }

  /**
   * Set the streetAddress
   *
   * @param {string} streetAddress streetAddress
   */
  streetAddress (streetAddress) {
    this.subject.streetAddress = streetAddress
  }

  /**
   * Set the addressCountry
   *
   * @param {string} addressCountry addressCountry
   */
  addressCountry (addressCountry) {
    this.subject.addressCountry = addressCountry
  }

  /**
   * Set the addressRegion
   *
   * @param {string} addressRegion addressRegion
   */
  addressRegion (addressRegion) {
    this.subject.addressRegion = addressRegion
  }
}
