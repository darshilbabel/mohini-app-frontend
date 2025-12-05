/**
 * Transforms an array of objectives with source information into an object grouped by organization
 * @param {Array} objectivesArray - Array of objects with text and source properties
 * @returns {Object} Object with organization names as keys and arrays of objectives as values
 */
export const transformSource = (objectivesArray = []) => {
  if (!Array.isArray(objectivesArray) || objectivesArray.length === 0) {
    return {};
  }

  const result = {};

  objectivesArray.forEach((item, index) => {
    // Get organization from source, default to empty string if not present
    const organization = item?.source?.organization?.name || "";

    // Skip if organization is missing or empty
    if (!organization) {
      return;
    }

    // Initialize array for this organization if it doesn't exist
    if (!result[organization]) {
      result[organization] = [];
    }

    // Add the item with organization property at the top level
    result[organization].push({
      ...item,
      reference: `Reference ${index + 1}`,
      organization: organization,
    });
  });

  return result;
};

