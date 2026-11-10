import { normalizeSingleProject, serializeSingleProject } from "../../../src/utils/projectUtils";

describe("single owning project helpers", () => {
	it("normalizes scalar frontmatter to the internal array shape", () => {
		expect(normalizeSingleProject("[[LifeOS]]")).toEqual(["[[LifeOS]]"]);
	});

	it("retains only the first non-empty legacy project", () => {
		expect(normalizeSingleProject(["", "[[LifeOS]]", "[[PAI]]"])).toEqual(["[[LifeOS]]"]);
	});

	it("serializes one project as a scalar and no project as an empty string", () => {
		expect(serializeSingleProject(["[[LifeOS]]"])).toBe("[[LifeOS]]");
		expect(serializeSingleProject([])).toBe("");
	});
});
