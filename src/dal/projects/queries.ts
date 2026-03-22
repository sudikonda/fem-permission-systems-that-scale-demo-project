import { db } from "@/drizzle/db"
import { ProjectTable } from "@/drizzle/schema"
import { eq } from "drizzle-orm"

export async function getAllProjects({
  ordered = false,
  whereClause = undefined,
}: {
  ordered?: boolean
  whereClause?: any
} = {}) {
  return db.query.ProjectTable.findMany({
    where: whereClause,
    orderBy: ordered ? ProjectTable.name : undefined,
  })
}

export async function getProjectById(id: string) {
  return db.query.ProjectTable.findFirst({
    where: eq(ProjectTable.id, id),
  })
}
