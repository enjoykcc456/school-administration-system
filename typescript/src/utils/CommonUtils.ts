// Check if an object is empty
export const isEmpty = (obj: {}) => {
  return !obj || Object.keys(obj).length === 0;
};
