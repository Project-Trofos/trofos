import axios from 'axios';
import fs from 'fs';
import { ServiceProvider, IdentityProvider, ServiceProviderInstance, IdentityProviderInstance } from 'samlify';

const configureSp = async () => {
  try {
    const spMetadataXmlFile = process.env.NODE_ENV === 'staging' ? './sp-staging.xml' : './sp-prod.xml';
    const spMetadataXml = fs.readFileSync(spMetadataXmlFile, 'utf-8');
    return ServiceProvider({ metadata: spMetadataXml });
  } catch (error) {
    console.error('Error configuring SP:', error);
    throw new Error('Failed to configure Service Provider');
  }
};

const configureIdp = async () => {
  try {
    const idpMetadataUrl =
      process.env.IDP_METADATA_URL || 'https://vafs.u.nus.edu/FederationMetadata/2007-06/FederationMetadata.xml';
    const { data: idpMetadataXml } = await axios.get(idpMetadataUrl);
    return IdentityProvider({ metadata: idpMetadataXml });
  } catch (error) {
    console.error('Error configuring IdP:', error);
    throw new Error('Failed to configure Identity Provider');
  }
};

let sp: ServiceProviderInstance;
let idp: IdentityProviderInstance;

const getCachedSp = async () => {
  if (!sp) {
    sp = await configureSp();
  }
  return sp;
};

const getCachedIdp = async () => {
  if (!idp) {
    idp = await configureIdp();
  }
  return idp;
};

export { getCachedSp, getCachedIdp };
