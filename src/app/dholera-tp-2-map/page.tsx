import React from 'react';
import type { Metadata } from 'next';
import TpSchemeDetailPage, { getTpSchemeMetadata } from '@/components/portal/TpSchemeDetailPage';

export const metadata: Metadata = getTpSchemeMetadata(2);

export default function DholeraTp2MapPage() {
  return <TpSchemeDetailPage schemeNumber={2} />;
}
