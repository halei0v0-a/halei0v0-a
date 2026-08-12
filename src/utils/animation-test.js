// 动画测试工具 - 验证yukina风格的侧滑效果

export function testSlideAnimation() {
	// 测试主要动画元素
	const mainElements = document.querySelectorAll(".transition-main");
	const animationElements = document.querySelectorAll(".onload-animation");

	return {
		mainElements: mainElements.length,
		animationElements: animationElements.length,
		status: "Animation test completed",
	};
}

// 模拟页面切换动画
export function simulatePageTransition() {
	const body = document.body;
	const html = document.documentElement;

	// 添加离开状态
	html.classList.add("is-animating", "is-leaving");

	setTimeout(() => {
		// 移除离开状态，添加进入状态
		html.classList.remove("is-leaving");

		setTimeout(() => {
			// 完成动画
			html.classList.remove("is-animating");
		}, 300);
	}, 300);
}

// 在控制台中可用的测试函数
if (typeof window !== "undefined") {
	window.testSlideAnimation = testSlideAnimation;
	window.simulatePageTransition = simulatePageTransition;
}
