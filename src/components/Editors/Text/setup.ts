import { FileType } from '@/appCycle/FileType'
import * as monaco from 'monaco-editor'

export function setupMonacoEditor() {
	monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
		enableSchemaRequest: true,
		allowComments: true,
		validate: true,
		schemas: FileType.getMonacoSchemaArray(),
	})
}
