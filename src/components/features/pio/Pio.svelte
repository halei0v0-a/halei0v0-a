<script lang="ts">
	import { onDestroy, onMount } from "svelte";

	import { pioConfig } from "@/config";

	import type { PioProps } from "./types";

	export let config: Partial<PioProps["config"]> = {};

	// 模型配置：将路径数组映射为 l2d-widget 的模型选项
	const models = (config?.models ?? pioConfig.models ?? []).map((path) => ({
		path,
	}));

	// 对话配置 → 提示气泡（Tips）映射
	const dialog = config?.dialog ?? pioConfig.dialog ?? {};
	const welcomeMessage = dialog.welcome
		? Array.isArray(dialog.welcome)
			? dialog.welcome
			: [dialog.welcome]
		: undefined;
	// 循环气泡：融合触摸 / 换装 / 首页 / 关闭等台词，形成蓝龙的日常性格
	const messages = [
		...(dialog.touch
			? Array.isArray(dialog.touch)
				? dialog.touch
				: [dialog.touch]
			: []),
		...(dialog.skin
			? Array.isArray(dialog.skin)
				? dialog.skin
				: [dialog.skin]
			: []),
		...(dialog.home ? [dialog.home] : []),
		...(dialog.close ? [dialog.close] : []),
	];

	let widgetInstance: import("l2d-widget").Widget | null = null;

	async function initWidget() {
		if (typeof window === "undefined" || widgetInstance) {
			return;
		}
		// 防止组件被重复挂载时重复创建实例（跨页面切换保持单例）
		const globalWidget = (window as any).__l2dWidgetInstance as
			| import("l2d-widget").Widget
			| undefined;
		if (globalWidget) {
			widgetInstance = globalWidget;
			return;
		}
		try {
			// 动态导入：l2d-widget 在模块顶层访问 document，只能在客户端加载
			const { createWidget } = await import("l2d-widget");
			// 为当前模型配置提示气泡（欢迎词 / 触摸提示 / 嘴型同步）
			if (welcomeMessage || messages) {
				const model = models[0];
				if (model) {
					model.tips = {
						welcomeMessage,
						messages,
						duration: 4000,
						interval: 6000,
						typing: {
							param: "ParamMouthOpenY",
							speed: 120,
							minValue: 0.3,
							maxValue: 1,
						},
						offset: { y: -20 },
						// 允许换行，避免长句超出气泡
						style: {
							whiteSpace: "normal",
							wordBreak: "break-word",
							maxWidth: "240px",
							lineHeight: "1.6",
						},
					};
				}
			}
			widgetInstance = createWidget({
				model: models.length === 1 ? models[0] : models,
				position:
					(pioConfig.position ?? "left") === "right"
						? "bottom-right"
						: "bottom-left",
				size: {
					width: pioConfig.width ?? 280,
					height: pioConfig.height ?? 250,
				},
				transitionType: "slide",
				transitionDuration: 1000,
				menus: {
					extraItems: dialog.link
						? [
								{
									icon: "mdi:link-variant",
									label: "关于",
									onClick: () => {
										window.open(
											dialog.link as string,
											"_blank",
											"noopener",
										);
									},
								},
							]
						: [],
				},
			});
			(window as any).__l2dWidgetInstance = widgetInstance;
			console.log("l2d-widget initialized (lanlong model)");
		} catch (e) {
			console.error("l2d-widget initialization error:", e);
		}
	}

	onMount(() => {
		if (!pioConfig.enable) {
			return;
		}
		if (
			pioConfig.hiddenOnMobile &&
			window.matchMedia("(max-width: 1280px)").matches
		) {
			return;
		}
		// 延迟到浏览器空闲时初始化，避免影响首屏性能
		if ("requestIdleCallback" in window) {
			(window as any).requestIdleCallback(
				() => {
					void initWidget();
				},
				{ timeout: 3000 },
			);
		} else {
			setTimeout(() => {
				void initWidget();
			}, 500);
		}
	});

	onDestroy(() => {
		// 保持实例存活，避免页面切换（Swup）时模型销毁重建
		console.log("Pio component destroyed (keeping widget alive)");
	});
</script>

{#if pioConfig.enable}
	<!--
		占位元素：fixed 定位使其始终位于视口内，用于触发 client:visible；
		实际 UI（canvas/菜单/气泡）由 l2d-widget 挂载到 body
	-->
	<div
		class="pio-container"
		aria-hidden="true"
		style="position:fixed;left:0;bottom:0;width:1px;height:1px;pointer-events:none"
	></div>
{/if}
