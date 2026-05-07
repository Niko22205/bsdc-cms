import { ProjectForm } from "../_components/ProjectForm"
import { createProjectNewsItem } from "../actions"

export default function NewProjectPage() {
  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-zinc-900">New Project / News Item</h1>
      <ProjectForm action={createProjectNewsItem} submitLabel="Create Item" />
    </div>
  )
}
