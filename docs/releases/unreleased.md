# TaskNotes - Unreleased

<!--

**Added** for new features.
**Changed** for changes in existing functionality.
**Deprecated** for soon-to-be removed features.
**Removed** for now removed features.
**Fixed** for any bug fixes.
**Security** in case of vulnerabilities.

Always acknowledge contributors and those who report issues.

Example:

```
## Fixed

- (#768) Fixed calendar view appearing empty in week and day views due to invalid time configuration values
  - Added time validation in settings UI with proper error messages and debouncing
  - Prevents "Cannot read properties of null (reading 'years')" error from FullCalendar
  - Thanks to @userhandle for reporting and help debugging
```

-->

## Changed

- Task projects now use a single owning-project model: scalar project frontmatter is read safely, legacy project lists retain their first value, and all writes serialize one project or an empty value. Task creation, editing, project assignment, filters, and API schemas now enforce at most one project.
- ICS imports now use `icsEventId` as their relationship field without adding a tag by default. A tag is written only when an ICS event tag is explicitly configured.
