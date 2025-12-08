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

  // Get all unique sources with their indices
  const allSources = objectivesArray?.flatMap(obj => obj?.sources || []);
  const uniqueSourceIds = [...new Set(allSources?.map(source => source.source_id))];

  
  // Create a map of source_id to source number
  const sourceIdToNumber = {};
  uniqueSourceIds.forEach((sourceId, idx) => {
    sourceIdToNumber[sourceId] = idx + 1;
  });

  objectivesArray.forEach((item, index) => {
    const sources = item?.sources || [];

    if (sources.length === 0) {
      return;
    }


    sources.forEach(source => {
      const organization = source?.organization?.name;
      
      if (!organization) {
        return;
      }

      if (!result[organization]) {
        result[organization] = [];
      }

      const sourceNumber = sourceIdToNumber[source.source_id];

      // Check if this source_id already exists in this organization
      const existingEntryIndex = result[organization].findIndex(
        entry => entry.currentSource?.source_id === source.source_id
      );

      if (existingEntryIndex !== -1) {
        // Source already exists, merge the chunks arrays
        const existingEntry = result[organization][existingEntryIndex];
        
        // Ensure chunks array exists
        if (!existingEntry.chunks) {
          existingEntry.chunks = existingEntry.currentSource?.chunks || [];
        }
        
        // Add new chunks from this source if they don't already exist
        const newChunks = source?.chunks || [];
        newChunks.forEach(newChunk => {

            existingEntry.chunks.push(newChunk);
          
        });
        return;
      }

      // New source, create new entry
      result[organization].push({
        ...item,
        reference: `Reference ${sourceNumber}`,
        organization: organization,
        currentSource: source, 
        chunks: source?.chunks || [],
      });
    });

  });


  return result;
};



/**
 * Transforms action list sources by grouping them by organization and source_id across all plans
 * @param {Array} action_list - Array of action plans with steps and sources
 * @returns {Object} Object with organization names as keys and arrays of unique sources as values
 */
export const transformActionListSources = (action_list = []) => {
  if (!Array.isArray(action_list) || action_list.length === 0) {
    return {};
  }

  const result = {};

  // Collect all sources from all plans and steps
  const allSources = action_list.flatMap(plan => 
    plan?.actionSteps?.flatMap(step => step?.sources || []) || []
  );

  // Get unique source IDs and create mapping to source numbers
  const uniqueSourceIds = [...new Set(allSources?.map(source => source.source_id))];
  const sourceIdToNumber = {};
  uniqueSourceIds.forEach((sourceId, idx) => {
    sourceIdToNumber[sourceId] = idx + 1;
  });

  action_list.forEach(plan => {
    const actionSteps = plan?.actionSteps || [];

    actionSteps.forEach(step => {
      const sources = step?.sources || [];

      sources.forEach(source => {
        const organization = source?.organization?.name;

        if (!organization) {
          return;
        }

        if (!result[organization]) {
          result[organization] = [];
        }

        const sourceNumber = sourceIdToNumber[source.source_id];

        // Check if this source_id already exists in this organization
        const existingEntryIndex = result[organization].findIndex(
          entry => entry.currentSource?.source_id === source.source_id
        );

        if (existingEntryIndex !== -1) {
          // Source already exists, merge the chunks arrays
          const existingEntry = result[organization][existingEntryIndex];

          if (!existingEntry.chunksList) {
            existingEntry.chunksList = existingEntry.currentSource?.chunks || [];
          }

          // Add new chunks from this source
          const newChunks = source?.chunks || [];
          newChunks.forEach(newChunk => {
            existingEntry.chunksList.push(newChunk);
          });
          return;
        }

        // New source, create new entry
        result[organization].push({
          reference: `Reference ${sourceNumber}`,
          organization: organization,
          currentSource: source,
          chunks: source?.chunks || [], 
        });
      });
    });
  });

  return result;
}