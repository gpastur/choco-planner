@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  background: #f6f4fb;
  color: #1e293b;
  letter-spacing: 0;
}

button,
input,
select,
textarea {
  font: inherit;
  letter-spacing: 0;
}

.app-shell {
  background:
    linear-gradient(#f7f5fc, #f7f5fc) padding-box;
}

.app-header {
  position: relative;
}

.app-header::before {
  content: "";
  display: block;
  height: 4px;
  background: linear-gradient(90deg, #5b21b6 0 35%, #0f766e 35% 63%, #e11d48 63% 82%, #f59e0b 82% 100%);
}

.brand-tile {
  display: grid;
  width: 46px;
  height: 46px;
  flex: 0 0 46px;
  place-items: center;
  border-radius: 8px;
  background: #4c1d95;
  box-shadow: inset 0 -5px 0 rgba(0, 0, 0, 0.12), 0 6px 16px rgba(76, 29, 149, 0.18);
  color: white;
  font-size: 24px;
  font-weight: 900;
}

.metric-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-height: 26px;
  border: 1px solid;
  border-radius: 999px;
  padding: 3px 9px;
  white-space: nowrap;
}

.metric-chip-violet { border-color: #ddd6fe; background: #f5f3ff; color: #5b21b6; }
.metric-chip-sky { border-color: #bae6fd; background: #f0f9ff; color: #075985; }
.metric-chip-green { border-color: #a7f3d0; background: #ecfdf5; color: #047857; }
.metric-chip-orange { border-color: #fed7aa; background: #fff7ed; color: #c2410c; }

.app-secondary-button {
  min-height: 38px;
  border: 1px solid #ddd6fe;
  border-radius: 7px;
  background: #fff;
  padding: 7px 12px;
  color: #5b21b6;
  font-size: 14px;
  font-weight: 600;
  transition: background-color 150ms ease, border-color 150ms ease, box-shadow 150ms ease;
}

.app-secondary-button:hover {
  border-color: #a78bfa;
  background: #f5f3ff;
  box-shadow: 0 3px 10px rgba(76, 29, 149, 0.08);
}

.app-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  border: 1px solid #e9e5f5;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.96);
  padding: 6px;
  box-shadow: 0 3px 14px rgba(76, 29, 149, 0.06);
}

.app-nav-item {
  position: relative;
  display: inline-flex;
  min-height: 40px;
  align-items: center;
  gap: 7px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  padding: 8px 11px;
  color: #5b21b6;
  font-size: 13px;
  font-weight: 650;
  white-space: nowrap;
  transition: color 150ms ease, background-color 150ms ease, border-color 150ms ease, box-shadow 150ms ease;
}

.app-nav-item > span {
  display: grid;
  width: 22px;
  height: 22px;
  place-items: center;
  border-radius: 5px;
  background: #f5f3ff;
  font-size: 13px;
}

.app-nav-item:hover {
  border-color: #ddd6fe;
  background: #faf9ff;
  color: #3b0764;
}

.app-nav-item.is-active {
  border-color: #5b21b6;
  background: #5b21b6;
  box-shadow: 0 4px 10px rgba(91, 33, 182, 0.2);
  color: #fff;
}

.app-nav-item.is-active > span {
  background: rgba(255, 255, 255, 0.16);
}

.nav-count {
  display: grid;
  min-width: 20px;
  height: 20px;
  place-items: center;
  border-radius: 999px;
  background: #f97316;
  padding: 0 5px;
  color: white;
  font-size: 10px;
}

@media (max-width: 720px) {
  .app-nav {
    flex-wrap: nowrap;
    overflow-x: auto;
    overscroll-behavior-x: contain;
    scrollbar-width: thin;
  }

  .app-nav-item {
    flex: 0 0 auto;
  }
}
