import {
	mapTaskFromFrontmatter,
	mapTaskToFrontmatter,
	validateFieldMapping,
} from "../../../src/core/fieldMapping";
import { DEFAULT_FIELD_MAPPING } from "../../../src/settings/defaults";

describe("core/fieldMapping", () => {
	it("maps frontmatter into task fields without a FieldMapper instance", () => {
		const mapped = mapTaskFromFrontmatter(
			DEFAULT_FIELD_MAPPING,
			{
				title: "Mapped title",
				status: true,
				contexts: "work",
				projects: ["alpha"],
				recurrence_anchor: "completion",
				complete_instances: ["2026-03-01", 123, "2026-03-02"],
				tags: ["task", "archived"],
			},
			"Tasks/Mapped title.md",
			true
		);

		expect(mapped).toMatchObject({
			title: "Mapped title",
			status: "true",
			contexts: ["work"],
			projects: ["alpha"],
			recurrence_anchor: "completion",
			complete_instances: ["2026-03-01", "2026-03-02"],
			tags: ["task", "archived"],
			archived: true,
			path: "Tasks/Mapped title.md",
		});
	});

	it("maps task fields back to frontmatter with serialized dependency data", () => {
		const frontmatter = mapTaskToFrontmatter(
			DEFAULT_FIELD_MAPPING,
			{
				title: "Task",
				status: "open",
				blockedBy: [{ uid: "[[Other Task]]", reltype: "FINISHTOSTART" }],
				recurrence_anchor: "scheduled",
				tags: ["alpha"],
				archived: true,
			},
			"task"
		);

		expect(frontmatter.title).toBe("Task");
		expect(frontmatter.status).toBe("open");
		expect(frontmatter.recurrence_anchor).toBe("scheduled");
		expect(frontmatter.blockedBy).toEqual([{ uid: "[[Other Task]]", reltype: "FINISHTOSTART" }]);
		expect(frontmatter.tags).toEqual(expect.arrayContaining(["alpha", "task", "archived"]));
	});

	it("validates duplicate mapping values as invalid", () => {
		const duplicateMapping = {
			...DEFAULT_FIELD_MAPPING,
			status: "title",
		};

		const result = validateFieldMapping(duplicateMapping);
		expect(result.valid).toBe(false);
		expect(result.errors).toContain("Field mappings must have unique property names");
	});

	describe("parked field mappings (empty-string keys)", () => {
		const parkedMapping = {
			...DEFAULT_FIELD_MAPPING,
			title: "",
			priority: "",
		};

		it("mapTaskToFrontmatter does not write to frontmatter[''] for parked title", () => {
			const frontmatter = mapTaskToFrontmatter(parkedMapping, {
				title: "Real Task Title",
				priority: "normal",
			});
			expect(frontmatter[""]).toBeUndefined();
		});

		it("mapTaskToFrontmatter does not write to frontmatter[''] for parked priority", () => {
			const frontmatter = mapTaskToFrontmatter(parkedMapping, {
				priority: "high",
			});
			expect(frontmatter[""]).toBeUndefined();
		});

		it("mapTaskToFrontmatter: parked title and priority do not collide on same key", () => {
			const frontmatter = mapTaskToFrontmatter(parkedMapping, {
				title: "Real Task Title",
				priority: "normal",
			});
			expect(Object.prototype.hasOwnProperty.call(frontmatter, "")).toBe(false);
		});

		it("mapTaskFromFrontmatter: parked title falls back to filename when storeTitleInFilename=true", () => {
			const frontmatter = { "": "normal" };
			const mapped = mapTaskFromFrontmatter(
				parkedMapping,
				frontmatter,
				"Tasks/Real Task Title.md",
				true
			);
			expect(mapped.title).toBe("Real Task Title");
		});

		it("mapTaskFromFrontmatter: parked priority does not pick up garbage from frontmatter['']", () => {
			const frontmatter = { "": "normal" };
			const mapped = mapTaskFromFrontmatter(
				parkedMapping,
				frontmatter,
				"Tasks/Real Task Title.md",
				true
			);
			expect(mapped.priority).toBeUndefined();
		});

		it("regression: round-trip through parked mapping never corrupts title to priority value", () => {
			const originalTask = {
				title: "Real Task Title",
				status: "todo",
				priority: "normal",
			};
			const frontmatter = mapTaskToFrontmatter(parkedMapping, originalTask);
			const roundTripped = mapTaskFromFrontmatter(
				parkedMapping,
				frontmatter,
				"Tasks/Real Task Title.md",
				true
			);
			expect(roundTripped.title).toBe("Real Task Title");
			expect(roundTripped.title).not.toBe("normal");
		});
	});
});
