import {DocumentFormValues, documentSchema} from '@/schemas/documents';
import {getCurrentUser} from '@/lib/session';
import {createDocument, updateDocument, deleteDocument} from '@/dal/documents/mutations';
import {getDocumentById, getDocumentWithUserInfo, getProjectDocuments} from '@/dal/documents/queries';
import {getProjectById} from '@/dal/projects/queries';
import {AuthorizationError} from '@/lib/errors';

export async function getProjectDocumentsService(projectId: string) {
    const user = await getCurrentUser()
    if (user == null) throw new Error("Unauthenticated")

    // Check if user has access to this project
    const project = await getProjectById(projectId)
    if (project == null) return []

    if (user.role !== "admin" && project.department != null && user.department !== project.department) {
        return []
    }

    return await getProjectDocuments(projectId)
}

export async function getDocumentByIdService(documentId: string) {
    const user = await getCurrentUser()
    if (user == null) throw new Error("Unauthenticated")

    const document = await getDocumentById(documentId)
    if (document == null) return null

    // Check if user has access to this document's project
    const project = await getProjectById(document.projectId)
    if (project == null) return null

    if (user.role !== "admin" && project.department != null && user.department !== project.department) {
        return null
    }

    return document
}

export async function getDocumentWithUserInfoService(documentId: string) {
    const user = await getCurrentUser()
    if (user == null) throw new Error("Unauthenticated")

    const document = await getDocumentWithUserInfo(documentId)
    if (document == null) return null

    // Check if user has access to this document's project
    const project = await getProjectById(document.projectId)
    if (project == null) return null

    if (user.role !== "admin" && project.department != null && user.department !== project.department) {
        return null
    }

    return document
}

export async function createDocumentService(
    projectId: string,
    data: DocumentFormValues,
) {
    const user = await getCurrentUser()
    if (user == null) throw new Error("Unauthenticated")

    // Check if user has access to this project
    const project = await getProjectById(projectId)
    if (project == null) throw new Error("Project not found")

    if (user.role !== "admin" && project.department != null && user.department !== project.department) {
        throw new AuthorizationError()
    }

    // PERMISSION:
    // Step 1: Authorization - can they perform this action?
    if (user.role !== "admin" && user.role !== "author") {
        throw new AuthorizationError()
    }

    // Step 2: Validation - is the data valid?
    const result = documentSchema.safeParse(data)
    if (!result.success) throw new Error("Invalid data")

    // Step 3: Execute - perform the actual operation
    return await createDocument({
        ...result.data,
        creatorId: user.id,
        lastEditedById: user.id,
        projectId,
    })
}

export async function updateDocumentService(
    documentId: string,
    data: DocumentFormValues,
) {
    const user = await getCurrentUser()
    if (user == null) throw new Error("Unauthenticated")

    // Check if user has access to this document
    const document = await getDocumentById(documentId)
    if (document == null) throw new Error("Document not found")

    const project = await getProjectById(document.projectId)
    if (project == null) throw new Error("Project not found")

    if (user.role !== "admin" && project.department != null && user.department !== project.department) {
        throw new AuthorizationError()
    }

    // PERMISSION:
    // Step 1: Authorization - can they perform this action?
    if (user.role === "viewer") {
        throw new AuthorizationError()
    }

    // Step 2: Validation - is the data valid?
    const result = documentSchema.safeParse(data)
    if (!result.success) throw new Error("Invalid data")

    // Step 3: Execute - perform the actual operation
    return await updateDocument(documentId, {
        ...result.data,
        lastEditedById: user.id,
    })
}

export async function deleteDocumentService(documentId: string) {
    const user = await getCurrentUser()
    if (user == null) throw new Error("Unauthenticated")

    // Check if user has access to this document
    const document = await getDocumentById(documentId)
    if (document == null) throw new Error("Document not found")

    const project = await getProjectById(document.projectId)
    if (project == null) throw new Error("Project not found")

    if (user.role !== "admin" && project.department != null && user.department !== project.department) {
        throw new AuthorizationError()
    }

    // PERMISSION:
    // Step 1: Authorization - can they perform this action?
    if (user.role !== "admin") {
        throw new AuthorizationError()
    }

    // Step 2: Execute - perform the actual operation
    return await deleteDocument(documentId)
}
