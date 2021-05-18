/**
 * Get a formatted string of the current date/time
 *
 * @return {string} The formatted date string
 */
export const getDate = () => {
  const currentdate = new Date();
  return `${currentdate.getMonth() +
    1}-${currentdate.getDate()}-${currentdate.getFullYear()}_${currentdate.getHours()}-${currentdate.getMinutes()}-${currentdate.getSeconds()}`;
};
