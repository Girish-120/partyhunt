import { DocumentReference } from "@google-cloud/firestore";
export async function asyncForEach(
  array: any,
  callback: (arg0: any, arg1: number, arg2: any) => any
) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

export function CheckEmail(email: string) {
  const emailRegex = new RegExp(
    /^[A-Za-z0-9_!#$%&'*+\/=?`{|}~^.-]+@[A-Za-z0-9.-]+$/,
    "gm"
  );
  const isValidEmail = emailRegex.test(email);
  return isValidEmail;
}

export function Listdifference(list1: string[], list2: string[]): string[] {
  const set2 = new Set(list2);
  return list1.filter((item) => !set2.has(item));
}

export function toTileCase(text: string) {
  let returnText = text;
  if (text !== undefined && text !== "") {
    returnText = text
      .split(" ")
      .map((w) => w[0].toUpperCase() + w.substring(1).toLowerCase())
      .join(" ");
  }
  return text;
}
export function unionDocumentReferences(
  arr1: DocumentReference[],
  arr2: DocumentReference[]
) {
  const merged = arr1.concat(
    arr2.filter((ref) => !arr1.some((r) => r.path === ref.path))
  );
  return merged;
}

export function splitIntoChunk(arr: any[], chunk: number) {
  const chunkArray = [];
  while (arr.length > 0) {
    const tempArray = arr.splice(0, chunk);
    chunkArray.push(tempArray);
  }
  return chunkArray;
}


