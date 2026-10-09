import React from 'react';
import type { Metadata } from 'next';
import TpSchemeDetailPage, { getTpSchemeMetadata } from '@/components/portal/TpSchemeDetailPage';

export const metadata: Metadata = getTpSchemeMetadata(3);

export default function DholeraTp3MapPage() {
  return <TpSchemeDetailPage schemeNumber={3} />;
}
