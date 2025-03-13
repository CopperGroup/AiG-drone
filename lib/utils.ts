import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { CategoriesParams, FilterType, ProductType, TypeScriptPrimitiveTypes } from "./types/types";


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDateString(dateString: string) {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  const date = new Date(dateString);
  const formattedDate = date.toLocaleDateString(undefined, options);

  const time = date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  return `${time} - ${formattedDate}`;
}

export function totalProducts(products : { 
  product: {
      id: string;
      images: string[];
      name: string;
      priceToShow: number;
      price: number;
  }, 
  amount: number
} []) {
  let total = 0;

  for(const product of products){
      total += 1 * product.amount
  }

  return total;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function replaceDescription(str: string) {
  const decodedStr = str
    .replace(/&amp;lt;/g, '<')
    .replace(/&amp;gt;/g, '>')
    .replace(/&amp;quot;/g, '"')
    .replace(/&amp;amp;/g, '&')
    .replace(/&amp;#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&copy;/g, '©')
    .replace(/&reg;/g, '®')
    .replace(/&euro;/g, '€')
    .replace(/&pound;/g, '£')
    .replace(/&yen;/g, '¥')
    .replace(/&cent;/g, '¢')
    .replace(/&bull;/g, '•')
    .replace(/&hellip;/g, '…')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–');
  
  const plainText = decodedStr.replace(/<\/?[^>]+(>|$)/g, '');
  
  return plainText.trim();
}

export function capitalize(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

export function isArrayOf<T>(value: unknown, type: typeof TypeScriptPrimitiveTypes[number]): value is T[]{
  return Array.isArray(value) && value.every(item => typeof item === type)
}

export function replace<T extends string | string[]>(item: T, replacable: string, replaceWith: string): T extends string[] ? string[] : string {
  if(isArrayOf<string>(item, "string")) {
    return item.map((subItem) => subItem.replace(replacable, replaceWith)) as T extends string[] ? string[] : string
  } else {
    return item.replace(replacable, replaceWith) as T extends string[] ? string[] : string
  }
}

export function createSearchString({
  pNumber,
  sort,
  categories,
  search,
  vendors,
  selectParamsValues,
  unitParamsValues,
  price,
  category,
  minPrice,
  maxPrice,
}: {
  pNumber: string;
  sort: string;
  categories: string[],
  search: string;
  vendors: string[];
  selectParamsValues: string[],
  unitParamsValues: string[],
  price: [number, number];
  category: string,
  minPrice: number;
  maxPrice: number;
}) {
  const queryObject: Record<string, string> = {
    page: pNumber,
  };

  if (sort !== '') queryObject.sort = sort;
  if (categories.length > 0) queryObject.categories = categories.join(",");
  if (search) queryObject.search = search;
  if (vendors.length > 0) queryObject.vendor = vendors.join(',');
  if (selectParamsValues.length > 0) queryObject.selectParams = selectParamsValues.join(',');
  if (unitParamsValues.length > 0) queryObject.unitParams = unitParamsValues.join(',');

  if (price[0] !== minPrice || price[1] !== maxPrice) {
    queryObject.minPrice = price[0].toString();
    queryObject.maxPrice = price[1].toString();
  }

  return new URLSearchParams(queryObject).toString();
}

export function getKeyValuePairs<T, K extends keyof T, V extends keyof T>(list: T[], keyProp: K, valueProp: V): Record<string, string> {
  return list.reduce((acc, item) => {
    const key = String(item[keyProp]); // Convert the key to a string
    const value = String(item[valueProp]);
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);
}


export function getFiltredProducts(products: ProductType[], searchParams: { [key: string]: string }) {
  const { 
    search, maxPrice, minPrice, 
    categories, vendor, selectParams,
    unitParams
  } = searchParams;

  const selectParamsValues = searchParams.selectParams ? selectParams.split(",") : []
  const unitParamsValues = searchParams.unitParams ? unitParams.split(",") : []

  const paramNamesSet = new Set<string>();
  const unitParamNamesSet = new Set<string>();

  // Step 1: Loop through selectParamsValues and extract param names
  selectParamsValues.forEach((entry) => {
    const [paramName] = entry.split("--");
    if (paramName) {
      paramNamesSet.add(paramName); // Add param name to the set
    }
  });

  unitParamsValues.forEach((entry) => {
    const [paramName] = entry.split("--");
    if (paramName) {
      unitParamNamesSet.add(paramName); // Add param name to the set
    }
  });


  console.log(paramNamesSet, unitParamNamesSet)
  console.log(selectParamsValues, unitParamsValues) 

  
  return products.filter(product => {

    const matchesSearch = search ? product.name.toLowerCase().includes(search.toLowerCase()) : true;
    const matchesPrice = (minPrice || maxPrice) ? product.priceToShow >= parseFloat(minPrice || '0') && product.priceToShow <= parseFloat(maxPrice || 'Infinity') : true;
    const matchesVendor = vendor ? vendor.includes(product.vendor) : true;

    let matchesSelectParams = selectParamsValues.length === 0; // If no filters are applied, everything matches.

    if (!matchesSelectParams) {
      matchesSelectParams = true;
      for (const paramEntry of selectParamsValues) {
        
        const [paramName, valuesString] = paramEntry.split("--");
        if (!valuesString) {
          matchesSelectParams = false;
          break;
        }
    
        const valuesSet = new Set(valuesString.split("__"));
        const productParam = product.params.find((param) => param.name === paramName);
    
        if (!productParam || !valuesSet.has(productParam.value)) {
          matchesSelectParams = false;
          break; // Stop checking further if one condition fails
        }
      }
    }
    
    let matchesUnitParams = unitParamsValues.length === 0; // If no filters are applied, everything matches.

    if (!matchesUnitParams) {
      matchesUnitParams = true;
      for (const paramEntry of unitParamsValues) {
        
        const [paramName, valuesString] = paramEntry.split("--");
        if (!valuesString) {
          matchesUnitParams = false;
          break;
        }
    
        const [min, max] = new Set(valuesString.split("m"));
        console.log(min, max);
        
        const productParam = product.params.find((param) => param.name === paramName);
    
        if (!productParam || isNaN(parseFloat(extractNumber(productParam.value) || ""))) {
          matchesUnitParams = false;
          break; // Stop checking further if one condition fails
        }

        if(parseFloat(extractNumber(productParam.value) || '0') < parseFloat(min) || parseFloat(extractNumber(productParam.value) || '0') > parseFloat(max)) {
          matchesUnitParams = false;
          break; // Stop checking further if one condition fails
        }
      }
    }

    return (
      matchesSearch &&
      matchesPrice &&
      matchesVendor &&
      matchesSelectParams &&
      matchesUnitParams
    );
  });
}

function countByKey<T>(
  list: T[],
  keyExtractor: (item: T) => string | undefined,
  initialKey: string = ""
): { [key: string]: number } {
  return list.reduce((acc, item) => {
    const key = keyExtractor(item);
    if (key) {
      acc[key] = (acc[key] || 0) + 1;
    }
    return acc;
  }, { [initialKey]: list.length });
}

export function getCounts(filtredProducts: ProductType[]) {
  return {
      categoriesCount: countByKey(filtredProducts, product => product.category),
      vendorsCount: countByKey(filtredProducts, product => product.vendor),
  };
}

export function removeAllButOne(inputString: string, charToKeep: string) {
  let firstOccurrence = false;
  return inputString
    .split('')
    .filter((char) => {
      if (char === charToKeep && !firstOccurrence) {
        firstOccurrence = true;
        return true;
      }
      return char !== charToKeep;
    })
    .join('');
}

export function removeExtraLeadingCharacters(input: string, char: string): string {
  // Validate input
  if (typeof input !== "string" || typeof char !== "string") {
    throw new Error("Invalid input: both arguments must be strings");
  }

  if (char.length !== 1) {
    throw new Error("Invalid input: 'char' must be a single character");
  }

  // If the string does not start with the specified character, return it as is
  if (!input.startsWith(char)) {
    return input;
  }

  // Find the first character that is different from the specified character
  let firstDifferentIndex = 0;
  while (input[firstDifferentIndex] === char) {
    firstDifferentIndex++;
  }

  // Ensure only one leading occurrence of the character remains
  return char + input.slice(firstDifferentIndex);
}

type GetElementDataConfig = {
  parent: Element;
  value: string;
  attributeOf?: string;
  many?: boolean;
};

export function getElementData(config: GetElementDataConfig): Element | Element[] | string | string[] | null {
  const { parent, value, attributeOf, many } = config;

  if (attributeOf) {
    // If `attributeOf` matches the parent's tag name, fetch the parent's attribute
    if (attributeOf === parent.tagName) {
      return parent.getAttribute(value); // Return the attribute value of the parent
    } else {
      // Otherwise, fetch child elements based on `attributeOf`
      const elements = Array.from(parent.getElementsByTagName(attributeOf));
      if (value === "Content") {
        if (!many) {
          return elements[0]?.textContent?.trim() || null; // Single element's textContent
        }
        return elements.map((el) => el.textContent?.trim() || "").filter(Boolean); // All matching textContent
      } else {
        if (!many) {
          return elements[0]?.getAttribute(value) || null; // Single element's attribute
        }
        return elements.map((el) => el.getAttribute(value)).filter(Boolean) as string[]; // All matching attributes
      }
    }
  } else {
    // No `attributeOf`, fetch child elements based on `value`
    const elements = Array.from(parent.getElementsByTagName(value));
    if (value === "Content") {
      
      return parent?.textContent?.trim() || null; // Single element's textContent
    } else {
      if (!many) {
        return elements[0] || null; // Single element
      }
      return elements; // All matching elements
    }
  }
}

export function getTopProductsBySales(products: ProductType[], topN = 3) {
  // Sort products by the length of their orderedBy array (descending)
  const sortedProducts = products
    .sort((a, b) => b.orderedBy.length - a.orderedBy.length)
    .slice(0, topN); // Take the top N products
  
  return sortedProducts;
}

export function generateLongPassword(length: number = 32, options?: { 
  uppercase?: boolean, 
  lowercase?: boolean, 
  numbers?: boolean, 
  symbols?: boolean 
}): string {
  
  const defaultOptions = { uppercase: true, lowercase: true, numbers: true, symbols: true };
  const finalOptions = { ...defaultOptions, ...options };

  const charSets = {
      uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      lowercase: "abcdefghijklmnopqrstuvwxyz",
      numbers: "0123456789",
      symbols: "!@#$%^&*()-_=+[]{}|;:,.<>?/~"
  };

  let validChars = "";
  if (finalOptions.uppercase) validChars += charSets.uppercase;
  if (finalOptions.lowercase) validChars += charSets.lowercase;
  if (finalOptions.numbers) validChars += charSets.numbers;
  if (finalOptions.symbols) validChars += charSets.symbols;

  if (!validChars) throw new Error("At least one character type must be enabled!");

  let password = "";
  for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * validChars.length);
      password += validChars[randomIndex];
  }

  return password;
}


export function mergeFilterAndCategories(filter: FilterType, categories: CategoriesParams): CategoriesParams {
  const mergedCategories: CategoriesParams = {};

  Object.entries(categories).forEach(([categoryId, categoryData]) => {
    // Find matching category in filter using categoryId from schema
    const filterCategory = filter.categories.find(cat => cat.categoryId.toString() === categoryId);

    // Merge params
    const mergedParams = categoryData.params.map(param => {
      // Check if param exists in the filter
      const activeParam = filterCategory?.params.find(fp => fp.name === param.name);

      return {
        name: param.name,
        totalProducts: param.totalProducts,
        type: activeParam ? activeParam.type : "", // Use active type if available, else set empty
      };
    });

    // Construct merged category data
    mergedCategories[categoryId] = {
      name: categoryData.name,
      totalProducts: categoryData.totalProducts,
      params: mergedParams,
    };
  });

  return mergedCategories;
}

export function extractNumber(input: string): string | null {
  const matches = input.match(/\d+[\.,]?\d*/g); // Match integers and decimals with optional comma/period
  if (!matches) return null;

  return matches.reduce((longest, current) =>
    current.replace(/,/g, ".").length > longest.replace(/,/g, ".").length ? current : longest
  );
}

export function processProductParams(
  products: { params: { name: string; value: string }[] }[],
  unitParams: Record<string, { totalProducts: number; type: string; min: number; max: number }>,
  selectParams: Record<string, { totalProducts: number; type: string; values: { value: string; valueTotalProducts: number }[] }>
) {
  const unitValues: Record<string, number[]> = {}; // Collects all values for unit params
  const valueCounts: Record<string, Record<string, number>> = {}; // Tracks occurrences of each value for selectParams

  products.forEach((product) => {
    product.params.forEach(({ name, value }) => {
      if (unitParams[name]) {
        // Extract the numeric value
        const num = parseFloat(extractNumber(value)?.replace(",", ".") || "NaN");
        if (!isNaN(num)) {
          if (!unitValues[name]) {
            unitValues[name] = [];
          }
          unitValues[name].push(num);
        }
      }

      if (selectParams[name]) {
        // Initialize valueCounts for this param if not present
        if (!valueCounts[name]) {
          valueCounts[name] = {};
        }

        // Increment count of this value
        valueCounts[name][value] = (valueCounts[name][value] || 0) + 1;
      }
    });
  });

  // Update min/max for unit parameters
  Object.keys(unitValues).forEach((name) => {
    unitParams[name].min = Math.min(...unitValues[name]);
    unitParams[name].max = Math.max(...unitValues[name]);
  });

  // Convert value counts to the required format and update selectParams
  Object.keys(valueCounts).forEach((name) => {
    selectParams[name].values = Object.entries(valueCounts[name]).map(([value, count]) => ({
      value,
      valueTotalProducts: count,
    }));
  });
}


export function generateUniqueId() {
  const randomPart = Math.floor(1000 + Math.random() * 9000).toString();
  const timestampPart = Date.now().toString().slice(-4); 
  return randomPart + timestampPart;
}

export function filterProductsByKey<T extends keyof ProductType>(
  products: ProductType[],
  key: T,
  splitChar?: string,
  index?: number
): ProductType[] {
  const seenValues = new Set<string>();

  return products.filter((product) => {
    const keyValue = product[key];

    if (typeof keyValue !== "string") {
      return true; // Skip filtering if the key value is not a string
    }

    let valueToCompare: string = keyValue;

    if (splitChar && index !== undefined) {
      const splitParts = keyValue.split(splitChar);
      valueToCompare = splitParts[index === -1 ? splitParts.length - 1 : index] ?? keyValue;
    }

    if (!seenValues.has(valueToCompare)) {
      seenValues.add(valueToCompare);
      return true; // Keep the first product with this value
    }

    return false; // Skip duplicates
  });
}

export function pretifyProductName(productName: string, params: { name: string, value: string }[], articleNumber: string): string {
  let cleanedName = productName;

  // Split the product name into words and exclude the first two words
  const words = cleanedName.split(' ');
  const wordsToCheck = words.slice(2).join(' '); // Skip the first two words

  // Remove article number from the product name (ignoring the first two words)
  const articleNumberRegex = new RegExp(articleNumber, 'i');
  cleanedName = cleanedName.replace(articleNumberRegex, '').trim();

  // Iterate over the params and remove matching parts from the name (ignoring the first two words)
  params.forEach((param) => {
    const paramValueRegex = new RegExp(param.value, 'i'); // Create a case-insensitive regex for each param value
    // Only remove if the param value is found in the part of the name excluding the first two words
    if (wordsToCheck.match(paramValueRegex)) {
      cleanedName = cleanedName.replace(paramValueRegex, '').trim(); // Remove param value from the name
    }
  });

  return cleanedName;
}


export function formatStringWithDate(input: string) {
  const now = new Date();
  const formattedDate = `${now.getFullYear()}_${String(now.getMonth() + 1).padStart(2, "0")}_${String(now.getDate()).padStart(2, "0")}`;
  const cleanedString = input.replace(/[^a-zA-Z0-9]/g, "");
  return `${cleanedString}_${formattedDate}`;
}

export function normalizeRepoName(name: string): string {
  const cyrillicToLatinMap: { [key: string]: string } = {
      'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'H', 'Д': 'D', 'Е': 'E', 'Є': 'Ye', 'Ж': 'Zh',
      'З': 'Z', 'И': 'Y', 'І': 'I', 'Ї': 'Yi', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M',
      'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F',
      'Х': 'Kh', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shch', 'Ь': '', 'Ю': 'Yu', 'Я': 'Ya',
      'а': 'a', 'б': 'b', 'в': 'v', 'г': 'h', 'д': 'd', 'е': 'e', 'є': 'ye', 'ж': 'zh',
      'з': 'z', 'и': 'y', 'і': 'i', 'ї': 'yi', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
      'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f',
      'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ь': '', 'ю': 'yu', 'я': 'ya'
  };

  const converted = name.split('').map(char => cyrillicToLatinMap[char] || char).join('');

  // Replace restricted characters with "-"
  const cleaned = converted.replace(/[^a-zA-Z0-9-_]/g, '-');

  // Replace multiple dashes with a single dash
  const finalName = cleaned.replace(/-+/g, '-').replace(/^-|-$/g, '');

  return finalName;
}
