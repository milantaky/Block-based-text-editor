const ears = {
  keywords: {
    color: "#FFB400",
    items: ["while", "when", "where", "if", "shall", "then"],
  },
  relationalOperators: {
    color: "#FF6B6B",
    items: [
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
    ],
  },
  objects: {
    color: "#4ECDC4",
    items: [],
  },
  states: {
    color: "#1A535C",
    items: [],
  },
  actors: {
    color: "#F7FFF7",
    items: [],
  },
  other: {
    color: "#A9A9A9",
    items: [",", ".", "the", "second", "seconds"],
  },
};

const earsTest = {
  keywords: {
    color: "#FFB400",
    items: ["while", "then", "shall", "if"],
  },
  relationalOperators: {
    color: "#FF6B6B",
    items: [
      "is",
      "and",
      "set",
      "to",
      "within",
      "has been",
      "for",
      "greater than",
    ],
  },
  objects: {
    color: "#4ECDC4",
    items: [
      "left gear state",
      "aircraft speed",
      "aircraft status",
      "operational mode",
      "left gear visual warning",
      "left gear warning lamp",
    ],
  },
  states: {
    color: "#1A535C",
    items: [
      "becomes hazardous",
      "stops being hazardous",
      "active",
      "inactive",
      "on",
      "off",
      "in air",
      "on land",
      "up and locked",
    ],
  },
  actors: {
    color: "#F7FFF7",
    items: ["LGS Warning System"],
  },
  other: {
    color: "#A9A9A9",
    items: [",", ".", "the", "second", "seconds", "previous"],
  },
};


export const languages = [ears, earsTest];
