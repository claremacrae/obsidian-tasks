import { diagnoseTaskParsing } from './DiagnoseTaskParsing';
import { generateMarkdownReport } from './GenerateMarkdownReport';

export function createTaskParsingReport(taskLines: string[]) {
    const diagnostics = taskLines.map((line) => diagnoseTaskParsing(line));

    // Render as markdown table below the current position
    return generateMarkdownReport(diagnostics);
}
