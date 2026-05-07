import { ServiceForm } from "../_components/ServiceForm"
import { createService } from "../actions"

export default function NewServicePage() {
  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-zinc-900">New Service</h1>
      <ServiceForm action={createService} submitLabel="Create Service" />
    </div>
  )
}
