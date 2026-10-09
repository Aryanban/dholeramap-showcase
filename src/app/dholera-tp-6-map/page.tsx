import React from 'react';
import type { Metadata } from 'next';
import TpSchemeDetailPage, { getTpSchemeMetadata } from '@/components/portal/TpSchemeDetailPage';

export const metadata: Metadata = getTpSchemeMetadata(6);

export default function DholeraTp6MapPage() {
  return <TpSchemeDetailPage schemeNumber={6} />;
}
