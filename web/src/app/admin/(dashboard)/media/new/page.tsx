import { PageHeader } from "../../../_components/ui/PageHeader"
import { MediaForm } from "../_components/MediaForm"
import { createMediaRecord } from "../actions"

export default function NewMediaPage() {
  return (
    <div>
      <PageHeader title="Register Media URL" description="Add an external media URL to use in your content." />
      <div className="max-w-lg rounded-xl border border-white/[0.07] bg-white/[0.04] p-8">
        <MediaForm action={createMediaRecord} />
      </div>
    </div>
  )
}
