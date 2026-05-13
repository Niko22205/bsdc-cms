import { PageHeader } from "../../../_components/ui/PageHeader"
import { ServiceForm } from "../_components/ServiceForm"
import { createService } from "../actions"

export default function NewServicePage() {
  return (
    <div>
      <PageHeader title="New Service" description="Add a new service to display on the site." />
      <ServiceForm action={createService} submitLabel="Create Service" />
    </div>
  )
}
