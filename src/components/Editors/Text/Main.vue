<template>
	<div ref="monacoContainer" style="height:100%; width: 100%;" />
</template>

<script>
import * as monaco from 'monaco-editor'
import { on } from '@/appCycle/EventSystem'
import { v4 as uuid } from 'uuid'

let editorInstance
export default {
	name: 'Monaco',
	props: {
		tab: Object,
	},
	computed: {
		isDarkMode() {
			return this.$vuetify.theme.dark
		},
		fontSize() {
			return /** this.$store.state.Settings.file_font_size || */ '14px'
		},
		fontFamily() {
			return /** this.$store.state.Settings.file_font_family || */ '14px'
		},
	},
	mounted() {
		monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
			target: monaco.languages.typescript.ScriptTarget.ESNext,
			allowNonTsExtensions: true,
			noLib: true,
		})

		editorInstance = monaco.editor.create(this.$refs.monacoContainer, {
			theme: 'bridge-monaco-default',
			roundedSelection: false,
			autoIndent: 'full',
			fontSize: this.fontSize,
			// fontFamily: this.fontFamily,
			tabSize: 4,
		})
		this.tab.receiveEditorInstance(editorInstance)
	},
	watch: {
		tab() {
			this.tab.receiveEditorInstance(editorInstance)
		},
		isDarkMode(val) {
			monaco.editor.setTheme(val ? 'vs-dark' : 'vs')
		},
		fontSize(val) {
			this.monacoEditor.updateOptions({
				fontSize: this.fontSize,
			})
		},
		fontFamily(val) {
			this.monacoEditor.updateOptions({
				fontFamily: this.fontFamily,
			})
		},
	},
}
</script>

<style>
.monaco-action-bar {
	background: var(--v-menu-base) !important;
}
.action-item.focused > a {
	background: var(--v-primary-base) !important;
}
</style>
