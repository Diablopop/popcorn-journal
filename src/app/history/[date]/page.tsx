import PastEntryClient from './PastEntryClient'

interface PastEntryPageProps {
  params: { date: string }
}

export default function PastEntryPage({ params }: PastEntryPageProps) {
  return <PastEntryClient dateParam={params.date} />
}


