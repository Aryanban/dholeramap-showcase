import React from 'react';
import type { Metadata } from 'next';
import TpSchemeDetailPage, { getTpSchemeMetadata } from '@/components/portal/TpSchemeDetailPage';

export const metadata: Metadata = getTpSchemeMetadata(1);

export default function DholeraTp1MapPage() {
  return <TpSchemeDetailPage schemeNumber={1} />;
}
