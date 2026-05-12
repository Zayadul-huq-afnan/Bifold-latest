import { Agent } from '@credo-ts/core';
import { saveJson } from './VCMetaData';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Credential {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  data: any;
}

// Function to get dynamic credential list from the agent
export const getCredentialList = async (agent: Agent) => {
  try {
    if (!agent) {
      return [];
    }
    
    const vcMetadataList = await saveJson(agent);
    return vcMetadataList;
  } catch (error) {
    return [];
  }
};

// Fallback hardcoded list in case agent is not available
export const credentialList = [
  {
    verifiableCredential: {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://www.w3.org/2018/credentials/examples/v1'
      ],
      type: ['VerifiableCredential', 'AlumniCredential'],
      issuer: 'did:key:z6MkgLpg8eLjBA1vvehrCAKCqmrFq23674Hs4JysnW5oqa34',
      issuanceDate: '2025-06-04T16:31:25.982Z',
      credentialSubject: { name: 'Noirit' },
      proof: {
        type: 'Ed25519Signature2018',
        proofPurpose: 'assertionMethod',
        verificationMethod: 'did:key:z6MkgLpg8eLjBA1vvehrCAKCqmrFq23674Hs4JysnW5oqa34#z6MkgLpg8eLjBA1vvehrCAKCqmrFq23674Hs4JysnW5oqa34',
        created: '2025-06-04T16:31:25+00:00',
        jws: 'eyJhbGciOiAiRWREU0EiLCAiYjY0IjogZmFsc2UsICJjcml0IjogWyJiNjQiXX0..ejY7-7NY3FH8ABadFBnLUn-rrGa9b6GdcKyWMHt8OMZ5cbA2QY8Tf_qB3j24om9TTHzCZTyW8Ady3KSF6bOhAg'
      }
    }
  },
  {
    verifiableCredential: {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://www.w3.org/2018/credentials/examples/v1'
      ],
      type: ['VerifiableCredential', 'StudentCredential'],
      issuer: 'did:key:z6MkgLpg8eLjBA1vvehrCAKCqmrFq23674Hs4JysnW5oqa34',
      issuanceDate: '2025-06-06T14:20:15.982Z',
      credentialSubject: { name: 'Bob Johnson' },
      proof: {
        type: 'Ed25519Signature2018',
        proofPurpose: 'assertionMethod',
        verificationMethod: 'did:key:z6MkgLpg8eLjBA1vvehrCAKCqmrFq23674Hs4JysnW5oqa34#z6MkgLpg8eLjBA1vvehrCAKCqmrFq23674Hs4JysnW5oqa34',
        created: '2025-06-06T14:20:15+00:00',
        jws: 'eyJhbGciOiAiRWREU0EiLCAiYjY0IjogZmFsc2UsICJjcml0IjogWyJiNjQiXX0..ejY7-7NY3FH8ABadFBnLUn-rrGa9b6GdcKyWMHt8OMZ5cbA2QY8Tf_qB3j24om9TTHzCZTyW8Ady3KSF6bOhAg'
      }
    }
  }
];

export const loadCredentials = async (): Promise<Credential[]> => {
  try {
    const credentials = await AsyncStorage.getItem('credentials');
    return credentials ? JSON.parse(credentials) : [];
  } catch (error) {
    return [];
  }
};

export const saveCredentials = async (credentials: Credential[]): Promise<void> => {
  try {
    await AsyncStorage.setItem('credentials', JSON.stringify(credentials));
  } catch (error) {
    // Handle error silently
  }
}; 