import Client from 'fhir-kit-client';

const baseUrl = 'https://hapi.fhir.org/baseR5/';

var fhirClient = new Client({
  baseUrl
});

export default fhirClient;
