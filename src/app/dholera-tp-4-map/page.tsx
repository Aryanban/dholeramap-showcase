import React from 'react';
import type { Metadata } from 'next';
import TpSchemeDetailPage, { getTpSchemeMetadata } from '@/components/portal/TpSchemeDetailPage';

export const metadata: Metadata = getTpSchemeMetadata(4);

export default function DholeraTp4MapPage() {
  return <TpSchemeDetailPage schemeNumber={4} />;
}
