import { FileType } from '@/appCycle/FileType'
import json5 from 'json5'
import * as Comlink from 'comlink'
import { TaskService } from '@/components/TaskManager/WorkerTask'
import { hashString } from '@/utils/hash'
import { walkObject } from '@/utils/walkObject'
import { LightningStore } from './LightningStore'

const fileIgnoreList = ['.DS_Store']
const folderIgnoreList = [
	'RP/textures/items',
	'RP/textures/blocks',
	'RP/textures/entity',
	'RP/textures/ui',
	'RP/textures/gui',
	'RP/ui',
	'RP/sounds/step',
	'RP/sounds/dig',
	'RP/sounds/block',
	'RP/sounds/mob',
]

export interface ILightningInstruction {
	'@filter'?: string[]
	[str: string]: undefined | string | string[]
}

export class PackIndexerService extends TaskService {
	protected lightningStore: LightningStore
	constructor(baseDirectory: FileSystemDirectoryHandle) {
		super('packIndexer', baseDirectory)
		this.lightningStore = new LightningStore(this)
	}

	async onStart() {
		await FileType.setup()

		await this.iterateDir(
			this.fileSystem.baseDirectory,
			async (fileHandle, filePath) => {
				await this.processFile(filePath, fileHandle)

				this.progress.addToCurrent()
			}
		)

		await this.lightningStore.saveStore()
	}

	async updateFile(filePath: string) {
		await FileType.setup()
		await this.processFile(
			filePath,
			await this.fileSystem.getFileHandle(filePath)
		)
		await this.lightningStore.saveStore()
	}

	protected async iterateDir(
		baseDir: FileSystemDirectoryHandle,
		callback: (
			file: FileSystemFileHandle,
			filePath: string
		) => void | Promise<void>,
		fullPath = ''
	) {
		const promises = []

		for await (const [fileName, entry] of baseDir.entries()) {
			const currentFullPath =
				fullPath.length === 0 ? fileName : `${fullPath}/${fileName}`
			if (
				entry.kind === 'directory' &&
				!folderIgnoreList.includes(currentFullPath)
			) {
				await this.iterateDir(entry, callback, currentFullPath)
			} else if (!fileIgnoreList.includes(fileName)) {
				this.progress.addToTotal()
				promises.push(
					callback(entry as FileSystemFileHandle, currentFullPath)
				)
			}
		}

		await Promise.all(promises)
	}

	async processFile(filePath: string, fileHandle: FileSystemFileHandle) {
		if (filePath.endsWith('.json'))
			return await this.processJSON(filePath, fileHandle)
	}
	async processJSON(filePath: string, fileHandle: FileSystemFileHandle) {
		const file = await fileHandle.getFile()
		const fileContent = await file.text()

		// Check for file changes
		const newHash = await hashString(fileContent)
		const oldHash = await this.lightningStore.getHash(filePath)
		// File did not change, no work to do
		if (newHash === oldHash) return

		const data = json5.parse(fileContent)
		const instructions = await FileType.getLightningCache(filePath)
		// No instructions = no work
		if (instructions.length === 0) return

		// console.log(instructions)
		const collectedData: Record<string, string[]> = {}
		const onReceiveData = (key: string, filter?: string[]) => (
			data: any
		) => {
			let readyData: string[]
			if (Array.isArray(data)) readyData = data
			else if (typeof data === 'object') readyData = Object.keys(data)
			else readyData = [data]

			if (filter) readyData = readyData.filter(d => !filter.includes(d))

			if (!collectedData[key]) collectedData[key] = readyData
			else
				collectedData[key] = [
					...new Set(collectedData[key].concat(readyData)),
				]
		}

		await Promise.all(
			instructions.map(async instruction => {
				const key = Object.keys(instruction).find(
					key => key !== '@filter'
				)
				if (!key) return
				const paths = instruction[key] as string[]

				if (Array.isArray(paths))
					await Promise.all(
						paths.map(path =>
							walkObject(
								path,
								data,
								onReceiveData(key, instruction['@filter'])
							)
						)
					)
				else
					await walkObject(
						paths,
						data,
						onReceiveData(key, instruction['@filter'])
					)
			})
		)

		await this.lightningStore.save(
			filePath,
			fileContent,
			Object.keys(collectedData).length > 0 ? collectedData : undefined
		)
	}
}

Comlink.expose(PackIndexerService, self)