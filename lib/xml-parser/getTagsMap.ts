import { DOMParser } from "xmldom";

export default async function getTagsMap(xmlString: string) {
  if (!xmlString) {
    console.log("No XML data found");
    return {};
  }

  const xmlDocument = new DOMParser().parseFromString(xmlString, "text/xml");

  // Map to hold the tag names and their descendants and attributes
  const tagDescendantsMap: Record<string, { tags: Set<string>; attributes: Set<string> }> = {};

  const collectDescendants = (node: Node, parentTag: string | null = null) => {
    if (node.nodeType === 1) {
      // Check if the node is an element
      const elementNode = node as Element; // Cast to Element to access attributes
      const tagName = elementNode.nodeName;

      // Initialize the entry for the tag if it doesn't exist
      if (!tagDescendantsMap[tagName]) {
        tagDescendantsMap[tagName] = { tags: new Set(), attributes: new Set() };
      }

      // Collect attributes of the current tag (if the node is an element)
      if (elementNode.attributes) {
        for (let i = 0; i < elementNode.attributes.length; i++) {
          tagDescendantsMap[tagName].attributes.add(elementNode.attributes[i].nodeName);
        }
      }

      // Collect the parent tag's descendants
      if (parentTag) {
        tagDescendantsMap[parentTag].tags.add(tagName);
      }

      // Recursively process child nodes
      if (node.childNodes) {
        for (let i = 0; i < node.childNodes.length; i++) {
          collectDescendants(node.childNodes[i], tagName);

          const childTag = node.childNodes[i].nodeName;
          if (tagDescendantsMap[childTag]) {
            for (const descendant of tagDescendantsMap[childTag].tags) {
              tagDescendantsMap[tagName].tags.add(descendant);
            }
          }
        }
      }
    }
  };

  collectDescendants(xmlDocument.documentElement);

  // Convert Set to Array for both tags and attributes and ensure "Content" is added for empty tags
  const result = Object.fromEntries(
    Object.entries(tagDescendantsMap).map(([tag, { tags, attributes }]) => [
      tag,
      {
        tags: tags.size === 0 ? ["Content"] : Array.from(tags), // Add "Content" if the tags set is empty
        attributes: Array.from(attributes)
      }
    ])
  );

//   console.log(result);
  return result;
}
