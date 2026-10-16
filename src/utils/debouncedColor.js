const _colorTimers = {};

export const debouncedColor = (key, value, setter) => {
  clearTimeout(_colorTimers[key]);
  _colorTimers[key] = setTimeout(() => setter(p => ({ ...p, [key]: value })), 80);
};
