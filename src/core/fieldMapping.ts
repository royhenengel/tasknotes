/* eslint-disable no-console */
import { FieldMapping, TaskInfo } from "../types";
import {
	normalizeDependencyEntry,
	normalizeDependencyList,
	serializeDependencies,
} from "../utils/dependencyUtils";
import { validateCompleteInstances } from "../utils/dateUtils";

function isParkedKey(key: string | undefined | null): boolean {
	return !key || key.trim() === "";
}

function readFm(fm: Record<string, any>, key: string | undefined | null): any {
	if (isParkedKey(key)) return undefined;
	return fm[key as string];
}

function writeFm(
	fm: Record<string, any>,
	key: string | undefined | null,
	value: any
): void {
	if (isParkedKey(key)) return;
	fm[key as string] = value;
}

export function toUserField(mapping: FieldMapping, internalName: keyof FieldMapping): string {
	return mapping[internalName];
}

export function normalizeTitleValue(val: unknown): string | undefined {
	if (typeof val === "string") return val;
	if (Array.isArray(val)) return val.map((v) => String(v)).join(", ");
	if (val === null || val === undefined) return undefined;
	if (typeof val === "object") return "";
	return String(val);
}

export function mapTaskFromFrontmatter(
	mapping: FieldMapping,
	frontmatter: Record<string, any> | undefined | null,
	filePath: string,
	storeTitleInFilename?: boolean
): Partial<TaskInfo> {
	if (!frontmatter) return {};

	const mapped: Partial<TaskInfo> = {
		path: filePath,
	};

	const titleRaw = readFm(frontmatter, mapping.title);
	if (titleRaw !== undefined) {
		const normalized = normalizeTitleValue(titleRaw);
		if (normalized !== undefined) {
			mapped.title = normalized;
		}
	} else if (storeTitleInFilename) {
		const filename = filePath.split("/").pop()?.replace(".md", "");
		if (filename) {
			mapped.title = filename;
		}
	}

	const statusRaw = readFm(frontmatter, mapping.status);
	if (statusRaw !== undefined) {
		mapped.status = typeof statusRaw === "boolean" ? (statusRaw ? "true" : "false") : statusRaw;
	}

	const priorityRaw = readFm(frontmatter, mapping.priority);
	if (priorityRaw !== undefined) {
		mapped.priority = priorityRaw;
	}

	const dueRaw = readFm(frontmatter, mapping.due);
	if (dueRaw !== undefined) {
		mapped.due = dueRaw;
	}

	const scheduledRaw = readFm(frontmatter, mapping.scheduled);
	if (scheduledRaw !== undefined) {
		mapped.scheduled = scheduledRaw;
	}

	const contextsRaw = readFm(frontmatter, mapping.contexts);
	if (contextsRaw !== undefined) {
		mapped.contexts = Array.isArray(contextsRaw) ? contextsRaw : [contextsRaw];
	}

	const projectsRaw = readFm(frontmatter, mapping.projects);
	if (projectsRaw !== undefined) {
		mapped.projects = Array.isArray(projectsRaw) ? projectsRaw : [projectsRaw];
	}

	const timeEstimateRaw = readFm(frontmatter, mapping.timeEstimate);
	if (timeEstimateRaw !== undefined) {
		mapped.timeEstimate = timeEstimateRaw;
	}

	const completedDateRaw = readFm(frontmatter, mapping.completedDate);
	if (completedDateRaw !== undefined) {
		mapped.completedDate = completedDateRaw;
	}

	const recurrenceRaw = readFm(frontmatter, mapping.recurrence);
	if (recurrenceRaw !== undefined) {
		mapped.recurrence = recurrenceRaw;
	}

	const recurrenceAnchorRaw = readFm(frontmatter, mapping.recurrenceAnchor);
	if (recurrenceAnchorRaw !== undefined) {
		if (recurrenceAnchorRaw === "scheduled" || recurrenceAnchorRaw === "completion") {
			mapped.recurrence_anchor = recurrenceAnchorRaw;
		} else {
			console.warn(`Invalid recurrence_anchor value: ${recurrenceAnchorRaw}, defaulting to 'scheduled'`);
			mapped.recurrence_anchor = "scheduled";
		}
	}

	const dateCreatedRaw = readFm(frontmatter, mapping.dateCreated);
	if (dateCreatedRaw !== undefined) {
		mapped.dateCreated = dateCreatedRaw;
	}

	const dateModifiedRaw = readFm(frontmatter, mapping.dateModified);
	if (dateModifiedRaw !== undefined) {
		mapped.dateModified = dateModifiedRaw;
	}

	const timeEntriesRaw = readFm(frontmatter, mapping.timeEntries);
	if (timeEntriesRaw !== undefined) {
		mapped.timeEntries = Array.isArray(timeEntriesRaw) ? timeEntriesRaw : [];
	}

	const completeInstancesRaw = readFm(frontmatter, mapping.completeInstances);
	if (completeInstancesRaw !== undefined) {
		mapped.complete_instances = validateCompleteInstances(completeInstancesRaw);
	}

	const skippedInstancesRaw = readFm(frontmatter, mapping.skippedInstances);
	if (skippedInstancesRaw !== undefined) {
		mapped.skipped_instances = validateCompleteInstances(skippedInstancesRaw);
	}

	if (mapping.blockedBy) {
		const blockedByRaw = readFm(frontmatter, mapping.blockedBy);
		if (blockedByRaw !== undefined) {
			const dependencies = normalizeDependencyList(blockedByRaw);
			if (dependencies) {
				mapped.blockedBy = dependencies;
			}
		}
	}

	const icsEventIdRaw = readFm(frontmatter, mapping.icsEventId);
	if (icsEventIdRaw !== undefined) {
		mapped.icsEventId = Array.isArray(icsEventIdRaw) ? icsEventIdRaw : [icsEventIdRaw];
	}

	const googleCalendarEventIdRaw = readFm(frontmatter, mapping.googleCalendarEventId);
	if (googleCalendarEventIdRaw !== undefined) {
		mapped.googleCalendarEventId = googleCalendarEventIdRaw;
	}

	const remindersRaw = readFm(frontmatter, mapping.reminders);
	if (remindersRaw !== undefined) {
		if (Array.isArray(remindersRaw)) {
			const filteredReminders = remindersRaw.filter((r) => r != null);
			if (filteredReminders.length > 0) {
				mapped.reminders = filteredReminders;
			}
		} else if (remindersRaw != null) {
			mapped.reminders = [remindersRaw];
		}
	}

	const sortOrderRaw = readFm(frontmatter, mapping.sortOrder);
	if (sortOrderRaw !== undefined) {
		mapped.sortOrder = typeof sortOrderRaw === "string" ? sortOrderRaw : String(sortOrderRaw);
	}

	if (frontmatter.tags && Array.isArray(frontmatter.tags)) {
		mapped.tags = frontmatter.tags;
		mapped.archived = frontmatter.tags.includes(mapping.archiveTag);
	}

	return mapped;
}

