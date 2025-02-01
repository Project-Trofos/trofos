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

const SSORoles = {
  STAFF: 'staff',
  STUDENT: 'student',
};

const configureSp = async (isStaff = false) => {
  if (isStaff) {
    let privateKey: string = '';

    // Retrieve the private key from the environment
    if (process.env.SP_PRIVATE_KEY) {
      privateKey = process.env.SP_PRIVATE_KEY; // Directly stored as plaintext
    } else if (process.env.SP_PRIVATE_KEY_BASE64) {
      privateKey = Buffer.from(process.env.SP_PRIVATE_KEY_BASE64, 'base64').toString('utf-8'); // Decode from Base64
    }

    const privateKeyPass: string = process.env.SP_PRIVATE_KEY_PASSPHRASE || '';

    if (!privateKey) {
      throw new Error('SP private key is required.');
    }

    if (!process.env.FRONTEND_BASE_URL) {
      throw new Error('FRONTEND_BASE_URL is required.');
    }

    // Define the SP configuration
    return ServiceProvider({
      entityID: `${process.env.FRONTEND_BASE_URL}/sp`,
      wantAssertionsSigned: true,
      authnRequestsSigned: true,
      privateKey: privateKey,
      privateKeyPass: privateKeyPass,
      assertionConsumerService: [
        {
          Binding: 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST',
          Location: `${process.env.FRONTEND_BASE_URL}/api/account/callback/saml`,
          isDefault: true,
        },
        {
          Binding: 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect',
          Location: `${process.env.FRONTEND_BASE_URL}/callback/saml`,
        },
      ],
      nameIDFormat: ['saml.Constants.namespace.nameid.unspecified'],
      relayState: SSORoles.STAFF,
    });
  } else {
    const spMetadataXmlFile = process.env.NODE_ENV === 'staging' ? './sp-staging.xml' : './sp-prod.xml';
    const spMetadataXml = fs.readFileSync(spMetadataXmlFile, 'utf-8');

    // Define the SP configuration
    return ServiceProvider({ metadata: spMetadataXml, relayState: SSORoles.STUDENT });
  }
};

const configureIdp = async (isStaff = false) => {
  const idpMetadataXmlFile = isStaff ? './ws1_idp.xml' : './adfs_idp.xml';
  const idpMetadataXml = fs.readFileSync(idpMetadataXmlFile, 'utf-8');
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

export { getCachedSp, getCachedSpStaff, getCachedIdp, getCachedIdpStaff, SAML_CLAIMS, SSORoles };
