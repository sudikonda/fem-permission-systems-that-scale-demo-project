import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon } from "lucide-react"
import { ActionButton } from "@/components/ui/action-button"
import { deleteProjectAction } from "@/actions/projects"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getProjectByIdService } from "@/services/projects"
import { ProjectForm } from "@/components/project-form"
import { getCurrentUser } from "@/lib/session"

export default async function EditProjectPage({
  params,
}: PageProps<"/projects/[projectId]/edit">) {
  const { projectId } = await params

  // Use service that handles auth
  const project = await getProjectByIdService(projectId)
  if (project == null) return notFound()

  const user = await getCurrentUser()

  // Check admin permission for UI only (service handles actual auth)
  if (user?.role !== "admin") {
    return redirect("/")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/projects/${projectId}`}>
            <ArrowLeftIcon className="size-4" />
            <span className="sr-only">Back to project</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Project</h1>
          <p className="text-muted-foreground">{project.name}</p>
        </div>
      </div>

      <div className="max-w-2xl space-y-6">
        <ProjectForm project={project} />

        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              Permanently delete this project and all its documents.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ActionButton
              variant="destructive"
              requireAreYouSure
              action={deleteProjectAction.bind(null, projectId)}
            >
              Delete Project
            </ActionButton>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
