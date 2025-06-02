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

## Plan: Fix BERA and BERA+BGT Data Not Displaying (May 2025)

### Background and Motivation
The main dashboard is failing to load the latest Dune emissions data, resulting in a 500 error from the `/api/dune` endpoint. The direct output from `/api/dune` is:

```
{"error":"Failed to trigger Dune execution"}
```

This confirms the error occurs when attempting to trigger a new Dune query execution, not during polling or data processing. This is a critical data source for BGT emissions and BERA supply calculations, so restoring this functionality is essential for accurate dashboard metrics.

---

## Key Challenges and Analysis

1. **Dune API Integration**  
   - The backend (`app/api/dune/route.ts`) triggers a Dune query, polls for results, and returns emissions data.
   - The error occurs specifically at the step where the API attempts to trigger a new Dune query execution (`/api/v1/query/4740951/execute`).
   - Possible causes: invalid/expired API key, Dune API changes, endpoint deprecation, or network issues.

2. **API Key and Rate Limits**  
   - The Dune API key is hardcoded in the route file, not loaded from an environment variable.
   - If the key is invalid, expired, or rate-limited, the API will return errors at the execution trigger step.

3. **Error Handling and Fallback**  
   - The frontend attempts to fetch fallback data if the main call fails, but if no fallback is available, the dashboard shows an error.
   - The backend returns a 500 error for most failures, which is surfaced directly to the user.

4. **Dependency on Dune for Other APIs**  
   - The inflation API also depends on `/api/dune`. If Dune is down, inflation stats may also be affected.

5. **No .env or Config Management**  
   - No `.env` file is present for managing secrets or API keys, which is a security and maintainability risk.

---

## High-level Task Breakdown

1. **Reproduce and Isolate the Error**
   - [x] Manually trigger the `/api/dune` endpoint and capture the full error response. (Confirmed: `{"error":"Failed to trigger Dune execution"}`)
   - [ ] Check if the error is due to the Dune API key, rate limits, or query failure by inspecting the response from the Dune API at the execution trigger step.

2. **Check Dune API Key and Usage**
   - [ ] Verify the Dune API key is valid and has not exceeded its quota.
   - [ ] If possible, move the API key to an environment variable for security.

3. **Improve Error Logging and Diagnostics**
   - [ ] Enhance backend error responses to include more diagnostic information (e.g., Dune error messages, status codes).
   - [ ] Log the full error stack and Dune API responses for debugging.

4. **Test Fallback and Recovery**
   - [ ] Ensure the fallback mechanism works and that the dashboard can display cached/last-known data if Dune is unavailable.
   - [ ] Add a user-facing message with more detail if both live and fallback data are unavailable.

5. **Review and Harden API Integration**
   - [ ] Add retries and exponential backoff for Dune API calls if not already present.
   - [ ] Handle specific Dune error states (e.g., rate limit, invalid query, API changes).

6. **Document and Communicate**
   - [ ] Update `.cursor/scratchpad.md` with findings, root cause, and next steps.
   - [ ] Document any changes to API key management or error handling.

---

## Success Criteria

- The dashboard loads Dune emissions data successfully, or gracefully falls back to cached data with a clear user message.
- 500 errors from `/api/dune` are rare and, when they occur, provide actionable diagnostic information.
- The Dune API key is managed securely (preferably via environment variable).
- All dependent APIs (e.g., inflation) are robust to Dune outages.

## Executor's Feedback or Assistance Requests
- Enhanced error handling in `app/api/dune/route.ts` to capture and return the Dune API's status code, status text, and response body.
- Tested the endpoint, but the only output is `{"error":"Failed to trigger Dune execution"}`—no additional diagnostic fields are present.
- This means the Dune API is returning a 500 error or similar, but not providing a response body with further details. The backend is not able to surface more information because Dune is not providing it.
- **Next step:** Check the Dune API key in the code for validity, expiration, or quota issues. If possible, test the Dune API call directly (e.g., with Postman or curl) using the same API key and endpoint to see if a more detailed error is returned. Also, check Dune's API documentation or status page for any known issues or changes.

### Backup Data Source Implementation Plan

#### Background and Motivation
Currently, the dashboard relies on Dune for BERA+BGT emissions data. If Dune is unavailable, the page fails to load properly. We need to implement a backup data source to ensure the dashboard remains functional even when Dune is down.

#### Key Challenges and Analysis
1. **Data Consistency**: Need to ensure backup data matches Dune data format
2. **Data Storage**: Need to store historical emissions data locally
3. **Data Updates**: Need to keep backup data in sync with Dune
4. **Fallback Logic**: Need to implement graceful fallback to backup data

#### High-level Task Breakdown
1. **Create Backup Data Structure**
   - [ ] Create a `data` directory to store backup data
   - [ ] Define backup data schema matching Dune format
   - [ ] Create initial backup data file with current emissions data

2. **Implement Backup Data API**
   - [ ] Create new API endpoint for backup data
   - [ ] Implement data fetching from backup file
   - [ ] Add error handling and validation

3. **Update Data Fetching Logic**
   - [ ] Modify `useDashboardData` hook to try Dune first
   - [ ] Add fallback to backup data if Dune fails
   - [ ] Add logging for data source switches

4. **Implement Data Sync**
   - [ ] Create function to sync Dune data to backup
   - [ ] Add periodic sync (e.g., daily)
   - [ ] Add manual sync trigger

5. **Testing and Validation**
   - [ ] Test fallback behavior
   - [ ] Verify data consistency
   - [ ] Test error scenarios

#### Project Status Board
- [x] Create Backup Data Structure
  - Created data directory
  - Defined backup data types
  - Created initial backup file
- [x] Implement Backup Data API
  - Created /api/backup endpoint
  - Implemented GET and POST methods
  - Added error handling
- [x] Update Data Fetching Logic
  - Modified useDashboardData hook
  - Implemented fallback to backup
  - Added logging
- [x] Implement Data Sync
  - Created /api/sync endpoint
  - Added manual sync trigger
  - Implemented error handling
- [ ] Testing and Validation
  - [ ] Test fallback behavior
  - [ ] Verify data consistency
  - [ ] Test error scenarios

#### Executor's Feedback or Assistance Requests
- Need to test the implementation with real data
- Need to verify error handling in production environment
- Need to monitor backup data sync performance

#### Lessons
- Always have a backup data source for critical data
- Implement graceful fallbacks for external dependencies
- Keep backup data in sync with primary source
- Use TypeScript interfaces to ensure data consistency
- Implement proper error handling and logging 