// The design is set in Inter at variable weights (485–680). Self-hosted rather than loaded
// from a CDN so a clean checkout renders correctly offline and there is no render-blocking
// third-party request. `wght.css` carries the weight axis only — the design uses no optical
// sizing, so the larger multi-axis bundle would be dead weight.
import '@fontsource-variable/inter/wght.css'
