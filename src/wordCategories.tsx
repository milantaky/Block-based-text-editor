export const ears = {
  keywords: {
    color: "#C586C0", // Keywords - purple
    type: 1,
    prefab: true,
    items: new Set(["while", "when", "where", "if", "shall", "then"]),
  },
  relationalOperators: {
    color: "#D4D4D4", // Operators / misc - light gray
    type: 2,
    prefab: false,
    items: new Set([
      "is",
      "and",
      "set",
      "to",
      "within",
      "equals",
      "greater than",
      "less than",
      "for",
      "has been",
    ]),
  },
  objects: {
    color: "#9CDCFE", // Variables / objects - light blue
    type: 3,
    prefab: true,
    items: new Set([]),
  },
  states: {
    color: "#CE9178", // States / strings - orange-brown
    type: 4,
    prefab: true,
    items: new Set([]),
  },
  actors: {
    color: "#4EC9B0", // Identifiers / types - teal
    type: 5,
    prefab: true,
    items: new Set([]),
  },
  other: {
    color: "#808080", // Misc / punctuation - gray
    type: 0,
    prefab: false,
    items: new Set([",", ".", "the", "second", "seconds"]),
  },
};

export const earsTest = {
  keywords: {
    color: "#C586C0",
    type: 1,
    prefab: true,
    items: new Set(["while", "when", "where", "if", "shall", "then"]),
  },
  relationalOperators: {
    color: "#D4D4D4",
    type: 2,
    prefab: false,
    items: new Set([
      "is",
      "and",
      "set",
      "to",
      "within",
      "has been",
      "for",
      "greater than",
    ]),
  },
  objects: {
    color: "#9CDCFE",
    type: 3,
    prefab: true,
    items: new Set([
      "left gear state",
      "aircraft speed",
      "aircraft status",
      "operational mode",
      "left gear visual warning",
      "left gear warning lamp",
    ]),
  },
  states: {
    color: "#CE9178",
    type: 4,
    prefab: true,
    items: new Set([
      "becomes hazardous",
      "stops being hazardous",
      "active",
      "inactive",
      "on",
      "off",
      "in air",
      "on land",
      "up and locked",
    ]),
  },
  actors: {
    color: "#4EC9B0",
    type: 5,
    prefab: true,
    items: new Set(["LGS Warning System"]),
  },
  other: {
    color: "#808080",
    type: 0,
    prefab: false,
    items: new Set([",", ".", "the", "second", "seconds", "previous"]),
  },
};
