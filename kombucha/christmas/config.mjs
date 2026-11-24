// Public Timeweb API origin. No secret is stored in the game.
export const scoreOrigin = ['localhost','127.0.0.1','[::1]'].includes(location.hostname)
  ? ''
  : 'https://api.weirdflex.online/';
