import { isMatch } from 'micromatch'
import json5 from 'json5'
import type { ILightningInstruction } from '@/components/LightningCache/Worker/Main'

/**
 * Describes the structure of a file definition
 */
interface IFileType {
	id: string
	matcher: string | string[]
	schema: string
	packSpider: string
	lightningCache: string
}

/**
 * Used for return type of FileType.getMonacoSchemaArray() function
 */
interface IMonacoSchemaArrayEntry {
	fileMatch?: string[]
	uri: string
	schema?: any
}

/**
 * Utilities around bridge.'s file definitions
 */
export namespace FileType {
	const baseUrl =
		'https://raw.githubusercontent.com/bridge-core/data/next/packages/'
	let fileTypes: IFileType[] = []

	export async function setup() {
		if (fileTypes.length > 0) return

		const jsonString = await fetch(
			`${baseUrl}data/fileDefinitions.json`
		).then(rawData => rawData.text())
		fileTypes = json5.parse(jsonString) as IFileType[]
	}

	/**
	 * Get the file definition data for the given file path
	 * @param filePath file path to fetch file definition for
	 */
	export function get(filePath: string) {
		for (const fileType of fileTypes) {
			if (
				typeof fileType.matcher === 'string' &&
				isMatch(filePath, fileType.matcher)
			)
				return fileType

			for (const matcher of fileType.matcher)
				if (isMatch(filePath, matcher)) return fileType
		}
	}

	/**
	 * Get the file type/file definition id for the provided file path
	 * @param filePath file path to get the file type of
	 */
	export function getId(filePath: string) {
		return get(filePath)?.id ?? 'unknown'
	}

	/**
	 * Get a JSON schema array that can be used to set Monaco's JSON defaults
	 */
	export function getMonacoSchemaArray(): IMonacoSchemaArrayEntry[] {
		return fileTypes
			.map(({ matcher, schema }) => ({
				fileMatch: Array.isArray(matcher) ? [...matcher] : [matcher],
				uri: schema,
			}))
			.flat()
	}

	export async function getLightningCache(filePath: string) {
		const { lightningCache } = get(filePath) ?? {}
		if (!lightningCache) return []

		const response = await fetch(
			`${baseUrl}lightningCache/${lightningCache}`
		)

		return json5.parse(await response.text()) as ILightningInstruction[]
	}
}
