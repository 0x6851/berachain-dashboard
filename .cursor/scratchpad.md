# Berachain Dashboard Improvements

## Background and Motivation
The Berachain Dashboard is a Next.js application that displays key metrics for BERA and BGT tokens. While the basic functionality is in place, there are several areas where we can improve the code quality, user experience, and maintainability of the application.

## Key Challenges and Analysis
1. Type Safety: Currently using `any` types which reduces type safety and IDE support
2. Error Handling: Basic error handling without proper user feedback
3. UX: No loading states or proper number formatting
4. Testing: No test coverage
5. Documentation: Limited documentation for setup and usage

## High-level Task Breakdown

### Phase 1: Type Safety and Error Handling
1. Create types directory and define interfaces
   - Success Criteria: All API response types defined and exported
   - Dependencies: None

2. Implement proper error handling
   - Success Criteria: Error states visible to users, retry functionality
   - Dependencies: Task 1

3. Add loading states
   - Success Criteria: Loading indicators for all data fetching operations
   - Dependencies: Task 1

### Phase 2: UI/UX Improvements
4. Implement number formatting
   - Success Criteria: All numbers properly formatted with appropriate precision
   - Dependencies: None

5. Add responsive design improvements
   - Success Criteria: Dashboard looks good on all screen sizes
   - Dependencies: None

6. Add tooltips and data explanations
   - Success Criteria: All metrics have helpful tooltips
   - Dependencies: None

### Phase 3: Performance and Testing
7. Implement data caching
   - Success Criteria: Reduced API calls, faster data loading
   - Dependencies: None

8. Add unit tests
   - Success Criteria: >80% test coverage for components
   - Dependencies: None

9. Add API integration tests
   - Success Criteria: All API routes tested
   - Dependencies: Task 8

### Phase 4: Documentation
10. Add JSDoc comments
    - Success Criteria: All components and functions documented
    - Dependencies: None

11. Update README
    - Success Criteria: Complete setup and usage instructions
    - Dependencies: None

## Project Status Board
- [x] Phase 1: Type Safety and Error Handling
  - [x] Task 1: Create types directory and define interfaces
  - [x] Task 2: Implement proper error handling
  - [x] Task 3: Add loading states
- [x] Phase 2: UI/UX Improvements
  - [x] Task 4: Implement number formatting
  - [x] Task 5: Add responsive design improvements
  - [x] Task 6: Add tooltips and data explanations
- [x] Phase 3: Performance and Testing
  - [x] Task 7: Implement data caching
  - [x] Task 8: Add unit tests
  - [x] Task 9: Add API integration tests
- [x] Phase 4: Documentation
  - [x] Task 10: Add JSDoc comments
  - [x] Task 11: Update README

## Executor's Feedback or Assistance Requests
We've completed Phase 1, Phase 2, and Tasks 7-8 of Phase 3 with the following improvements:
1. Created TypeScript interfaces for all API responses
2. Added proper error handling with retry functionality
3. Implemented loading states with skeleton UI
4. Added number formatting utilities with support for:
   - Compact notation (e.g., 1.2M instead of 1,200,000)
   - Currency formatting
   - Custom decimal places
   - Prefixes and suffixes
5. Enhanced responsive design with:
   - Dark mode support
   - Better spacing and layout on different screen sizes
   - Improved chart responsiveness
   - Hover effects and transitions
   - Better error and loading states
6. Added tooltips and explanations:
   - Created a reusable Tooltip component
   - Added detailed explanations for all metrics
   - Improved chart tooltips
   - Made tooltips accessible with keyboard navigation
7. Implemented data caching with React Query:
   - Automatic background refetching
   - Configurable stale time for each data type
   - Retry logic for failed requests
   - Optimistic updates
   - Better error handling
8. Added unit tests:
   - Set up Jest and Testing Library
   - Created tests for Tooltip component
   - Created tests for useDashboardData hook
   - Added test coverage reporting

