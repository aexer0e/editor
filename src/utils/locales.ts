import { vue } from '@/main'
import Vue from 'vue'

export function translate(translationKey?: string) {
	if (translationKey && !translationKey.startsWith('$vuetify.'))
		translationKey = `$vuetify.${translationKey}`

	try {
		return (vue as any).$vuetify.lang.t(translationKey)
	} catch {
		return translationKey
	}
}

export const TranslationMixin = {
	methods: {
		t(translationKey?: string) {
			if (translationKey && !translationKey.startsWith('$vuetify.'))
				translationKey = `$vuetify.${translationKey}`

			try {
				return (this as any).$vuetify.lang.t(translationKey)
			} catch {
				return translationKey
			}
		},
	},
}

export function addLanguage(key: string, obj: unknown, force = false) {
	const lang = (vue as any).$vuetify.lang
	if (key in lang.locales && !force)
		throw new Error(`Language key "${key}" already exists!`)
	Vue.set(lang.locales, key, obj)

	return {
		dispose: () => {
			if (lang.current === key) lang.current = lang.defaultLocale
			Vue.delete(lang.locales, key)
		},
	}
}

export function selectLanguage(key: string) {
	const lang = (vue as any).$vuetify.lang
	if (!(key in lang.locales)) throw new Error(`Undefined language: "${key}"`)
	lang.current = key
}

export function getLanguages() {
	const locales = (vue as any).$vuetify.lang.locales
	return Object.entries(locales)
		.filter(([_, locale]) => (locale as any).languageName !== undefined)
		.map(([key, locale]) => [key, (locale as any).languageName])
}
