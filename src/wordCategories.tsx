export const ears = {
  keywords: {
    color: "#FFB400",
    type: 1,
    items: new Set(["while", "when", "where", "if", "shall", "then"]),
  },
  relationalOperators: {
    color: "#FF6B6B",
    type: 2,
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
    color: "#4ECDC4",
    type: 3,
    items: new Set([]),
  },
  states: {
    color: "#1A535C",
    type: 4,
    items: new Set([]),
  },
  actors: {
    color: "#F7FFF7",
    type: 5,
    items: new Set([]),
  },
  other: {
    color: "#A9A9A9",
    type: 0,
    items: new Set([",", ".", "the", "second", "seconds"]),
  },
};

export const earsTest = {
  keywords: {
    color: "#FFB400",
    type: 1,
    items: new Set(["while", "when", "where", "if", "shall", "then"]),
  },
  relationalOperators: {
    color: "#FF6B6B",
    type: 2,
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
    color: "#4ECDC4",
    type: 3,
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
    color: "#1A535C",
    type: 4,
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
    color: "#F7FFF7",
    type: 5,
    items: new Set(["LGS Warning System"]),
  },
  other: {
    color: "#A9A9A9",
    type: 0,
    items: new Set([",", ".", "the", "second", "seconds", "previous"]),
  },
};
