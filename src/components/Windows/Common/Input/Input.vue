<template>
	<BaseWindow
		v-if="shouldRender"
		:windowTitle="windowTitle"
		:isVisible="isVisible"
		:hasMaximizeButton="false"
		:isFullscreen="false"
		:width="440"
		:height="120"
		@closeWindow="onClose"
	>
		<template #default>
			<v-row>
				<v-text-field
					:label="label"
					v-model="inputValue"
					@keydown.enter.native="onConfirm"
					autofocus
				/>
				<p class="expand_text" v-if="expandText !== ''">
					{{ expandText }}
				</p>
			</v-row>
		</template>
		<template #actions>
			<v-spacer />
			<v-btn
				color="primary"
				@click="onConfirm"
				:disabled="inputValue === ''"
			>
				<span>{{ t('windows.common.input.confirm') }}</span>
			</v-btn>
		</template>
	</BaseWindow>
</template>

<script>
import { TranslationMixin } from '@/utils/locales'
import BaseWindow from '../../Layout/Base'

export default {
	name: 'Input',
	mixins: [TranslationMixin],
	components: {
		BaseWindow,
	},
	props: ['currentWindow'],
	data() {
		return this.currentWindow.getState()
	},
	methods: {
		onClose() {
			this.currentWindow.close()
			this.inputValue = ''
		},
		onConfirm() {
			this.currentWindow.close()
			this.onConfirmCb(this.inputValue + this.expandText)
			this.inputValue = ''
		},
	},
}
</script>

<style>
.expand_text {
	opacity: 60%;
	padding-top: 26px;
}
</style>
