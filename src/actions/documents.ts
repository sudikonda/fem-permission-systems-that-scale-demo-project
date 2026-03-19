"use server"

import {getCurrentUser} from "@/lib/session"
import {redirect} from "next/navigation"
import {documentSchema, type DocumentFormValues} from "../schemas/documents"
import {
    createDocument,
    deleteDocument,
    updateDocument,
} from "@/dal/documents/mutations"
import {tryFn} from "@/lib/helpers"
import {createDocumentService, updateDocumentService, deleteDocumentService} from '@/services/document';

export async function createDocumentAction(
    projectId: string,
    data: DocumentFormValues,
) {

    const [error, document] = await tryFn(() =>
        createDocumentService(projectId, data),
    )

    if (error) return error

    redirect(`/projects/${projectId}/documents/${document.id}`)
}

export async function updateDocumentAction(
    documentId: string,
    projectId: string,
    data: DocumentFormValues,
) {
    const [error] = await tryFn(() =>
        updateDocumentService(documentId, data),
    )

    if (error) return error

    redirect(`/projects/${projectId}/documents/${documentId}`)
}

export async function deleteDocumentAction(
    documentId: string,
    projectId: string,
) {
    const [error] = await tryFn(() => deleteDocumentService(documentId))

    if (error) return error

    redirect(`/projects/${projectId}`)
}
