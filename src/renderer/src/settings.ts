import './assets/style.css';
import App from './App.svelte';

const app = new App({
	target: document.getElementById('app'),
	props: {
		window_name: 'settings'
	}
});

export default app;
