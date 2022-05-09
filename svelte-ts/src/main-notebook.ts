import App from './App.svelte';

const app = new App({
  target: document.body,
  props: { notebookMode: true }
});

export default app;
