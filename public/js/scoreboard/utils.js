// /public/js/scoreboard/utils.js
export const byId = (id) => document.getElementById(id);

export function setAppHeight(){
  const apply = () => document.documentElement.style.setProperty('--app-h', `${window.innerHeight}px`);
  apply();
  window.addEventListener('resize', apply);
  window.addEventListener('orientationchange', apply);
}

export function onFullscreenToggle(cb){
  document.addEventListener('fullscreenchange', cb);
}
