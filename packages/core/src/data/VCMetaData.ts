import { VerifiableCredential } from '../types/credential';
import { W3cCredentialRecord, SdJwtVcRecord, MdocRecord, Agent } from '@credo-ts/core';
import { getOpenId4VcCredentialMetadata } from '../modules/openid/metadata';
import { getCredentialForDisplay } from '../modules/openid/display';
import { CredentialMetadata } from '../types/credential';

interface VCMetaData {
  id: string;
  type: string[];
  issuer: string;
  issuanceDate: string;
  expirationDate?: string;
  subject: {
    id: string;
    name: string;
    [key: string]: any;
  };
  proof: {
    type: string;
    created: string;
    proofPurpose: string;
    verificationMethod: string;
    jws?: string;
  };
}

export const fetchVCMetaData = async (credential: VerifiableCredential): Promise<VCMetaData> => {
  try {
    const metadata: VCMetaData = {
      id: credential.id,
      type: credential.type,
      issuer: credential.issuer,
      issuanceDate: credential.issuanceDate,
      expirationDate: credential.expirationDate,
      subject: {
        id: credential.credentialSubject.id,
        name: credential.credentialSubject.name,
        ...credential.credentialSubject
      },
      proof: {
        type: credential.proof.type,
        created: credential.proof.created,
        proofPurpose: credential.proof.proofPurpose,
        verificationMethod: credential.proof.verificationMethod,
        jws: credential.proof.jws
      }
    };

    return metadata;
  } catch (error) {
    console.error('Error fetching VC metadata:', error);
    throw new Error('Failed to fetch VC metadata');
  }
};

export const getVCTypes = (credential: VerifiableCredential): string[] => {
  return credential.type.filter(type => type !== 'VerifiableCredential');
};

export const getVCIssuer = (credential: VerifiableCredential): string => {
  return credential.issuer;
};

export const getVCSubject = (credential: VerifiableCredential): any => {
  return credential.credentialSubject;
};

export const getVCProof = (credential: VerifiableCredential): any => {
  return credential.proof;
};

export const isVCExpired = (credential: VerifiableCredential): boolean => {
  if (!credential.expirationDate) return false;
  const expirationDate = new Date(credential.expirationDate);
  return expirationDate < new Date();
};

export const getVCValidityPeriod = (credential: VerifiableCredential): { 
  issued: string; 
  expires?: string;
} => {
  return {
    issued: credential.issuanceDate,
    expires: credential.expirationDate
  };
};

/**
 * Logs credential metadata in a detailed and organized way
 * @param metadata The metadata object returned by fetchCredentialMetadata
 */
export const logCredentialMetadataDetails = (metadata: CredentialMetadata) => {
  console.log('\n========== CREDENTIAL METADATA DETAILS ==========\n');

  // Log OpenID4VC Metadata
  console.log('📄 OPENID4VC METADATA');
  console.log('-------------------');
  if (metadata.openId4VcMetadata) {
    console.log('Credential:');
    console.log('- Display:', metadata.openId4VcMetadata.credential?.display);
    console.log('- Order:', metadata.openId4VcMetadata.credential?.order);
    console.log('- Subject:', metadata.openId4VcMetadata.credential?.credential_subject);
    console.log('\nIssuer:');
    console.log('- ID:', metadata.openId4VcMetadata.issuer?.id);
    console.log('- Display:', metadata.openId4VcMetadata.issuer?.display);
  } else {
    console.log('No OpenID4VC metadata available');
  }
  console.log('\n');

  // Log Basic Metadata
  console.log('🔑 BASIC METADATA');
  console.log('----------------');
  console.log('- ID:', metadata.metadata.id);
  console.log('- Created At:', metadata.metadata.createdAt);
  console.log('- Type:', metadata.metadata.type);
  console.log('- Issuer:', metadata.metadata.issuer);
  console.log('- Valid Until:', metadata.metadata.validUntil);
  console.log('- Valid From:', metadata.metadata.validFrom);
  console.log('\n');

  // Log Credential Attributes
  console.log('📋 CREDENTIAL ATTRIBUTES');
  console.log('----------------------');
  if (Object.keys(metadata.attributes).length > 0) {
    Object.entries(metadata.attributes).forEach(([key, value]) => {
      console.log(`${key}:`, value);
    });
  } else {
    console.log('No attributes available');
  }
  console.log('\n');

  // Log Credential Subject
  console.log('👤 CREDENTIAL SUBJECT');
  console.log('-------------------');
  if (metadata.credentialSubject) {
    console.log(JSON.stringify(metadata.credentialSubject, null, 2));
  } else {
    console.log('No subject information available');
  }
  console.log('\n');

  // Log Display Information
  console.log('🎨 DISPLAY INFORMATION');
  console.log('-------------------');
  console.log('- Name:', metadata.display.name);
  console.log('- Issuer:', metadata.display.issuer);
  console.log('- Background Color:', metadata.display.backgroundColor);
  console.log('- Logo:', metadata.display.logo);
  console.log('- Background Image:', metadata.display.backgroundImage);
  console.log('\n');

  console.log('========== END OF CREDENTIAL METADATA ==========\n');
};

