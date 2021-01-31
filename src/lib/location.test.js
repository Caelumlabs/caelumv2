const cred = require('../index')

test('Person: should set a Location', () => {
  // new Person.
  const location = new cred.Location()
  location.addressLocality('MyOldTown')

  // Check Person.
  expect(location.subject['@type']).toEqual('PostalAddress')
  expect(location.subject.addressLocality).toEqual('MyOldTown')
})

test('Person: should set a addressLocality', () => {
  // new Person.
  const location = new cred.Location()
  location.streetAddress('Reina Cristina 9, principal')
  location.addressLocality('Sitges')
  location.postalCode('08001')
  location.addressRegion('Barcelona')
  location.addressCountry('Spain')

  // Check Location.
  expect(location.subject['@type']).toEqual('PostalAddress')
  expect(location.subject.streetAddress).toEqual('Reina Cristina 9, principal')
  expect(location.subject.addressLocality).toEqual('Sitges')
  expect(location.subject.postalCode).toEqual('08001')
  expect(location.subject.addressRegion).toEqual('Barcelona')
  expect(location.subject.addressCountry).toEqual('Spain')
})

test('Person: should set a postalCode', () => {
  // new Person.
  const location = new cred.Location()
  location.postalCode('08001')

  // Check Person.
  expect(location.subject['@type']).toEqual('PostalAddress')
  expect(location.subject.postalCode).toEqual('08001')
})

test('Person: should set a neighborhood', () => {
  // new Person.
  const location = new cred.Location()
  location.neighborhood('MyNeighborhood')

  // Check Person.
  expect(location.subject['@type']).toEqual('PostalAddress')
  expect(location.subject.neighborhood).toEqual('MyNeighborhood')
})
