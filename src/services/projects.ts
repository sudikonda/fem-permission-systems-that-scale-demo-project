import {projectSchema, ProjectFormValues} from '@/schemas/projects';
import {getCurrentUser} from '@/lib/session';
import {createProject, updateProject, deleteProject} from '@/dal/projects/mutations';
import {getAllProjects, getProjectById} from '@/dal/projects/queries';
import {AuthorizationError} from '@/lib/errors';
import {eq, isNull, or} from 'drizzle-orm';
import {ProjectTable} from '@/drizzle/schema';

export async function getAllProjectsService({ordered = false}: { ordered?: boolean } = {}) {
    const user = await getCurrentUser()
    if (user == null) throw new Error("Unauthenticated")

    // Build where clause based on user role
    let whereClause = undefined
    if (user.role === "author" || user.role === "viewer" || user.role === "editor") {
        whereClause = or(
            eq(ProjectTable.department, user.department),
            isNull(ProjectTable.department),
        )
    }
    // admin can see all (no where clause)

    return getAllProjects({ordered, whereClause})
}

export async function getProjectByIdService(id: string) {
    const user = await getCurrentUser()
    if (user == null) throw new Error("Unauthenticated")

    const project = await getProjectById(id)
    if (project == null) return null

    // Check if user has access to this project
    if (user.role !== "admin" && project.department != null && user.department !== project.department) {
        return null
    }

    return project
}

export async function createProjectService(data: ProjectFormValues) {
    const user = await getCurrentUser()
    if (user == null) throw new Error("Unauthenticated")

    // PERMISSION: Only admin can create projects
    if (user.role !== "admin") {
        throw new AuthorizationError()
    }

    // Validation
    const result = projectSchema.safeParse(data)
    if (!result.success) throw new Error("Invalid data")

    return await createProject({
        ...result.data,
        ownerId: user.id,
        department: result.data.department || null,
    })
}

export async function updateProjectService(
    projectId: string,
    data: ProjectFormValues,
) {
    const user = await getCurrentUser()
    if (user == null) throw new Error("Unauthenticated")

    // PERMISSION: Only admin can update projects
    if (user.role !== "admin") {
        throw new AuthorizationError()
    }

    // Validation
    const result = projectSchema.safeParse(data)
    if (!result.success) throw new Error("Invalid data")

    return await updateProject(projectId, result.data)
}

export async function deleteProjectService(projectId: string) {
    const user = await getCurrentUser()
    if (user == null) throw new Error("Unauthenticated")

    // PERMISSION: Only admin can delete projects
    if (user.role !== "admin") {
        throw new AuthorizationError()
    }

    return await deleteProject(projectId)
}
