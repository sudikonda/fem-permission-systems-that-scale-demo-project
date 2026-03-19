import {DocumentFormValues, documentSchema} from '@/schemas/documents';
import {getCurrentUser} from '@/lib/session';
import {createDocument, updateDocument, deleteDocument} from '@/dal/documents/mutations';
import {AuthorizationError} from '@/lib/errors';

export async function createDocumentService(
    projectId: string,
    data: DocumentFormValues,
) {
    const user = await getCurrentUser()
    if (user == null) throw new Error("Unauthenticated")

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

    // PERMISSION:
    // Step 1: Authorization - can they perform this action?
    if (user.role !== "admin") {
        throw new AuthorizationError()
    }

    // Step 2: Execute - perform the actual operation
    return await deleteDocument(documentId)
}