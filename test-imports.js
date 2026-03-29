// Test file to verify imports work correctly
import { DataManagerNew } from './utils/DataManagerNew';
import StatisticsService from './services/StatisticsService';

console.log('DataManagerNew imported successfully:', !!DataManagerNew);
console.log('StatisticsService imported successfully:', !!StatisticsService);

export { DataManagerNew, StatisticsService };