import React from 'react'
import { useLocalSearchParams } from 'expo-router'
import Terms from '@/components/Terms'

// `/terms` opens the Terms of Use; `/terms?tab=privacy` and `/terms?tab=refund`
// open those policies directly. The paywall needs the deep links because App
// Store Review Guideline 3.1.2 wants a distinct, working link per policy.
const TermsPage = () => {
  const { tab } = useLocalSearchParams<{ tab?: string }>()
  const initialPage =
    tab === 'privacy' || tab === 'refund' ? tab : 'terms'

  return <Terms initialPage={initialPage} />
}

export default TermsPage
