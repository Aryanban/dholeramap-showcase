import React from 'react';
import type { Metadata } from 'next';
import TpSchemeDetailPage, { getTpSchemeMetadata } from '@/components/portal/TpSchemeDetailPage';

export const metadata: Metadata = getTpSchemeMetadata(5);

export default function DholeraTp5MapPage() {
  return <TpSchemeDetailPage schemeNumber={5} />;
}
