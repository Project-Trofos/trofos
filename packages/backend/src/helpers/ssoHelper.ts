import axios from 'axios';
import fs from 'fs';
import {
  ServiceProvider,
  IdentityProvider,
  ServiceProviderInstance,
  IdentityProviderInstance,
  setSchemaValidator,
} from 'samlify';
import * as validator from '@authenio/samlify-xsd-schema-validator';

setSchemaValidator(validator);

const configureSp = async (isStaff = false) => {
  const spMetadataXmlFile = process.env.NODE_ENV === 'staging' ? './sp-staging.xml' : './sp-prod.xml';
  const spMetadataXml = fs.readFileSync(spMetadataXmlFile, 'utf-8');

  // if (isStaff) {
  //   // If staff SSO login, configure SP with authnRequestsSigned set to true
  //   return ServiceProvider({
  //     metadata: spMetadataXml,
  //     authnRequestsSigned: true,
  //     privateKey: ,
  //     privateKeyPass:'',
  //   });
  // }

  // Default configuration for ADFS logins
  return ServiceProvider({ metadata: spMetadataXml });
};

const configureIdp = async (isStaff = false) => {
  const idpMetadataUrl = isStaff
    ? process.env.IDP_METADATA_STAFF_URL || 'https://nus.vmwareidentity.asia/SAAS/API/1.0/GET/metadata/idp.xml'
    : process.env.IDP_METADATA_URL || 'https://vafs.u.nus.edu/FederationMetadata/2007-06/FederationMetadata.xml';
  const { data: idpMetadataXml } = await axios.get(idpMetadataUrl);
  return IdentityProvider({ metadata: idpMetadataXml });
};

let adfs_sp: ServiceProviderInstance;
let ws1_sp: ServiceProviderInstance;
let adfs_idp: IdentityProviderInstance;
let ws1_idp: IdentityProviderInstance;

const getCachedSp = async () => {
  if (!adfs_sp) {
    adfs_sp = await configureSp();
  }
  return adfs_sp;
};

const getCachedSpStaff = async () => {
  if (!ws1_sp) {
    ws1_sp = await configureSp(true);
  }
  return ws1_sp;
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

const SAML_CLAIMS = {
  EMAIL: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
  SURNAME: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname',
  GIVEN_NAME: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
};

export { getCachedSp, getCachedSpStaff, getCachedIdp, getCachedIdpStaff, SAML_CLAIMS };
