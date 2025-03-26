'use client';

import React, { useState } from 'react';
// World ID‐ийн React эсвэл JS library
import { WorldIDWidget } from '@worldcoin/id';

interface Props {
  onSuccess: (proofData: any) => void;
  onError?: (errorMsg: string) => void;
}

export default function WorldIDVerifyButton({ onSuccess, onError }: Props) {
  const [loading, setLoading] = useState(false);

  return (
    <div>
      <WorldIDWidget
        actionId='<YOUR_ACTION_ID>'
        signal='some_unique_signal'
        enableTelemetry
        onSuccess={(verificationResponse) => {
          /**
           * verificationResponse = {
           *   merkle_root: string,
           *   nullifier_hash: string,
           *   proof: string[],
           *   credential_type: string,
           *   action: string,
           *   signal: string
           * }
           */
          onSuccess(verificationResponse);
        }}
        onError={(error) => {
          onError?.(String(error));
        }}
      />
    </div>
  );
}
