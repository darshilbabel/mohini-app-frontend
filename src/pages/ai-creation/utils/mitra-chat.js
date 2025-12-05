/**
 * Transforms an array of objectives with source information into an object grouped by organization
 * @param {Array} objectivesArray - Array of objects with text and source properties
 * @returns {Object} Object with organization names as keys and arrays of objectives as values
 */
export const transformSource = (objectivesArray = []) => {
  console.log("******", objectivesArray)
  if (!Array.isArray(objectivesArray) || objectivesArray.length === 0) {
    return {};
  }

  const result = {};

  objectivesArray.forEach((item, index) => {
    // Get organization from source, default to empty string if not present
    const organizationList = item?.sources?.map(source => source.organization?.name);

    // Skip if organization is missing or empty
    if (!organizationList || organizationList?.length === 0) {
      return;
    }

    organizationList.forEach(organization => {
      if (!result[organization]) {
        result[organization] = [];
      }

      result[organization].push({
        ...item,
        reference: `Reference ${index + 1}`,
        organization: organization,
      });
    });
    // // Initialize array for this organization if it doesn't exist
    // if (!result[organization]) {
    //   result[organization] = [];
    // }

    // // Add the item with organization property at the top level
    // result[organization].push({
    //   ...item,
    //   reference: `Reference ${index + 1}`,
    //   organization: organization,
    // });
  });

  console.log({result})

  return result;
};

