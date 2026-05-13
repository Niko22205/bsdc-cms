import { PageHeader } from "../../../_components/ui/PageHeader"
import { ProjectDocumentEditor } from "../_components/ProjectDocumentEditor"
import { createProjectNewsItem } from "../actions"

export default function NewProjectPage() {
  return (
    <div>
      <PageHeader title="New Project / News Item" description="Add a project or news post to display on the site." />
      <ProjectDocumentEditor action={createProjectNewsItem} submitLabel="Create Item" />
    </div>
  )
}