/**
 * Fetches and logs all metadata from a Verifiable Credential
 * @param credential The credential to fetch metadata from
 * @returns Object containing all credential metadata
 */
export const fetchCredentialMetadata = async (
  credential: W3cCredentialRecord | SdJwtVcRecord | MdocRecord
): Promise<CredentialMetadata> => {
  // Get OpenID4VC metadata
  const openId4VcMetadata = getOpenId4VcCredentialMetadata(credential);
  console.log('=== OpenID4VC Metadata ===');
  console.log(JSON.stringify(openId4VcMetadata, null, 2));

  // Get credential display information
  const credentialDisplay = getCredentialForDisplay(credential);
  console.log('=== Credential Display ===');
  console.log(JSON.stringify(credentialDisplay, null, 2));

  // Get basic metadata
  const metadata = {
    id: credential.id,
    createdAt: credential.createdAt,
    type: credential instanceof W3cCredentialRecord ? credential.credential.type :
          credential instanceof SdJwtVcRecord ? 'SD-JWT' : 'MDOC',
    issuer: credential instanceof W3cCredentialRecord ? credential.credential.issuerId :
            credential instanceof SdJwtVcRecord ? 'SD-JWT Issuer' : 'MDOC Issuer',
    validUntil: credential instanceof W3cCredentialRecord ? credential.credential.expirationDate :
                credential instanceof SdJwtVcRecord ? 'SD-JWT Expiration' : 'MDOC Expiration',
    validFrom: credential instanceof W3cCredentialRecord ? credential.credential.issuanceDate :
               credential instanceof SdJwtVcRecord ? 'SD-JWT Issuance' : 'MDOC Issuance',
  };
  console.log('=== Basic Metadata ===');
  console.log(JSON.stringify(metadata, null, 2));

  // Get credential attributes
  const attributes = credentialDisplay.attributes;
  console.log('=== Credential Attributes ===');
  console.log(JSON.stringify(attributes, null, 2));

  // Get credential subject
  const credentialSubject = credentialDisplay.credentialSubject;
  console.log('=== Credential Subject ===');
  console.log(JSON.stringify(credentialSubject, null, 2));

  // Get display information
  const display = credentialDisplay.display;
  console.log('=== Display Information ===');
  console.log(JSON.stringify({
    name: display.name,
    issuer: display.issuer,
    backgroundColor: display.backgroundColor,
    logo: display.logo,
    backgroundImage: display.backgroundImage,
  }, null, 2));

  // Create the metadata object
  const allMetadata: CredentialMetadata = {
    openId4VcMetadata,
    metadata,
    attributes,
    credentialSubject,
    display,
  };

  // Log the metadata in a detailed format
  logCredentialMetadataDetails(allMetadata);

  return allMetadata;
};