export function mapTaskToFrontmatter(
	mapping: FieldMapping,
	taskData: Partial<TaskInfo>,
	taskTag?: string,
	storeTitleInFilename?: boolean
): Record<string, any> {
	const frontmatter: Record<string, any> = {};

	if (taskData.title !== undefined) {
		writeFm(frontmatter, mapping.title, taskData.title);
	}

	if (taskData.status !== undefined) {
		const lower = taskData.status.toLowerCase();
		const coercedValue =
			lower === "true" || lower === "false" ? lower === "true" : taskData.status;
		writeFm(frontmatter, mapping.status, coercedValue);
	}

	if (taskData.priority !== undefined) {
		writeFm(frontmatter, mapping.priority, taskData.priority);
	}

	if (taskData.due !== undefined) {
		writeFm(frontmatter, mapping.due, taskData.due);
	}

	if (taskData.scheduled !== undefined) {
		writeFm(frontmatter, mapping.scheduled, taskData.scheduled);
	}

	if (
		taskData.contexts !== undefined &&
		(!Array.isArray(taskData.contexts) || taskData.contexts.length > 0)
	) {
		writeFm(frontmatter, mapping.contexts, taskData.contexts);
	}

	if (
		taskData.projects !== undefined &&
		(!Array.isArray(taskData.projects) || taskData.projects.length > 0)
	) {
		writeFm(frontmatter, mapping.projects, taskData.projects);
	}

	if (taskData.timeEstimate !== undefined) {
		writeFm(frontmatter, mapping.timeEstimate, taskData.timeEstimate);
	}

	if (taskData.completedDate !== undefined) {
		writeFm(frontmatter, mapping.completedDate, taskData.completedDate);
	}

	if (taskData.recurrence !== undefined) {
		writeFm(frontmatter, mapping.recurrence, taskData.recurrence);
	}

	if (taskData.recurrence_anchor !== undefined) {
		writeFm(frontmatter, mapping.recurrenceAnchor, taskData.recurrence_anchor);
	}

	if (taskData.dateCreated !== undefined) {
		writeFm(frontmatter, mapping.dateCreated, taskData.dateCreated);
	}

	if (taskData.dateModified !== undefined) {
		writeFm(frontmatter, mapping.dateModified, taskData.dateModified);
	}

	if (taskData.sortOrder !== undefined) {
		writeFm(frontmatter, mapping.sortOrder, taskData.sortOrder);
	}

	if (taskData.timeEntries !== undefined) {
		writeFm(frontmatter, mapping.timeEntries, taskData.timeEntries);
	}

	if (taskData.complete_instances !== undefined) {
		writeFm(frontmatter, mapping.completeInstances, taskData.complete_instances);
	}

	if (taskData.skipped_instances !== undefined && taskData.skipped_instances.length > 0) {
		writeFm(frontmatter, mapping.skippedInstances, taskData.skipped_instances);
	}

	if (taskData.blockedBy !== undefined) {
		if (Array.isArray(taskData.blockedBy)) {
			const normalized = taskData.blockedBy
				.map((item) => normalizeDependencyEntry(item))
				.filter((item): item is NonNullable<ReturnType<typeof normalizeDependencyEntry>> => !!item);
			if (normalized.length > 0) {
				writeFm(frontmatter, mapping.blockedBy, serializeDependencies(normalized));
			}
		} else {
			writeFm(frontmatter, mapping.blockedBy, taskData.blockedBy);
		}
	}

	if (taskData.icsEventId !== undefined && taskData.icsEventId.length > 0) {
		writeFm(frontmatter, mapping.icsEventId, taskData.icsEventId);
	}

	if (taskData.reminders !== undefined && taskData.reminders.length > 0) {
		writeFm(frontmatter, mapping.reminders, taskData.reminders);
	}

	let tags = taskData.tags ? [...taskData.tags] : [];

	if (taskTag && !tags.includes(taskTag)) {
		tags.push(taskTag);
	}

	if (taskData.archived === true && !tags.includes(mapping.archiveTag)) {
		tags.push(mapping.archiveTag);
	} else if (taskData.archived === false) {
		tags = tags.filter((tag) => tag !== mapping.archiveTag);
	}

	if (tags.length > 0) {
		frontmatter.tags = tags;
	}

	void storeTitleInFilename;

	return frontmatter;
}

