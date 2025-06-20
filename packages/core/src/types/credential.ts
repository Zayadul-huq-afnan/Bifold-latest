import { W3cCredentialRecord, SdJwtVcRecord, MdocRecord } from '@credo-ts/core';

export type VerifiableCredential = W3cCredentialRecord | SdJwtVcRecord | MdocRecord;

export interface CredentialMetadata {
  openId4VcMetadata?: {
    credential?: {
      display?: any;
      order?: number;
      credential_subject?: any;
    };
    issuer?: {
      id?: string;
      display?: any;
    };
  };
  metadata: {
    id: string;
    createdAt: string;
    type: string;
    issuer: string;
    validUntil?: string;
    validFrom?: string;
  };
  attributes: Record<string, any>;
  credentialSubject: any;
  display: {
    name: string;
    issuer: string;
    backgroundColor?: string;
    logo?: string;
    backgroundImage?: string;
  };
} 