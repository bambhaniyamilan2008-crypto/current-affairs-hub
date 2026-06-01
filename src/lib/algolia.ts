// src/lib/algolia.ts
import algoliasearch from 'algoliasearch/lite';

const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || 'your_algolia_app_id';
const searchKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY || 'your_algolia_search_key';

export const searchClient = algoliasearch(appId, searchKey);

// Define your index names (You'll create these in Algolia dashboard)
export const INDICES = {
  ARTICLES: 'articles_index',
  USERS: 'users_index',
  CHANNELS: 'channels_index',
};