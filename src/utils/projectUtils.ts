/**
 * Normalize the external project value into TaskNotes' internal array shape.
 *
 * LifeOS tasks have zero or one owning project. TaskNotes keeps an array
 * internally for upstream compatibility, but only the first non-empty value is
 * retained at every read/write boundary.
 */
export function normalizeSingleProject(value: unknown): string[] {
	const candidates = Array.isArray(value) ? value : [value];
	const project = candidates.find(
		(candidate): candidate is string =>
			typeof candidate === "string" && candidate.trim().length > 0
	);

	return project ? [project.trim()] : [];
}

/** Serialize the internal project array to canonical scalar frontmatter. */
export function serializeSingleProject(value: unknown): string {
	return normalizeSingleProject(value)[0] ?? "";
}
