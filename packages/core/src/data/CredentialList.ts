import { Agent } from '@credo-ts/core';
import { saveJson } from './VCMetaData';

// Function to get dynamic credential list from the agent
export const getCredentialList = async (agent: Agent) => {
  try {
    if (!agent) {
      console.error('Agent not available');
      return [];
    }
    
    const vcMetadataList = await saveJson(agent);
    console.log('Dynamic credential list fetched:', vcMetadataList);
    return vcMetadataList;
  } catch (error) {
    console.error('Error fetching credential list:', error);
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