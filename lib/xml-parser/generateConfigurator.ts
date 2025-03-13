import { Connection } from "../types/types";

type Card = {
    id: number,
    name: string,
    ref: number,
    leftElements: {
        id: string,
        name: string,
    }[],
    rightElements: {
        id: string,
        name: string
    }[]
}

export function generateConfigurator(cards: Card[]) {
  const configurator = {
    cards: {} as Record<string, string>, // To store raw JSON strings of connections
    paths: {} as Record<
      string,
      Record<string, { value: string; attributeOf?: string }>
    >, // To map left-side names to right-side objects
  };

  // Iterate over sessionStorage keys
  for (const key in sessionStorage) {
    if (key.startsWith('connection-card-')) {
      // Retrieve and parse the connections
      const connectionsJSON = sessionStorage.getItem(key);
      if (!connectionsJSON) continue;

      let connections: Connection[];
      try {
        connections = JSON.parse(connectionsJSON);
        if (!Array.isArray(connections) || !connections.every(validateConnection)) {
          console.warn(`Invalid connections for ${key}:`, connectionsJSON);
          continue;
        }
      } catch (e) {
        console.error(`Failed to parse connections for ${key}:`, connectionsJSON);
        continue;
      }

      // Store the raw JSON string in the cards section
      configurator.cards[key] = connectionsJSON;

      // Extract card ID from the key
      const cardId = parseInt(key.split('-').pop() || '', 10);
      const card = cards.find((card) => card.id === cardId);
      if (!card) continue;

      // Initialize paths for the current card name
      const cardName = card.name;
      configurator.paths[cardName] = configurator.paths[cardName] || {};

      // Map left-side element names to the desired structure
      connections.forEach((connection) => {
        const leftElement = card.leftElements.find((el) => el.id === connection.start);
        const rightElement = card.rightElements.find((el) => el.id === connection.end);

        if (leftElement && rightElement) {
          // Check if the right element ID ends with "-attribute"
          if (rightElement.id.endsWith('-attribute')) {
            const [attributeOf, value] = rightElement.name.split('-', 2); // Split by the first "-"
            configurator.paths[cardName][leftElement.name.toLowerCase().replace(" ", "_")] = {
              value: value || '',
              attributeOf: attributeOf || '',
            };
          } else {
            // For non-attribute elements, just assign the value
            configurator.paths[cardName][leftElement.name.toLowerCase().replace(" ", "_")] = {
              value: rightElement.name,
            };
          }
        }
      });
    }
  }

  console.log(configurator)

  return configurator;

  // Helper to validate a connection object
  function validateConnection(connection: any): connection is Connection {
    return (
      typeof connection === 'object' &&
      connection !== null &&
      typeof connection.start === 'string' &&
      typeof connection.end === 'string' &&
      typeof connection.color === 'string'
    );
  }
}