export function lookupMappingKey(
	mapping: FieldMapping,
	frontmatterPropertyName: string
): keyof FieldMapping | null {
	for (const [mappingKey, propertyName] of Object.entries(mapping)) {
		if (propertyName === frontmatterPropertyName) {
			return mappingKey as keyof FieldMapping;
		}
	}
	return null;
}

export function isRecognizedProperty(mapping: FieldMapping, frontmatterPropertyName: string): boolean {
	return lookupMappingKey(mapping, frontmatterPropertyName) !== null;
}

export function isPropertyForField(
	mapping: FieldMapping,
	propertyName: string,
	internalField: keyof FieldMapping
): boolean {
	return mapping[internalField] === propertyName;
}

export function toUserFields(
	mapping: FieldMapping,
	internalFields: (keyof FieldMapping)[]
): string[] {
	return internalFields.map((field) => mapping[field]);
}

export function validateFieldMapping(mapping: FieldMapping): { valid: boolean; errors: string[] } {
	const errors: string[] = [];

	const fields = Object.keys(mapping) as (keyof FieldMapping)[];
	for (const field of fields) {
		if (!mapping[field] || mapping[field].trim() === "") {
			errors.push(`Field "${field}" cannot be empty`);
		}
	}

	const values = Object.values(mapping);
	const uniqueValues = new Set(values);
	if (values.length !== uniqueValues.size) {
		errors.push("Field mappings must have unique property names");
	}

	return {
		valid: errors.length === 0,
		errors,
	};
}