Current Issues:
1. There's still a TypeScript error related to the JSX namespace that needs to be resolved
2. Consider adding a dark mode toggle
3. Task 9 (API integration tests) is complete. All API routes are now covered by integration tests, and the test suite passes with no errors. The environment and syntax issues were resolved by ensuring proper file extensions and adding necessary mocks in the Jest setup. Ready for Planner review and to proceed to Task 10 (Add JSDoc comments).

## Lessons
1. When working with TypeScript in Next.js, ensure proper type definitions are in place for JSX elements
2. Using Promise.all for parallel API requests improves performance
3. Adding loading states and error handling significantly improves user experience
4. Using Intl.NumberFormat provides better number formatting than manual string manipulation
5. Using Tailwind's responsive classes and dark mode utilities makes it easy to create a responsive and themeable UI
6. Tooltips should be accessible via both mouse and keyboard interactions
7. React Query provides powerful caching and state management features that significantly improve data fetching
8. Writing tests helps catch edge cases and ensures component reliability

## Plan: Integrate CoinGecko Supply Data

### Background and Motivation
- The current dashboard uses a placeholder supply source. We now have a reliable supply history from CoinGecko via the `/api/coingecko` endpoint.
- This integration will provide accurate historical supply data for BERA, enhancing the dashboard's reliability and user experience.

### Key Challenges and Analysis
- **Data Consistency:** Ensure that the CoinGecko data is consistent with the dashboard's expected format.
- **Error Handling:** Implement robust error handling for API failures or unexpected data formats.
- **Performance:** Consider caching strategies to minimize API calls and improve load times.

### High-level Task Breakdown
1. **Update API Integration:**
   - Modify the dashboard's data fetching logic to use the `/api/coingecko` endpoint.
   - Ensure the data is parsed correctly and integrated into the existing supply history state.

2. **Update UI Components:**
   - Update any UI components that display supply data to reflect the new data source.
   - Ensure that charts and panels are updated to use the new supply history.

3. **Testing:**
   - Write tests to verify that the new data source is correctly integrated and displayed.
   - Ensure that the dashboard behaves as expected with the new data.

4. **Documentation:**
   - Update any relevant documentation to reflect the new data source and any changes in the dashboard's functionality.

### Project Status Board
- [x] Update API Integration
- [x] Update UI Components
- [x] Testing
- [x] Documentation

### Executor's Feedback or Assistance Requests
- Completed updating the documentation to reflect the new CoinGecko supply data integration. The README.md now includes information about the new data source and setup instructions. All tasks for the CoinGecko integration are now complete. Awaiting further instructions.

### Lessons
- Ensure to handle API errors gracefully and provide informative error messages to users.

## Plan: Identify Data for BERA and BGT Inflation Charts

### Background and Motivation
- The current implementation incorrectly shows the same data for BERA and BGT inflation.
- According to the Berachain documentation, BERA's total supply is static except when BGT is burned, while BGT's supply increases due to emissions minus the amount burned.

### Key Challenges and Analysis
- **Data Accuracy:** Ensure that the data sources accurately reflect the supply dynamics of BERA and BGT.
- **Data Availability:** Identify what data is currently available and what is missing to accurately represent the inflation rates.

### High-level Task Breakdown
1. **Review Current Data Sources:**
   - Assess the current data sources for BERA and BGT supply.
   - Identify any discrepancies or missing data points.

2. **Identify Required Data:**
   - Determine the specific data points needed to calculate BERA and BGT inflation rates.
   - This includes:
     - Total supply of BERA (static except for BGT burns).
     - Total supply of BGT (increases with emissions minus burns).

3. **Data Collection Plan:**
   - Outline a plan to collect or fetch the necessary data from the CoinGecko API or other sources.
   - Ensure that the data is updated regularly to reflect the latest supply changes.

4. **Update Dashboard Components:**
   - Modify the `InflationPanel` and `SupplyChart` components to display the correct data for BERA and BGT.
   - Ensure that the UI clearly differentiates between BERA and BGT inflation.

