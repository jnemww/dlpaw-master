
export function isObjectEmpty(obj) {
    return (Object.keys(obj).length === 0 &&
        Object.getOwnPropertySymbols(obj).length === 0 &&
        obj.constructor === Object);
  }

export function storageAvailable(type) {
    let storage;
    try {
      storage = window[type];
      const x = "__storage_test__";
      storage.setItem(x, x);
      storage.removeItem(x);
      return true;
    } catch (e) {
      return (
        e instanceof DOMException &&
        // everything except Firefox
        (//e.code === 22 ||
          // Firefox
          //e.code === 1014 ||
          // test name field too, because code might not be present
          // everything except Firefox
          e.name === "QuotaExceededError" ||
          // Firefox
          e.name === "NS_ERROR_DOM_QUOTA_REACHED") &&
        // acknowledge QuotaExceededError only if there's something already stored
        storage &&
        storage.length !== 0
      );
    }
  }

export function permute(nums) {
	let result = [];
	if (nums.length === 0) return [];
	if (nums.length === 1) return [nums];
	for (let i = 0; i < nums.length; i++) {
    	const currentNum = nums[i];
      const remainingNums = nums.slice(0, i).concat(nums.slice(i + 1));
    	const remainingNumsPermuted = permute(remainingNums);
    	for (let j = 0; j < remainingNumsPermuted.length; j++) {
    		const permutedArray = [currentNum].concat(remainingNumsPermuted[j]);
    		result.push(permutedArray);
    	}
  }
  return result;
}