/**
 * Extracts and returns VC metadata as a list of JSON objects
 * @param agent The agent instance
 * @returns Array of VC metadata JSON objects
 */
export const saveJson = async (agent: Agent): Promise<any[]> => {
  try {
    if (!agent) {
      console.error('Agent not available')
      return []
    }

    const vcMetadataList: any[] = []

    // Fetch all credentials
    const w3cCredentials = await agent.w3cCredentials.getAllCredentialRecords()
    const sdJwtCredentials = await agent.sdJwtVc.getAll()
    const mdocCredentials = await agent.mdoc.getAll()

    console.log('\n=== EXTRACTING VC METADATA ===\n')

    // Process W3C credentials
    console.log('Processing W3C Credentials...')
    for (const credential of w3cCredentials) {
      try {
        const metadata = await fetchCredentialMetadata(credential)
        if (metadata.attributes && metadata.attributes.VC) {
          console.log(`Found VC metadata for credential: ${credential.id}`)
          vcMetadataList.push(metadata.attributes.VC)
        }
      } catch (error) {
        console.error(`Error processing W3C credential ${credential.id}:`, error)
      }
    }

    // Process SD-JWT credentials
    console.log('\nProcessing SD-JWT Credentials...')
    for (const credential of sdJwtCredentials) {
      try {
        const metadata = await fetchCredentialMetadata(credential)
        if (metadata.attributes && metadata.attributes.VC) {
          console.log(`Found VC metadata for credential: ${credential.id}`)
          vcMetadataList.push(metadata.attributes.VC)
        }
      } catch (error) {
        console.error(`Error processing SD-JWT credential ${credential.id}:`, error)
      }
    }

    // Process MDOC credentials
    console.log('\nProcessing MDOC Credentials...')
    for (const credential of mdocCredentials) {
      try {
        const metadata = await fetchCredentialMetadata(credential)
        if (metadata.attributes && metadata.attributes.VC) {
          console.log(`Found VC metadata for credential: ${credential.id}`)
          vcMetadataList.push(metadata.attributes.VC)
        }
      } catch (error) {
        console.error(`Error processing MDOC credential ${credential.id}:`, error)
      }
    }

    console.log(`\n=== EXTRACTED ${vcMetadataList.length} VC METADATA OBJECTS ===\n`)
    console.log('VC Metadata List:', JSON.stringify(vcMetadataList, null, 2))

    return vcMetadataList
  } catch (error) {
    console.error('Error extracting VC metadata:', error)
    return []
  }
}

/**
 * Test function to fetch and display metadata for all credentials in the wallet
 */
export const testFetchAllCredentialMetadata = async (agent: Agent) => {
  try {
    if (!agent) {
      console.error('Agent not available');
      return;
    }

    // Fetch all credentials
    const w3cCredentials = await agent.w3cCredentials.getAllCredentialRecords();
    const sdJwtCredentials = await agent.sdJwtVc.getAll();
    const mdocCredentials = await agent.mdoc.getAll();

    console.log('\n=== FETCHING METADATA FOR ALL CREDENTIALS ===\n');

    // Process W3C credentials
    console.log('Processing W3C Credentials...');
    for (const credential of w3cCredentials) {
      console.log(`\n--- W3C Credential: ${credential.id} ---`);
      await fetchCredentialMetadata(credential);
    }

    // Process SD-JWT credentials
    console.log('\nProcessing SD-JWT Credentials...');
    for (const credential of sdJwtCredentials) {
      console.log(`\n--- SD-JWT Credential: ${credential.id} ---`);
      await fetchCredentialMetadata(credential);
    }

    // Process MDOC credentials
    console.log('\nProcessing MDOC Credentials...');
    for (const credential of mdocCredentials) {
      console.log(`\n--- MDOC Credential: ${credential.id} ---`);
      await fetchCredentialMetadata(credential);
    }

    console.log('\n=== FINISHED FETCHING ALL CREDENTIAL METADATA ===\n');
  } catch (error) {
    console.error('Error fetching credential metadata:', error);
  }
}; 