5. **Testing and Validation:**
   - Write tests to verify that the data is displayed correctly.
   - Validate the data against the Berachain documentation to ensure accuracy.

### Project Status Board
- [x] Review Current Data Sources
- [x] Identify Required Data
- [x] Data Collection Plan
- [x] Update Dashboard Components
- [ ] Testing and Validation

### Data Sources Review
**Current Data Sources:**
1. **CoinGecko API**
   - Provides: Historical supply data for BERA (up to 365 days)
   - Limitation: No BGT data, and only 1 year of history for free tier
2. **Official Berachain API**
   - Provides: Current total supply and circulating supply for BERA and BGT
   - Limitation: No historical data
3. **Dune Query** ([Dune Query 4740951](https://dune.com/queries/4740951))
   - Provides: BGT emissions and amount burned (historical)
   - Limitation: No direct BERA supply, but BGT burns can be used to adjust BERA supply

**Summary:**
- We have historical BERA supply (CoinGecko, limited to 1 year), current BERA supply (official API), and historical BGT emissions/burns (Dune).
- No direct historical BGT supply, but it can be calculated as cumulative emissions minus cumulative burns.
- BERA supply is static except for BGT burns (see docs).

### Identify Required Data
- **BERA Supply:**
  - Current total supply (from official Berachain API)
  - Historical supply data (from CoinGecko API, limited to 1 year)
  - Adjustments for BGT burns (from Dune Query)

- **BGT Supply:**
  - Current total supply (from official Berachain API)
  - Historical emissions and burns (from Dune Query)
  - Calculated as cumulative emissions minus cumulative burns

### Data Collection Plan
1. **Fetch Current Supply Data:**
   - Use the official Berachain API to fetch the current total supply for both BERA and BGT.
   - Ensure to handle any API errors gracefully.

2. **Fetch Historical BERA Supply Data:**
   - Use the CoinGecko API to fetch historical supply data for BERA (up to 365 days).
   - Store this data in a structured format for easy access.

3. **Fetch BGT Emissions and Burns:**
   - Use the Dune Query to fetch historical BGT emissions and burns.
   - Calculate the cumulative BGT supply as emissions minus burns.

4. **Data Integration:**
   - Integrate the fetched data into the dashboard's state management.
   - Ensure that the data is updated regularly to reflect the latest changes.

### Project Status Board
- [x] Review Current Data Sources
- [x] Identify Required Data
- [x] Data Collection Plan
- [x] Update Dashboard Components
- [ ] Testing and Validation

### Executor's Feedback or Assistance Requests
- Currently conducting testing and validation of the dashboard components to ensure they display the data correctly and function as expected.

## New Feature & Bugfix Plan (May 2025)

### Background and Motivation
The dashboard needs two new pages to provide more comprehensive analysis:
1. A comparison page showing inflation metrics of BERA/BGT against other major L1s
2. A detailed BGT incentives analysis page showing the relationship between incentives and inflation

### Key Challenges and Analysis
1. **Inflation Comparison Page:**
   - Need to identify reliable data sources for other L1s' inflation metrics
   - Need to handle different inflation calculation methodologies across chains
   - Need to ensure consistent time periods for comparison
   - Need to handle different genesis dates for accurate all-time comparisons

2. **BGT Incentives Page:**
   - Need to source historical BGT incentive data
   - Need to correlate incentive data with inflation data
   - Need to visualize the relationship between incentives and inflation
   - Need to handle potential data gaps or inconsistencies

### High-level Task Breakdown

#### 1. Inflation Comparison Page
1. **Data Collection Setup:**
   - [ ] Create API endpoints for fetching other L1s' inflation data
   - [ ] Identify and integrate with reliable data sources (CoinGecko, Messari, etc.)
   - [ ] Create data models for storing and processing inflation metrics

2. **UI/UX Implementation:**
   - [ ] Create new page component with routing
   - [ ] Design and implement comparison table/grid
   - [ ] Add interactive charts for visual comparison
   - [ ] Add filters for time periods and metrics

3. **Data Processing:**
   - [ ] Implement inflation calculation logic for each chain
   - [ ] Create data aggregation functions for different time periods
   - [ ] Add data validation and error handling

#### 2. BGT Incentives Page
1. **Data Collection Setup:**
   - [ ] Create API endpoint for BGT incentives data
   - [ ] Identify data source for historical incentives
   - [ ] Create data models for incentives and correlation with inflation

2. **UI/UX Implementation:**
   - [ ] Create new page component with routing
   - [ ] Design and implement incentives timeline view
   - [ ] Add comparison charts for incentives vs inflation
   - [ ] Add interactive filters and time period selectors

3. **Data Processing:**
   - [ ] Implement incentive data processing logic
   - [ ] Create correlation analysis functions
   - [ ] Add data validation and error handling

### Project Status Board
- [ ] Set up new page routing
- [ ] Create data collection endpoints
- [ ] Implement data processing logic
- [ ] Build UI components
- [ ] Add data visualization
- [ ] Implement filters and interactivity
- [ ] Add error handling and loading states
- [ ] Test and validate

### Executor's Feedback or Assistance Requests
- Need to confirm which data sources to use for other L1s' inflation data
- Need to verify if we have access to historical BGT incentives data
- Need to decide on the specific metrics to show in the comparison

### Lessons
- Ensure consistent time periods when comparing inflation across different chains
- Consider different inflation calculation methodologies when comparing chains
- Plan for data source rate limits and caching requirements

## Background and Motivation
The inflation comparison page currently shows inconsistent 7d inflation values for BERA and BERA+BGT compared to the main dashboard, has duplicate entries for these chains, and uses inconsistent naming/tickers for all chains. The goal is to unify the calculation and display so the comparison table matches the dashboard, uses correct tickers, and has no duplicates.

## Key Challenges and Analysis
- BERA and BERA+BGT inflation must use the same calculation and data as the dashboard cards (from duneEmissions and custom logic).
- Other chains should use CoinGecko data, but display their ticker (BTC, ETH, etc.).
- Remove any duplicate or misnamed entries.

## High-level Task Breakdown

1. **Update Chain Mapping**
   - Create a mapping from CoinGecko IDs to tickers and display names.
   - Ensure BERA and BERA+BGT are only included once, with correct names.
   - **Success criteria:** All chains in the table use the correct ticker and display name; BERA/BERA+BGT appear only once each.

2. **Unify Inflation Calculation**
   - For BERA and BERA+BGT, use the same calculation as the dashboard cards (pull from the same hook/data).
   - For other chains, use CoinGecko data as before.
   - **Success criteria:** 7d inflation for BERA and BERA+BGT matches the dashboard cards exactly.

3. **Update Table Rendering**
   - Render only one row each for BERA and BERA+BGT.
   - Use tickers for all chains.
   - **Success criteria:** No duplicate rows; all tickers correct; table is clear and matches dashboard.

4. **Test and Validate**
   - Check that the 7d inflation for BERA and BERA+BGT matches the dashboard cards.
   - Ensure no duplicate rows and all tickers are correct.
   - **Success criteria:** Visual/manual check confirms all requirements above.

## Project Status Board
- [x] Update chain mapping and remove duplicates
- [x] Unify inflation calculation for BERA/BERA+BGT
- [x] Update table rendering for correct tickers and names
- [ ] Test and validate output

## Executor's Feedback or Assistance Requests
- Inflation calculation for BERA and BERA+BGT now uses shared logic from lib/inflation.ts, matching the dashboard cards exactly.
- Table rendering uses correct tickers and names, and there are no duplicate rows.
- Ready for test and validation.

## Lessons
- Always use the same data/calculation source for the same metric across dashboard and comparison pages.
- Use a single mapping for tickers and display names to avoid inconsistencies.

# New Pages Implementation Plan

## Background and Motivation
The dashboard needs two new pages to provide more comprehensive analysis:
1. A comparison page showing inflation metrics of BERA/BGT against other major L1s
2. A detailed BGT incentives analysis page showing the relationship between incentives and inflation

## Key Challenges and Analysis

### 1. Inflation Comparison Page
- **Data Sources:**
  - CoinGecko API for current supply and price data
  - Messari API for historical supply data
  - Chain-specific APIs for detailed metrics
  - Need to handle rate limits and caching

- **Inflation Calculation Methodologies:**
  - Different chains use different methods (e.g., fixed supply vs. dynamic)
  - Need to normalize calculations for fair comparison
  - Need to handle different genesis dates

- **UI/UX Considerations:**
  - Complex data visualization needs
  - Interactive filtering and comparison
  - Clear presentation of different time periods

### 2. BGT Incentives Page
- **Data Sources:**
  - Dune Analytics for historical BGT emissions
  - Berachain API for current incentives
  - Need to correlate with inflation data

- **Data Processing:**
  - Complex correlation analysis
  - Time-series data alignment
  - Gap handling in historical data

- **Visualization Requirements:**
  - Timeline view of incentives
  - Correlation charts
  - Interactive filtering

## High-level Task Breakdown

### Phase 1: Infrastructure Setup
1. **Project Structure:**
   - [ ] Create new page components
   - [ ] Set up routing
   - [ ] Create shared components directory
   - [ ] Set up API route handlers

2. **Data Layer:**
   - [ ] Create API endpoints for external data
   - [ ] Implement data fetching hooks
   - [ ] Set up caching layer
   - [ ] Create data transformation utilities

### Phase 2: Inflation Comparison Page
1. **Data Collection:**
   - [ ] Implement CoinGecko API integration
   - [ ] Implement Messari API integration
   - [ ] Create data aggregation service
   - [ ] Implement caching strategy

2. **Data Processing:**
   - [ ] Create inflation calculation service
   - [ ] Implement time period aggregation
   - [ ] Create data normalization utilities
   - [ ] Add data validation

3. **UI Components:**
   - [ ] Create comparison table component
   - [ ] Implement interactive charts
   - [ ] Add time period filters
   - [ ] Create metric selectors

4. **Features:**
   - [ ] 24h/7d/30d/all-time views
   - [ ] Chain comparison grid
   - [ ] Interactive charts
   - [ ] Export functionality

### Phase 3: BGT Incentives Page
1. **Data Collection:**
   - [ ] Implement Dune Analytics integration
   - [ ] Create incentives data service
   - [ ] Set up correlation analysis
   - [ ] Implement data caching

2. **Data Processing:**
   - [ ] Create incentives calculation service
   - [ ] Implement time-series alignment
   - [ ] Add correlation analysis
   - [ ] Create data validation

3. **UI Components:**
   - [ ] Create timeline view
   - [ ] Implement correlation charts
   - [ ] Add interactive filters
   - [ ] Create metric selectors

4. **Features:**
   - [ ] Historical incentives view
   - [ ] Inflation correlation
   - [ ] Interactive timeline
   - [ ] Export functionality

### Phase 4: Testing and Optimization
1. **Testing:**
   - [ ] Unit tests for data processing
   - [ ] Integration tests for API endpoints
   - [ ] E2E tests for user flows
   - [ ] Performance testing

2. **Optimization:**
   - [ ] Implement data caching
   - [ ] Optimize API calls
   - [ ] Add error boundaries
   - [ ] Implement loading states

## Project Status Board
- [ ] Phase 1: Infrastructure Setup
  - [ ] Project Structure
  - [ ] Data Layer
- [ ] Phase 2: Inflation Comparison Page
  - [ ] Data Collection
  - [ ] Data Processing
  - [ ] UI Components
  - [ ] Features
- [ ] Phase 3: BGT Incentives Page
  - [ ] Data Collection
  - [ ] Data Processing
  - [ ] UI Components
  - [ ] Features
- [ ] Phase 4: Testing and Optimization
  - [ ] Testing
  - [ ] Optimization

## Executor's Feedback or Assistance Requests
- Need to confirm specific chains to include in the comparison
- Need to verify API rate limits and quotas
- Need to decide on specific metrics to show in the comparison
- Need to confirm if we have access to historical BGT incentives data

## Lessons
- Ensure consistent time periods when comparing inflation across different chains
- Consider different inflation calculation methodologies when comparing chains
- Plan for data source rate limits and caching requirements
- Implement proper error handling for external API calls
- Use TypeScript for better type safety and maintainability
- Implement proper loading states and error boundaries
- Consider mobile responsiveness in UI design

# Inflation Comparison Page Implementation Plan

## Background and Motivation
Create a comprehensive comparison page showing inflation metrics of BERA/BGT against other major L1s, focusing on different time periods (24h, 7d, 30d, and all-time) to provide clear insights into supply dynamics and token unlocks.

## Key Challenges and Analysis

### 1. Data Collection and Processing
- **Data Sources:**
  - CoinGecko API
    - Current supply data
    - Historical supply data (limited to 1 year for free tier)
    - Price data for market cap calculations
    - Token unlock data (if available)
  - Additional unlock data sources (if needed)
    - TokenUnlocks.app API
    - Chain-specific documentation

- **Selected Chains:**
  1. Bitcoin (BTC)
  2. Ethereum (ETH)
  3. Solana (SOL)
  4. Sui (SUI)
  5. Avalanche (AVAX)
  6. BNB Chain (BNB)
  7. Sonic (S)
  8. Sei (SEI)
  9. Near Protocol (NEAR)
  10. Aptos (APT)
  11. Internet Protocol (IP)
  12. Initia (INIT)

- **Data Processing Requirements:**
  - Normalize inflation calculations across different chains
  - Handle different genesis dates for all-time comparisons
  - Calculate consistent time period metrics
  - Track and display significant token unlocks
  - Implement proper error handling and data validation

### 2. UI/UX Design
- **Layout Structure:**
  ```
  +------------------------------------------+
  |  Time Period Selector (24h/7d/30d/all)   |
  +------------------------------------------+
  |                                          |
  |  Main Comparison Table                   |
  |  - Chain info                            |
  |  - Supply metrics                        |
  |  - Unlock info                           |
  |                                          |
  +------------------------------------------+
  |                                          |
  |  Interactive Charts                      |
  |  - Supply growth                         |
  |  - Unlock timeline                       |
  |                                          |
  +------------------------------------------+
  |                                          |
  |  Detailed Metrics Panel                  |
  |  - Chain-specific details                |
  |  - Upcoming unlocks                      |
  |  - Historical unlocks                    |
  |                                          |
  +------------------------------------------+
  ```

- **Components:**
  1. Time Period Selector
     - Radio buttons for period selection
     - Last updated timestamp
     - Auto-refresh indicator

  2. Comparison Table
     - Chain name and logo
     - Current supply
     - Supply change (absolute and percentage)
     - Market cap
     - FDV
     - Next significant unlock
     - Unlock impact (% of supply)
     - Sortable columns
     - Search/filter functionality

  3. Interactive Charts
     - Supply growth over time
     - Unlock timeline visualization
     - Zoom and pan controls
     - Tooltip with detailed metrics

  4. Detailed Metrics Panel
     - Chain-specific details
     - Upcoming unlock schedule
     - Historical unlock events
     - Additional context and explanations

### 3. Technical Implementation

#### Phase 1: Data Layer
1. **API Integration:**
   - [ ] Set up CoinGecko API client
   - [ ] Create data fetching hooks
   - [ ] Implement caching strategy
   - [ ] Add unlock data integration

2. **Data Processing:**
   - [ ] Create inflation calculation service
   - [ ] Implement time period aggregation
   - [ ] Add unlock data processing
   - [ ] Create data validation

#### Phase 2: UI Components
1. **Core Components:**
   - [ ] Create TimePeriodSelector
   - [ ] Create ComparisonTable
   - [ ] Create InteractiveCharts
   - [ ] Create MetricsPanel
   - [ ] Create UnlockTimeline

2. **Shared Components:**
   - [ ] Create ChainLogo component
   - [ ] Create MetricCard component
   - [ ] Create LoadingState component
   - [ ] Create ErrorBoundary component
   - [ ] Create UnlockCard component

#### Phase 3: Features
1. **Table Features:**
   - [ ] Implement sorting
   - [ ] Add filtering
   - [ ] Add search functionality
   - [ ] Add pagination
   - [ ] Add unlock filtering

2. **Chart Features:**
   - [ ] Add zoom controls
   - [ ] Implement tooltips
   - [ ] Add data point selection
   - [ ] Add export functionality
   - [ ] Add unlock event markers

3. **Data Management:**
   - [ ] Implement data caching
   - [ ] Add auto-refresh
   - [ ] Add manual refresh
   - [ ] Add error handling

## Project Status Board
- [ ] Phase 1: Data Layer
  - [x] Planning and design
  - [ ] API Integration
    - [ ] Set up CoinGecko API client
    - [ ] Create data fetching hooks
    - [ ] Implement caching strategy
    - [ ] Add unlock data integration
  - [ ] Data Processing
    - [ ] Create inflation calculation service
    - [ ] Implement time period aggregation
    - [ ] Add unlock data processing
    - [ ] Create data validation
- [ ] Phase 2: UI Components
  - [ ] Core Components
  - [ ] Shared Components
- [ ] Phase 3: Features
  - [ ] Table Features
  - [ ] Chart Features
  - [ ] Data Management

## Current Implementation Focus
Starting with Phase 1: Data Layer

### Step 1: CoinGecko API Integration
1. Create API route handler for CoinGecko data
2. Implement data fetching for:
   - Current supply data
   - Historical supply data
   - Price data
   - Market cap data
3. Set up proper error handling and rate limiting
4. Implement caching to stay within API limits

### Implementation Notes
- Keep all development in private branches
- No public deployment until final review
- Implement proper error handling and logging
- Use TypeScript for type safety
- Add comprehensive testing

## Executor's Feedback or Assistance Requests
Ready to begin implementation of the CoinGecko API integration. Will start with:
1. Creating the API route handler
2. Setting up the data fetching hooks
3. Implementing the caching strategy

Would you like me to proceed with creating the initial API route handler for CoinGecko integration?

## Lessons
- Ensure consistent time periods when comparing inflation across different chains
- Consider different inflation calculation methodologies when comparing chains
- Plan for data source rate limits and caching requirements
- Implement proper error handling for external API calls
- Use TypeScript for better type safety and maintainability
- Implement proper loading states and error boundaries
- Consider mobile responsiveness in UI design
- Handle timezone differences for unlock events

## Plan: Fix API Error Handling and Rate Limiting

### Background and Motivation
The inflation comparison page is experiencing several API-related issues:
1. 401 Unauthorized errors from CoinGecko API
2. Rate limiting issues causing request failures
3. 404 errors for BERA and BGT data
4. Inconsistent API key configuration

### Key Challenges and Analysis
1. **API Authentication:**
   - CoinGecko API requires proper API key configuration
   - Current implementation may not be correctly passing the API key
   - Need to handle both authenticated and unauthenticated requests

2. **Rate Limiting:**
   - CoinGecko has strict rate limits (10-50 calls/minute depending on tier)
   - Current retry mechanism may not be optimal
   - Need better handling of rate limit responses

3. **Data Availability:**
   - BERA and BGT data may not be available through standard endpoints
   - Need to identify correct endpoints or alternative data sources
   - Handle 404 errors gracefully with user feedback

### High-level Task Breakdown
1. **Fix API Authentication:**
   - [ ] Review and fix API key configuration
   - [ ] Implement proper API key header format
   - [ ] Add fallback to unauthenticated requests when needed
   - Success Criteria: No more 401 errors, proper API key usage

2. **Improve Rate Limiting:**
   - [ ] Implement exponential backoff for retries
   - [ ] Add proper rate limit detection from response headers
   - [ ] Cache successful responses to reduce API calls
   - Success Criteria: No more rate limit errors, efficient API usage

3. **Handle Missing Data:**
   - [ ] Add proper error handling for 404 responses
   - [ ] Implement fallback data sources where available
   - [ ] Add user-friendly error messages
   - Success Criteria: Graceful handling of missing data, clear user feedback

4. **Testing and Validation:**
   - [ ] Test with and without API key
   - [ ] Verify rate limit handling
   - [ ] Test error scenarios
   - Success Criteria: All error cases handled properly

### Project Status Board
- [x] Fix API Authentication
  - [x] Review and fix API key configuration
  - [x] Implement proper API key header format
  - [x] Add fallback to unauthenticated requests when needed
- [x] Improve Rate Limiting
- [x] Handle Missing Data
- [x] Show annualized inflation for 'since BERA TGE' in All-time column for all chains, and match column widths
- [ ] Testing and Validation

### Executor's Feedback or Assistance Requests
- Updated the All-time annualized inflation calculation to use the BERA TGE date (2025-01-20) as the start date for all chains, ensuring consistent calculation.
- Adjusted the table so all main columns (including All-time) are now equal width.
- Please review the UI and confirm that annualized inflation is now shown for all chains and the columns are visually consistent.

### Lessons
- CoinGecko API key should be passed in the `x-cg-demo-api-key` header, not as a URL parameter
- Always check API documentation for the correct authentication method
- Keep API key configuration consistent across all API routes

## Planner Mode: Comprehensive Plan for Root Cause Analysis and Permanent Fix of 'circulatingSupply' Error

### Background and Motivation
- The error `Cannot read properties of undefined (reading 'circulatingSupply')` has recurred multiple times, indicating that previous fixes have not addressed the root cause or have not been robust enough.
- This error disrupts the user experience and undermines confidence in the dashboard's reliability.

### Key Challenges and Analysis
- The error occurs when code attempts to access `.circulatingSupply` on an object that is `undefined`.
- This can happen if:
  1. The API call fails or returns an error (network, server, or data issue).
  2. The API returns a response without the expected fields (e.g., malformed or partial data).
  3. The frontend does not check for `undefined` before accessing properties.
  4. There is a race condition or stale cache causing missing data.
- Previous fixes have focused on adding defensive checks, but the error persists, suggesting a deeper or more systemic issue.

### High-level Task Breakdown
1. **Comprehensive Diagnostics**
   - [ ] Add detailed logging in both API and frontend to capture:
     - The full API response for all supply endpoints (BERA, BGT, others).
     - The state of all supply-related variables before rendering.
     - Any errors or warnings from API calls or data parsing.
   - [ ] Capture and review logs from a failing session to identify exactly when and why `undefined` is being passed to the UI.

2. **Code Review and Data Flow Audit**
   - [ ] Review all code paths that fetch, transform, and consume supply data (API, hooks, components).
   - [ ] Map out the full data flow from API to UI for `circulatingSupply` and related fields.
   - [ ] Identify any places where data could be lost, overwritten, or not properly checked.

3. **Robust Error Handling and Fallbacks**
   - [ ] Ensure all API endpoints return a consistent, well-typed response (with explicit error fields if needed).
   - [ ] In hooks and components, always check for `undefined` or missing fields before rendering or using the data.
   - [ ] Show a clear loading or error state in the UI if data is missing or invalid, never attempt to render `undefined` values.
   - [ ] Add automated tests to simulate API failures and malformed data, verifying that the UI handles these cases gracefully.

4. **Permanent Fix and Validation**
   - [ ] Implement fixes based on findings from diagnostics and code review.
   - [ ] Validate the fix by reproducing the error scenario and confirming it no longer occurs.
   - [ ] Monitor logs and user reports for recurrence.

### Success Criteria
- The error `Cannot read properties of undefined (reading 'circulatingSupply')` no longer occurs in any scenario (including API failures, slow loads, or malformed data).
- The UI always shows a clear loading or error state if supply data is missing or invalid.
- Automated and manual tests confirm robust handling of all edge cases. 