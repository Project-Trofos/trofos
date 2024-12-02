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

const configureIdp = async (isStaff = false) => {
  try {
    const idpMetadataUrl = isStaff
      ? process.env.IDP_METADATA_STAFF_URL || 'https://nus.vmwareidentity.asia/SAAS/API/1.0/GET/metadata/idp.xml'
      : process.env.IDP_METADATA_URL || 'https://vafs.u.nus.edu/FederationMetadata/2007-06/FederationMetadata.xml';
    const { data: idpMetadataXml } = await axios.get(idpMetadataUrl);
    return IdentityProvider({ metadata: idpMetadataXml });
  } catch (error) {
    console.error('Error configuring IdP:', error);
    throw new Error('Failed to configure Identity Provider');
  }
};

let sp: ServiceProviderInstance;
let adfs_idp: IdentityProviderInstance;
let ws1_idp: IdentityProviderInstance;

const getCachedSp = async () => {
  if (!sp) {
    sp = await configureSp();
  }
  return sp;
};

const getCachedIdp = async () => {
  if (!adfs_idp) {
    adfs_idp = await configureIdp();
  }
  return adfs_idp;
};

const getCachedIdpStaff = async () => {
  if (!ws1_idp) {
    ws1_idp = await configureIdp(true);
  }
  return ws1_idp;
};

export { getCachedSp, getCachedIdp, getCachedIdpStaff };
